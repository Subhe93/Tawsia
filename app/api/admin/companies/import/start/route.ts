import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import { CompanyImportService } from "@/lib/services/company-import-service";
import importSessionManager from "@/lib/import-session-manager";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const settingsJson = formData.get("settings") as string;

    if (!file) {
      return NextResponse.json({ error: "لم يتم رفع أي ملف" }, { status: 400 });
    }

    const settings = JSON.parse(settingsJson);

    // قراءة وتحليل الملف
    const fileContent = await file.text();
    const parseResult = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors && parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: "خطأ في تحليل ملف CSV" },
        { status: 400 }
      );
    }

    const data = parseResult.data || [];

    // إنشاء جلسة استيراد جديدة
    const importId = uuidv4();
    const importSession = {
      id: importId,
      status: "running" as const,
      data,
      settings,
      stats: {
        totalRows: data.length,
        processedRows: 0,
        successfulImports: 0,
        failedImports: 0,
        skippedRows: 0,
        downloadedImages: 0,
        failedImages: 0,
      },
      errors: [],
      skippedCompanies: [],
      startedAt: new Date(),
      currentIndex: 0,
    };

    importSessionManager.createSession(importSession);

    // بدء عملية الاستيراد في الخلفية
    processImportInBackground(importId);

    return NextResponse.json({
      success: true,
      importId,
      message: "تم بدء عملية الاستيراد",
    });
  } catch (error) {
    console.error("خطأ في بدء الاستيراد:", error);
    return NextResponse.json(
      { error: "حدث خطأ في بدء عملية الاستيراد" },
      { status: 500 }
    );
  }
}

// معالجة الاستيراد في الخلفية
async function processImportInBackground(importId: string) {
  const session = importSessionManager.getSession(importId);
  if (!session) return;

  const importService = new CompanyImportService();

  try {
    for (let i = session.currentIndex; i < session.data.length; i++) {
      // التحقق من حالة الجلسة
      const currentSession = importSessionManager.getSession(importId);
      if (!currentSession || currentSession.status === "cancelled") {
        break;
      }

      // إيقاف مؤقت
      if (currentSession.status === "paused") {
        await new Promise((resolve) => {
          const checkPause = () => {
            const sess = importSessionManager.getSession(importId);
            if (sess?.status === "running") {
              resolve(void 0);
            } else if (sess?.status === "cancelled") {
              resolve(void 0);
            } else {
              setTimeout(checkPause, 1000);
            }
          };
          checkPause();
        });
      }

      const row = session.data[i];
      session.currentIndex = i;

      try {
        // معالجة الصف الحالي
        const result = await importService.processCompanyRow(
          row,
          session.settings,
          i + 2
        ); // +2 للرأس والفهرسة

        if (result.success) {
          session.stats.successfulImports++;
          if (result.imagesDownloaded) {
            session.stats.downloadedImages += result.imagesDownloaded;
          }
          if (result.imagesFailed) {
            session.stats.failedImages += result.imagesFailed;
          }
        } else if (result.skipped) {
          session.stats.skippedRows++;
          session.skippedCompanies.push({
            row: i + 2,
            companyName: row.Nom || "غير محدد",
            reason: result.error || "تم تخطي الشركة",
            data: row,
          });
        } else {
          session.stats.failedImports++;
          session.errors.push({
            row: i + 2,
            companyName: row.Nom || "غير محدد",
            error: result.error || "خطأ غير محدد",
            data: row,
          });
        }
      } catch (error) {
        session.stats.failedImports++;
        session.errors.push({
          row: i + 2,
          companyName: row.Nom || "غير محدد",
          error: error instanceof Error ? error.message : "خطأ غير متوقع",
          data: row,
        });
      }

      session.stats.processedRows = i + 1;

      // تحديث الجلسة
      importSessionManager.updateSession(importId, {
        stats: session.stats,
        currentIndex: i,
        errors: session.errors,
        skippedCompanies: session.skippedCompanies,
      });

      // إيقاف قصير لتجنب إرهاق السيرفر
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // انتهاء المعالجة
    importSessionManager.updateSession(importId, { status: "completed" });
  } catch (error) {
    console.error("خطأ في معالجة الاستيراد:", error);
    const errorMessage =
      error instanceof Error ? error.message : "خطأ في النظام";
    importSessionManager.updateSession(importId, {
      status: "failed",
      errors: [
        ...session.errors,
        {
          row: 0,
          companyName: "عام",
          error: errorMessage,
        },
      ],
    });
  }
}

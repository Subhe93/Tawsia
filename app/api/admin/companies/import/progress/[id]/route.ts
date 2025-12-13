import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import importSessionManager from "@/lib/import-session-manager";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const importId = params.id;

    console.log("البحث عن جلسة الاستيراد:", importId);
    console.log("عدد الجلسات المتاحة:", importSessionManager.getSessionCount());
    console.log("معرفات الجلسات:", importSessionManager.getSessionIds());

    const importSession = importSessionManager.getSession(importId);

    if (!importSession) {
      return NextResponse.json(
        {
          error: "جلسة الاستيراد غير موجودة",
          availableIds: importSessionManager.getSessionIds(),
          requestedId: importId,
          totalSessions: importSessionManager.getSessionCount(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: importSession.status,
      stats: importSession.stats,
      errors: importSession.errors,
      skippedCompanies: importSession.skippedCompanies || [],
      startedAt: importSession.startedAt,
      currentIndex: importSession.currentIndex,
    });
  } catch (error) {
    console.error("خطأ في جلب تقدم الاستيراد:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب البيانات" },
      { status: 500 }
    );
  }
}

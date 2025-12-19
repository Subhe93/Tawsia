import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// قائمة الكلمات والأنماط المحجوزة (ليست شركات)
const RESERVED_PATTERNS = [
  /^country\//, // روابط الدول
  /^category\//, // روابط التصنيفات
  /^https?:\/\//, // روابط كاملة
  /^auth\//, // صفحات المصادقة
  /\?/, // روابط بها query params
];

const RESERVED_WORDS = [
  "about",
  "services",
  "privacy",
  "terms",
  "search",
  "companies",
  "add-company",
  "reviews",
  "auth",
  "",
];

interface SlugMigration {
  from: string;
  to: string;
}

interface MigrationResult {
  from: string;
  to: string;
  status: "success" | "not_found" | "conflict" | "skipped" | "error";
  message: string;
  oldUrl?: string;
  newUrl?: string;
}

// التحقق مما إذا كان الـ slug يخص شركة أم لا
function isCompanySlug(slug: string): boolean {
  // تحقق من الكلمات المحجوزة
  if (RESERVED_WORDS.includes(slug.toLowerCase())) {
    return false;
  }

  // تحقق من الأنماط المحجوزة
  for (const pattern of RESERVED_PATTERNS) {
    if (pattern.test(slug)) {
      return false;
    }
  }

  return true;
}

// تنظيف الـ slug
function cleanSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, ""); // إزالة السلاش من البداية والنهاية
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const {
      migrations,
      dryRun = false,
    }: { migrations: SlugMigration[]; dryRun?: boolean } = await request.json();

    if (!migrations || !Array.isArray(migrations)) {
      return NextResponse.json(
        { error: "البيانات غير صحيحة" },
        { status: 400 }
      );
    }

    const results: MigrationResult[] = [];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://twsia.com";

    for (const migration of migrations) {
      const fromSlug = cleanSlug(migration.from);
      const toSlug = cleanSlug(migration.to);

      // تخطي الأسطر الفارغة
      if (!fromSlug || !toSlug) {
        continue;
      }

      // تخطي إذا كان الـ from و to متطابقين
      if (fromSlug === toSlug) {
        results.push({
          from: fromSlug,
          to: toSlug,
          status: "skipped",
          message: "الـ slug القديم والجديد متطابقان",
        });
        continue;
      }

      // تخطي الروابط التي ليست شركات
      if (!isCompanySlug(fromSlug)) {
        results.push({
          from: fromSlug,
          to: toSlug,
          status: "skipped",
          message: "هذا الرابط ليس slug شركة (رابط تصنيف أو صفحة محجوزة)",
        });
        continue;
      }

      try {
        // البحث عن الشركة بالـ slug القديم
        const company = await prisma.company.findUnique({
          where: { slug: fromSlug },
        });

        if (!company) {
          results.push({
            from: fromSlug,
            to: toSlug,
            status: "not_found",
            message: "لم يتم العثور على شركة بهذا الـ slug",
          });
          continue;
        }

        // التحقق من عدم وجود شركة أخرى بالـ slug الجديد
        const existingCompany = await prisma.company.findUnique({
          where: { slug: toSlug },
        });

        if (existingCompany && existingCompany.id !== company.id) {
          results.push({
            from: fromSlug,
            to: toSlug,
            status: "conflict",
            message: `الـ slug الجديد مستخدم بالفعل من شركة أخرى: ${existingCompany.name}`,
          });
          continue;
        }

        // تنفيذ التحديث (إذا لم يكن dry run)
        if (!dryRun) {
          await prisma.company.update({
            where: { id: company.id },
            data: { slug: toSlug },
          });
        }

        results.push({
          from: fromSlug,
          to: toSlug,
          status: "success",
          message: dryRun ? "سيتم التحديث" : "تم التحديث بنجاح",
          oldUrl: `${baseUrl}/${fromSlug}`,
          newUrl: `${baseUrl}/${toSlug}`,
        });
      } catch (error) {
        console.error(`Error processing ${fromSlug}:`, error);
        results.push({
          from: fromSlug,
          to: toSlug,
          status: "error",
          message: error instanceof Error ? error.message : "خطأ غير معروف",
        });
      }
    }

    // إحصائيات
    const stats = {
      total: results.length,
      success: results.filter((r) => r.status === "success").length,
      notFound: results.filter((r) => r.status === "not_found").length,
      conflict: results.filter((r) => r.status === "conflict").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      error: results.filter((r) => r.status === "error").length,
    };

    return NextResponse.json({
      dryRun,
      stats,
      results,
    });
  } catch (error) {
    console.error("خطأ في ترحيل الـ slugs:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}



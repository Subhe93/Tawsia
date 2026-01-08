import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";
    const country = searchParams.get("country");

    // إعداد فلتر الشركات
    const companiesFilter: any = { isActive: true };
    if (country) {
      companiesFilter.city = {
        country: {
          code: country,
        },
      };
    }

    // جلب الفئات مع حساب عدد الشركات بشكل ديناميكي
    const categories = await prisma.category.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      select: {
        id: true,
        slug: true,
        name: true,
        icon: true,
        description: true,
        _count: {
          select: {
            companies: {
              where: companiesFilter,
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // تحويل البيانات لتتطابق مع الواجهة المطلوبة
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      icon: category.icon,
      description: category.description,
      companiesCount: category._count.companies,
    }));

    return NextResponse.json({
      success: true,
      categories: formattedCategories,
    });
  } catch (error) {
    console.error("خطأ في جلب الفئات:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في الخادم أثناء جلب الفئات",
      },
      { status: 500 }
    );
  }
}

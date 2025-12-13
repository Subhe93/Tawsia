import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // جلب البيانات بشكل متوازي
    const [countries, featuredCompanies, categories, latestReviews] =
      await Promise.all([
        // البلدان النشطة مع عدد الشركات
        prisma.country.findMany({
          where: { isActive: true },
          select: {
            id: true,
            code: true,
            name: true,
            flag: true,
            image: true,
            description: true,
            companiesCount: true,
          },
          orderBy: { companiesCount: "desc" },
          take: 8,
        }),

        // الشركات المميزة
        prisma.company.findMany({
          where: {
            isActive: true,
            isFeatured: true,
          },
          select: {
            id: true,
            slug: true,
            name: true,
            shortDescription: true,
            mainImage: true,
            rating: true,
            reviewsCount: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
            city: {
              select: {
                name: true,
                slug: true,
                country: {
                  select: {
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { rating: "desc" },
          take: 6,
        }),

        // الفئات النشطة مع عدد الشركات
        prisma.category.findMany({
          where: { isActive: true },
          select: {
            id: true,
            slug: true,
            name: true,
            icon: true,
            description: true,
            companiesCount: true,
          },
          orderBy: { companiesCount: "desc" },
          take: 12,
        }),

        // أحدث المراجعات
        prisma.review.findMany({
          where: {
            isApproved: true,
            company: {
              isActive: true,
            },
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
            company: {
              select: {
                name: true,
                slug: true,
                city: {
                  select: {
                    slug: true,
                    country: {
                      select: {
                        code: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        countries,
        featuredCompanies,
        categories,
        latestReviews,
        stats: {
          totalCountries: countries.length,
          totalCompanies: featuredCompanies.length,
          totalCategories: categories.length,
          totalReviews: latestReviews.length,
        },
      },
    });
  } catch (error) {
    console.error("خطأ في جلب بيانات الصفحة الرئيسية:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب البيانات",
      },
      { status: 500 }
    );
  }
}

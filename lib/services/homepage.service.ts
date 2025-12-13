import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Types للبيانات المطلوبة
export interface HomePageCountry {
  id: string;
  code: string;
  name: string;
  flag: string | null;
  image: string | null;
  description: string | null;
  companiesCount: number;
}

export interface HomePageCompany {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  mainImage: string | null;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  category: {
    name: string;
    slug: string;
  };
  city: {
    name: string;
    slug: string;
    country: {
      code: string;
      name: string;
    };
  };
}

export interface HomePageCategory {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  description: string | null;
  companiesCount: number;
}

export interface HomePageReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  userName: string; // اسم المستخدم من جدول Review
  userAvatar: string | null; // صورة المستخدم من جدول Review
  user: {
    name: string | null;
    avatar: string | null;
  } | null;
  company: {
    name: string;
    slug: string;
    city: {
      slug: string;
      country: {
        code: string;
      };
    };
  };
}

export interface HomePageData {
  countries: HomePageCountry[];
  featuredCompanies: HomePageCompany[];
  categories: HomePageCategory[];
  latestReviews: HomePageReview[];
  stats: {
    totalCountries: number;
    totalCompanies: number;
    totalCategories: number;
    totalReviews: number;
  };
}

// استخدام React cache لتحسين الأداء
export const getHomePageData = cache(async (): Promise<HomePageData> => {
  try {
    const [countriesData, featuredCompanies, categoriesData, latestReviews, stats] = await Promise.all([
      // جلب البلدان مع عدد الشركات النشطة
      prisma.country.findMany({
        where: { isActive: true },
        select: {
          id: true,
          code: true,
          name: true,
          flag: true,
          image: true,
          description: true,
          _count: {
            select: { companies: { where: { isActive: true } } },
          },
        },
        take: 50,
      }),

      // الشركات المميزة
      prisma.company.findMany({
        where: { isActive: true, isFeatured: true },
        select: {
          id: true,
          slug: true,
          name: true,
          shortDescription: true,
          mainImage: true,
          rating: true,
          reviewsCount: true,
          isFeatured: true,
          category: { select: { name: true, slug: true } },
          city: { select: { name: true, slug: true, country: { select: { code: true, name: true } } } },
        },
        orderBy: [{ rating: "desc" }, { reviewsCount: "desc" }],
        take: 6,
      }),

      // الفئات مع عدد الشركات النشطة
      prisma.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          slug: true,
          name: true,
          icon: true,
          description: true,
          _count: {
            select: { companies: { where: { isActive: true } } },
          },
        },
        orderBy: { companies: { _count: "desc" } },
        take: 12,
      }),

      // أحدث المراجعات المعتمدة
      prisma.review.findMany({
        where: { isApproved: true, company: { isActive: true } },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          userName: true,
          userAvatar: true,
          user: { select: { name: true, avatar: true } },
          company: { select: { name: true, slug: true, city: { select: { slug: true, country: { select: { code: true } } } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),

      // الإحصائيات العامة
      getSiteStats(),
    ]);

    // تنسيق بيانات البلدان لفرزها وإضافة العدد الصحيح
    const countries = countriesData
      .map(country => ({
        ...country,
        companiesCount: country._count.companies,
      }))
      .sort((a, b) => b.companiesCount - a.companiesCount || a.name.localeCompare(b.name));

    // تنسيق بيانات الفئات
    const categories = categoriesData.map(category => ({
      ...category,
      companiesCount: category._count.companies,
    }));

    return {
      countries,
      featuredCompanies,
      categories,
      latestReviews,
      stats: {
        totalCountries: stats.countriesCount,
        totalCompanies: stats.companiesCount,
        totalCategories: stats.categoriesCount,
        totalReviews: stats.reviewsCount,
      },
    };
  } catch (error) {
    console.error("خطأ في جلب بيانات الصفحة الرئيسية:", error);
    return {
      countries: [],
      featuredCompanies: [],
      categories: [],
      latestReviews: [],
      stats: { totalCountries: 0, totalCompanies: 0, totalCategories: 0, totalReviews: 0 },
    };
  }
});

// دالة للحصول على إحصائيات عامة للموقع (للـ SEO)
export const getSiteStats = cache(async () => {
  try {
    const [countriesCount, companiesCount, categoriesCount, reviewsCount] =
      await Promise.all([
        prisma.country.count({ where: { isActive: true } }),
        prisma.company.count({ where: { isActive: true } }),
        prisma.category.count({ where: { isActive: true } }),
        prisma.review.count({ where: { isApproved: true } }), // استخدام الحقل الصحيح
      ]);

    return {
      countriesCount,
      companiesCount,
      categoriesCount,
      reviewsCount,
    };
  } catch (error) {
    console.error("خطأ في جلب إحصائيات الموقع:", error);
    return {
      countriesCount: 0,
      companiesCount: 0,
      categoriesCount: 0,
      reviewsCount: 0,
    };
  }
});

// دالة للحصول على جميع البلدان (بدون حد)
export const getAllCountries = cache(async () => {
  try {
    const countriesData = await prisma.country.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        flag: true,
        image: true,
        description: true,
        _count: {
          select: { companies: { where: { isActive: true } } },
        },
      },
    });

    return countriesData
      .map(country => ({
        ...country,
        companiesCount: country._count.companies,
      }))
      .sort((a, b) => b.companiesCount - a.companiesCount || a.name.localeCompare(b.name));

  } catch (error) {
    console.error("خطأ في جلب جميع البلدان:", error);
    return [];
  }
});
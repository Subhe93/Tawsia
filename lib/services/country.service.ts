import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getAllCountries as getCountriesFromHomepage } from "./homepage.service";

// Types لصفحة البلد
export interface CountryPageData {
  id: string;
  code: string;
  name: string;
  flag: string | null;
  image: string | null;
  description: string | null;
  companiesCount: number;
}

export interface CountryCity {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  description: string | null;
  companiesCount: number;
}

export interface CountryCompany {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  mainImage: string | null;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  city: {
    id: string;
    name: string;
    slug: string;
  };
  // للفلاتر
  services: string[];
  latitude: number | null;
  longitude: number | null;
}

export interface FilterOptions {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    companiesCount: number;
  }>;
  cities: Array<{
    id: string;
    name: string;
    slug: string;
    companiesCount: number;
  }>;
  ratingRanges: Array<{
    min: number;
    max: number;
    count: number;
  }>;
  verificationStatus: {
    verified: number;
    unverified: number;
  };
}

export interface CompanyFilters {
  categoryId?: string;
  cityId?: string;
  minRating?: number;
  maxRating?: number;
  isVerified?: boolean;
  searchQuery?: string;
  sortBy?: "name" | "rating" | "reviewsCount" | "newest";
  sortOrder?: "asc" | "desc";
}

// جلب بيانات البلد
export const getCountryByCode = cache(
  async (countryCode: string): Promise<CountryPageData | null> => {
    try {
      const country = await prisma.country.findFirst({
        where: {
          code: countryCode.toLowerCase(),
          isActive: true,
        },
        select: {
          id: true,
          code: true,
          name: true,
          flag: true,
          image: true,
          description: true,
          _count: { select: { companies: { where: { isActive: true } } } },
        },
      });

      if (!country) return null;

      return {
        ...country,
        companiesCount: country._count.companies,
      };
    } catch (error) {
      console.error("خطأ في جلب بيانات البلد:", error);
      return null;
    }
  }
);

// جلب مدن البلد
export const getCountryCities = cache(
  async (countryCode: string): Promise<CountryCity[]> => {
    try {
      const cities = await prisma.city.findMany({
        where: {
          countryCode: countryCode.toLowerCase(),
          isActive: true,
        },
        select: {
          id: true,
          slug: true,
          name: true,
          image: true,
          description: true,
          _count: { select: { companies: { where: { isActive: true } } } },
        },
        orderBy: [{ companies: { _count: "desc" } }, { name: "asc" }],
      });

      return cities.map((city) => ({
        ...city,
        companiesCount: city._count.companies,
      }));
    } catch (error) {
      console.error("خطأ في جلب مدن البلد:", error);
      return [];
    }
  }
);

// جلب شركات البلد مع الفلاتر
export const getCountryCompanies = cache(
  async (
    countryCode: string,
    filters: CompanyFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
    companies: CountryCompany[];
    totalCount: number;
    totalPages: number;
  }> => {
    try {
      const where: any = {
        country: {
          code: countryCode.toLowerCase(),
        },
        isActive: true,
      };

      // تطبيق الفلاتر
      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }

      if (filters.cityId) {
        where.cityId = filters.cityId;
      }

      if (filters.minRating !== undefined) {
        where.rating = { gte: filters.minRating };
      }

      if (filters.maxRating !== undefined) {
        where.rating = { ...where.rating, lte: filters.maxRating };
      }

      if (filters.isVerified !== undefined) {
        where.isVerified = filters.isVerified;
      }

      if (filters.searchQuery) {
        where.OR = [
          { name: { contains: filters.searchQuery, mode: "insensitive" } },
          {
            shortDescription: {
              contains: filters.searchQuery,
              mode: "insensitive",
            },
          },
          { services: { hasSome: [filters.searchQuery] } },
        ];
      }

      // ترتيب النتائج
      const orderBy: any = {};
      switch (filters.sortBy) {
        case "rating":
          orderBy.rating = filters.sortOrder || "desc";
          break;
        case "reviewsCount":
          orderBy.reviewsCount = filters.sortOrder || "desc";
          break;
        case "newest":
          orderBy.createdAt = "desc";
          break;
        case "name":
        default:
          orderBy.name = filters.sortOrder || "asc";
          break;
      }

      const [companies, totalCount] = await Promise.all([
        prisma.company.findMany({
          where,
          select: {
            id: true,
            slug: true,
            name: true,
            shortDescription: true,
            mainImage: true,
            rating: true,
            reviewsCount: true,
            isVerified: true,
            isFeatured: true,
            services: true,
            latitude: true,
            longitude: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            city: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            country: {
              select: {
                code: true,
                name: true,
              },
            },
          },
          orderBy: [
            { isFeatured: "desc" }, // الشركات المميزة أولاً
            orderBy,
          ],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.company.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        companies,
        totalCount,
        totalPages,
      };
    } catch (error) {
      console.error("خطأ في جلب شركات البلد:", error);
      return {
        companies: [],
        totalCount: 0,
        totalPages: 0,
      };
    }
  }
);

// جلب خيارات الفلاتر للبلد
export const getCountryFilterOptions = cache(
  async (countryCode: string): Promise<FilterOptions> => {
    try {
      const [categories, cities, companiesStats] = await Promise.all([
        // الفئات المتوفرة في هذا البلد
        prisma.category.findMany({
          where: {
            isActive: true,
            companies: {
              some: {
                isActive: true,
                country: {
                  code: countryCode.toLowerCase(),
                },
              },
            },
          },
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: {
                companies: {
                  where: {
                    isActive: true,
                    country: {
                      code: countryCode.toLowerCase(),
                    },
                  },
                },
              },
            },
          },
          orderBy: { name: "asc" },
        }),

        // المدن المتوفرة في هذا البلد
        prisma.city.findMany({
          where: {
            countryCode: countryCode.toLowerCase(),
            isActive: true,
            companies: {
              some: {
                isActive: true,
              },
            },
          },
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: {
                companies: {
                  where: {
                    isActive: true,
                  },
                },
              },
            },
          },
          orderBy: { name: "asc" },
        }),

        // إحصائيات للفلاتر
        prisma.company.groupBy({
          by: ["rating", "isVerified"],
          where: {
            isActive: true,
            country: {
              code: countryCode.toLowerCase(),
            },
          },
          _count: true,
        }),
      ]);

      // تجهيز نطاقات التقييم
      const ratingRanges = [
        { min: 4.5, max: 5, count: 0 },
        { min: 4, max: 4.4, count: 0 },
        { min: 3, max: 3.9, count: 0 },
        { min: 2, max: 2.9, count: 0 },
        { min: 1, max: 1.9, count: 0 },
      ];

      // حساب عدد الشركات في كل نطاق تقييم
      companiesStats.forEach((stat) => {
        const rating = stat.rating;
        const range = ratingRanges.find(
          (r) => rating >= r.min && rating <= r.max
        );
        if (range) {
          range.count += stat._count;
        }
      });

      // حساب حالة التوثيق
      const verificationStatus = {
        verified: companiesStats
          .filter((stat) => stat.isVerified)
          .reduce((sum, stat) => sum + stat._count, 0),
        unverified: companiesStats
          .filter((stat) => !stat.isVerified)
          .reduce((sum, stat) => sum + stat._count, 0),
      };

      return {
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          companiesCount: cat._count.companies,
        })),
        cities: cities.map((city) => ({
          id: city.id,
          name: city.name,
          slug: city.slug,
          companiesCount: city._count.companies,
        })),
        ratingRanges,
        verificationStatus,
      };
    } catch (error) {
      console.error("خطأ في جلب خيارات الفلاتر:", error);
      return {
        categories: [],
        cities: [],
        ratingRanges: [],
        verificationStatus: { verified: 0, unverified: 0 },
      };
    }
  }
);

// دالة لتوليد metadata ديناميكي للبلد
export const generateCountryMetadata = async (countryCode: string) => {
  const country = await getCountryByCode(countryCode);

  if (!country) {
    return {
      title: "الدولة غير موجودة",
      description: "هذه الدولة غير متوفرة في دليل الشركات",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://murabaat.com";

  return {
    title: `${country.name} | دليل الشركات والخدمات | توصية`,
    description: `اكتشف أفضل الشركات والخدمات في ${country.name}. ابحث عن الشركات حسب المدينة والفئة مع تقييمات العملاء. ${country.companiesCount} شركة متاحة.`,
    keywords: [
      `شركات ${country.name}`,
      `خدمات ${country.name}`,
      `دليل أعمال ${country.name}`,
      "شركات عربية",
      "دليل الشركات",
    ].join(", "),

    openGraph: {
      title: `${country.name} - دليل الشركات والخدمات`,
      description: `اكتشف أفضل ${country.companiesCount} شركة في ${country.name}`,
      url: `${baseUrl}/country/${country.code}`,
      images: country.image
        ? [
            {
              url: country.image,
              width: 1200,
              height: 630,
              alt: `صورة ${country.name}`,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title: `${country.name} - دليل الشركات`,
      description: `${country.companiesCount} شركة في ${country.name}`,
      images: country.image ? [country.image] : [],
    },

    alternates: {
      canonical: `${baseUrl}/country/${country.code}`,
    },
  };
};

// إعادة تصدير دالة getAllCountries
export const getAllCountries = getCountriesFromHomepage;

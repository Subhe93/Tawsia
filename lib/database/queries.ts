import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  SearchFilters,
  SearchResult,
  CompanyWithRelations,
  ReviewWithRelations,
} from "@/lib/types/database";
import { WorkingHoursService } from "@/lib/services/working-hours.service";

// استعلامات البلدان
export async function getCountries() {
  return await prisma.country.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          cities: true,
          companies: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCountryByCode(code: string) {
  return await prisma.country.findUnique({
    where: { code },
    include: {
      cities: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
      companies: {
        where: { isActive: true },
        take: 10,
        orderBy: { rating: "desc" },
      },
    },
  });
}

// استعلامات المدن
export async function getCities(countryCode?: string) {
  return await prisma.city.findMany({
    where: {
      isActive: true,
      ...(countryCode && { countryCode }),
    },
    include: {
      country: true,
      _count: {
        select: {
          companies: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

// استعلامات المناطق الفرعية
export async function getSubAreas(cityId?: string, countryCode?: string) {
  return await prisma.subArea.findMany({
    where: {
      isActive: true,
      ...(cityId && { cityId }),
      ...(countryCode && { countryCode }),
    },
    include: {
      city: true,
      country: true,
      _count: {
        select: {
          companies: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getSubAreaBySlug(slug: string) {
  return await prisma.subArea.findUnique({
    where: { slug },
    include: {
      city: true,
      country: true,
      companies: {
        where: { isActive: true },
        include: {
          category: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: { rating: "desc" },
      },
      _count: {
        select: {
          companies: true,
        },
      },
    },
  });
}

export async function getCityBySlug(slug: string, countryCode?: string) {
  const whereClause = countryCode
    ? { slug, countryCode, isActive: true }
    : { slug, isActive: true };

  return await prisma.city.findFirst({
    where: whereClause,
    include: {
      country: true,
      companies: {
        where: { isActive: true },
        include: {
          category: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: { rating: "desc" },
      },
    },
  });
}

// استعلامات الفئات
export async function getCategories() {
  return await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          companies: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryBySlug(slug: string, country?: string) {
  const whereClause = country
    ? { isActive: true, country: { code: country } }
    : { isActive: true };

  return await prisma.category.findUnique({
    where: { slug },
    include: {
      companies: {
        where: whereClause,
        include: {
          city: true,
          country: true,
        },
        orderBy: { rating: "desc" },
      },
    },
  });
}

export async function getSubcategories(categorySlug: string) {
  return await prisma.subCategory.findMany({
    where: {
      category: {
        slug: categorySlug,
      },
      isActive: true,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      icon: true,
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
    orderBy: {
      name: "asc",
    },
  });
}

export async function getSubcategoryBySlug(slug: string) {
  return await prisma.subCategory.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  });
}

// استعلامات الشركات

export async function getCompanies(
  filters: SearchFilters = {}
): Promise<SearchResult<CompanyWithRelations>> {
  const {
    query,
    country,
    city,
    subArea,
    category,
    subcategory,
    subCategory,
    rating,
    verified,
    featured,
    hasWebsite,
    hasPhone,
    hasEmail,
    hasImages,
    hasWorkingHours,
    page = 1,
    limit = 12,
    sortBy = "rating",
    sortOrder = "desc",
  } = filters;

  const skip = (page - 1) * limit;

  // بناء شروط البحث
  const where: Prisma.CompanyWhereInput = {
    isActive: true,
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { services: { has: query } },
        { specialties: { has: query } },
        {
          tags: { some: { tagName: { contains: query, mode: "insensitive" } } },
        },
      ],
    }),
    ...(country && { country: { code: country } }),
    ...(city && { city: { slug: city } }),
    ...(subArea && { subArea: { slug: subArea } }),
    ...(category && { category: { slug: category } }),
    ...(subcategory && { subCategory: { slug: subcategory } }),
    ...(subCategory && { subCategory: { slug: subCategory } }),
    ...(rating && { rating: { gte: rating } }),
    ...(verified !== undefined && { isVerified: verified }),
    ...(featured !== undefined && { isFeatured: featured }),
    ...(hasWebsite && { website: { not: null } }),
    ...(hasPhone && { phone: { not: null } }),
    ...(hasEmail && { email: { not: null } }),
    ...(hasImages && { images: { some: { isActive: true } } }),
    ...(hasWorkingHours && { workingHours: { some: {} } }),
  };

  // بناء ترتيب النتائج
  const orderBy: Prisma.CompanyOrderByWithRelationInput = (() => {
    switch (sortBy) {
      case "name":
        return { name: sortOrder };
      case "rating":
        return { rating: sortOrder };
      case "reviews":
        return { reviewsCount: sortOrder };
      case "newest":
        return { createdAt: "desc" };
      case "oldest":
        return { createdAt: "asc" };
      default:
        return { rating: "desc" };
    }
  })();

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        country: true,
        city: true,
        subArea: true,
        category: true,
        images: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        tags: true,
        workingHours: true,
        socialMedia: {
          where: { isActive: true },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            images: true,
            ratings: true,
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        awards: {
          where: { isActive: true },
          orderBy: { year: "desc" },
        },
        owners: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.company.count({ where }),
  ]);

  return {
    data: companies,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCompanyBySlug(
  slug: string
): Promise<CompanyWithRelations | null> {
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      country: true,
      city: true,
      category: true,
      subCategory: true,
      subArea: true,
      images: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      tags: true,
      socialMedia: {
        where: { isActive: true },
      },
      reviews: {
        where: { isApproved: true },
        include: {
          images: true,
          ratings: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      awards: {
        where: { isActive: true },
        orderBy: { year: "desc" },
      },
      owners: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  if (!company) {
    return null;
  }

  // استخدام الخدمة الموحدة لجلب ساعات العمل
  try {
    const workingHours = await WorkingHoursService.getWorkingHours(company.id);
    return {
      ...company,
      workingHours,
    } as CompanyWithRelations;
  } catch (error) {
    console.error("خطأ في جلب ساعات العمل للشركة:", error);
    // إرجاع الشركة بدون ساعات العمل في حالة الخطأ
    return {
      ...company,
      workingHours: [],
    } as CompanyWithRelations;
  }
}

export async function getFeaturedCompanies(limit: number = 6) {
  return await prisma.company.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },
    include: {
      country: true,
      city: true,
      category: true,
      tags: true,
      _count: {
        select: {
          reviews: {
            where: { isApproved: true },
          },
        },
      },
    },
    orderBy: { rating: "desc" },
    take: limit,
  });
}

export async function getSimilarCompanies(
  companySlug: string,
  categoryId: string,
  cityId: string,
  limit: number = 4
) {
  return await prisma.company.findMany({
    where: {
      isActive: true,
      slug: { not: companySlug },
      OR: [{ categoryId }, { cityId }],
    },
    include: {
      city: true,
      country: true,
      category: true,
      _count: {
        select: {
          reviews: {
            where: { isApproved: true },
          },
        },
      },
    },
    orderBy: { rating: "desc" },
    take: limit,
  });
}

// استعلامات المراجعات
export async function getReviews(
  companyId?: string,
  filters: SearchFilters = {}
): Promise<SearchResult<ReviewWithRelations>> {
  const { page = 1, limit = 10, sortBy = "newest" } = filters;

  const skip = (page - 1) * limit;

  const where: Prisma.ReviewWhereInput = {
    isApproved: true,
    ...(companyId && { companyId }),
  };

  const orderBy: Prisma.ReviewOrderByWithRelationInput = (() => {
    switch (sortBy) {
      case "newest":
        return { createdAt: "desc" };
      case "oldest":
        return { createdAt: "asc" };
      case "highest":
        return { rating: "desc" };
      case "lowest":
        return { rating: "asc" };
      case "helpful":
        return { helpfulCount: "desc" };
      default:
        return { createdAt: "desc" };
    }
  })();

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            mainImage: true,
            city: {
              select: {
                name: true,
                slug: true,
              },
            },
            country: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
        images: true,
        ratings: true,
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getLatestReviews(limit: number = 6) {
  return await prisma.review.findMany({
    where: {
      isApproved: true,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          mainImage: true,
          city: {
            select: {
              name: true,
              slug: true,
            },
          },
          country: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      },
      user: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// إنشاء شركة جديدة
export async function createCompany(data: Prisma.CompanyCreateInput) {
  return await prisma.company.create({
    data,
    include: {
      country: true,
      city: true,
      category: true,
    },
  });
}

// إنشاء مراجعة جديدة
export async function createReview(data: Prisma.ReviewCreateInput) {
  const review = await prisma.review.create({
    data,
    include: {
      company: true,
    },
  });

  // تحديث متوسط التقييم وعدد المراجعات
  await updateCompanyRating(review.companyId);

  return review;
}

// تحديث متوسط التقييم للشركة
export async function updateCompanyRating(companyId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      companyId,
      isApproved: true,
    },
    select: {
      rating: true,
    },
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

  await prisma.company.update({
    where: { id: companyId },
    data: {
      rating: Math.round(averageRating * 10) / 10, // تقريب لرقم عشري واحد
      reviewsCount: totalReviews,
    },
  });
}

// إعادة حساب تقييمات جميع الشركات
export async function recalculateAllCompanyRatings() {
  const companies = await prisma.company.findMany({
    select: { id: true },
  });

  for (const company of companies) {
    await updateCompanyRating(company.id);
  }

  return companies.length;
}

// البحث المتقدم
export async function searchCompanies(
  searchTerm: string,
  filters: SearchFilters = {}
) {
  const searchWords = searchTerm.trim().split(/\s+/);

  return await getCompanies({
    ...filters,
    query: searchTerm,
  });
}

// الحصول على الإحصائيات العامة
export async function getOverviewStats() {
  const [
    totalCompanies,
    totalReviews,
    totalUsers,
    pendingRequests,
    verifiedCompanies,
    featuredCompanies,
    averageRatingResult,
  ] = await Promise.all([
    prisma.company.count({ where: { isActive: true } }),
    prisma.review.count({ where: { isApproved: true } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.companyRequest.count({ where: { status: "PENDING" } }),
    prisma.company.count({ where: { isActive: true, isVerified: true } }),
    prisma.company.count({ where: { isActive: true, isFeatured: true } }),
    prisma.review.aggregate({
      where: { isApproved: true },
      _avg: { rating: true },
    }),
  ]);

  return {
    totalCompanies,
    totalReviews,
    totalUsers,
    pendingRequests,
    verifiedCompanies,
    featuredCompanies,
    averageRating: Math.round((averageRatingResult._avg.rating || 0) * 10) / 10,
  };
}

// الحصول على إحصائيات الشركة
export async function getCompanyStats(companyId: string) {
  const [company, reviewsStats, monthlyReviews, ratingDistribution] =
    await Promise.all([
      prisma.company.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          name: true,
          rating: true,
          reviewsCount: true,
          createdAt: true,
        },
      }),
      prisma.review.aggregate({
        where: {
          companyId,
          isApproved: true,
        },
        _count: true,
        _avg: { rating: true },
      }),
      prisma.review.groupBy({
        by: ["createdAt"],
        where: {
          companyId,
          isApproved: true,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // آخر 30 يوم
          },
        },
        _count: true,
      }),
      prisma.review.groupBy({
        by: ["rating"],
        where: {
          companyId,
          isApproved: true,
        },
        _count: true,
      }),
    ]);

  return {
    company,
    totalReviews: reviewsStats._count,
    averageRating: Math.round((reviewsStats._avg.rating || 0) * 10) / 10,
    monthlyReviews: monthlyReviews.length,
    ratingDistribution: ratingDistribution.map((item) => ({
      rating: item.rating,
      count: item._count,
    })),
  };
}

// إنشاء طلب شركة جديدة
export async function createCompanyRequest(
  data: Prisma.CompanyRequestCreateInput
) {
  return await prisma.companyRequest.create({
    data,
  });
}

// الحصول على طلبات الشركات
export async function getCompanyRequests(
  status?: string,
  page: number = 1,
  limit: number = 10
) {
  const skip = (page - 1) * limit;

  const where: Prisma.CompanyRequestWhereInput = {
    ...(status && { status: status as any }),
  };

  const [requests, total] = await Promise.all([
    prisma.companyRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.companyRequest.count({ where }),
  ]);

  return {
    data: requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// الموافقة على طلب شركة
export async function approveCompanyRequest(
  requestId: string,
  adminId: string
) {
  const request = await prisma.companyRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error("طلب الشركة غير موجود");
  }

  // العثور على البلد والمدينة والفئة
  const [country, category] = await Promise.all([
    prisma.country.findUnique({ where: { code: request.country } }),
    prisma.category.findUnique({ where: { slug: request.category } }),
  ]);

  if (!country || !category) {
    throw new Error("البلد أو الفئة غير موجودة");
  }

  // العثور على المدينة أو إنشاؤها
  let city = await prisma.city.findFirst({
    where: {
      name: request.city,
      countryCode: request.country,
    },
  });

  if (!city) {
    city = await prisma.city.create({
      data: {
        slug: request.city.toLowerCase().replace(/\s+/g, "-"),
        name: request.city,
        countryId: country.id,
        countryCode: request.country,
        description: `مدينة ${request.city} في ${country.name}`,
      },
    });
  }

  // إنشاء الشركة
  const company = await prisma.company.create({
    data: {
      slug:
        request.companyName.toLowerCase().replace(/\s+/g, "-") +
        "-" +
        Date.now(),
      name: request.companyName,
      description: request.description,
      countryId: country.id,
      cityId: city.id,
      categoryId: category.id,
      phone: request.phone,
      email: request.email,
      website: request.website,
      address: request.address,
      services: request.services.split(",").map((s) => s.trim()),
      isVerified: true,
    },
  });

  // إنشاء مستخدم للمالك إذا لم يكن موجود
  let owner = await prisma.user.findUnique({
    where: { email: request.ownerEmail },
  });

  if (!owner) {
    owner = await prisma.user.create({
      data: {
        email: request.ownerEmail,
        name: request.ownerName,
        role: "COMPANY_OWNER",
      },
    });
  }

  // ربط المالك بالشركة
  await prisma.companyOwner.create({
    data: {
      companyId: company.id,
      userId: owner.id,
      role: "OWNER",
      isPrimary: true,
      permissions: [
        "view_company",
        "edit_company",
        "manage_reviews",
        "manage_images",
        "view_analytics",
      ],
    },
  });

  // تحديث حالة الطلب
  await prisma.companyRequest.update({
    where: { id: requestId },
    data: {
      status: "APPROVED",
      reviewedBy: adminId,
      reviewedAt: new Date(),
    },
  });

  return company;
}

// رفض طلب شركة
export async function rejectCompanyRequest(
  requestId: string,
  adminId: string,
  reason: string
) {
  return await prisma.companyRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      adminNotes: reason,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    },
  });
}

// تحديث إحصائيات يومية
export async function updateDailyStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalCompanies,
    totalReviews,
    totalUsers,
    newCompanies,
    newReviews,
    newUsers,
  ] = await Promise.all([
    prisma.company.count({ where: { isActive: true } }),
    prisma.review.count({ where: { isApproved: true } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.company.count({
      where: {
        isActive: true,
        createdAt: { gte: today },
      },
    }),
    prisma.review.count({
      where: {
        isApproved: true,
        createdAt: { gte: today },
      },
    }),
    prisma.user.count({
      where: {
        isActive: true,
        createdAt: { gte: today },
      },
    }),
  ]);

  return await prisma.dailyStats.upsert({
    where: { date: today },
    update: {
      totalCompanies,
      totalReviews,
      totalUsers,
      newCompanies,
      newReviews,
      newUsers,
    },
    create: {
      date: today,
      totalCompanies,
      totalReviews,
      totalUsers,
      newCompanies,
      newReviews,
      newUsers,
    },
  });
}

export async function getAllCountries() {
  const countries = await prisma.country.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          companies: {
            where: { isActive: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return countries.map((country) => ({
    id: country.id,
    code: country.code,
    name: country.name,
    flag: country.flag,
    image: country.image,
    description: country.description,
    companiesCount: country._count.companies,
  }));
}

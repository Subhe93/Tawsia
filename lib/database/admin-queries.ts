import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { DashboardStats } from "@/lib/types/database";
import { WorkingHoursService } from "@/lib/services/working-hours.service";
import {
  createEnglishSlug,
  createUniqueEnglishSlug,
} from "@/lib/utils/database-helpers";
import { updateCompanyInSitemap } from "@/lib/sitemap/auto-updater";

// إحصائيات داشبورد المدير
export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const lastMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate(),
  );
  const lastYear = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate(),
  );

  // الإحصائيات العامة
  const [
    totalCompanies,
    totalReviews,
    totalUsers,
    pendingRequests,
    verifiedCompanies,
    featuredCompanies,
    averageRatingResult,
    // إحصائيات النمو
    lastMonthCompanies,
    lastMonthReviews,
    lastMonthUsers,
    currentMonthCompanies,
    currentMonthReviews,
    currentMonthUsers,
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
    // النمو الشهري
    prisma.company.count({
      where: {
        isActive: true,
        createdAt: { lt: lastMonth },
      },
    }),
    prisma.review.count({
      where: {
        isApproved: true,
        createdAt: { lt: lastMonth },
      },
    }),
    prisma.user.count({
      where: {
        isActive: true,
        createdAt: { lt: lastMonth },
      },
    }),
    prisma.company.count({
      where: {
        isActive: true,
        createdAt: { gte: lastMonth },
      },
    }),
    prisma.review.count({
      where: {
        isApproved: true,
        createdAt: { gte: lastMonth },
      },
    }),
    prisma.user.count({
      where: {
        isActive: true,
        createdAt: { gte: lastMonth },
      },
    }),
  ]);

  // حساب نسب النمو
  const companiesGrowth =
    lastMonthCompanies > 0
      ? ((currentMonthCompanies - lastMonthCompanies) / lastMonthCompanies) *
        100
      : 0;
  const reviewsGrowth =
    lastMonthReviews > 0
      ? ((currentMonthReviews - lastMonthReviews) / lastMonthReviews) * 100
      : 0;
  const usersGrowth =
    lastMonthUsers > 0
      ? ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100
      : 0;

  // أفضل البلدان
  const topCountries = await prisma.country.findMany({
    include: {
      _count: {
        select: {
          companies: {
            where: { isActive: true },
          },
        },
      },
    },
    orderBy: {
      companies: {
        _count: "desc",
      },
    },
    take: 5,
  });

  // أفضل الفئات
  const topCategories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          companies: {
            where: { isActive: true },
          },
        },
      },
    },
    orderBy: {
      companies: {
        _count: "desc",
      },
    },
    take: 5,
  });

  // النشاط الأخير
  const [recentCompanies, recentReviews, recentUsers] = await Promise.all([
    prisma.company.findMany({
      where: { isActive: true },
      select: {
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.review.findMany({
      where: { isApproved: true },
      select: {
        title: true,
        userName: true,
        company: {
          select: { name: true },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findMany({
      where: { isActive: true },
      select: {
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const recentActivity = [
    ...recentCompanies.map((company) => ({
      type: "company" as const,
      title: `شركة جديدة: ${company.name}`,
      description: "تم إضافة شركة جديدة إلى الدليل",
      date: company.createdAt.toISOString(),
    })),
    ...recentReviews.map((review) => ({
      type: "review" as const,
      title: `مراجعة جديدة: ${review.title}`,
      description: `${review.userName} قام بمراجعة ${review.company.name}`,
      date: review.createdAt.toISOString(),
    })),
    ...recentUsers.map((user) => ({
      type: "user" as const,
      title: `مستخدم جديد: ${user.name}`,
      description: "انضم مستخدم جديد إلى المنصة",
      date: user.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return {
    overview: {
      totalCompanies,
      totalReviews,
      totalUsers,
      averageRating:
        Math.round((averageRatingResult._avg.rating || 0) * 10) / 10,
      pendingRequests,
      verifiedCompanies,
      featuredCompanies,
    },
    growth: {
      companiesGrowth: Math.round(companiesGrowth * 10) / 10,
      reviewsGrowth: Math.round(reviewsGrowth * 10) / 10,
      usersGrowth: Math.round(usersGrowth * 10) / 10,
    },
    topCountries: topCountries.map((country) => ({
      code: country.code,
      name: country.name,
      companiesCount: country._count.companies,
      percentage: Math.round((country._count.companies / totalCompanies) * 100),
    })),
    topCategories: topCategories.map((category) => ({
      slug: category.slug,
      name: category.name,
      companiesCount: category._count.companies,
      percentage: Math.round(
        (category._count.companies / totalCompanies) * 100,
      ),
    })),
    recentActivity,
  };
}

// إدارة الشركات
export async function getCompaniesForAdmin(
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    city?: string;
    country?: string;
    isVerified?: boolean;
    isFeatured?: boolean;
    isActive?: boolean;
    rating?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {},
) {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    city,
    country,
    isVerified,
    isFeatured,
    isActive,
    rating,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const skip = (page - 1) * limit;

  const where: Prisma.CompanyWhereInput = {
    // إذا تم تحديد isActive صراحة، استخدمه، وإلا اعرض جميع الشركات
    ...(isActive !== undefined && { isActive }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(country && { country: { code: country } }),
    ...(city && { city: { slug: city } }),
    ...(category && { category: { slug: category } }),
    ...(isVerified !== undefined && { isVerified }),
    ...(isFeatured !== undefined && { isFeatured }),
    ...(rating && { rating: { gte: rating } }),
  };

  console.log("Database query where clause:", JSON.stringify(where, null, 2));

  console.log("Executing query with skip:", skip, "take:", limit);

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        country: true,
        city: true,
        category: true,
        owners: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: {
              where: { isApproved: true },
            },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.company.count({ where }),
  ]);

  console.log(
    "Query results - companies found:",
    companies.length,
    "total count:",
    total,
  );

  return {
    data: companies,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// إدارة المراجعات
export async function getReviewsForAdmin(
  filters: {
    page?: number;
    limit?: number;
    status?: "pending" | "approved" | "rejected";
    company?: string;
    rating?: number;
  } = {},
) {
  const { page = 1, limit = 20, status, company, rating } = filters;

  const skip = (page - 1) * limit;

  const where: Prisma.ReviewWhereInput = {
    ...(status === "pending" && { isApproved: false }),
    ...(status === "approved" && { isApproved: true }),
    ...(company && { company: { slug: company } }),
    ...(rating && { rating }),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      select: {
        id: true,
        title: true,
        comment: true,
        rating: true,
        isApproved: true,
        isVerified: true,
        createdAt: true,
        userName: true,
        userEmail: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            mainImage: true,
          },
        },
        images: true,
        user: {
          select: {
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
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

// الموافقة على مراجعة
export async function approveReview(reviewId: string) {
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { isApproved: true },
    include: { company: true },
  });

  // تحديث تقييم الشركة
  await updateCompanyRating(review.companyId);

  return review;
}

// رفض مراجعة
export async function rejectReview(reviewId: string) {
  return await prisma.review.delete({
    where: { id: reviewId },
  });
}

// تحديث متوسط التقييم للشركة
async function updateCompanyRating(companyId: string) {
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
      rating: Math.round(averageRating * 10) / 10,
      reviewsCount: totalReviews,
    },
  });
}

// إدارة المستخدمين
export async function getUsersForAdmin(
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: "active" | "inactive" | "all";
    isVerified?: "true" | "false" | "all";
    hasCompanies?: "true" | "false" | "all";
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {},
) {
  const {
    page = 1,
    limit = 20,
    search,
    role,
    status,
    isVerified,
    hasCompanies,
    dateFrom,
    dateTo,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    // فلتر الحالة النشطة
    ...(status && status !== "all" && { isActive: status === "active" }),

    // البحث في الاسم والإيميل والشركات المملوكة
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        {
          ownedCompanies: {
            some: {
              company: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          },
        },
      ],
    }),

    // فلتر الدور (دعم أدوار متعددة)
    ...(role &&
      role !== "all" && {
        role: role.includes(",") ? { in: role.split(",") } : (role as any),
      }),

    // فلتر التوثيق
    ...(isVerified &&
      isVerified !== "all" && { isVerified: isVerified === "true" }),

    // فلتر المستخدمين الذين لديهم شركات
    ...(hasCompanies &&
      hasCompanies !== "all" && {
        ownedCompanies: hasCompanies === "true" ? { some: {} } : { none: {} },
      }),

    // فلتر التاريخ
    ...(dateFrom &&
      dateTo && {
        createdAt: { gte: new Date(dateFrom), lte: new Date(dateTo) },
      }),
    ...(dateFrom &&
      !dateTo && {
        createdAt: { gte: new Date(dateFrom) },
      }),
    ...(!dateFrom &&
      dateTo && {
        createdAt: { lte: new Date(dateTo) },
      }),
  };

  // الترتيب
  const orderBy: any = {};
  if (sortBy === "lastLogin") {
    orderBy.lastLoginAt = sortOrder;
  } else if (sortBy === "reviewsCount") {
    orderBy.reviews = { _count: sortOrder };
  } else if (sortBy === "companiesCount") {
    orderBy.ownedCompanies = { _count: sortOrder };
  } else {
    orderBy[sortBy] = sortOrder;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        ownedCompanies: {
          include: {
            company: {
              select: {
                name: true,
                slug: true,
                isActive: true,
                isVerified: true,
                rating: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: {
              where: { isApproved: true },
            },
            ownedCompanies: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// تحديث حالة الشركة
export async function updateCompanyStatus(
  companyId: string,
  updates: {
    isVerified?: boolean;
    isFeatured?: boolean;
    isActive?: boolean;
  },
) {
  return await prisma.company.update({
    where: { id: companyId },
    data: updates,
  });
}

// حذف شركة
export async function deleteCompany(companyId: string) {
  return await prisma.company.update({
    where: { id: companyId },
    data: { isActive: false },
  });
}

// إنشاء شركة جديدة
export async function createCompany(data: {
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  longDescription?: string;
  categoryId: string;
  subCategoryId?: string;
  cityId: string;
  subAreaId?: string;
  countryId: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  mainImage?: string;
  logoImage?: string;
  latitude?: number;
  longitude?: number;
  services?: string[];
  specialties?: string[];
  isVerified?: boolean;
  isFeatured?: boolean;
}) {
  let slug: string;

  if (data.slug) {
    // التحقق من أن السلوغ المخصص فريد
    const existingCompany = await prisma.company.findFirst({
      where: { slug: data.slug },
    });

    if (existingCompany) {
      throw new Error("هذا السلوغ مستخدم بالفعل");
    }

    slug = createEnglishSlug(data.slug);
  } else {
    slug = await createUniqueEnglishSlug("company", data.name);
  }

  const { subCategoryId, subAreaId, ...restOfData } = data;

  const company = await prisma.company.create({
    data: {
      ...restOfData,
      slug,
      subCategoryId: subCategoryId || null,
      subAreaId: subAreaId || null,
      services: data.services || [],
      specialties: data.specialties || [],
    },
    include: {
      country: true,
      city: true,
      category: true,
      _count: {
        select: {
          reviews: {
            where: { isApproved: true },
          },
        },
      },
    },
  });

  return company;
}

// تحديث شركة
export async function updateCompany(
  companyId: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    longDescription: string;
    categoryId: string;
    subCategoryId?: string;
    cityId: string;
    subAreaId?: string;
    countryId: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    mainImage: string;
    logoImage: string;
    latitude: number;
    longitude: number;
    services: string[];
    specialties: string[];
    isVerified: boolean;
    isFeatured: boolean;
    isActive: boolean;
    additionalImages: string[];
  }>,
) {
  const { additionalImages, subCategoryId, subAreaId, ...companyData } = data;
  const updateData: any = { ...companyData };

  if (subCategoryId !== undefined) {
    updateData.subCategoryId = subCategoryId === "" ? null : subCategoryId;
  }

  if (subAreaId !== undefined) {
    updateData.subAreaId = subAreaId === "" ? null : subAreaId;
  }

  // إذا تم تمرير slug مخصص، استخدمه، وإلا أنشئ واحد من الاسم
  if (data.slug) {
    // التحقق من أن السلوغ المخصص فريد
    const existingCompany = await prisma.company.findFirst({
      where: {
        slug: data.slug,
        id: { not: companyId },
      },
    });

    if (existingCompany) {
      throw new Error("هذا السلوغ مستخدم بالفعل");
    }

    updateData.slug = createEnglishSlug(data.slug);
  } else if (data.name) {
    updateData.slug = await createUniqueEnglishSlug(
      "company",
      data.name,
      companyId,
    );
  }

  // استخدام transaction لتحديث الشركة والصور معاً
  const result = await prisma.$transaction(async (tx) => {
    // تحديث بيانات الشركة
    const updatedCompany = await tx.company.update({
      where: { id: companyId },
      data: updateData,
      include: {
        country: true,
        city: true,
        category: true,
        images: true,
        _count: {
          select: {
            reviews: {
              where: { isApproved: true },
            },
          },
        },
      },
    });

    // تحديث الصور الإضافية إذا تم تمريرها
    if (additionalImages !== undefined) {
      // حذف الصور القديمة
      await tx.companyImage.deleteMany({
        where: { companyId },
      });

      // إضافة الصور الجديدة
      if (additionalImages && additionalImages.length > 0) {
        await tx.companyImage.createMany({
          data: additionalImages.map((imageUrl, index) => ({
            companyId,
            imageUrl,
            altText: `صورة ${index + 1}`,
            sortOrder: index + 1,
          })),
        });
      }
    }

    return updatedCompany;
  });

  // تحديث السايت ماب (Sync URL/Slug)
  await updateCompanyInSitemap(result.id);

  return result;
}

// الحصول على شركة واحدة للأدمن
export async function getCompanyForAdmin(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
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
      socialMedia: {
        where: { isActive: true },
      },
      awards: {
        where: { isActive: true },
        orderBy: { year: "desc" },
      },
      owners: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          reviews: {
            where: { isApproved: true },
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
    };
  } catch (error) {
    console.error("خطأ في جلب ساعات العمل للشركة في الأدمن:", error);
    // إرجاع الشركة بدون ساعات العمل في حالة الخطأ
    return {
      ...company,
      workingHours: [],
    };
  }
}

// إحصائيات مفصلة
export async function getDetailedStats(
  period: "week" | "month" | "year" = "month",
) {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
      );
      break;
    case "year":
      startDate = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
      );
      break;
  }

  const stats = await prisma.dailyStats.findMany({
    where: {
      date: { gte: startDate },
    },
    orderBy: { date: "asc" },
  });

  return stats;
}

// تصدير البيانات
export async function exportCompaniesData(format: "csv" | "json" = "csv") {
  const companies = await prisma.company.findMany({
    where: { isActive: true },
    include: {
      country: true,
      city: true,
      category: true,
      reviews: {
        where: { isApproved: true },
        select: {
          rating: true,
          createdAt: true,
        },
      },
    },
  });

  if (format === "json") {
    return companies;
  }

  // تحويل إلى CSV
  const csvHeaders = [
    "اسم الشركة",
    "الوصف",
    "الفئة",
    "البلد",
    "المدينة",
    "الهاتف",
    "البريد الإلكتروني",
    "الموقع الإلكتروني",
    "التقييم",
    "عدد المراجعات",
    "موثق",
    "مميز",
    "تاريخ الإنشاء",
  ].join(",");

  const csvRows = companies.map((company) =>
    [
      `"${company.name}"`,
      `"${company.description || ""}"`,
      `"${company.category.name}"`,
      `"${company.country.name}"`,
      `"${company.city.name}"`,
      `"${company.phone || ""}"`,
      `"${company.email || ""}"`,
      `"${company.website || ""}"`,
      company.rating,
      company.reviewsCount,
      company.isVerified ? "نعم" : "لا",
      company.isFeatured ? "نعم" : "لا",
      company.createdAt.toISOString().split("T")[0],
    ].join(","),
  );

  return [csvHeaders, ...csvRows].join("\n");
}

// النسخ الاحتياطي
export async function createBackup() {
  const backup = {
    timestamp: new Date().toISOString(),
    countries: await prisma.country.findMany(),
    cities: await prisma.city.findMany(),
    categories: await prisma.category.findMany(),
    companies: await prisma.company.findMany({
      include: {
        images: true,
        tags: true,
        workingHours: true,
        socialMedia: true,
        awards: true,
      },
    }),
    reviews: await prisma.review.findMany({
      include: {
        images: true,
      },
    }),
    users: await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    }),
  };

  return backup;
}

// البحث في لوحة التحكم
export async function adminSearch(
  query: string,
  type: "companies" | "reviews" | "users" | "all" = "all",
) {
  const results: any = {};

  if (type === "companies" || type === "all") {
    results.companies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        country: true,
        city: true,
        category: true,
      },
      take: 10,
    });
  }

  if (type === "reviews" || type === "all") {
    results.reviews = await prisma.review.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { comment: { contains: query, mode: "insensitive" } },
          { userName: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        company: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      take: 10,
    });
  }

  if (type === "users" || type === "all") {
    results.users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      take: 10,
    });
  }

  return results;
}

// جلب جميع البلدان النشطة
export async function getAllCountries() {
  return await prisma.country.findMany({
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
}

// جلب جميع الفئات النشطة
export async function getAllCategories() {
  return await prisma.category.findMany({
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
}

// جلب المدن حسب البلد
export async function getCitiesByCountry(countryId: string) {
  return await prisma.city.findMany({
    where: {
      countryId,
      isActive: true,
    },
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
}

// تحليلات متقدمة
export async function getAdvancedAnalytics() {
  const [
    topRatedCompanies,
    mostReviewedCompanies,
    recentGrowth,
    categoryPerformance,
    countryPerformance,
  ] = await Promise.all([
    // أعلى الشركات تقييماً
    prisma.company.findMany({
      where: {
        isActive: true,
        reviewsCount: { gte: 5 },
      },
      include: {
        country: true,
        city: true,
        category: true,
      },
      orderBy: { rating: "desc" },
      take: 10,
    }),

    // أكثر الشركات مراجعة
    prisma.company.findMany({
      where: { isActive: true },
      include: {
        country: true,
        city: true,
        category: true,
      },
      orderBy: { reviewsCount: "desc" },
      take: 10,
    }),

    // نمو آخر 7 أيام
    prisma.dailyStats.findMany({
      where: {
        date: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { date: "asc" },
    }),

    // أداء الفئات
    prisma.category.findMany({
      include: {
        companies: {
          where: { isActive: true },
          select: {
            rating: true,
            reviewsCount: true,
          },
        },
      },
    }),

    // أداء البلدان
    prisma.country.findMany({
      include: {
        companies: {
          where: { isActive: true },
          select: {
            rating: true,
            reviewsCount: true,
          },
        },
      },
    }),
  ]);

  return {
    topRatedCompanies,
    mostReviewedCompanies,
    recentGrowth,
    categoryPerformance: categoryPerformance.map((cat) => ({
      ...cat,
      averageRating:
        cat.companies.length > 0
          ? cat.companies.reduce((sum, comp) => sum + comp.rating, 0) /
            cat.companies.length
          : 0,
      totalReviews: cat.companies.reduce(
        (sum, comp) => sum + comp.reviewsCount,
        0,
      ),
    })),
    countryPerformance: countryPerformance.map((country) => ({
      ...country,
      averageRating:
        country.companies.length > 0
          ? country.companies.reduce((sum, comp) => sum + comp.rating, 0) /
            country.companies.length
          : 0,
      totalReviews: country.companies.reduce(
        (sum, comp) => sum + comp.reviewsCount,
        0,
      ),
    })),
  };
}

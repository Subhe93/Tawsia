import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { CompanyDashboardStats } from '@/lib/types/database'

// إحصائيات داشبورد الشركة
export async function getCompanyDashboardStats(companyId: string): Promise<CompanyDashboardStats> {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

  const [
    company,
    totalReviews,
    pendingReviews,
    approvedReviews,
    averageRatingResult,
    monthlyReviews,
    ratingDistribution,
    dailyViews
  ] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        rating: true,
        reviewsCount: true,
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        city: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    }),
    prisma.review.count({
      where: { companyId, isApproved: true }
    }),
    prisma.review.count({
      where: { companyId, isApproved: false }
    }),
    prisma.review.count({
      where: { companyId, isApproved: true }
    }),
    prisma.review.aggregate({
      where: { companyId, isApproved: true },
      _avg: { rating: true }
    }),
    prisma.review.count({
      where: {
        companyId,
        isApproved: true,
        createdAt: { gte: lastMonth }
      }
    }),
    prisma.review.groupBy({
      by: ['rating'],
      where: {
        companyId,
        isApproved: true
      },
      _count: true
    }),
    // محاكاة بيانات المشاهدات اليومية (في التطبيق الحقيقي ستأتي من Google Analytics أو نظام تتبع)
    Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 100) + 20
      }
    }).reverse()
  ])

  if (!company) {
    throw new Error('الشركة غير موجودة')
  }

  // الحصول على الشركات المنافسة
  const competitors = await prisma.company.findMany({
    where: {
      isActive: true,
      id: { not: companyId },
      categoryId: company.category.slug,
      city: {
        slug: company.city.slug
      }
    },
    select: {
      name: true,
      rating: true,
      reviewsCount: true
    },
    orderBy: { rating: 'desc' },
    take: 5
  })

  const totalViews = dailyViews.reduce((sum, day) => sum + day.views, 0)
  const monthlyViews = dailyViews.slice(-30).reduce((sum, day) => sum + day.views, 0)

  return {
    overview: {
      totalReviews,
      averageRating: Math.round((averageRatingResult._avg.rating || 0) * 10) / 10,
      totalViews,
      monthlyViews,
      responseRate: 85 // نسبة الرد (محاكاة)
    },
    reviews: {
      pending: pendingReviews,
      approved: approvedReviews,
      byRating: ratingDistribution.map(item => ({
        rating: item.rating,
        count: item._count
      }))
    },
    traffic: {
      daily: dailyViews,
      sources: [
        { source: 'البحث المباشر', views: Math.floor(totalViews * 0.4), percentage: 40 },
        { source: 'وسائل التواصل', views: Math.floor(totalViews * 0.25), percentage: 25 },
        { source: 'محركات البحث', views: Math.floor(totalViews * 0.20), percentage: 20 },
        { source: 'مواقع أخرى', views: Math.floor(totalViews * 0.15), percentage: 15 }
      ]
    },
    competitors
  }
}

// الحصول على مراجعات الشركة للمالك
export async function getCompanyReviewsForOwner(companyId: string, filters: {
  page?: number
  limit?: number
  status?: 'all' | 'approved' | 'pending'
  rating?: number
} = {}) {
  const {
    page = 1,
    limit = 10,
    status = 'all',
    rating
  } = filters

  const skip = (page - 1) * limit

  const where: Prisma.ReviewWhereInput = {
    companyId,
    ...(status === 'approved' && { isApproved: true }),
    ...(status === 'pending' && { isApproved: false }),
    ...(rating && { rating })
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        images: true,
        ratings: true,
        user: {
          select: {
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.review.count({ where })
  ])

  return {
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

// تحديث معلومات الشركة
export async function updateCompanyInfo(companyId: string, data: Prisma.CompanyUpdateInput) {
  return await prisma.company.update({
    where: { id: companyId },
    data,
    include: {
      country: true,
      city: true,
      category: true
    }
  })
}

// إدارة صور الشركة
export async function addCompanyImage(companyId: string, imageUrl: string, altText?: string) {
  const imagesCount = await prisma.companyImage.count({
    where: { companyId, isActive: true }
  })

  return await prisma.companyImage.create({
    data: {
      companyId,
      imageUrl,
      altText,
      sortOrder: imagesCount
    }
  })
}

export async function deleteCompanyImage(imageId: string) {
  return await prisma.companyImage.update({
    where: { id: imageId },
    data: { isActive: false }
  })
}

export async function reorderCompanyImages(companyId: string, imageOrders: { id: string, sortOrder: number }[]) {
  const updatePromises = imageOrders.map(({ id, sortOrder }) =>
    prisma.companyImage.update({
      where: { id },
      data: { sortOrder }
    })
  )

  return await Promise.all(updatePromises)
}

// إدارة ساعات العمل
export async function updateWorkingHours(companyId: string, workingHours: Record<string, {
  openTime?: string
  closeTime?: string
  isClosed?: boolean
}>) {
  const updatePromises = Object.entries(workingHours).map(([day, hours]) =>
    prisma.workingHours.upsert({
      where: {
        companyId_dayOfWeek: {
          companyId,
          dayOfWeek: day
        }
      },
      update: {
        openTime: hours.isClosed ? null : hours.openTime,
        closeTime: hours.isClosed ? null : hours.closeTime,
        isClosed: hours.isClosed || false
      },
      create: {
        companyId,
        dayOfWeek: day,
        openTime: hours.isClosed ? null : hours.openTime,
        closeTime: hours.isClosed ? null : hours.closeTime,
        isClosed: hours.isClosed || false
      }
    })
  )

  return await Promise.all(updatePromises)
}

// إدارة وسائل التواصل الاجتماعي
export async function updateSocialMedia(companyId: string, socialMedia: Record<string, string>) {
  // حذف الروابط الحالية
  await prisma.socialMedia.deleteMany({
    where: { companyId }
  })

  // إضافة الروابط الجديدة
  const createPromises = Object.entries(socialMedia)
    .filter(([platform, url]) => url.trim())
    .map(([platform, url]) =>
      prisma.socialMedia.create({
        data: {
          companyId,
          platform,
          url
        }
      })
    )

  return await Promise.all(createPromises)
}

// إدارة العلامات
export async function updateCompanyTags(companyId: string, tags: string[]) {
  // حذف العلامات الحالية
  await prisma.companyTag.deleteMany({
    where: { companyId }
  })

  // إضافة العلامات الجديدة
  const createPromises = tags
    .filter(tag => tag.trim())
    .map(tag =>
      prisma.companyTag.create({
        data: {
          companyId,
          tagName: tag.trim()
        }
      })
    )

  return await Promise.all(createPromises)
}

// إضافة جائزة للشركة
export async function addCompanyAward(companyId: string, awardData: {
  title: string
  description?: string
  year?: number
  awardType: 'GOLD' | 'SILVER' | 'BRONZE' | 'CERTIFICATE'
  issuer?: string
  imageUrl?: string
}) {
  return await prisma.award.create({
    data: {
      companyId,
      ...awardData
    }
  })
}

// حذف جائزة
export async function deleteCompanyAward(awardId: string) {
  return await prisma.award.update({
    where: { id: awardId },
    data: { isActive: false }
  })
}

// التحقق من ملكية الشركة
export async function verifyCompanyOwnership(companyId: string, userId: string) {
  const ownership = await prisma.companyOwner.findFirst({
    where: {
      companyId,
      userId,
      company: { isActive: true },
      user: { isActive: true }
    },
    include: {
      company: {
        select: {
          name: true,
          slug: true
        }
      }
    }
  })

  return ownership
}

// الحصول على شركات المستخدم
export async function getUserCompanies(userId: string) {
  const ownerships = await prisma.companyOwner.findMany({
    where: {
      userId,
      company: { isActive: true }
    },
    include: {
      company: {
        include: {
          country: true,
          city: true,
          category: true,
          _count: {
            select: {
              reviews: {
                where: { isApproved: true }
              }
            }
          }
        }
      }
    }
  })

  return ownerships.map(ownership => ownership.company)
}

// إحصائيات مقارنة مع المنافسين
export async function getCompetitorAnalysis(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      category: true,
      city: true
    }
  })

  if (!company) {
    throw new Error('الشركة غير موجودة')
  }

  const competitors = await prisma.company.findMany({
    where: {
      isActive: true,
      id: { not: companyId },
      categoryId: company.categoryId,
      cityId: company.cityId
    },
    select: {
      name: true,
      rating: true,
      reviewsCount: true
    },
    orderBy: { rating: 'desc' },
    take: 10
  })

  const categoryAverage = await prisma.company.aggregate({
    where: {
      isActive: true,
      categoryId: company.categoryId
    },
    _avg: {
      rating: true,
      reviewsCount: true
    }
  })

  return {
    company: {
      name: company.name,
      rating: company.rating,
      reviewsCount: company.reviewsCount
    },
    competitors,
    categoryAverage: {
      rating: Math.round((categoryAverage._avg.rating || 0) * 10) / 10,
      reviewsCount: Math.round(categoryAverage._avg.reviewsCount || 0)
    },
    position: competitors.filter(comp => comp.rating > company.rating).length + 1
  }
}

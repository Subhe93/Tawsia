import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Get reviews with advanced filtering for admin
export async function getReviewsForAdmin(filters: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'all';
  rating?: number;
  search?: string;
  companyId?: string;
  startDate?: Date;
  endDate?: Date;
} = {}) {
  const {
    page = 1,
    limit = 10,
    status = 'all',
    rating,
    search,
    companyId,
    startDate,
    endDate
  } = filters;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.ReviewWhereInput = {};

  if (status === 'pending') {
    where.isApproved = false;
  } else if (status === 'approved') {
    where.isApproved = true;
  }

  if (rating) {
    where.rating = rating;
  }

  if (companyId) {
    where.companyId = companyId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { comment: { contains: search, mode: 'insensitive' } },
      { userName: { contains: search, mode: 'insensitive' } },
      { company: { name: { contains: search, mode: 'insensitive' } } }
    ];
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        images: {
          select: {
            id: true,
            imageUrl: true,
            altText: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.review.count({ where })
  ]);

  return {
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

// Get review statistics
export async function getReviewStats() {
  const [
    totalReviews,
    pendingReviews,
    approvedReviews,
    averageRatingResult,
    ratingDistribution,
    recentReviews
  ] = await Promise.all([
    prisma.review.count(),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.review.count({ where: { isApproved: true } }),
    prisma.review.aggregate({
      where: { isApproved: true },
      _avg: { rating: true }
    }),
    prisma.review.groupBy({
      by: ['rating'],
      where: { isApproved: true },
      _count: true,
      orderBy: { rating: 'desc' }
    }),
    prisma.review.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    })
  ]);

  return {
    totalReviews,
    pendingReviews,
    approvedReviews,
    averageRating: Math.round((averageRatingResult._avg.rating || 0) * 10) / 10,
    approvalRate: totalReviews > 0 ? Math.round((approvedReviews / totalReviews) * 100) : 0,
    ratingDistribution: ratingDistribution.map(item => ({
      rating: item.rating,
      count: item._count,
      percentage: totalReviews > 0 ? Math.round((item._count / totalReviews) * 100) : 0
    })),
    recentReviews
  };
}

// Get review reports with filtering
export async function getReviewReports(filters: {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'all';
  reason?: string;
  startDate?: Date;
  endDate?: Date;
} = {}) {
  const {
    page = 1,
    limit = 10,
    status = 'all',
    reason,
    startDate,
    endDate
  } = filters;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.ReviewReportWhereInput = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  if (reason) {
    where.reason = reason;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [reports, total] = await Promise.all([
    prisma.reviewReport.findMany({
      where,
      include: {
        review: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.reviewReport.count({ where })
  ]);

  return {
    data: reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

// Get report statistics
export async function getReportStats() {
  const [
    totalReports,
    pendingReports,
    approvedReports,
    rejectedReports,
    reportsByReason
  ] = await Promise.all([
    prisma.reviewReport.count(),
    prisma.reviewReport.count({ where: { status: 'PENDING' } }),
    prisma.reviewReport.count({ where: { status: 'APPROVED' } }),
    prisma.reviewReport.count({ where: { status: 'REJECTED' } }),
    prisma.reviewReport.groupBy({
      by: ['reason'],
      _count: true,
      orderBy: { _count: { reason: 'desc' } }
    })
  ]);

  return {
    totalReports,
    pendingReports,
    approvedReports,
    rejectedReports,
    processingRate: totalReports > 0 ? Math.round(((approvedReports + rejectedReports) / totalReports) * 100) : 0,
    reportsByReason: reportsByReason.map(item => ({
      reason: item.reason,
      count: item._count,
      percentage: totalReports > 0 ? Math.round((item._count / totalReports) * 100) : 0
    }))
  };
}

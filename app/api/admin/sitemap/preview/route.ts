/**
 * API لمعاينة الشركات قبل إضافتها
 * POST /api/admin/sitemap/preview
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { distributeCompanies } from '@/lib/sitemap/distributor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      method = 'TOP_RATED',
      limit = 100,
      count, // للتوافق مع الإصدارات القديمة
      filters = {},
      fromId,
      toId,
      categoryId,
      cityId,
    } = body;

    const takeCount = limit || count || 100;

    // جلب IDs الشركات الموجودة في السايت ماب
    const existingCompanyIds = await prisma.sitemapEntry.findMany({
      where: {
        companyId: { not: null },
        isActive: true,
      },
      select: { companyId: true },
    });

    const existingIds = existingCompanyIds
      .map((e) => e.companyId)
      .filter((id): id is string => id !== null);

    // بناء شروط البحث
    const whereClause: any = {
      isActive: true,
    };

    // الشركات التي ليست في السايت ماب
    if (existingIds.length > 0) {
      whereClause.id = { notIn: existingIds };
    }

    // تطبيق الفلاتر
    if (filters.isVerified) whereClause.isVerified = true;
    if (filters.isFeatured) whereClause.isFeatured = true;
    if (filters.hasImage) whereClause.mainImage = { not: null };
    if (filters.minRating) {
      whereClause.rating = { gte: filters.minRating };
    }
    if (filters.minReviews) {
      whereClause.reviewsCount = { gte: filters.minReviews };
    }
    if (categoryId) whereClause.categoryId = categoryId;
    if (cityId) whereClause.cityId = cityId;

    // تطبيق نطاق IDs
    if (method === 'BY_ID_RANGE' && fromId && toId) {
      whereClause.id = {
        gte: fromId,
        lte: toId,
      };
    }

    // تحديد الترتيب
    let orderBy: any = {};
    switch (method) {
      case 'TOP_RATED':
        orderBy = [{ rating: 'desc' }, { reviewsCount: 'desc' }];
        break;
      case 'NEWEST_FIRST':
        orderBy = { createdAt: 'desc' };
        break;
      case 'OLDEST_FIRST':
        orderBy = { createdAt: 'asc' };
        break;
      case 'BY_ID_RANGE':
        orderBy = { id: 'asc' };
        break;
      case 'BY_CATEGORY':
        orderBy = { rating: 'desc' };
        break;
      case 'BY_CITY':
        orderBy = { rating: 'desc' };
        break;
      case 'RANDOM':
        // سنستخدم take فقط
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // جلب الشركات
    let companies;
    if (method === 'RANDOM') {
      // استعلام خاص للعشوائي
      const randomWhere = {
        ...whereClause,
        ...(filters.isVerified && { isVerified: true }),
        ...(filters.isFeatured && { isFeatured: true }),
        ...(filters.hasImage && { mainImage: { not: null } }),
      };

      // جلب جميع IDs المتاحة ثم اختيار عشوائي
      const allIds = await prisma.company.findMany({
        where: randomWhere,
        select: { id: true },
      });

      // اختيار عشوائي
      const shuffled = allIds.sort(() => 0.5 - Math.random());
      const selectedIds = shuffled.slice(0, takeCount).map((c) => c.id);

      companies = await prisma.company.findMany({
        where: {
          id: { in: selectedIds },
        },
        select: {
          id: true,
          slug: true,
          name: true,
          rating: true,
          reviewsCount: true,
          mainImage: true,
          isVerified: true,
          isFeatured: true,
          category: {
            select: { name: true },
          },
          city: {
            select: { name: true },
          },
        },
      });
    } else {
      companies = await prisma.company.findMany({
        where: whereClause,
        orderBy,
        take: takeCount,
        select: {
          id: true,
          slug: true,
          name: true,
          rating: true,
          reviewsCount: true,
          mainImage: true,
          isVerified: true,
          isFeatured: true,
          category: {
            select: { name: true },
          },
          city: {
            select: { name: true },
          },
        },
      });
    }

    // حساب التوزيع (اختياري - يمكن إزالته إذا كان يسبب مشاكل)
    let distribution = null;
    try {
      distribution = await distributeCompanies(companies.length);
    } catch (error) {
      console.warn('⚠️ خطأ في حساب التوزيع:', error);
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';

    return NextResponse.json({
      success: true,
      data: {
        companies: companies.map((c: any) => ({
          id: c.id,
          slug: c.slug,
          name: c.name || 'بدون اسم',
          rating: c.rating || 0,
          reviewsCount: c.reviewsCount || 0,
          hasImage: !!c.mainImage,
          isVerified: c.isVerified || false,
          isFeatured: c.isFeatured || false,
          category: c.category?.name || '',
          city: c.city?.name || '',
          previewUrl: `${baseUrl}/${c.slug}`,
        })),
        total: companies.length,
        count: companies.length, // للتوافق
        distribution: distribution ? {
          totalCompanies: distribution.totalCompanies,
          affectedFiles: distribution.affectedFiles,
          fileBreakdown: distribution.distribution.map((d) => ({
            fileName: d.fileName,
            fileIndex: d.fileIndex,
            willAdd: d.count,
            currentCount: d.currentCount,
            newCount: d.newCount,
            percentage: ((d.newCount / 10000) * 100).toFixed(2),
            isFull: d.isFull,
          })),
        } : null,
      },
    });
  } catch (error: any) {
    console.error('❌ خطأ في المعاينة:', error);
    console.error('تفاصيل الخطأ:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'فشل في معاينة الشركات',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}


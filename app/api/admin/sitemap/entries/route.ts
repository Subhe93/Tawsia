
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // التحقق من الصلاحيات (Admin Only)
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || 'ALL';
    const sitemapFile = searchParams.get('sitemapFile');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'addedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: Prisma.SitemapEntryWhereInput = {
      isActive: true,
    };

    // فلترة حسب النوع
    if (type !== 'ALL') {
      where.entryType = type as any;
    }

    // فلترة حسب الملف
    if (sitemapFile && sitemapFile !== 'ALL') {
      where.sitemapFile = sitemapFile;
    }

    // بحث في الرابط
    if (search) {
      where.OR = [
        { url: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    // جلب البيانات مع الترقيم
    const [entries, total] = await Promise.all([
      prisma.sitemapEntry.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          url: true,
          slug: true,
          entryType: true,
          sitemapFile: true,
          changeFrequency: true,
          priority: true,
          lastModified: true,
          addedAt: true,
        }
      }),
      prisma.sitemapEntry.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        entries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    console.error('خطأ في جلب روابط السايت ماب:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

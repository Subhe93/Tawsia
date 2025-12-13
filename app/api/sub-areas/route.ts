import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - جلب المناطق الفرعية للواجهة الأمامية
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('cityId');
    const countryCode = searchParams.get('countryCode');
    const search = searchParams.get('search');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where: any = {
      ...(activeOnly && { isActive: true }),
    };

    if (cityId) {
      where.cityId = cityId;
    }

    if (countryCode) {
      where.countryCode = countryCode;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const subAreas = await prisma.subArea.findMany({
      where,
      include: {
        city: true,
        country: true,
        _count: {
          select: {
            companies: {
              where: { isActive: true }
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // تحويل البيانات لتتطابق مع الواجهة المطلوبة
    const formattedSubAreas = subAreas.map(subArea => ({
      id: subArea.id,
      slug: subArea.slug,
      name: subArea.name,
      cityId: subArea.cityId,
      companiesCount: subArea._count.companies,
    }));

    return NextResponse.json({ 
      success: true,
      subAreas: formattedSubAreas
    });
  } catch (error) {
    console.error('خطأ في جلب المناطق الفرعية:', error);
    return NextResponse.json(
      { error: 'خطأ في جلب المناطق الفرعية' },
      { status: 500 }
    );
  }
}

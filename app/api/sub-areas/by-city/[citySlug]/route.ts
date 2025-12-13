import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - جلب المناطق الفرعية لمدينة محددة
export async function GET(
  request: NextRequest,
  { params }: { params: { citySlug: string } }
) {
  try {
    const { citySlug } = params;

    if (!citySlug) {
      return NextResponse.json({ error: 'معرف المدينة مطلوب' }, { status: 400 });
    }

    // البحث عن المدينة أولاً
    const city = await prisma.city.findUnique({
      where: { 
        slug: citySlug,
        isActive: true 
      },
      include: {
        country: true
      }
    });

    if (!city) {
      return NextResponse.json({ error: 'المدينة غير موجودة' }, { status: 404 });
    }

    // جلب المناطق الفرعية للمدينة
    const subAreas = await prisma.subArea.findMany({
      where: {
        cityId: city.id,
        isActive: true
      },
      include: {
        city: true,
        country: true,
        _count: {
          select: {
            companies: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      city,
      subAreas
    });
  } catch (error) {
    console.error('خطأ في جلب المناطق الفرعية للمدينة:', error);
    return NextResponse.json(
      { error: 'خطأ في جلب المناطق الفرعية للمدينة' },
      { status: 500 }
    );
  }
}

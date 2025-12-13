import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - جلب المناطق الفرعية لمدينة محددة
export async function GET(
  request: NextRequest,
  { params }: { params: { cityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: any = {
      cityId: params.cityId,
      isActive: true,
    };

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
            companies: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(subAreas);
  } catch (error) {
    console.error('خطأ في جلب المناطق الفرعية للمدينة:', error);
    return NextResponse.json(
      { error: 'خطأ في جلب المناطق الفرعية للمدينة' },
      { status: 500 }
    );
  }
}

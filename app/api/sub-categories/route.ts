import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - جلب الفئات الفرعية
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where: any = {
      ...(activeOnly && { isActive: true }),
      ...(categoryId && { categoryId }),
    };

    const subCategories = await prisma.subCategory.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            companies: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // تحويل البيانات لتتطابق مع الواجهة المطلوبة
    const formattedSubCategories = subCategories.map(subCategory => ({
      id: subCategory.id,
      slug: subCategory.slug,
      name: subCategory.name,
      categoryId: subCategory.categoryId,
      companiesCount: subCategory._count.companies,
    }));

    return NextResponse.json({
      success: true,
      subCategories: formattedSubCategories,
    });
  } catch (error) {
    console.error('خطأ في جلب الفئات الفرعية:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في الخادم أثناء جلب الفئات الفرعية',
      },
      { status: 500 }
    );
  }
}


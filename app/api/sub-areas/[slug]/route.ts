import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - جلب منطقة فرعية محددة بالـ slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ error: 'معرف المنطقة الفرعية مطلوب' }, { status: 400 });
    }

    const subArea = await prisma.subArea.findUnique({
      where: { 
        slug,
        isActive: true 
      },
      include: {
        city: {
          include: {
            country: true
          }
        },
        country: true,
        companies: {
          where: { isActive: true },
          include: {
            category: true,
            _count: {
              select: {
                reviews: {
                  where: { isApproved: true }
                }
              }
            }
          },
          orderBy: { rating: 'desc' }
        },
        _count: {
          select: {
            companies: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    if (!subArea) {
      return NextResponse.json({ error: 'المنطقة الفرعية غير موجودة' }, { status: 404 });
    }

    return NextResponse.json(subArea);
  } catch (error) {
    console.error('خطأ في جلب المنطقة الفرعية:', error);
    return NextResponse.json(
      { error: 'خطأ في جلب المنطقة الفرعية' },
      { status: 500 }
    );
  }
}

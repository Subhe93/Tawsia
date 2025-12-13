import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/company/awards - Get awards for a specific company
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: { message: 'معرف الشركة مطلوب' } },
        { status: 400 }
      );
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true }
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: { message: 'الشركة غير موجودة' } },
        { status: 404 }
      );
    }

    // Get active awards for the company
    const awards = await prisma.award.findMany({
      where: {
        companyId: companyId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        year: true,
        awardType: true,
        issuer: true,
        imageUrl: true,
        createdAt: true,
      },
      orderBy: {
        year: 'desc',
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: awards,
      meta: {
        companyName: company.name,
        totalAwards: awards.length,
      },
    });

  } catch (error) {
    console.error('خطأ في جلب جوائز الشركة:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'حدث خطأ أثناء جلب الجوائز',
          code: 'FETCH_COMPANY_AWARDS_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

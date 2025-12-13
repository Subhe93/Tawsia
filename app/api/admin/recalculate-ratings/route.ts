import { NextRequest, NextResponse } from 'next/server';
import { recalculateAllCompanyRatings } from '@/lib/database/queries';

// POST /api/admin/recalculate-ratings - Recalculate all company ratings
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin (you might want to add proper authentication)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { message: 'غير مصرح' } },
        { status: 401 }
      );
    }

    console.log('بدء إعادة حساب تقييمات جميع الشركات...');
    
    const companiesCount = await recalculateAllCompanyRatings();
    
    console.log(`تم إعادة حساب تقييمات ${companiesCount} شركة بنجاح`);

    return NextResponse.json({
      success: true,
      message: `تم إعادة حساب تقييمات ${companiesCount} شركة بنجاح`,
      companiesCount
    });

  } catch (error) {
    console.error('خطأ في إعادة حساب التقييمات:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'حدث خطأ أثناء إعادة حساب التقييمات',
          code: 'RECALCULATE_RATINGS_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

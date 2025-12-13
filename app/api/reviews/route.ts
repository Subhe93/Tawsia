import { NextRequest, NextResponse } from 'next/server';
import { createReview, getReviews } from '@/lib/database/queries';
import { createReviewNotification } from '@/lib/services/notification-service';
import { z } from 'zod';

// Schema for review validation
const CreateReviewSchema = z.object({
  companyId: z.string().min(1, 'معرف الشركة مطلوب'),
  userName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  userEmail: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  rating: z.number().int().min(1, 'التقييم يجب أن يكون من 1 إلى 5').max(5, 'التقييم يجب أن يكون من 1 إلى 5'),
  title: z.string().optional(), // جعل العنوان اختياري
  comment: z.string().min(10, 'التعليق يجب أن يكون 10 أحرف على الأقل').max(1000, 'التعليق لا يجب أن يتجاوز 1000 حرف'),
  images: z.array(z.string()).max(3, 'يمكن إضافة 3 صور كحد أقصى').optional(), // تعديل للسماح بروابط محلية
});

// GET /api/reviews - Get reviews for a company
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'newest';

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: { message: 'معرف الشركة مطلوب' } },
        { status: 400 }
      );
    }

    const result = await getReviews(companyId, {
      page,
      limit,
      sortBy: sortBy as any
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('خطأ في جلب التقييمات:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'حدث خطأ أثناء جلب التقييمات',
          code: 'FETCH_REVIEWS_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = CreateReviewSchema.parse(body);

    // Create review in database
    const review = await createReview({
      company: {
        connect: { id: validatedData.companyId }
      },
      userName: validatedData.userName,
      userEmail: validatedData.userEmail || null,
      rating: validatedData.rating,
      title: validatedData.title || '', // العنوان اختياري - قيمة افتراضية فارغة
      comment: validatedData.comment,
      isApproved: false, // Reviews need approval by default
      helpfulCount: 0,
      notHelpfulCount: 0,
      ...(validatedData.images && validatedData.images.length > 0 && {
        images: {
          create: validatedData.images.map((imageUrl, index) => ({
            imageUrl,
            sortOrder: index
          }))
        }
      })
    });

    // إنشاء إشعار للشركة عن المراجعة الجديدة
    try {
      await createReviewNotification(review.id, validatedData.companyId);
    } catch (notificationError) {
      console.error('خطأ في إنشاء إشعار المراجعة:', notificationError);
      // لا نوقف العملية إذا فشل إنشاء الإشعار
    }

    return NextResponse.json({
      success: true,
      data: review,
      message: 'تم إرسال التقييم بنجاح. سيتم مراجعته قبل النشر.'
    }, { status: 201 });

  } catch (error) {
    console.error('خطأ في إنشاء التقييم:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: 'بيانات غير صحيحة',
            details: error.errors,
            code: 'VALIDATION_ERROR'
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'حدث خطأ أثناء إرسال التقييم',
          code: 'CREATE_REVIEW_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

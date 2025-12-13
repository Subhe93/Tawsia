import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createReviewReplyNotification } from '@/lib/services/notification-service';

// Schema for reply validation
const CreateReplySchema = z.object({
  userName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  comment: z.string().min(5, 'الرد يجب أن يكون 5 أحرف على الأقل').max(500, 'الرد لا يجب أن يتجاوز 500 حرف'),
  isOwner: z.boolean().optional().default(false)
});

// GET /api/reviews/[reviewId]/replies - Get replies for a review
export async function GET(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params;
    
    const replies = await prisma.reviewReply.findMany({
      where: { 
        reviewId,
        isApproved: true 
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: replies
    });

  } catch (error) {
    console.error('خطأ في جلب الردود:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'حدث خطأ أثناء جلب الردود',
          code: 'FETCH_REPLIES_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

// POST /api/reviews/[reviewId]/replies - Create a new reply
export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params;
    const body = await request.json();
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: 'يجب تسجيل الدخول لإرسال رد' } },
        { status: 401 }
      );
    }
    
    // Validate input
    const validatedData = CreateReplySchema.parse(body);

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { 
        id: true,
        companyId: true
      }
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: { message: 'التقييم غير موجود' } },
        { status: 404 }
      );
    }

    // Check if user is company owner (if isOwner is true)
    let isFromOwner = false;
    if (validatedData.isOwner) {
      const ownership = await prisma.companyOwner.findFirst({
        where: {
          companyId: review.companyId,
          userId: session.user.id
        }
      });
      isFromOwner = !!ownership;
    }

    // Create reply
    const reply = await prisma.reviewReply.create({
      data: {
        reviewId,
        userId: session.user.id,
        content: validatedData.comment,
        isFromOwner
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // إنشاء إشعار عن الرد الجديد
    try {
      await createReviewReplyNotification(reply.id, review.companyId);
    } catch (notificationError) {
      console.error('خطأ في إنشاء إشعار الرد:', notificationError);
      // لا نوقف العملية إذا فشل إنشاء الإشعار
    }

    return NextResponse.json({
      success: true,
      data: reply,
      message: validatedData.isOwner 
        ? 'تم نشر الرد بنجاح'
        : 'تم إرسال الرد بنجاح. سيتم مراجعته قبل النشر.'
    }, { status: 201 });

  } catch (error) {
    console.error('خطأ في إنشاء الرد:', error);

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
          message: 'حدث خطأ أثناء إرسال الرد',
          code: 'CREATE_REPLY_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

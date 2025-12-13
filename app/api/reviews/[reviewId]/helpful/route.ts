import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/reviews/[reviewId]/helpful - Mark review as helpful
export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params;
    
    // Get current helpful count and increment it
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: 1
        }
      },
      select: {
        helpfulCount: true,
        notHelpfulCount: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        helpful: review.helpfulCount,
        notHelpful: review.notHelpfulCount
      },
      message: 'تم تسجيل إعجابك بهذا التقييم'
    });

  } catch (error) {
    console.error('خطأ في تسجيل الإعجاب:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'حدث خطأ أثناء تسجيل الإعجاب',
          code: 'HELPFUL_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[reviewId]/helpful - Remove helpful mark
export async function DELETE(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params;
    
    // Decrement helpful count (but don't go below 0)
    const currentReview = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { helpfulCount: true, notHelpfulCount: true }
    });

    if (!currentReview) {
      return NextResponse.json(
        { success: false, error: { message: 'التقييم غير موجود' } },
        { status: 404 }
      );
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: Math.max(0, currentReview.helpfulCount - 1)
      },
      select: {
        helpfulCount: true,
        notHelpfulCount: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        helpful: review.helpfulCount,
        notHelpful: review.notHelpfulCount
      },
      message: 'تم إلغاء الإعجاب'
    });

  } catch (error) {
    console.error('خطأ في إلغاء الإعجاب:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'حدث خطأ أثناء إلغاء الإعجاب',
          code: 'REMOVE_HELPFUL_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

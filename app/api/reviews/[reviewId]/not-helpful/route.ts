import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/reviews/[reviewId]/not-helpful - Mark review as not helpful
export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params;
    
    // Get current not helpful count and increment it
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        notHelpfulCount: {
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
      message: 'تم تسجيل عدم الإعجاب بهذا التقييم'
    });

  } catch (error) {
    console.error('خطأ في تسجيل عدم الإعجاب:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'حدث خطأ أثناء تسجيل عدم الإعجاب',
          code: 'NOT_HELPFUL_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[reviewId]/not-helpful - Remove not helpful mark
export async function DELETE(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params;
    
    // Decrement not helpful count (but don't go below 0)
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
        notHelpfulCount: Math.max(0, currentReview.notHelpfulCount - 1)
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
      message: 'تم إلغاء عدم الإعجاب'
    });

  } catch (error) {
    console.error('خطأ في إلغاء عدم الإعجاب:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'حدث خطأ أثناء إلغاء عدم الإعجاب',
          code: 'REMOVE_NOT_HELPFUL_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

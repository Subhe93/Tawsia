import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateCompanyRating } from '@/lib/database/queries';

// PATCH /api/admin/reviews/[reviewId] - Approve or reject a review
export async function PATCH(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params;
    const body = await request.json();
    const { action } = body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: { message: 'إجراء غير صالح' } },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Approve the review
      const review = await prisma.review.update({
        where: { id: reviewId },
        data: { isApproved: true },
        include: { company: true }
      });

      // Update company rating
      await updateCompanyRating(review.companyId);

      return NextResponse.json({
        success: true,
        data: review,
        message: 'تم الموافقة على التقييم بنجاح'
      });

    } else {
      // Reject (delete) the review
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: { company: true }
      });

      if (!review) {
        return NextResponse.json(
          { success: false, error: { message: 'التقييم غير موجود' } },
          { status: 404 }
        );
      }

      await prisma.review.delete({
        where: { id: reviewId }
      });

      // Update company rating after deletion
      await updateCompanyRating(review.companyId);

      return NextResponse.json({
        success: true,
        message: 'تم رفض وحذف التقييم بنجاح'
      });
    }

  } catch (error) {
    console.error('خطأ في معالجة التقييم:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'حدث خطأ أثناء معالجة التقييم',
          code: 'PROCESS_REVIEW_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

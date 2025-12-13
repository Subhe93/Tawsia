import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateCompanyRating } from '@/lib/database/queries';

// PATCH /api/admin/reports/[reportId] - Approve or reject a report
export async function PATCH(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const { reportId } = params;
    const body = await request.json();
    const { action } = body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: { message: 'إجراء غير صالح' } },
        { status: 400 }
      );
    }

    const report = await prisma.reviewReport.findUnique({
      where: { id: reportId },
      include: {
        review: {
          include: {
            company: true
          }
        }
      }
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: { message: 'البلاغ غير موجود' } },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Approve the report - delete the review and update report status
      await Promise.all([
        prisma.review.delete({
          where: { id: report.reviewId }
        }),
        prisma.reviewReport.update({
          where: { id: reportId },
          data: { status: 'APPROVED' }
        })
      ]);

      // Update company rating after review deletion
      await updateCompanyRating(report.review.companyId);

      return NextResponse.json({
        success: true,
        message: 'تم قبول البلاغ وحذف التقييم بنجاح'
      });

    } else {
      // Reject the report - keep the review and update report status
      await prisma.reviewReport.update({
        where: { id: reportId },
        data: { status: 'REJECTED' }
      });

      return NextResponse.json({
        success: true,
        message: 'تم رفض البلاغ. التقييم سيبقى منشوراً.'
      });
    }

  } catch (error) {
    console.error('خطأ في معالجة البلاغ:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'حدث خطأ أثناء معالجة البلاغ',
          code: 'PROCESS_REPORT_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

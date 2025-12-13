import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createNotification } from '@/lib/services/notification-service';

// Schema for report validation
const ReportReviewSchema = z.object({
  reason: z.enum([
    'SPAM',
    'INAPPROPRIATE_LANGUAGE',
    'FAKE_REVIEW',
    'HARASSMENT',
    'COPYRIGHT_VIOLATION',
    'OTHER'
  ], { message: 'سبب الإبلاغ غير صحيح' }),
  description: z.string().min(10, 'وصف المشكلة يجب أن يكون 10 أحرف على الأقل').max(500, 'وصف المشكلة لا يجب أن يتجاوز 500 حرف'),
  reporterEmail: z.string().email('البريد الإلكتروني غير صحيح').optional()
});

// POST /api/reviews/[reviewId]/report - Report a review
export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params;
    const body = await request.json();
    
    // Validate input
    const validatedData = ReportReviewSchema.parse(body);

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, title: true, company: { select: { id: true, name: true } } }
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: { message: 'التقييم غير موجود' } },
        { status: 404 }
      );
    }

    // Create report
    const report = await prisma.reviewReport.create({
      data: {
        reviewId,
        reason: validatedData.reason,
        description: validatedData.description,
        reporterEmail: validatedData.reporterEmail,
        status: 'PENDING'
      }
    });

    await createNotification({
        type: 'SYSTEM',
        title: 'بلاغ جديد على مراجعة',
        message: `تم استلام بلاغ جديد على مراجعة "${review.title}" لشركة ${review.company.name}`,
        companyId: review.company.id,
        data: { reportId: report.id, reviewId: review.id },
    });

    // Get reason text in Arabic
    const reasonTexts = {
      SPAM: 'رسائل مزعجة',
      INAPPROPRIATE_LANGUAGE: 'لغة غير لائقة',
      FAKE_REVIEW: 'تقييم مزيف',
      HARASSMENT: 'تحرش',
      COPYRIGHT_VIOLATION: 'انتهاك حقوق الطبع',
      OTHER: 'أخرى'
    };

    return NextResponse.json({
      success: true,
      data: {
        reportId: report.id,
        reason: reasonTexts[validatedData.reason],
        status: 'تم الإرسال'
      },
      message: 'تم إرسال البلاغ بنجاح. سيتم مراجعته من قبل فريق الإدارة.'
    }, { status: 201 });

  } catch (error) {
    console.error('خطأ في إرسال البلاغ:', error);

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
          message: 'حدث خطأ أثناء إرسال البلاغ',
          code: 'CREATE_REPORT_ERROR'
        }
      },
      { status: 500 }
    );
  }
}
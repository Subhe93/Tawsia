import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// PATCH /api/company/reviews/[reviewId] - Approve or reject a review
export async function PATCH(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    // التحقق من صلاحيات المستخدم
    if (!['COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const { reviewId } = params
    const body = await request.json()
    const { isApproved } = body

    if (typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { error: 'قيمة isApproved مطلوبة' },
        { status: 400 }
      )
    }

    let companyId: string | null = null

    // للادمن والسوبر ادمن، يمكنهم الموافقة على أي مراجعة
    if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: { company: true }
      })

      if (!review) {
        return NextResponse.json({ error: 'المراجعة غير موجودة' }, { status: 404 })
      }
      
      companyId = review.companyId
    } else {
      // للشركات، جلب الشركة المرتبطة بالمستخدم
      const companyOwner = await prisma.companyOwner.findFirst({
        where: {
          userId: session.user.id,
          isPrimary: true
        }
      })

      if (!companyOwner) {
        return NextResponse.json({ error: 'لم يتم العثور على شركة مرتبطة بحسابك' }, { status: 404 })
      }

      companyId = companyOwner.companyId
    }

    // التحقق من أن المراجعة تخص هذه الشركة
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review || review.companyId !== companyId) {
      return NextResponse.json({ error: 'المراجعة غير موجودة أو لا تخص الشركة' }, { status: 404 })
    }

    if (isApproved) {
      // الموافقة على المراجعة
      const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: { isApproved: true },
        include: { company: true }
      })

      // تحديث تقييم الشركة
      await updateCompanyRating(companyId)

      return NextResponse.json({
        success: true,
        message: 'تم الموافقة على المراجعة بنجاح',
        review: updatedReview
      })
    } else {
      // رفض المراجعة (حذفها)
      await prisma.review.delete({
        where: { id: reviewId }
      })

      // تحديث تقييم الشركة بعد الحذف
      await updateCompanyRating(companyId)

      return NextResponse.json({
        success: true,
        message: 'تم رفض وحذف المراجعة بنجاح'
      })
    }

  } catch (error) {
    console.error('خطأ في معالجة المراجعة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// DELETE /api/company/reviews/[reviewId] - Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    // التحقق من صلاحيات المستخدم
    if (!['COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const { reviewId } = params

    let companyId: string | null = null

    // للادمن والسوبر ادمن، يمكنهم حذف أي مراجعة
    if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: { company: true }
      })

      if (!review) {
        return NextResponse.json({ error: 'المراجعة غير موجودة' }, { status: 404 })
      }
      
      companyId = review.companyId
    } else {
      // للشركات، جلب الشركة المرتبطة بالمستخدم
      const companyOwner = await prisma.companyOwner.findFirst({
        where: {
          userId: session.user.id,
          isPrimary: true
        }
      })

      if (!companyOwner) {
        return NextResponse.json({ error: 'لم يتم العثور على شركة مرتبطة بحسابك' }, { status: 404 })
      }

      companyId = companyOwner.companyId
    }

    // التحقق من أن المراجعة تخص هذه الشركة
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review || review.companyId !== companyId) {
      return NextResponse.json({ error: 'المراجعة غير موجودة أو لا تخص الشركة' }, { status: 404 })
    }

    // حذف المراجعة
    await prisma.review.delete({
      where: { id: reviewId }
    })

    // تحديث تقييم الشركة بعد الحذف
    await updateCompanyRating(companyId)

    return NextResponse.json({
      success: true,
      message: 'تم حذف المراجعة بنجاح'
    })

  } catch (error) {
    console.error('خطأ في حذف المراجعة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// دالة تحديث تقييم الشركة
async function updateCompanyRating(companyId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        companyId,
        isApproved: true
      },
      select: {
        rating: true
      }
    })

    if (reviews.length === 0) {
      await prisma.company.update({
        where: { id: companyId },
        data: {
          rating: 0,
          reviewsCount: 0
        }
      })
      return
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    await prisma.company.update({
      where: { id: companyId },
      data: {
        rating: averageRating,
        reviewsCount: reviews.length
      }
    })
  } catch (error) {
    console.error('خطأ في تحديث تقييم الشركة:', error)
  }
}

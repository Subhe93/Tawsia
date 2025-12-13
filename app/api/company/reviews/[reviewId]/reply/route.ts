import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const replySchema = z.object({
  content: z.string().min(1, 'محتوى الرد مطلوب').max(1000, 'الرد طويل جداً')
})

export async function POST(
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

    const body = await request.json()
    const validatedData = replySchema.parse(body)

    let companyId: string | null = null

    // للادمن والسوبر ادمن، يمكنهم الرد باسم أي شركة
    if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
      const review = await prisma.review.findUnique({
        where: { id: params.reviewId },
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

      // التحقق من الصلاحيات
      if (!companyOwner.permissions.includes('RESPOND_REVIEWS')) {
        return NextResponse.json({ error: 'ليس لديك صلاحية للرد على المراجعات' }, { status: 403 })
      }

      companyId = companyOwner.companyId
    }

    // التحقق من أن المراجعة تخص هذه الشركة
    const review = await prisma.review.findUnique({
      where: { id: params.reviewId }
    })

    if (!review || review.companyId !== companyId) {
      return NextResponse.json({ error: 'المراجعة غير موجودة أو لا تخص الشركة' }, { status: 404 })
    }

    // التحقق من عدم وجود رد مسبق من الشركة
    const existingReply = await prisma.reviewReply.findFirst({
      where: {
        reviewId: params.reviewId,
        userId: session.user.id
      }
    })

    if (existingReply) {
      return NextResponse.json({ error: 'لقد قمت بالرد على هذه المراجعة مسبقاً' }, { status: 409 })
    }

    // إنشاء الرد
    const reply = await prisma.reviewReply.create({
      data: {
        content: validatedData.content,
        reviewId: params.reviewId,
        userId: session.user.id,
        isFromOwner: true
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
    })

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الرد بنجاح',
      reply
    })

  } catch (error) {
    console.error('خطأ في إضافة الرد:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'بيانات غير صحيحة',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

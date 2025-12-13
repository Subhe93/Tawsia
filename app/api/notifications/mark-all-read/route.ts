import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // الحصول على معرف الشركة من المستخدم
    const userCompany = await prisma.companyOwner.findFirst({
      where: { userId: session.user.id },
      select: { companyId: true }
    })

    if (!userCompany) {
      return NextResponse.json(
        { error: 'لم يتم العثور على شركة مرتبطة بهذا المستخدم' },
        { status: 404 }
      )
    }

    // تحديث جميع الإشعارات كمقروءة
    await prisma.notification.updateMany({
      where: {
        companyId: userCompany.companyId,
        OR: [
          { userId: session.user.id },
          { userId: null }
        ],
        isRead: false
      },
      data: { isRead: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('خطأ في تحديث جميع الإشعارات:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الإشعارات' },
      { status: 500 }
    )
  }
}

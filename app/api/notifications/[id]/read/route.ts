import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // التحقق من أن الإشعار يخص المستخدم
    const notification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          {
            userId: null,
            company: {
              owners: {
                some: {
                  userId: session.user.id
                }
              }
            }
          }
        ]
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'الإشعار غير موجود أو غير مصرح لك بالوصول إليه' },
        { status: 404 }
      )
    }

    // تحديث حالة الإشعار كمقروء
    await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('خطأ في تحديث حالة الإشعار:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث حالة الإشعار' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    // جلب الإشعارات للشركة
    const notifications = await prisma.notification.findMany({
      where: {
        companyId: userCompany.companyId,
        OR: [
          { userId: session.user.id },
          { userId: null } // إشعارات عامة للشركة
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // حساب الإحصائيات
    const stats = await prisma.notification.aggregate({
      where: {
        companyId: userCompany.companyId,
        OR: [
          { userId: session.user.id },
          { userId: null }
        ],
        isRead: false
      },
      _count: true
    })

    const byType = await prisma.notification.groupBy({
      by: ['type'],
      where: {
        companyId: userCompany.companyId,
        OR: [
          { userId: session.user.id },
          { userId: null }
        ],
        isRead: false
      },
      _count: true
    })

    const typeStats = {
      review: 0,
      message: 0,
      system: 0,
      award: 0
    }

    byType.forEach(item => {
      typeStats[item.type as keyof typeof typeStats] = item._count
    })

    return NextResponse.json({
      notifications: notifications.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        isRead: notif.isRead,
        createdAt: notif.createdAt.toISOString(),
        data: notif.data
      })),
      stats: {
        unreadCount: stats._count,
        totalCount: notifications.length,
        byType: typeStats
      }
    })
  } catch (error) {
    console.error('خطأ في جلب الإشعارات:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الإشعارات' },
      { status: 500 }
    )
  }
}

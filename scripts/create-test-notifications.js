const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestNotifications() {
  try {
    // الحصول على أول شركة في النظام
    const company = await prisma.company.findFirst({
      select: { id: true, name: true }
    })

    if (!company) {
      console.log('لا توجد شركات في النظام')
      return
    }

    console.log(`إنشاء إشعارات تجريبية لشركة: ${company.name}`)

    // إنشاء إشعارات تجريبية
    const testNotifications = [
      {
        type: 'REVIEW',
        title: 'مراجعة جديدة',
        message: 'تم إضافة مراجعة جديدة من أحمد محمد لشركتك',
        companyId: company.id,
        isRead: false,
        data: { reviewId: 'test-review-1' }
      },
      {
        type: 'MESSAGE',
        title: 'رد على مراجعة',
        message: 'تم الرد على مراجعة من سارة أحمد بواسطة فريق الدعم',
        companyId: company.id,
        isRead: false,
        data: { replyId: 'test-reply-1', reviewId: 'test-review-2' }
      },
      {
        type: 'SYSTEM',
        title: 'تحديث النظام',
        message: 'تم تحديث لوحة تحكم الشركة بميزات جديدة',
        companyId: company.id,
        isRead: true,
        data: { updateType: 'dashboard' }
      },
      {
        type: 'AWARD',
        title: 'جائزة جديدة',
        message: 'مبروك! حصلت شركتك على جائزة أفضل خدمة عملاء',
        companyId: company.id,
        isRead: false,
        data: { awardName: 'أفضل خدمة عملاء' }
      },
      {
        type: 'REVIEW',
        title: 'مراجعة إيجابية',
        message: 'مراجعة جديدة من محمد علي مع تقييم 5 نجوم',
        companyId: company.id,
        isRead: false,
        data: { reviewId: 'test-review-3', rating: 5 }
      }
    ]

    for (const notification of testNotifications) {
      await prisma.notification.create({
        data: notification
      })
    }

    console.log(`تم إنشاء ${testNotifications.length} إشعارات تجريبية بنجاح`)
  } catch (error) {
    console.error('خطأ في إنشاء الإشعارات التجريبية:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestNotifications()

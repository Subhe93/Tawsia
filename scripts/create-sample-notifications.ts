import { prisma } from '@/lib/prisma'

// إنشاء إشعارات تجريبية للاختبار
export async function createSampleNotifications() {
  try {
    // الحصول على أول شركة في النظام
    const company = await prisma.company.findFirst({
      select: { id: true, name: true }
    })

    if (!company) {
      console.log('لا توجد شركات في النظام لإنشاء إشعارات تجريبية')
      return
    }

    // إنشاء إشعارات تجريبية
    const sampleNotifications = [
      {
        type: 'review' as const,
        title: 'مراجعة جديدة',
        message: 'تم إضافة مراجعة جديدة من أحمد محمد لشركتك',
        companyId: company.id,
        data: { reviewId: 'sample-review-1' }
      },
      {
        type: 'message' as const,
        title: 'رد على مراجعة',
        message: 'تم الرد على مراجعة من سارة أحمد بواسطة فريق الدعم',
        companyId: company.id,
        data: { replyId: 'sample-reply-1', reviewId: 'sample-review-2' }
      },
      {
        type: 'system' as const,
        title: 'تحديث النظام',
        message: 'تم تحديث لوحة تحكم الشركة بميزات جديدة',
        companyId: company.id,
        data: { updateType: 'dashboard' }
      },
      {
        type: 'award' as const,
        title: 'جائزة جديدة',
        message: 'مبروك! حصلت شركتك على جائزة أفضل خدمة عملاء',
        companyId: company.id,
        data: { awardName: 'أفضل خدمة عملاء' }
      }
    ]

    // إنشاء الإشعارات في الداتا بيز
    for (const notification of sampleNotifications) {
      await prisma.notification.create({
        data: {
          ...notification,
          isRead: false
        }
      })
    }

    console.log(`تم إنشاء ${sampleNotifications.length} إشعارات تجريبية لشركة ${company.name}`)
  } catch (error) {
    console.error('خطأ في إنشاء الإشعارات التجريبية:', error)
  }
}

// تشغيل إنشاء الإشعارات التجريبية
if (require.main === module) {
  createSampleNotifications()
    .then(() => {
      console.log('تم إنشاء الإشعارات التجريبية بنجاح')
      process.exit(0)
    })
    .catch((error) => {
      console.error('خطأ في إنشاء الإشعارات التجريبية:', error)
      process.exit(1)
    })
}

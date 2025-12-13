const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUserAndCompany() {
  try {
    // الحصول على أول مستخدم
    const user = await prisma.user.findFirst({
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      console.log('لا توجد مستخدمين في النظام')
      return
    }

    console.log(`المستخدم: ${user.name} (${user.email})`)

    // الحصول على أول شركة
    const company = await prisma.company.findFirst({
      select: { id: true, name: true }
    })

    if (!company) {
      console.log('لا توجد شركات في النظام')
      return
    }

    console.log(`الشركة: ${company.name}`)

    // التحقق من وجود علاقة بين المستخدم والشركة
    const companyOwner = await prisma.companyOwner.findFirst({
      where: {
        userId: user.id,
        companyId: company.id
      }
    })

    if (!companyOwner) {
      console.log('إنشاء علاقة بين المستخدم والشركة...')
      await prisma.companyOwner.create({
        data: {
          userId: user.id,
          companyId: company.id,
          role: 'OWNER',
          isPrimary: true,
          permissions: ['READ', 'WRITE', 'DELETE']
        }
      })
      console.log('تم إنشاء العلاقة بنجاح')
    } else {
      console.log('العلاقة موجودة بالفعل')
    }

    // التحقق من الإشعارات
    const notifications = await prisma.notification.findMany({
      where: { companyId: company.id },
      select: { id: true, title: true, type: true, isRead: true }
    })

    console.log(`عدد الإشعارات: ${notifications.length}`)
    notifications.forEach(notif => {
      console.log(`- ${notif.title} (${notif.type}) - ${notif.isRead ? 'مقروء' : 'غير مقروء'}`)
    })

  } catch (error) {
    console.error('خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserAndCompany()

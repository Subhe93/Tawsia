import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// دالة إرسال البريد الإلكتروني لإشعار الموافقة
async function sendCompanyApprovalEmail({
  ownerEmail,
  ownerName,
  companyName,
  loginUrl,
  dashboardUrl,
  tempPassword
}: {
  ownerEmail: string
  ownerName: string
  companyName: string
  loginUrl: string
  dashboardUrl: string
  tempPassword: string
}) {
  // هنا يمكن إضافة خدمة البريد الإلكتروني المفضلة
  // مثل SendGrid, Nodemailer, إلخ
  console.log('إرسال بريد إلكتروني إلى:', ownerEmail)
  console.log('تفاصيل الحساب:', {
    ownerName,
    companyName,
    loginUrl,
    dashboardUrl,
    tempPassword
  })
  
  // مؤقتاً سنقوم بطباعة التفاصيل فقط
  // يمكن استبدال هذا بخدمة بريد إلكتروني حقيقية
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const requestId = params.id
    const body = await request.json()
    
    if (!requestId) {
      return NextResponse.json({ error: 'معرف الطلب مطلوب' }, { status: 400 })
    }

    const { action, adminNotes } = body

    if (!action || !['approve', 'reject', 'needs_info'].includes(action)) {
      return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 })
    }

    // جلب تفاصيل الطلب
    const companyRequest = await prisma.companyRequest.findUnique({
      where: { id: requestId }
    })

    if (!companyRequest) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    if (action === 'approve') {
      // البحث عن البلد والمدينة والفئة
      const [country, city, category] = await Promise.all([
        prisma.country.findFirst({ where: { name: companyRequest.country } }),
        prisma.city.findFirst({ where: { name: companyRequest.city } }),
        prisma.category.findFirst({ where: { name: companyRequest.category } })
      ])

      if (!country || !city || !category) {
        return NextResponse.json({ 
          error: 'لم يتم العثور على البلد أو المدينة أو الفئة المطلوبة' 
        }, { status: 400 })
      }

      // إنشاء الشركة
      const company = await prisma.company.create({
        data: {
          name: companyRequest.companyName,
          slug: companyRequest.companyName.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, ''),
          description: companyRequest.description,
          shortDescription: companyRequest.description.substring(0, 200),
          categoryId: category.id,
          cityId: city.id,
          countryId: country.id,
          phone: companyRequest.phone,
          email: companyRequest.email,
          website: companyRequest.website,
          address: companyRequest.address,
          services: companyRequest.services.split(',').map(s => s.trim()),
          isActive: true,
          isVerified: false
        }
      })

      // البحث عن المستخدم المالك أو إنشاؤه
      let owner = await prisma.user.findUnique({
        where: { email: companyRequest.ownerEmail }
      })

      if (!owner) {
        // إنشاء كلمة مرور مؤقتة
        const tempPassword = Math.random().toString(36).slice(-8)
        
        owner = await prisma.user.create({
          data: {
            name: companyRequest.ownerName,
            email: companyRequest.ownerEmail,
            role: 'COMPANY_OWNER',
            isActive: true,
            isVerified: false,
            // سيتم إضافة تشفير كلمة المرور لاحقاً
            tempPassword: tempPassword
          }
        })
      } else if (owner.role !== 'COMPANY_OWNER') {
        // تحديث دور المستخدم إذا كان موجوداً
        owner = await prisma.user.update({
          where: { id: owner.id },
          data: { role: 'COMPANY_OWNER' }
        })
      }

      // ربط المالك بالشركة
      await prisma.companyOwner.create({
        data: {
          companyId: company.id,
          userId: owner.id,
          role: 'OWNER',
          isPrimary: true,
          permissions: ['MANAGE_INFO', 'MANAGE_IMAGES', 'RESPOND_REVIEWS', 'VIEW_ANALYTICS']
        }
      })

      // تحديث الطلب
      await prisma.companyRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          adminNotes,
          reviewedBy: session.user.id,
          reviewedAt: new Date()
        }
      })

      // إرسال إشعار بريد إلكتروني
      try {
        await sendCompanyApprovalEmail({
          ownerEmail: companyRequest.ownerEmail,
          ownerName: companyRequest.ownerName,
          companyName: companyRequest.companyName,
          loginUrl: `${process.env.NEXTAUTH_URL}/auth/signin`,
          dashboardUrl: `${process.env.NEXTAUTH_URL}/company-dashboard`,
          tempPassword: owner.tempPassword || 'سيتم إرسالها في بريد منفصل'
        })
      } catch (emailError) {
        console.error('خطأ في إرسال البريد الإلكتروني:', emailError)
        // لا نفشل العملية بسبب خطأ في البريد
      }

      return NextResponse.json({
        message: 'تم الموافقة على الطلب وإنشاء الشركة بنجاح',
        company,
        owner: {
          id: owner.id,
          email: owner.email,
          name: owner.name
        }
      })
    }

    // تحديث حالة الطلب
    const statusMap = {
      'reject': 'REJECTED',
      'needs_info': 'NEEDS_INFO'
    }

    const updatedRequest = await prisma.companyRequest.update({
      where: { id: requestId },
      data: {
        status: statusMap[action as keyof typeof statusMap],
        adminNotes,
        reviewedBy: session.user.id,
        reviewedAt: new Date()
      }
    })

    return NextResponse.json({
      message: action === 'reject' ? 'تم رفض الطلب' : 'تم تحديث حالة الطلب',
      request: updatedRequest
    })

  } catch (error) {
    console.error('خطأ في معالجة طلب الشركة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

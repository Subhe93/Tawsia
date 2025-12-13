import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'COMPANY_OWNER') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    // جلب الشركة المرتبطة بالمستخدم
    const companyOwner = await prisma.companyOwner.findFirst({
      where: {
        userId: session.user.id,
        isPrimary: true
      },
      include: {
        company: {
          include: {
            category: true,
            city: {
              include: {
                country: true
              }
            },
            images: true,
            socialMedia: true,
            workingHours: true,
            reviews: {
              where: { isApproved: true },
              select: {
                id: true,
                rating: true,
                createdAt: true
              }
            }
          }
        }
      }
    })

    if (!companyOwner) {
      return NextResponse.json({ error: 'لم يتم العثور على شركة مرتبطة بحسابك' }, { status: 404 })
    }

    const company = companyOwner.company
    
    // حساب الإحصائيات
    const stats = {
      totalReviews: company.reviews.length,
      averageRating: company.reviews.length > 0 
        ? company.reviews.reduce((sum, review) => sum + review.rating, 0) / company.reviews.length 
        : 0,
      monthlyReviews: company.reviews.filter(
        review => new Date(review.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length
    }

    return NextResponse.json({
      success: true,
      company: {
        ...company,
        stats
      },
      permissions: companyOwner.permissions
    })

  } catch (error) {
    console.error('خطأ في جلب ملف الشركة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'COMPANY_OWNER') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const body = await request.json()
    
    // جلب الشركة المرتبطة بالمستخدم
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
    if (!companyOwner.permissions.includes('MANAGE_INFO')) {
      return NextResponse.json({ error: 'ليس لديك صلاحية لتعديل معلومات الشركة' }, { status: 403 })
    }

    // تحديث معلومات الشركة
    const updatedCompany = await prisma.company.update({
      where: { id: companyOwner.companyId },
      data: {
        ...(body.description && { description: body.description }),
        ...(body.shortDescription && { shortDescription: body.shortDescription }),
        ...(body.phone && { phone: body.phone }),
        ...(body.email && { email: body.email }),
        ...(body.website && { website: body.website }),
        ...(body.address && { address: body.address }),
        ...(body.services && { services: body.services }),
        ...(body.specialties && { specialties: body.specialties }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم تحديث معلومات الشركة بنجاح',
      company: updatedCompany
    })

  } catch (error) {
    console.error('خطأ في تحديث ملف الشركة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

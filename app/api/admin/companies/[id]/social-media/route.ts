import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const socialMediaData = await request.json()
    
    console.log('تحديث وسائل التواصل للشركة:', params.id)
    console.log('بيانات وسائل التواصل:', socialMediaData)

    // التحقق من وجود الشركة
    const company = await prisma.company.findUnique({
      where: { id: params.id }
    })

    if (!company) {
      return NextResponse.json({ error: 'الشركة غير موجودة' }, { status: 404 })
    }
    
    // حذف وسائل التواصل الحالية
    await prisma.socialMedia.deleteMany({
      where: { companyId: params.id }
    })

    // إضافة وسائل التواصل الجديدة
    if (Array.isArray(socialMediaData) && socialMediaData.length > 0) {
      await prisma.socialMedia.createMany({
        data: socialMediaData.map(social => ({
          companyId: params.id,
          platform: social.platform,
          url: social.url,
          isActive: true
        }))
      })
    }

    console.log('تم تحديث وسائل التواصل بنجاح')
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('خطأ في حفظ وسائل التواصل:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `خطأ في حفظ وسائل التواصل: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ في حفظ وسائل التواصل' },
      { status: 500 }
    )
  }
}

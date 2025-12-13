import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { WorkingHoursService } from '@/lib/services/working-hours.service'

// GET - جلب ساعات العمل
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    // العثور على الشركة
    const companyOwner = await prisma.companyOwner.findFirst({
      where: { userId: session.user.id },
      select: { companyId: true }
    })

    if (!companyOwner) {
      return NextResponse.json({ error: 'لم يتم العثور على شركة مرتبطة بحسابك' }, { status: 404 })
    }

    // استخدام الخدمة الموحدة لجلب ساعات العمل
    const workingHours = await WorkingHoursService.getWorkingHours(companyOwner.companyId)

    console.log('GET endpoint returning working hours:', workingHours) // للتأكد من البيانات المرجعة

    return NextResponse.json({
      workingHours
    })

  } catch (error) {
    console.error('خطأ في جلب ساعات العمل:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// PUT - تحديث ساعات العمل
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const body = await request.json()
    const { workingHours } = body

    console.log('Received working hours data:', workingHours) // للتأكد من البيانات الواردة

    if (!Array.isArray(workingHours)) {
      return NextResponse.json({ error: 'بيانات ساعات العمل غير صحيحة' }, { status: 400 })
    }

    // العثور على الشركة
    const companyOwner = await prisma.companyOwner.findFirst({
      where: { userId: session.user.id },
      select: { companyId: true }
    })

    if (!companyOwner) {
      return NextResponse.json({ error: 'لم يتم العثور على شركة مرتبطة بحسابك' }, { status: 404 })
    }

    console.log('Company ID:', companyOwner.companyId) // للتأكد من معرف الشركة

    // استخدام الخدمة الموحدة لتحديث ساعات العمل
    const updatedWorkingHours = await WorkingHoursService.updateWorkingHours(
      companyOwner.companyId, 
      workingHours
    )

    console.log('Updated working hours:', updatedWorkingHours) // للتأكد من النتيجة

    return NextResponse.json({
      success: true,
      message: 'تم تحديث ساعات العمل بنجاح',
      workingHours: updatedWorkingHours
    })

  } catch (error) {
    console.error('خطأ في تحديث ساعات العمل:', error)
    
    // إرجاع رسالة خطأ أكثر تفصيلاً
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في تحديث ساعات العمل'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

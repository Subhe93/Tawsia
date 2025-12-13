import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { WorkingHoursService } from '@/lib/services/working-hours.service'

// GET - جلب ساعات العمل لشركة معينة (للمدير)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const companyId = params.id
    
    if (!companyId) {
      return NextResponse.json({ error: 'معرف الشركة مطلوب' }, { status: 400 })
    }

    // استخدام الخدمة الموحدة لجلب ساعات العمل
    const workingHours = await WorkingHoursService.getWorkingHours(companyId)

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

// PUT - تحديث ساعات العمل لشركة معينة (للمدير)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const companyId = params.id
    const body = await request.json()
    const { workingHours } = body

    if (!companyId) {
      return NextResponse.json({ error: 'معرف الشركة مطلوب' }, { status: 400 })
    }

    if (!Array.isArray(workingHours)) {
      return NextResponse.json({ error: 'بيانات ساعات العمل غير صحيحة' }, { status: 400 })
    }

    // استخدام الخدمة الموحدة لتحديث ساعات العمل
    const updatedWorkingHours = await WorkingHoursService.updateWorkingHours(companyId, workingHours)

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

// POST - إنشاء ساعات العمل الافتراضية لشركة معينة
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const companyId = params.id
    
    if (!companyId) {
      return NextResponse.json({ error: 'معرف الشركة مطلوب' }, { status: 400 })
    }

    // استخدام الخدمة الموحدة لإنشاء ساعات العمل الافتراضية
    const workingHours = await WorkingHoursService.createDefaultWorkingHours(companyId)

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء ساعات العمل الافتراضية بنجاح',
      workingHours
    })

  } catch (error) {
    console.error('خطأ في إنشاء ساعات العمل الافتراضية:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء ساعات العمل الافتراضية' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import importSessionManager from '@/lib/import-session-manager'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      )
    }

    const importId = params.id
    const importSession = importSessionManager.getSession(importId)

    if (!importSession) {
      return NextResponse.json(
        { error: 'جلسة الاستيراد غير موجودة' },
        { status: 404 }
      )
    }

    if (importSession.status === 'completed' || importSession.status === 'cancelled') {
      return NextResponse.json(
        { error: 'العملية منتهية بالفعل' },
        { status: 400 }
      )
    }

    importSessionManager.updateSession(importId, { status: 'cancelled' })

    // حذف الجلسة بعد دقيقة واحدة
    setTimeout(() => {
      importSessionManager.deleteSession(importId)
    }, 60000)

    return NextResponse.json({
      success: true,
      message: 'تم إلغاء عملية الاستيراد'
    })

  } catch (error) {
    console.error('خطأ في إلغاء الاستيراد:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إلغاء العملية' },
      { status: 500 }
    )
  }
}

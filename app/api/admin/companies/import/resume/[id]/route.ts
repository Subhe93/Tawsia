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

    if (importSession.status !== 'paused') {
      return NextResponse.json(
        { error: 'العملية ليست متوقفة حالياً' },
        { status: 400 }
      )
    }

    importSessionManager.updateSession(importId, { status: 'running' })

    return NextResponse.json({
      success: true,
      message: 'تم استكمال عملية الاستيراد'
    })

  } catch (error) {
    console.error('خطأ في استكمال الاستيراد:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في استكمال العملية' },
      { status: 500 }
    )
  }
}

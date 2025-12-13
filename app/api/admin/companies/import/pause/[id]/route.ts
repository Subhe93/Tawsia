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

    if (importSession.status !== 'running') {
      return NextResponse.json(
        { error: 'لا يمكن إيقاف العملية في حالتها الحالية' },
        { status: 400 }
      )
    }

    importSessionManager.updateSession(importId, { status: 'paused' })

    return NextResponse.json({
      success: true,
      message: 'تم إيقاف عملية الاستيراد مؤقتاً'
    })

  } catch (error) {
    console.error('خطأ في إيقاف الاستيراد:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إيقاف العملية' },
      { status: 500 }
    )
  }
}

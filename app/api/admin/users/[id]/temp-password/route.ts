import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const userId = params.id

    // جلب المستخدم مع كلمة المرور المؤقتة
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tempPassword: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // إذا لم تكن هناك كلمة مرور مؤقتة، قم بإنشائها
    if (!user.tempPassword) {
      const tempPassword = Math.random().toString(36).slice(-8)
      
      await prisma.user.update({
        where: { id: userId },
        data: { tempPassword }
      })
      
      user.tempPassword = tempPassword
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        tempPassword: user.tempPassword
      }
    })

  } catch (error) {
    console.error('خطأ في جلب كلمة المرور المؤقتة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

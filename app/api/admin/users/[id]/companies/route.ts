import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// ربط مستخدم بشركة كمالك
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const userId = params.id
    const body = await request.json()
    const { companyId, role = 'OWNER', isPrimary = false, permissions = [] } = body || {}

    if (!userId || !companyId) {
      return NextResponse.json({ error: 'معرف المستخدم ومعرف الشركة مطلوبان' }, { status: 400 })
    }

    const [user, company] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.company.findUnique({ where: { id: companyId } })
    ])

    if (!user) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    if (!company) return NextResponse.json({ error: 'الشركة غير موجودة' }, { status: 404 })

    const ownership = await prisma.companyOwner.upsert({
      where: {
        companyId_userId: { companyId, userId }
      },
      update: {
        role,
        isPrimary,
        permissions
      },
      create: {
        companyId,
        userId,
        role,
        isPrimary,
        permissions
      }
    })

    if (user.role !== 'COMPANY_OWNER' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'COMPANY_OWNER' }
      })
    }

    return NextResponse.json({ message: 'تم ربط المستخدم بالشركة بنجاح', ownership })
  } catch (error) {
    console.error('خطأ في ربط المستخدم بالشركة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// إلغاء الربط
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId') || ''
    const userId = params.id

    if (!userId || !companyId) {
      return NextResponse.json({ error: 'معرف المستخدم ومعرف الشركة مطلوبان' }, { status: 400 })
    }

    await prisma.companyOwner.delete({
      where: {
        companyId_userId: { companyId, userId }
      }
    })

    return NextResponse.json({ message: 'تم إلغاء ربط المستخدم بالشركة' })
  } catch (error) {
    console.error('خطأ في إلغاء ربط المستخدم بالشركة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}



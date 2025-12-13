import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
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
    
    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 })
    }

    // التحقق من أن المستخدم لا يحاول تعديل نفسه أو مستخدم بصلاحيات أعلى
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'لا يمكنك تعديل حسابك الخاص' }, { status: 403 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // التحقق من الصلاحيات
    if (session.user.role === 'ADMIN' && (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'ADMIN')) {
      return NextResponse.json({ error: 'لا يمكنك تعديل مستخدم بنفس صلاحياتك أو أعلى' }, { status: 403 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.role !== undefined && { role: body.role }),
        ...(body.isVerified !== undefined && { isVerified: body.isVerified }),
      },
      include: {
        ownedCompanies: {
          include: {
            company: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        },
        _count: {
          select: {
            reviews: {
              where: { isApproved: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'تم تحديث المستخدم بنجاح',
      user
    })

  } catch (error) {
    console.error('خطأ في تحديث المستخدم:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// ربط/إلغاء ربط مستخدم بشركة كمالك
// ملاحظة: مسارات ربط الشركات للمستخدم موجودة في: /api/admin/users/[id]/companies

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const userId = params.id
    
    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 })
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: 'لا يمكنك حذف حسابك الخاص' }, { status: 403 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    })

    return NextResponse.json({
      message: 'تم حذف المستخدم بنجاح'
    })

  } catch (error) {
    console.error('خطأ في حذف المستخدم:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

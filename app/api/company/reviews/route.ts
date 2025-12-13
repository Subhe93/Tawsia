import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    // التحقق من صلاحيات المستخدم
    if (!['COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') // 'all', 'approved', 'pending'

    let companyId: string | null = null

    // للادمن والسوبر ادمن، يمكنهم تمرير معرف الشركة
    if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
      companyId = searchParams.get('companyId')
      if (!companyId) {
        return NextResponse.json({ error: 'معرف الشركة مطلوب للادمن' }, { status: 400 })
      }
    } else {
      // للشركات، جلب الشركة المرتبطة بالمستخدم
      const companyOwner = await prisma.companyOwner.findFirst({
        where: {
          userId: session.user.id,
          isPrimary: true
        }
      })

      if (!companyOwner) {
        return NextResponse.json({ error: 'لم يتم العثور على شركة مرتبطة بحسابك' }, { status: 404 })
      }
      
      companyId = companyOwner.companyId
    }

    const skip = (page - 1) * limit

    const where: any = {
      companyId: companyId
    }

    if (status === 'approved') {
      where.isApproved = true
    } else if (status === 'pending') {
      where.isApproved = false
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({ where })
    ])

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('خطأ في جلب المراجعات:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

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
    
    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 })
    }

    // جلب تفاصيل المستخدم الكاملة
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedCompanies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
                isVerified: true,
                rating: true,
                reviewsCount: true,
                category: {
                  select: {
                    name: true
                  }
                },
                city: {
                  select: {
                    name: true
                  }
                },
                country: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        reviews: {
          where: { isApproved: true },
          include: {
            company: {
              select: {
                name: true,
                slug: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            reviews: {
              where: { isApproved: true }
            },
            ownedCompanies: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // إزالة كلمة المرور من الاستجابة
    const { password, ...userWithoutPassword } = user

    // حساب إحصائيات إضافية
    const stats = {
      totalCompanies: user.ownedCompanies.length,
      activeCompanies: user.ownedCompanies.filter(c => c.company.isActive).length,
      verifiedCompanies: user.ownedCompanies.filter(c => c.company.isVerified).length,
      totalReviews: user._count.reviews,
      averageCompanyRating: user.ownedCompanies.length > 0 
        ? user.ownedCompanies.reduce((sum, c) => sum + (c.company.rating || 0), 0) / user.ownedCompanies.length
        : 0,
      accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)), // أيام
      lastActivity: user.lastLoginAt ? Math.floor((Date.now() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24)) : null // أيام منذ آخر دخول
    }

    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        stats
      }
    })

  } catch (error) {
    console.error('خطأ في جلب تفاصيل المستخدم:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

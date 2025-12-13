import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    // إحصائيات عامة
    const [
      totalCompanies,
      totalUsers,
      totalReviews,
      pendingCompanies,
      pendingReviews,
      totalCountries,
      totalCities,
      totalCategories
    ] = await Promise.all([
      prisma.company.count(),
      prisma.user.count(),
      prisma.review.count(),
      prisma.companyRequest.count({ where: { status: 'PENDING' } }),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.country.count(),
      prisma.city.count(),
      prisma.category.count()
    ])

    // إحصائيات الشركات حسب الفئة
    const companiesByCategory = await prisma.category.findMany({
      select: {
        name: true,
        _count: {
          select: { companies: true }
        }
      }
    })

    // إحصائيات الشركات حسب البلد
    const companiesByCountry = await prisma.country.findMany({
      select: {
        name: true,
        _count: {
          select: { companies: true }
        }
      }
    })

    // أحدث المراجعات
    const recentReviews = await prisma.review.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: { name: true, slug: true }
        },
        user: {
          select: { name: true, avatar: true }
        }
      }
    })

    // أحدث طلبات الشركات
    const recentCompanyRequests = await prisma.companyRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { status: 'PENDING' },
      select: {
        id: true,
        companyName: true,
        email: true,
        createdAt: true,
        status: true
      }
    })

    // إحصائيات شهرية (آخر 6 أشهر) - مبسطة لأن الجدول قد لا يكون موجود
    const monthlyStats: any[] = []

    return NextResponse.json({
      overview: {
        totalCompanies,
        totalUsers,
        totalReviews,
        pendingCompanies,
        pendingReviews,
        totalCountries,
        totalCities,
        totalCategories
      },
      companiesByCategory,
      companiesByCountry,
      recentReviews,
      recentCompanyRequests,
      monthlyStats
    })

  } catch (error) {
    console.error('خطأ في جلب إحصائيات الادمن:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

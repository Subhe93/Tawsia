import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdminDashboardStats, getAdvancedAnalytics } from '@/lib/database/admin-queries'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    // جلب الإحصائيات الأساسية
    const basicStats = await getAdminDashboardStats()
    
    // جلب التحليلات المتقدمة
    const advancedStats = await getAdvancedAnalytics()

    return NextResponse.json({
      overview: basicStats.overview,
      growth: basicStats.growth,
      topCountries: basicStats.topCountries,
      topCategories: basicStats.topCategories,
      recentActivity: basicStats.recentActivity,
      topRatedCompanies: advancedStats.topRatedCompanies,
      mostReviewedCompanies: advancedStats.mostReviewedCompanies,
      categoryPerformance: advancedStats.categoryPerformance,
      countryPerformance: advancedStats.countryPerformance
    })

  } catch (error) {
    console.error('خطأ في جلب التحليلات:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

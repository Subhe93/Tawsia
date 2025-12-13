import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCompanyDashboardStats } from '@/lib/database/company-queries'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // الحصول على معرف الشركة من المستخدم
    const userCompany = await prisma.companyOwner.findFirst({
      where: { userId: session.user.id },
      select: { companyId: true }
    })

    if (!userCompany) {
      return NextResponse.json(
        { error: 'لم يتم العثور على شركة مرتبطة بهذا المستخدم' },
        { status: 404 }
      )
    }

    const stats = await getCompanyDashboardStats(userCompany.companyId)
    
    // تحويل البيانات إلى الشكل المطلوب للسايد بار
    const sidebarData = {
      id: stats.company?.id || '',
      name: stats.company?.name || '',
      rating: stats.company?.rating || 0,
      reviewsCount: stats.company?.reviewsCount || 0,
      category: stats.company?.category || { name: '', slug: '' },
      city: stats.company?.city || { name: '', slug: '' },
      pendingReviews: stats.reviews.pending,
      totalReviews: stats.overview.totalReviews,
      averageRating: stats.overview.averageRating
    }

    return NextResponse.json(sidebarData)
  } catch (error) {
    console.error('خطأ في جلب إحصائيات الشركة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب البيانات' },
      { status: 500 }
    )
  }
}

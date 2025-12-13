'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  MessageSquare, 
  Star,
  TrendingUp,
  Eye,
  Users,
  Calendar,
  Award,
  BarChart3,
  Building2,
  Settings,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

// محاكاة البيانات
const mockStats: CompanyDashboardStats = {
  overview: {
    totalReviews: 124,
    averageRating: 4.8,
    totalViews: 5847,
    monthlyViews: 1234,
    responseRate: 92
  },
  reviews: {
    pending: 5,
    approved: 119,
    byRating: [
      { rating: 5, count: 89 },
      { rating: 4, count: 23 },
      { rating: 3, count: 7 },
      { rating: 2, count: 3 },
      { rating: 1, count: 2 }
    ]
  },
  traffic: {
    daily: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      views: Math.floor(Math.random() * 100) + 20
    })),
    sources: [
      { source: 'البحث المباشر', views: 2340, percentage: 40 },
      { source: 'وسائل التواصل', views: 1462, percentage: 25 },
      { source: 'محركات البحث', views: 1169, percentage: 20 },
      { source: 'مواقع أخرى', views: 876, percentage: 15 }
    ]
  },
  competitors: [
    { name: 'شركة التقنيات المتقدمة', rating: 4.6, reviewsCount: 98 },
    { name: 'مؤسسة الابتكار الرقمي', rating: 4.5, reviewsCount: 156 },
    { name: 'شركة الحلول الذكية', rating: 4.3, reviewsCount: 87 }
  ]
}

export function CompanyDashboard() {
  const [stats, setStats] = useState<CompanyDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* ترحيب */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">مرحباً بك في لوحة تحكم شركتك</h1>
        <p className="text-blue-100">إدارة شاملة لصفحة شركتك ومراجعاتها وإحصائياتها</p>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">إجمالي المراجعات</p>
                <p className="text-3xl font-bold">{stats.overview.totalReviews}</p>
                <p className="text-sm text-blue-100 mt-1">{stats.reviews.pending} في الانتظار</p>
              </div>
              <MessageSquare className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">متوسط التقييم</p>
                <p className="text-3xl font-bold">{stats.overview.averageRating}</p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm text-yellow-100 mr-1">من 5 نجوم</span>
                </div>
              </div>
              <Star className="h-12 w-12 text-yellow-200 fill-current" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">مشاهدات الشهر</p>
                <p className="text-3xl font-bold">{stats.overview.monthlyViews.toLocaleString()}</p>
                <p className="text-sm text-green-100 mt-1">إجمالي: {stats.overview.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">معدل الاستجابة</p>
                <p className="text-3xl font-bold">{stats.overview.responseRate}%</p>
                <p className="text-sm text-purple-100 mt-1">ممتاز</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* توزيع التقييمات */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع التقييمات</CardTitle>
            <CardDescription>تفصيل التقييمات حسب عدد النجوم</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.reviews.byRating.map((item) => (
                <div key={item.rating} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-sm font-medium w-8">{item.rating}</span>
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                  <div className="flex-1 mx-4">
                    <Progress 
                      value={(item.count / stats.overview.totalReviews) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* مصادر الزيارات */}
        <Card>
          <CardHeader>
            <CardTitle>مصادر الزيارات</CardTitle>
            <CardDescription>من أين يأتي زوار صفحة شركتك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.traffic.sources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {source.source}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {source.views.toLocaleString()} ({source.percentage}%)
                      </span>
                    </div>
                    <Progress value={source.percentage} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* المنافسين */}
      <Card>
        <CardHeader>
          <CardTitle>تحليل المنافسين</CardTitle>
          <CardDescription>مقارنة أداء شركتك مع الشركات المشابهة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* شركتك */}
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-2 border-blue-200 dark:border-blue-700">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">ABC التقنية (شركتك)</p>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{stats.overview.averageRating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({stats.overview.totalReviews} تقييم)</span>
                  </div>
                </div>
              </div>
              <Badge className="bg-blue-600 text-white">المركز الأول</Badge>
            </div>

            {/* الشركات المنافسة */}
            {stats.competitors.map((competitor, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{index + 2}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{competitor.name}</p>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{competitor.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({competitor.reviewsCount} تقييم)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* إجراءات سريعة */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
          <CardDescription>المهام الأكثر استخداماً لإدارة شركتك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2" asChild>
              <Link href="/company-dashboard/reviews/pending">
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm">المراجعات الجديدة</span>
                <Badge variant="destructive" className="text-xs">{stats.reviews.pending}</Badge>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2" asChild>
              <Link href="/company-dashboard/info">
                <Building2 className="h-6 w-6" />
                <span className="text-sm">تحديث المعلومات</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2" asChild>
              <Link href="/company-dashboard/gallery">
                <Eye className="h-6 w-6" />
                <span className="text-sm">إدارة الصور</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2" asChild>
              <Link href="/company-dashboard/analytics">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">عرض التقارير</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

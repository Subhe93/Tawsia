'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  MessageSquare,
  Star,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AdvancedStats } from '@/components/admin/advanced-stats'

interface AnalyticsData {
  overview: {
    totalCompanies: number
    totalReviews: number
    totalUsers: number
    averageRating: number
    pendingRequests: number
    verifiedCompanies: number
    featuredCompanies: number
  }
  growth: {
    companiesGrowth: number
    reviewsGrowth: number
    usersGrowth: number
  }
  topCountries: Array<{
    code: string
    name: string
    companiesCount: number
    percentage: number
  }>
  topCategories: Array<{
    slug: string
    name: string
    companiesCount: number
    percentage: number
  }>
  recentActivity: Array<{
    type: 'company' | 'review' | 'user'
    title: string
    description: string
    date: string
  }>
  topRatedCompanies: Array<{
    id: string
    name: string
    rating: number
    reviewsCount: number
    country: { name: string }
    city: { name: string }
    category: { name: string }
  }>
  mostReviewedCompanies: Array<{
    id: string
    name: string
    rating: number
    reviewsCount: number
    country: { name: string }
    city: { name: string }
    category: { name: string }
  }>
  categoryPerformance: Array<{
    id: string
    name: string
    companiesCount: number
    averageRating: number
    totalReviews: number
  }>
  countryPerformance: Array<{
    id: string
    name: string
    companiesCount: number
    averageRating: number
    totalReviews: number
  }>
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }
  }, [session, status, router])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      if (!response.ok) {
        throw new Error('فشل في جلب التحليلات')
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      setError('حدث خطأ في تحميل التحليلات')
      console.error('خطأ في جلب التحليلات:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchAnalytics()
    }
  }, [session, period])

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('خطأ في تصدير البيانات:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
    return null
  }

  if (isLoading) {
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

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في تحميل التحليلات</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchAnalytics}>إعادة المحاولة</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            الإحصائيات والتحليلات
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            تحليل شامل لأداء المنصة ونشاط المستخدمين
          </p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
              <SelectItem value="year">سنة</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">إجمالي الشركات</p>
                <p className="text-3xl font-bold">{analytics.overview.totalCompanies.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {analytics.growth.companiesGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 ml-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 ml-1" />
                  )}
                  <span className="text-sm text-blue-100">
                    {analytics.growth.companiesGrowth > 0 ? '+' : ''}
                    {analytics.growth.companiesGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Building2 className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">إجمالي المراجعات</p>
                <p className="text-3xl font-bold">{analytics.overview.totalReviews.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {analytics.growth.reviewsGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 ml-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 ml-1" />
                  )}
                  <span className="text-sm text-green-100">
                    {analytics.growth.reviewsGrowth > 0 ? '+' : ''}
                    {analytics.growth.reviewsGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <MessageSquare className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold">{analytics.overview.totalUsers.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {analytics.growth.usersGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 ml-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 ml-1" />
                  )}
                  <span className="text-sm text-purple-100">
                    {analytics.growth.usersGrowth > 0 ? '+' : ''}
                    {analytics.growth.usersGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Users className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">متوسط التقييم</p>
                <p className="text-3xl font-bold">{analytics.overview.averageRating.toFixed(1)}</p>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 ml-1 fill-current" />
                  <span className="text-sm text-yellow-100">من 5 نجوم</span>
                </div>
              </div>
              <Star className="h-12 w-12 text-yellow-200 fill-current" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* إحصائيات إضافية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">طلبات معلقة</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.overview.pendingRequests}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">شركات موثقة</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.overview.verifiedCompanies}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">موثق</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">شركات مميزة</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.overview.featuredCompanies}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500 fill-current" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* أفضل البلدان */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الشركات حسب البلد</CardTitle>
            <CardDescription>البلدان الأكثر نشاطاً</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCountries.map((country, index) => (
                <div key={country.code} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{country.name}</p>
                      <p className="text-sm text-gray-500">{country.companiesCount} شركة</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${country.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8">{country.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* أفضل الفئات */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الشركات حسب الفئة</CardTitle>
            <CardDescription>الفئات الأكثر شعبية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCategories.map((category, index) => (
                <div key={category.slug} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{category.name}</p>
                      <p className="text-sm text-gray-500">{category.companiesCount} شركة</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8">{category.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أفضل الشركات تقييماً */}
      <Card>
        <CardHeader>
          <CardTitle>أفضل الشركات تقييماً</CardTitle>
          <CardDescription>الشركات الحاصلة على أعلى التقييمات</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الترتيب</TableHead>
                <TableHead>الشركة</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>التقييم</TableHead>
                <TableHead>المراجعات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.topRatedCompanies.map((company, index) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 dark:text-yellow-400 text-xs font-bold">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {company.name}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {company.city.name}, {company.country.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{company.category.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{company.rating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {company.reviewsCount} مراجعة
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* أكثر الشركات مراجعة */}
      <Card>
        <CardHeader>
          <CardTitle>أكثر الشركات مراجعة</CardTitle>
          <CardDescription>الشركات الأكثر تفاعلاً من المستخدمين</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الترتيب</TableHead>
                <TableHead>الشركة</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>المراجعات</TableHead>
                <TableHead>التقييم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.mostReviewedCompanies.map((company, index) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-xs font-bold">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {company.name}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {company.city.name}, {company.country.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{company.category.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{company.reviewsCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm">{company.rating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* النشاط الأخير */}
      <Card>
        <CardHeader>
          <CardTitle>النشاط الأخير</CardTitle>
          <CardDescription>آخر الأنشطة على المنصة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 space-x-reverse p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'company' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'review' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {activity.type === 'company' ? <Building2 className="h-4 w-4" /> :
                   activity.type === 'review' ? <MessageSquare className="h-4 w-4" /> :
                   <Users className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.date).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات متقدمة */}
      {analytics.categoryPerformance && analytics.countryPerformance && (
        <AdvancedStats 
          categoryPerformance={analytics.categoryPerformance}
          countryPerformance={analytics.countryPerformance}
        />
      )}
    </div>
  )
}
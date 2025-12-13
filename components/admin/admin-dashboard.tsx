'use client'

import { RecentActivitySummary } from './recent-activity-summary';
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  Building2, 
  MessageSquare, 
  Users, 
  Star,
  TrendingUp,
  TrendingDown,
  FileText,
  Shield,
  Award,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

interface AdminStats {
  overview: {
    totalCompanies: number
    totalUsers: number
    totalReviews: number
    pendingCompanies: number
    pendingReviews: number
    totalCountries: number
    totalCities: number
    totalCategories: number
  }
  companiesByCategory: Array<{
    name: string
    _count: { companies: number }
  }>
  companiesByCountry: Array<{
    name: string
    _count: { companies: number }
  }>
  recentReviews: Array<{
    id: string
    title: string
    rating: number
    createdAt: string
    company: { name: string; slug: string }
    user: { name: string; avatar?: string }
  }>
  recentCompanyRequests: Array<{
    id: string
    companyName: string
    email: string
    createdAt: string
    status: string
  }>
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRecalculating, setIsRecalculating] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (!response.ok) {
          throw new Error('فشل في جلب الإحصائيات')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError('حدث خطأ في تحميل البيانات')
        console.error('خطأ في جلب الإحصائيات:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchStats()
    }
  }, [session])

  const handleRecalculateRatings = async () => {
    if (!confirm('هل أنت متأكد من إعادة حساب تقييمات جميع الشركات؟')) {
      return
    }

    setIsRecalculating(true)
    try {
      const response = await fetch('/api/admin/recalculate-ratings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.id}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: 'تم بنجاح',
          description: `تم إعادة حساب تقييمات ${result.companiesCount} شركة بنجاح`,
        })
        // Refresh stats
        // window.location.reload()
      } else {
        toast({
          variant: 'destructive',
          title: 'حدث خطأ',
          description: 'حدث خطأ أثناء إعادة حساب التقييمات: ' + result.error?.message,
        })
      }
    } catch (error) {
      console.error('خطأ في إعادة حساب التقييمات:', error)
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: 'حدث خطأ أثناء إعادة حساب التقييمات',
      })
    } finally {
      setIsRecalculating(false)
    }
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (!response.ok) {
          throw new Error('فشل في جلب الإحصائيات')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError('حدث خطأ في تحميل البيانات')
        console.error('خطأ في جلب الإحصائيات:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchStats()
    }
  }, [session])

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في تحميل البيانات</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">إجمالي الشركات</p>
                <p className="text-3xl font-bold">{stats.overview.totalCompanies.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 ml-1" />
                  <span className="text-sm text-blue-100">نشطة</span>
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
                <p className="text-3xl font-bold">{stats.overview.totalReviews.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 ml-1" />
                  <span className="text-sm text-green-100">معتمدة</span>
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
                <p className="text-3xl font-bold">{stats.overview.totalUsers.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 ml-1" />
                  <span className="text-sm text-purple-100">مسجلين</span>
                </div>
              </div>
              <Users className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">طلبات معلقة</p>
                <p className="text-3xl font-bold">{stats.overview.pendingCompanies + stats.overview.pendingReviews}</p>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 ml-1" />
                  <span className="text-sm text-orange-100">تحتاج مراجعة</span>
                </div>
              </div>
              <AlertTriangle className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* إحصائيات إضافية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">البلدان</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.totalCountries}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">المدن</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.totalCities}</p>
              </div>
              <Building2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">الفئات</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.totalCategories}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">مراجعات معلقة</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.pendingReviews}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <RecentActivitySummary />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* توزيع الشركات حسب البلد */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الشركات حسب البلد</CardTitle>
            <CardDescription>عدد الشركات في كل بلد</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.companiesByCountry.slice(0, 5).map((country, index) => {
                const percentage = Math.round((country._count.companies / stats.overview.totalCompanies) * 100)
                return (
                  <div key={country.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{country.name}</p>
                        <p className="text-sm text-gray-500">{country._count.companies} شركة</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-8">{percentage}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* توزيع الشركات حسب الفئة */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الشركات حسب الفئة</CardTitle>
            <CardDescription>الفئات الأكثر شعبية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.companiesByCategory.slice(0, 5).map((category, index) => {
                const percentage = Math.round((category._count.companies / stats.overview.totalCompanies) * 100)
                return (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-sm font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{category.name}</p>
                        <p className="text-sm text-gray-500">{category._count.companies} شركة</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-8">{percentage}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أحدث المراجعات */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>أحدث المراجعات</CardTitle>
            <CardDescription>آخر المراجعات المضافة للمنصة</CardDescription>
          </div>
          <Link href="/admin/reviews">
            <Button variant="outline" size="sm">
              عرض الكل
              <Eye className="h-4 w-4 mr-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentReviews.length > 0 ? (
              stats.recentReviews.map((review) => (
                <div key={review.id} className="flex items-start space-x-4 space-x-reverse p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.user?.avatar} />
                    <AvatarFallback>{review.user?.name?.charAt(0) || 'م'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 space-x-reverse mb-1">
                      <p className="font-medium text-gray-900 dark:text-white">{review.title}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < review.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      بواسطة {review.user?.name || 'مستخدم'} • {review.company.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(review.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد مراجعات حتى الآن</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* طلبات الشركات المعلقة */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>طلبات الشركات المعلقة</CardTitle>
            <CardDescription>طلبات انضمام الشركات التي تحتاج مراجعة</CardDescription>
          </div>
          <Link href="/admin/company-requests">
            <Button variant="outline" size="sm">
              عرض الكل
              <Eye className="h-4 w-4 mr-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentCompanyRequests.length > 0 ? (
              stats.recentCompanyRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                                              <div>
                            <p className="font-medium text-gray-900 dark:text-white">{request.companyName}</p>
                            <p className="text-sm text-gray-500">{request.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 ml-1" />
                      معلق
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد طلبات معلقة</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* إجراءات سريعة */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
          <CardDescription>المهام الأكثر استخداماً</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/company-requests">
              <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center space-y-2">
                <FileText className="h-6 w-6" />
                <span className="text-sm">مراجعة الطلبات</span>
                {stats.overview.pendingCompanies > 0 && (
                  <Badge variant="destructive" className="text-xs">{stats.overview.pendingCompanies}</Badge>
                )}
              </Button>
            </Link>
            
            <Link href="/admin/companies">
              <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center space-y-2">
                <Building2 className="h-6 w-6" />
                <span className="text-sm">إدارة الشركات</span>
              </Button>
            </Link>
            
            <Link href="/admin/reviews">
              <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center space-y-2">
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm">إدارة المراجعات</span>
                {stats.overview.pendingReviews > 0 && (
                  <Badge variant="destructive" className="text-xs">{stats.overview.pendingReviews}</Badge>
                )}
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="h-20 w-full flex flex-col items-center justify-center space-y-2"
              onClick={handleRecalculateRatings}
              disabled={isRecalculating}
            >
              {isRecalculating ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              ) : (
                <Star className="h-6 w-6" />
              )}
              <span className="text-sm">إعادة حساب التقييمات</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 w-full flex flex-col items-center justify-center space-y-2"
              onClick={() => {
                toast({
                  title: "Test Toast",
                  description: "This is a test toast message.",
                });
              }}
            >
              <Star className="h-6 w-6" />
              <span className="text-sm">Test Toast</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
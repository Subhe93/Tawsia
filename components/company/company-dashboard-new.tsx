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
  RefreshCw,
  CheckCircle,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

// واجهات البيانات
interface CompanyProfile {
  id: string
  name: string
  description: string
  category: { id: string; name: string }
  city: { id: string; name: string; country: { name: string } }
  phone?: string
  email?: string
  website?: string
  isVerified: boolean
  stats: {
    totalReviews: number
    averageRating: number
    monthlyReviews: number
  }
}

interface CompanyReview {
  id: string
  rating: number
  comment: string
  createdAt: string
  isApproved: boolean
  userName?: string
  userEmail?: string
  user?: {
    id: string
    name: string
    avatar?: string
  } | null
  replies: any[]
}

export function CompanyDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [reviews, setReviews] = useState<CompanyReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // التحقق من تسجيل الدخول والصلاحيات
  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'COMPANY_OWNER') {
      router.push('/auth/signin')
      return
    }

    fetchCompanyData()
  }, [session, status])

  const fetchCompanyData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [companyRes, reviewsRes] = await Promise.all([
        fetch('/api/company/profile'),
        fetch('/api/company/reviews?limit=5')
      ])

      if (!companyRes.ok) {
        throw new Error('فشل في تحميل بيانات الشركة')
      }

      const companyData = await companyRes.json()
      setCompany(companyData.company)

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json()
        setReviews(reviewsData && reviewsData.reviews ? reviewsData.reviews : [])
      } else {
        // في حالة فشل جلب المراجعات، نضع مصفوفة فارغة
        setReviews([])
      }

    } catch (err) {
      console.error('خطأ في تحميل البيانات:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
      setReviews([]) // ضمان أن reviews تكون مصفوفة فارغة في حالة الخطأ
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchCompanyData}
              className="mr-2"
            >
              <RefreshCw className="h-4 w-4 ml-1" />
              إعادة المحاولة
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            لم يتم العثور على شركة مرتبطة بحسابك. يرجى التواصل مع الدعم الفني.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              {company.name}
              {company.isVerified && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 ml-1" />
                  موثق
                </Badge>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {company.category.name} • {company.city.name}, {company.city.country.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/company-dashboard/profile">
                <Settings className="h-4 w-4 ml-2" />
                إعدادات
              </Link>
            </Button>
            <Button onClick={fetchCompanyData}>
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المراجعات</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              +{company.stats.monthlyReviews} هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط التقييم</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {company.stats.averageRating.toFixed(1)}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            {/* <Progress value={(company.stats.averageRating / 5) * 100} className="mt-2" /> */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(company.stats.averageRating / 5) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المراجعات الجديدة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter(r => !r.isApproved).length}
            </div>
            <p className="text-xs text-muted-foreground">في انتظار الرد</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الاستجابة</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((reviews.filter(r => r.replies.length > 0).length / Math.max(reviews.length, 1)) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">من المراجعات</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              أحدث المراجعات
            </CardTitle>
            <CardDescription>
              آخر {reviews && Array.isArray(reviews) ? reviews.length : 0} مراجعات على شركتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviews && Array.isArray(reviews) && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.slice(0, 5).filter(review => review && review.id).map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= (review.rating || 0) 
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">
                          {review.user?.name || review.userName || 'زائر'}
                        </span>
                      </div>
                      <Badge variant={review.isApproved ? 'default' : 'secondary'}>
                        {review.isApproved ? 'منشور' : 'معلق'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{review.comment || 'لا يوجد تعليق'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString('ar') : 'تاريخ غير محدد'}
                      </span>
                      {(review.replies && review.replies.length === 0) && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/company-dashboard/reviews/${review.id}`}>
                            رد
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد مراجعات بعد</p>
              </div>
            )}
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/company-dashboard/reviews">
                  عرض جميع المراجعات
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              إجراءات سريعة
            </CardTitle>
            <CardDescription>
              إدارة شركتك بسهولة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/company-dashboard/profile">
                  <Building2 className="h-4 w-4 ml-2" />
                  تحديث معلومات الشركة
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/company-dashboard/reviews">
                  <MessageSquare className="h-4 w-4 ml-2" />
                  إدارة المراجعات
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/company-dashboard/images">
                  <Award className="h-4 w-4 ml-2" />
                  إدارة الصور
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/company-dashboard/analytics">
                  <BarChart3 className="h-4 w-4 ml-2" />
                  الإحصائيات والتحليلات
                </Link>
              </Button>
            </div>

            {/* Company Status */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">حالة الشركة</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">ملف كامل</span>
                  <Badge variant={company.description && company.phone ? 'default' : 'secondary'}>
                    {company.description && company.phone ? 'مكتمل' : 'ناقص'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">شركة موثقة</span>
                  <Badge variant={company.isVerified ? 'default' : 'secondary'}>
                    {company.isVerified ? 'موثق' : 'غير موثق'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

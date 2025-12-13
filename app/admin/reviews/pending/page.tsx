'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  MessageSquare, 
  Star, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  ArrowLeft,
  User,
  Building2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface PendingReview {
  id: string
  userName: string
  userEmail?: string
  title: string
  comment: string
  rating: number
  createdAt: string
  isApproved: boolean
  helpfulCount: number
  notHelpfulCount: number
  company: {
    id: string
    name: string
    slug: string
    mainImage?: string
  }
  user?: {
    id: string
    name: string
    avatar?: string
  } | null
  images: Array<{
    id: string
    imageUrl: string
    altText?: string
  }>
}

export default function AdminPendingReviewsPage() {
  const [reviews, setReviews] = useState<PendingReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

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

  const fetchPendingReviews = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        statusFilter: 'pending'
      })

      const response = await fetch(`/api/admin/reviews?${params}`)
      if (!response.ok) {
        throw new Error('فشل في جلب المراجعات المعلقة')
      }

      const data = await response.json()
      if (data.success && data.data) {
        setReviews(data.data.reviews || [])
        setTotalPages(data.data.totalPages || 1)
      } else {
        console.error('خطأ في API:', data.error)
        setError(data.error?.message || 'حدث خطأ في تحميل البيانات')
        setReviews([])
      }
    } catch (error) {
      console.error('خطأ في جلب المراجعات المعلقة:', error)
      setError('حدث خطأ في الاتصال بالخادم')
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchPendingReviews()
    }
  }, [session, currentPage])

  const handleApproveReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' })
      })

      const result = await response.json()
      if (result.success) {
        setReviews(prev => prev.filter(review => review.id !== reviewId))
        toast({
          title: "تم بنجاح",
          description: result.message || 'تم الموافقة على المراجعة بنجاح',
          variant: "success",
        })
      } else {
        toast({
          title: "خطأ في الموافقة",
          description: result.error?.message || 'حدث خطأ أثناء الموافقة',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('خطأ في الموافقة على المراجعة:', error)
      toast({
        title: "خطأ في الاتصال",
        description: 'حدث خطأ أثناء الموافقة على المراجعة',
        variant: "destructive",
      })
    }
  }

  const handleRejectReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject' })
      })

      const result = await response.json()
      if (result.success) {
        setReviews(prev => prev.filter(review => review.id !== reviewId))
        toast({
          title: "تم الرفض",
          description: result.message || 'تم رفض المراجعة بنجاح',
          variant: "success",
        })
      } else {
        toast({
          title: "خطأ في الرفض",
          description: result.error?.message || 'حدث خطأ أثناء رفض المراجعة',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('خطأ في رفض المراجعة:', error)
      toast({
        title: "خطأ في الاتصال",
        description: 'حدث خطأ أثناء رفض المراجعة',
        variant: "destructive",
      })
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

  return (
    <div className="space-y-6">
      {/* الرأس */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <Button variant="ghost" asChild>
            <Link href="/admin/reviews">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للمراجعات
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              المراجعات المعلقة
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              مراجعة والموافقة على التقييمات المعلقة ({reviews?.length || 0} مراجعة)
            </p>
          </div>
        </div>
      </div>

      {/* المراجعات المعلقة */}
      <div className="space-y-6">
        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 space-x-reverse text-red-600 dark:text-red-400">
                <XCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchPendingReviews()}
                className="mt-3"
              >
                إعادة المحاولة
              </Button>
            </CardContent>
          </Card>
        )}
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !error && reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id} className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* رأس المراجعة */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 space-x-reverse flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={review.user?.avatar || undefined} />
                        <AvatarFallback>
                          {(review.user?.name || review.userName || 'مستخدم')
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase() || <User className="h-6 w-6" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 space-x-reverse mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {review.title}
                          </h3>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-5 w-5 ${
                                  i < review.rating 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            <Clock className="h-3 w-3 ml-1" />
                            معلقة
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <User className="h-4 w-4" />
                            <span>{review.user?.name || review.userName || 'مستخدم غير معروف'}</span>
                          </div>
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Building2 className="h-4 w-4" />
                            <span>{review.company.name}</span>
                          </div>
                          <span>•</span>
                          <span>{new Date(review.createdAt).toLocaleDateString( )}</span>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>

                        {review.images.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              الصور المرفقة ({review.images.length})
                            </p>
                            <div className="flex space-x-2 space-x-reverse">
                              {review.images.slice(0, 3).map((image) => (
                                <div key={image.id} className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                                  <img 
                                    src={image.imageUrl} 
                                    alt={image.altText || 'صورة المراجعة'}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {review.images.length > 3 && (
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                  <span className="text-xs text-gray-600">
                                    +{review.images.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 ml-2" />
                            موافقة
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>الموافقة على المراجعة</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من الموافقة على مراجعة "{review.title}"؟ 
                              ستظهر المراجعة للجمهور وستؤثر على تقييم الشركة.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleApproveReview(review.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              موافقة
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="text-red-600 hover:text-red-700">
                            <XCircle className="h-4 w-4 ml-2" />
                            رفض
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>رفض المراجعة</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من رفض مراجعة "{review.title}"؟ 
                              سيتم حذف المراجعة نهائياً ولن يمكن استرجاعها.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRejectReview(review.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              رفض وحذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* <Button variant="ghost" size="sm" asChild>
                        <Link href={`/${review.company.slug}`} target="_blank">
                          <Eye className="h-4 w-4 ml-2" />
                          عرض الشركة
                        </Link>
                      </Button> */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                لا توجد مراجعات معلقة
              </h3>
              <p className="text-gray-500 mb-6">
                جميع المراجعات تم مراجعتها والموافقة عليها
              </p>
              <Button asChild>
                <Link href="/admin/reviews">
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  العودة لجميع المراجعات
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* التنقل بين الصفحات */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              السابق
            </Button>
            
            <div className="flex items-center space-x-1 space-x-reverse">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                if (pageNum > totalPages) return null
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              التالي
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
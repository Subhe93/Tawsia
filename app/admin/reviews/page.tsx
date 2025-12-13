'use client'

import { useEffect, useState, useCallback } from 'react'
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
  Filter,
  Search
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useDebounce } from '@/hooks/use-debounce'

interface Review {
  id: string
  title: string
  comment: string
  rating: number
  isApproved: boolean
  isVerified: boolean
  createdAt: string
  userName?: string
  userEmail?: string
  company: {
    name: string
    slug: string
  }
  user?: {
    name: string
    avatar?: string
    email: string
  } | null
  images: Array<{
    id: string
    url: string
  }>
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        searchTerm: debouncedSearchTerm,
        statusFilter,
        ratingFilter,
      })

      const response = await fetch(`/api/admin/reviews?${params}`)
      if (!response.ok) {
        throw new Error('فشل في جلب المراجعات')
      }

      const data = await response.json();

      if (data.success && data.data) {
        setReviews(data.data.reviews || []);
        setTotalPages(data.data.totalPages || 1);
      } else {
        console.error('خطأ في API:', data.error);
        setError(data.error?.message || 'حدث خطأ في تحميل البيانات');
        setReviews([]);
      }
    } catch (error) {
      console.error('خطأ في جلب المراجعات:', error)
      setError('حدث خطأ في الاتصال بالخادم')
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, debouncedSearchTerm, statusFilter, ratingFilter]);

  useEffect(() => {
    if (status === 'authenticated') {
        if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
            router.push('/')
            return
        }
        fetchReviews()
    }
    if(status === 'unauthenticated'){
        router.push('/auth/signin')
    }
  }, [session, status, router, fetchReviews])

  const handleApproveReview = async (reviewId: string) => {
    // This function can be implemented later if needed
  }

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, { method: 'DELETE' });
      const result = await response.json()

      if (result.success) {
        toast({
          title: "تم الحذف",
          description: result.message || 'تم حذف المراجعة بنجاح',
          variant: "success",
        })
        fetchReviews();
      } else {
        toast({
          title: "خطأ في الحذف",
          description: result.error?.message || 'حدث خطأ أثناء حذف المراجعة',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('خطأ في حذف المراجعة:', error)
      toast({
        title: "خطأ في الاتصال",
        description: 'حدث خطأ أثناء حذف المراجعة',
        variant: "destructive",
      })
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة المراجعات</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">مراجعة والموافقة على تقييمات المستخدمين</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في المراجعات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="all">جميع الحالات</option>
                <option value="pending">في انتظار المراجعة</option>
                <option value="approved">موافق عليه</option>
            </select>
            <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="all">جميع التقييمات</option>
                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} نجوم</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المراجعات</CardTitle>
          <CardDescription>{reviews?.length || 0} مراجعة</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 space-x-reverse text-red-600 dark:text-red-400">
                <XCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => fetchReviews()} className="mt-3">إعادة المحاولة</Button>
            </div>
          )}
          
          {!error && reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 space-x-reverse flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.user?.avatar || undefined} />
                        <AvatarFallback>
                          {(review.user?.name || review.userName || 'زائر').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{review.title}</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
                          </div>
                          <Badge variant={review.isApproved ? 'default' : 'secondary'}>{review.isApproved ? 'موافق عليها' : 'معلقة'}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{review.comment}</p>
                        <div className="text-xs text-gray-500">بواسطة {review.user?.name || review.userName || 'زائر'} • {review.company.name} • {new Date(review.createdAt).toLocaleDateString( )}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse ml-4">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm"><XCircle className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>رفض المراجعة</AlertDialogTitle>
                                    <AlertDialogDescription>هل أنت متأكد من حذف مراجعة "{review.title}"؟ سيتم حذف المراجعة نهائياً.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteReview(review.id)} className="bg-red-600 hover:bg-red-700">حذف</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">لا توجد مراجعات</h3>
              <p className="text-gray-500">لم يتم العثور على مراجعات تطابق الفلاتر المحددة</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-gray-500">صفحة {currentPage} من {totalPages}</div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>السابق</Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>التالي</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
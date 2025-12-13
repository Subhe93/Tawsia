'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  MessageSquare, 
  Star, 
  Search, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Reply,
  Send
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Review {
  id: string
  title: string
  comment: string
  rating: number
  isApproved: boolean
  createdAt: string
  userName?: string
  userEmail?: string
  user?: {
    name: string
    avatar?: string
    email: string
  } | null
  replies: Array<{
    id: string
    content: string
    isFromOwner: boolean
    createdAt: string
    user: {
      name: string
      avatar?: string
    }
  }>
}

export default function AllReviewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [replyContent, setReplyContent] = useState('')
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'COMPANY_OWNER' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      router.push('/')
      return
    }

    fetchReviews()
  }, [session, status, router, filterStatus, currentPage])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filterStatus !== 'all' && { status: filterStatus })
      })

      const response = await fetch(`/api/company/reviews?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          setReviews(data.reviews || [])
          setTotalPages(data.pagination?.pages || 1)
        } else {
          toast.error(data.error || 'فشل في جلب المراجعات')
          setReviews([])
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || `خطأ في الخادم: ${response.status}`)
        setReviews([])
      }
    } catch (error) {
      console.error('خطأ في جلب المراجعات:', error)
      toast.error('حدث خطأ في الاتصال بالخادم')
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyContent.trim()) {
      toast.error('يرجى كتابة محتوى الرد')
      return
    }

    setIsSubmittingReply(true)
    try {
      const response = await fetch(`/api/company/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: replyContent })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('تم إضافة الرد بنجاح')
        setReplyContent('')
        setReplyingToId(null)
        fetchReviews() // إعادة جلب المراجعات لإظهار الرد الجديد
      } else {
        toast.error(data.error || 'فشل في إضافة الرد')
      }
    } catch (error) {
      console.error('خطأ في إضافة الرد:', error)
      toast.error('حدث خطأ في إضافة الرد')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const filteredReviews = reviews.filter(review => 
    (review.user?.name || review.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // حساب الإحصائيات
  const totalReviews = reviews.length
  const approvedReviews = reviews.filter(r => r.isApproved).length
  const pendingReviews = reviews.filter(r => !r.isApproved).length
  const repliedReviews = reviews.filter(r => r.replies?.some(reply => reply.isFromOwner)).length
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="space-y-6" dir="rtl">
      {/* الرأس */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          إدارة المراجعات
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          عرض والرد على مراجعات العملاء
        </p>
      </div>

      {/* إحصائيات المراجعات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المراجعات</p>
                <p className="text-2xl font-bold">{totalReviews}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط التقييم</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                  <div className="flex">
                    {renderStars(Math.round(averageRating))}
                  </div>
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">معلقة</p>
                <p className="text-2xl font-bold">{pendingReviews}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تم الرد عليها</p>
                <p className="text-2xl font-bold">{repliedReviews}</p>
              </div>
              <Reply className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الفلاتر */}
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
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                الكل
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
              >
                <Clock className="h-4 w-4 ml-1" />
                معلقة
              </Button>
              <Button
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('approved')}
              >
                <CheckCircle className="h-4 w-4 ml-1" />
                موافق عليها
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة المراجعات */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المراجعات</CardTitle>
          <CardDescription>
            {filteredReviews.length} مراجعة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد مراجعات
              </h3>
              <p className="text-gray-500">
                لم يتم العثور على مراجعات تطابق الفلاتر المحددة
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 space-x-reverse flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.user?.avatar || undefined} />
                        <AvatarFallback>
                          {(review.user?.name || review.userName || 'زائر')
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {review.title}
                          </h4>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <Badge 
                            variant={review.isApproved ? 'default' : 'secondary'}
                          >
                            {review.isApproved ? 'موافق عليها' : 'معلقة'}
                          </Badge>
                          {review.replies?.some(reply => reply.isFromOwner) && (
                            <Badge variant="outline" className="text-green-600">
                              تم الرد
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {review.comment}
                        </p>
                        <div className="text-xs text-gray-500 mb-3">
                          بواسطة {review.user?.name || review.userName || 'زائر'} • {new Date(review.createdAt).toLocaleDateString()}
                        </div>

                        {/* عرض الردود الموجودة */}
                        {review.replies && review.replies.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {review.replies.map((reply) => (
                              <div key={reply.id} className={`p-3 rounded-lg ${reply.isFromOwner ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                <div className="flex items-start space-x-2 space-x-reverse">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={reply.user?.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {reply.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                      <span className="text-sm font-medium">{reply.user.name}</span>
                                      {reply.isFromOwner && (
                                        <Badge variant="secondary" className="text-xs">الشركة</Badge>
                                      )}
                                      <span className="text-xs text-gray-500">
                                        {new Date(reply.createdAt).toLocaleDateString( )}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                      {reply.content}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* نموذج الرد */}
                        {!review.replies?.some(reply => reply.isFromOwner) && (
                          <div className="mt-4">
                            {replyingToId === review.id ? (
                              <div className="space-y-3">
                                <Textarea
                                  placeholder="اكتب ردك على هذه المراجعة..."
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleReplySubmit(review.id)}
                                    disabled={isSubmittingReply}
                                  >
                                    {isSubmittingReply ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                                        جاري الإرسال...
                                      </>
                                    ) : (
                                      <>
                                        <Send className="h-4 w-4 ml-2" />
                                        إرسال الرد
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setReplyingToId(null)
                                      setReplyContent('')
                                    }}
                                  >
                                    إلغاء
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setReplyingToId(review.id)}
                              >
                                <Reply className="h-4 w-4 ml-2" />
                                رد على المراجعة
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* التنقل بين الصفحات */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-gray-500">
                صفحة {currentPage} من {totalPages}
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

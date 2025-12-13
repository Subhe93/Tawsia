'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MessageSquare, Star, Reply, Send, Edit2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function ReviewResponsesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  }, [session, status, router])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/company/reviews?status=approved&limit=50')
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      } else {
        toast.error('فشل في جلب المراجعات')
      }
    } catch (error) {
      toast.error('حدث خطأ في جلب البيانات')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReply = async () => {
    if (!replyText.trim() || !selectedReview) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/company/reviews/${selectedReview.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          reply: replyText.trim(),
          authorName: session?.user?.name || 'إدارة الشركة'
        })
      })

      if (response.ok) {
        toast.success('تم إرسال الرد بنجاح')
        setReplyText('')
        setSelectedReview(null)
        fetchReviews()
      } else {
        toast.error('فشل في إرسال الرد')
      }
    } catch (error) {
      toast.error('حدث خطأ في العملية')
    } finally {
      setIsSubmitting(false)
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

  const reviewsWithReplies = reviews.filter(review => review.replies?.length > 0)
  const reviewsWithoutReplies = reviews.filter(review => !review.replies?.length)

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          الرد على المراجعات
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          إدارة والرد على مراجعات العملاء
        </p>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المراجعات</p>
                <p className="text-2xl font-bold">{reviews.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تم الرد عليها</p>
                <p className="text-2xl font-bold text-green-600">{reviewsWithReplies.length}</p>
              </div>
              <Reply className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تحتاج رد</p>
                <p className="text-2xl font-bold text-orange-600">{reviewsWithoutReplies.length}</p>
              </div>
              <Edit2 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* المراجعات التي تحتاج رد */}
      {reviewsWithoutReplies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">
              مراجعات تحتاج رد ({reviewsWithoutReplies.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviewsWithoutReplies.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 border-orange-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium">{review.userName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString( )}
                      </span>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setSelectedReview(review)
                          setReplyText('')
                        }}
                      >
                        <Reply className="h-4 w-4 ml-2" />
                        رد
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>الرد على مراجعة {review.userName}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-medium">{review.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                        </div>
                        <Textarea
                          placeholder="اكتب ردك هنا..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleReply} 
                            disabled={!replyText.trim() || isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Send className="h-4 w-4 ml-2 animate-spin" />
                                جاري الإرسال...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 ml-2" />
                                إرسال الرد
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">{review.title}</h4>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* المراجعات التي تم الرد عليها */}
      {reviewsWithReplies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">
              مراجعات تم الرد عليها ({reviewsWithReplies.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviewsWithReplies.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 border-green-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium">{review.userName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString( )}
                      </span>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <Reply className="h-3 w-3 ml-1" />
                    تم الرد
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">{review.title}</h4>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                  
                  {/* الردود */}
                  <div className="bg-blue-50 p-3 rounded-lg mr-4">
                    <div className="flex items-start gap-2">
                      <Reply className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          {review.replies?.[0]?.user?.name || 'إدارة الشركة'}
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          {review.replies?.[0]?.content}
                        </p>
                        <span className="text-xs text-blue-600">
                          {review.replies?.[0]?.createdAt && new Date(review.replies[0].createdAt).toLocaleDateString( )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {reviews.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لا توجد مراجعات
            </h3>
            <p className="text-gray-500">
              لم يتم العثور على مراجعات للرد عليها
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

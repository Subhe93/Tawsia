'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MessageSquare, Star, Check, X, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function PendingReviewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

    fetchPendingReviews()
  }, [session, status, router])

  const fetchPendingReviews = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/company/reviews?status=pending&limit=50')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setReviews(data.reviews || [])
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

  const handleApprove = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/company/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isApproved: true })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(data.message || 'تم الموافقة على المراجعة')
        fetchPendingReviews()
      } else {
        toast.error(data.error || 'فشل في الموافقة على المراجعة')
      }
    } catch (error) {
      console.error('خطأ في الموافقة:', error)
      toast.error('حدث خطأ في العملية')
    }
  }

  const handleReject = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/company/reviews/${reviewId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(data.message || 'تم رفض المراجعة')
        fetchPendingReviews()
      } else {
        toast.error(data.error || 'فشل في رفض المراجعة')
      }
    } catch (error) {
      console.error('خطأ في الرفض:', error)
      toast.error('حدث خطأ في العملية')
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
          المراجعات في الانتظار
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          مراجعة والموافقة على مراجعات العملاء الجديدة
        </p>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">في الانتظار</p>
                <p className="text-2xl font-bold">{reviews.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط التقييم</p>
                <p className="text-2xl font-bold">
                  {reviews.length > 0 
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تحتاج إجراء</p>
                <p className="text-2xl font-bold text-orange-600">{reviews.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة المراجعات */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد مراجعات في الانتظار
              </h3>
              <p className="text-gray-500">
                جميع المراجعات تم الموافقة عليها
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="border-l-4 border-orange-400">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
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
                  
                  <Badge variant="destructive">
                    في الانتظار
                  </Badge>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-lg">{review.title}</h4>
                  <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                  
                  <div className="flex gap-2 pt-3 border-t">
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(review.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 ml-2" />
                      موافقة
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleReject(review.id)}
                    >
                      <X className="h-4 w-4 ml-2" />
                      رفض
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

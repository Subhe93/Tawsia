'use client';

import { useState, useEffect } from 'react';
import { Star, Eye, Check, X, Flag, MessageSquare, AlertTriangle, Search, Filter, Calendar, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/alert-dialog';

interface Review {
  id: string;
  userName: string;
  userEmail?: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  isApproved: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  company: {
    id: string;
    name: string;
    slug: string;
  };
  images: Array<{
    id: string;
    imageUrl: string;
  }>;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ReviewReport {
  id: string;
  reason: string;
  description: string;
  reporterEmail?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  review: Review;
}

interface EnhancedAdminReviewsProps {
  initialReviews?: Review[];
  initialReports?: ReviewReport[];
}

export function EnhancedAdminReviews({ initialReviews = [], initialReports = [] }: EnhancedAdminReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [reports, setReports] = useState<ReviewReport[]>(initialReports);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [currentTab, setCurrentTab] = useState('reviews');

  // Load reviews
  const loadReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(ratingFilter !== 'all' && { rating: ratingFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/reviews?${params}`);
      const result = await response.json();

      if (result.success) {
        setReviews(result.data);
      }
    } catch (error) {
      console.error('خطأ في تحميل التقييمات:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load reports
  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/reports');
      const result = await response.json();

      if (result.success) {
        setReports(result.data);
      }
    } catch (error) {
      console.error('خطأ في تحميل البلاغات:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle review approval/rejection
  const handleReviewAction = async (reviewId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });

      const result = await response.json();

      if (result.success) {
        if (action === 'approve') {
          setReviews(prev => prev.map(review => 
            review.id === reviewId 
              ? { ...review, isApproved: true }
              : review
          ));
        } else {
          setReviews(prev => prev.filter(review => review.id !== reviewId));
        }
        alert(result.message);
      } else {
        alert(result.error?.message || 'حدث خطأ');
      }
    } catch (error) {
      console.error('خطأ في معالجة التقييم:', error);
      alert('حدث خطأ أثناء معالجة التقييم');
    }
  };

  // Handle report action
  const handleReportAction = async (reportId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });

      const result = await response.json();

      if (result.success) {
        setReports(prev => prev.map(report => 
          report.id === reportId 
            ? { ...report, status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
            : report
        ));
        
        if (action === 'approve') {
          // Also remove the review from reviews list
          setReviews(prev => prev.filter(review => review.id !== reports.find(r => r.id === reportId)?.review.id));
        }
        
        alert(result.message);
      } else {
        alert(result.error?.message || 'حدث خطأ');
      }
    } catch (error) {
      console.error('خطأ في معالجة البلاغ:', error);
      alert('حدث خطأ أثناء معالجة البلاغ');
    }
  };

  useEffect(() => {
    if (currentTab === 'reviews') {
      loadReviews();
    } else if (currentTab === 'reports') {
      loadReports();
    }
  }, [currentTab, statusFilter, ratingFilter, searchTerm]);

  const filteredReviews = reviews.filter(review => {
    if (statusFilter === 'pending' && review.isApproved) return false;
    if (statusFilter === 'approved' && !review.isApproved) return false;
    if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) return false;
    if (searchTerm && !review.title.includes(searchTerm) && !review.company.name.includes(searchTerm)) return false;
    return true;
  });

  const pendingReviews = reviews.filter(r => !r.isApproved);
  const pendingReports = reports.filter(r => r.status === 'PENDING');

  const getReasonText = (reason: string) => {
    const reasonTexts = {
      SPAM: 'رسائل مزعجة',
      INAPPROPRIATE_LANGUAGE: 'لغة غير لائقة',
      FAKE_REVIEW: 'تقييم مزيف',
      HARASSMENT: 'تحرش',
      COPYRIGHT_VIOLATION: 'انتهاك حقوق الطبع',
      OTHER: 'أخرى'
    };
    return reasonTexts[reason as keyof typeof reasonTexts] || reason;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التقييمات</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في انتظار المراجعة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingReviews.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">البلاغات المعلقة</CardTitle>
            <Flag className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingReports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الموافقة</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reviews.length > 0 ? Math.round((reviews.filter(r => r.isApproved).length / reviews.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="reviews">التقييمات</TabsTrigger>
          <TabsTrigger value="reports" className="relative">
            البلاغات
            {pendingReports.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-red-600">
                {pendingReports.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث في التقييمات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="pending">في انتظار المراجعة</option>
                  <option value="approved">موافق عليه</option>
                </select>

                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">جميع التقييمات</option>
                  <option value="5">5 نجوم</option>
                  <option value="4">4 نجوم</option>
                  <option value="3">3 نجوم</option>
                  <option value="2">2 نجوم</option>
                  <option value="1">1 نجمة</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 space-x-reverse flex-1">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.user?.avatar} />
                          <AvatarFallback>
                            {review.userName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {review.userName}
                              </h4>
                              <Badge className={review.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {review.isApproved ? 'موافق عليه' : 'في انتظار المراجعة'}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(review.createdAt).toLocaleDateString( )}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 space-x-reverse mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              في {review.company.name}
                            </span>
                          </div>

                          <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                            {review.title}
                          </h5>

                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                            {review.comment}
                          </p>

                          <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-500">
                            <span>👍 {review.helpfulCount}</span>
                            <span>👎 {review.notHelpfulCount}</span>
                            {review.images.length > 0 && (
                              <span>📷 {review.images.length} صور</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 space-x-reverse ml-4">
                        {!review.isApproved && (
                          <>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>موافقة على التقييم</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من الموافقة على هذا التقييم؟ سيصبح مرئياً للجمهور.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleReviewAction(review.id, 'approve')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    موافقة
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>رفض التقييم</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من رفض هذا التقييم؟ سيتم حذفه نهائياً.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleReviewAction(review.id, 'reject')}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    رفض وحذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  لا توجد تقييمات
                </h3>
                <p className="text-gray-500">
                  لم يتم العثور على تقييمات مطابقة للمرشحات المحددة
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : reports.length > 0 ? (
              reports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <Badge variant="destructive">
                              {getReasonText(report.reason)}
                            </Badge>
                            <Badge 
                              className={
                                report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                report.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }
                            >
                              {report.status === 'PENDING' ? 'معلق' :
                               report.status === 'APPROVED' ? 'مقبول' : 'مرفوض'}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString( )}
                          </span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {report.description}
                        </p>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex items-start space-x-3 space-x-reverse">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < report.review.rating
                                      ? 'text-yellow-500 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="flex-1">
                              <h6 className="font-medium text-sm">{report.review.title}</h6>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                بواسطة {report.review.userName} في {report.review.company.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 space-x-reverse ml-4">
                        {report.status === 'PENDING' && (
                          <>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>قبول البلاغ</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من قبول هذا البلاغ؟ سيتم حذف التقييم المبلغ عنه.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleReportAction(report.id, 'approve')}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    قبول وحذف التقييم
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>رفض البلاغ</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من رفض هذا البلاغ؟ سيبقى التقييم منشوراً.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleReportAction(report.id, 'reject')}
                                  >
                                    رفض البلاغ
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  لا توجد بلاغات
                </h3>
                <p className="text-gray-500">
                  لم يتم تلقي أي بلاغات حتى الآن
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

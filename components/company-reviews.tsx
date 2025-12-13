'use client';

import { useState, useEffect } from 'react';
import { Star, User, Calendar, ThumbsUp, ThumbsDown, Flag, Filter, Plus, MessageCircle, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import dynamic from 'next/dynamic';
import { AddReviewForm } from '@/components/add-review-form';
import { ReportReviewForm } from '@/components/report-review-form';
import type { ReviewWithRelations } from '@/lib/types/database';

const ClientSideDate = dynamic(() => import('@/components/client-side-date').then(mod => ({ default: mod.ClientSideDate })), {
  ssr: true
});

interface CompanyReviewsProps {
  companyId: string;
  companyName: string;
  overallRating: number;
  totalReviews: number;
  initialReviews?: ReviewWithRelations[];
}

export function CompanyReviews({ companyId, companyName, overallRating, totalReviews, initialReviews = [] }: CompanyReviewsProps) {
  const [reviews, setReviews] = useState<ReviewWithRelations[]>(initialReviews);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reportingReview, setReportingReview] = useState<ReviewWithRelations | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load more reviews
  const loadMoreReviews = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/reviews?companyId=${companyId}&page=${page + 1}&limit=10&sortBy=${sortBy}`);
      const result = await response.json();

      if (result.success) {
        setReviews(prev => [...prev, ...result.data]);
        setPage(prev => prev + 1);
        setHasMore(result.data.length === 10);
      }
    } catch (error) {
      console.error('خطأ في تحميل التقييمات:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle helpful/not helpful
  const handleHelpful = async (reviewId: string, isHelpful: boolean) => {
    const key = `${reviewId}-${isHelpful ? 'helpful' : 'not-helpful'}`;
    if (loadingStates[key]) return;

    setLoadingStates(prev => ({ ...prev, [key]: true }));

    try {
      const endpoint = isHelpful ? 'helpful' : 'not-helpful';
      const response = await fetch(`/api/reviews/${reviewId}/${endpoint}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                helpfulCount: result.data.helpful,
                notHelpfulCount: result.data.notHelpful
              }
            : review
        ));
      } else {
        alert(result.error?.message || 'حدث خطأ أثناء التفاعل');
      }
    } catch (error) {
      console.error('خطأ في التفاعل:', error);
      alert('حدث خطأ أثناء التفاعل');
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  };

  // Handle reply submission
  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;

    const key = `reply-${reviewId}`;
    if (loadingStates[key]) return;

    setLoadingStates(prev => ({ ...prev, [key]: true }));

    try {
      const response = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: 'مدير الشركة',
          comment: replyText,
          isOwner: true
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Reload the review replies or add the new reply locally
        setReplyText('');
        setReplyingTo(null);
        alert(result.message);
        // Refresh reviews to show new reply
        window.location.reload();
      } else {
        if (response.status === 401) {
          alert('يجب تسجيل الدخول أولاً لإرسال رد. سيتم توجيهك لصفحة تسجيل الدخول.');
          window.location.href = '/auth/signin';
        } else {
          alert(result.error?.message || 'حدث خطأ أثناء إرسال الرد');
        }
      }
    } catch (error) {
      console.error('خطأ في إرسال الرد:', error);
      alert('حدث خطأ أثناء إرسال الرد');
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  };

  // Handle add new review
  const handleAddReview = async (newReviewData: any) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newReviewData,
          companyId
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        setShowAddReview(false);
        // Refresh the page to show the new review (after approval)
        window.location.reload();
      } else {
        alert(result.error?.message || 'حدث خطأ أثناء إرسال التقييم');
      }
    } catch (error) {
      console.error('خطأ في إرسال التقييم:', error);
      alert('حدث خطأ أثناء إرسال التقييم');
    }
  };

  // Handle report review
  const handleReportReview = (data: any) => {
    setReportingReview(null);
  };

  // Calculate rating distribution from actual reviews
  const calculateRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++;
      }
    });
    
    return [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: distribution[stars as keyof typeof distribution],
      percentage: totalReviews > 0 
        ? Math.round((distribution[stars as keyof typeof distribution] / totalReviews) * 100)
        : 0
    }));
  };

  const ratingDistribution = calculateRatingDistribution();

  const filteredReviews = reviews.filter(review => {
    if (filterRating && review.rating !== filterRating) return false;
    // Note: We'll need to add an 'isVerified' field to the review model or derive it
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpfulCount - a.helpfulCount;
      default:
        return 0;
    }
  });
  return (
    <div className="space-y-8">
      {/* Reviews Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            تقييمات العملاء
          </p>
          <Button
            onClick={() => setShowAddReview(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة تقييم
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {overallRating}
            </div>
            <div className="flex items-center justify-center mb-2">
              {[...Array(5)].map((_, i) => {
                const starRating = i + 1;
                const isFullStar = starRating <= Math.floor(overallRating);
                const isPartialStar = starRating === Math.ceil(overallRating) && overallRating % 1 > 0;
                const partialPercentage = isPartialStar ? (overallRating % 1) * 100 : 0;
                
                return (
                  <div key={i} className="relative">
                    <Star
                      className={`h-6 w-6 ${
                        isFullStar || isPartialStar
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                    {isPartialStar && (
                      <div className="absolute inset-0 overflow-hidden">
                        <Star
                          className="h-6 w-6 text-yellow-500 fill-current"
                          style={{ clipPath: `inset(0 ${100 - partialPercentage}% 0 0)` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              بناءً على {totalReviews} تقييم
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center space-x-3 space-x-reverse">
                <div className="flex items-center space-x-1 space-x-reverse w-16">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.stars}
                  </span>
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <select
              className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">الأحدث</option>
              <option value="oldest">الأقدم</option>
              <option value="highest">الأعلى تقييماً</option>
              <option value="lowest">الأقل تقييماً</option>
              <option value="helpful">الأكثر فائدة</option>
            </select>

            <select
              className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">جميع التقييمات</option>
              <option value="5">5 نجوم</option>
              <option value="4">4 نجوم</option>
              <option value="3">3 نجوم</option>
              <option value="2">2 نجوم</option>
              <option value="1">1 نجمة</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              id="verified-only"
              checked={showVerifiedOnly}
              onChange={(e) => setShowVerifiedOnly(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="verified-only" className="text-sm text-gray-600 dark:text-gray-400">
              التقييمات المؤكدة فقط
            </label>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-start space-x-4 space-x-reverse">
              <Avatar className="w-12 h-12">
                <AvatarImage src={review.user?.avatar || undefined} />
                <AvatarFallback>
                  {(review.user?.name || review.userName || 'مستخدم')
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {review.userName}
                    </h4>
                    {review.isApproved && (
                      <Badge variant="secondary" className="text-xs">
                        مؤكد
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <ClientSideDate date={review.createdAt.toISOString().split('T')[0]} />
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse mb-3">
                  {[...Array(5)].map((_, i) => {
                    const starRating = i + 1;
                    const isFullStar = starRating <= review.rating;
                    
                    return (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          isFullStar
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    );
                  })}
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {review.comment}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <button 
                      onClick={() => handleHelpful(review.id, true)}
                      disabled={loadingStates[`${review.id}-helpful`]}
                      className="flex items-center space-x-1 space-x-reverse text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 disabled:opacity-50"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>مفيد ({review.helpfulCount})</span>
                    </button>
                    <button 
                      onClick={() => handleHelpful(review.id, false)}
                      disabled={loadingStates[`${review.id}-not-helpful`]}
                      className="flex items-center space-x-1 space-x-reverse text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>غير مفيد ({review.notHelpfulCount})</span>
                    </button>
                    <button 
                      onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                      className="flex items-center space-x-1 space-x-reverse text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>رد</span>
                    </button>
                  </div>
                  <button 
                    onClick={() => setReportingReview(review)}
                    className="flex items-center space-x-1 space-x-reverse text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Flag className="h-4 w-4" />
                    <span>إبلاغ</span>
                  </button>
                </div>

                {/* Reply Section */}
                {replyingTo === review.id && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="اكتب ردك هنا..."
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2 space-x-reverse mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                      >
                        إلغاء
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReply(review.id)}
                        disabled={!replyText.trim() || loadingStates[`reply-${review.id}`]}
                      >
                        {loadingStates[`reply-${review.id}`] ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            جاري الإرسال...
                          </div>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            إرسال الرد
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Display Replies */}
                {(review as any).replies && (review as any).replies.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      الردود ({(review as any).replies.length})
                    </h6>
                    {(review as any).replies.map((reply: any) => (
                      <div key={reply.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-r-4 border-blue-500">
                        <div className="flex items-start space-x-3 space-x-reverse">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={reply.user?.avatar || undefined} />
                            <AvatarFallback className="text-xs">
                              {(reply.user?.name || 'مستخدم')
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 space-x-reverse mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {reply.user?.name || 'مستخدم'}
                              </span>
                              {reply.isFromOwner && (
                                <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                                  مالك الشركة
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                <ClientSideDate date={reply.createdAt.toISOString().split('T')[0]} />
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={loadMoreReviews}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                جاري التحميل...
              </div>
            ) : (
              'عرض المزيد من التقييمات'
            )}
          </Button>
        </div>
      )}

      {/* Add Review Modal */}
      {showAddReview && (
        <AddReviewForm
          companyName={companyName}
          onClose={() => setShowAddReview(false)}
          onSubmit={handleAddReview}
        />
      )}

      {/* Report Review Modal */}
      {reportingReview && (
        <ReportReviewForm
          reviewId={reportingReview.id}
          reviewTitle={reportingReview.title}
          onClose={() => setReportingReview(null)}
          onSubmit={handleReportReview}
        />
      )}
    </div>
  );
}
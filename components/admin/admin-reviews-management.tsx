'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, Eye, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ReviewDetailsModal } from '@/components/admin/review-details-modal';
import { useDebounce } from '@/hooks/use-debounce';
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
} from "@/components/ui/alert-dialog"

// Types
interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  isApproved: boolean;
  company: { name: string; slug: string; };
  user?: { avatar?: string; };
}

export function AdminReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  // Filtering and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        searchTerm: debouncedSearchTerm,
        statusFilter,
        ratingFilter,
      });
      const response = await fetch(`/api/admin/reviews?${params.toString()}`);
      const data = await response.json();
      if (data.success && data.data) {
        setReviews(data.data.reviews || []);
        setTotalPages(data.data.totalPages || 1);
      } else {
        setReviews([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, statusFilter, ratingFilter]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        alert('تم حذف المراجعة بنجاح.');
        loadReviews(); // Refresh the list
      } else {
        alert(`فشل حذف المراجعة: ${data.error?.message}`);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('حدث خطأ أثناء حذف المراجعة.');
    } finally {
      setReviewToDelete(null);
    }
  };

  const getStatusBadge = (isApproved: boolean) => {
    return isApproved ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">موافق عليه</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">في انتظار المراجعة</Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">إدارة المراجعات</h1>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في التقييمات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
      ) : reviews.length === 0 ? (
        <p className="text-center py-12">لم يتم العثور على مراجعات تطابق بحثك.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 space-x-reverse flex-1">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.user?.avatar} />
                      <AvatarFallback>{review.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{review.userName}</h4>
                          {getStatusBadge(review.isApproved)}
                        </div>
                        <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString( )}</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse mb-2">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">في {review.company.name}</span>
                      </div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-1">{review.title}</h5>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{review.comment}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse ml-4">
                    <Button variant="outline" size="sm" onClick={() => setSelectedReview(review)}><Eye className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد?</AlertDialogTitle>
                          <AlertDialogDescription>
                            هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف المراجعة بشكل دائم.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteReview(review.id)}>حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>السابق</Button>
          <span className="text-sm text-gray-700 dark:text-gray-200">صفحة {currentPage} من {totalPages}</span>
          <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>التالي</Button>
        </div>
      )}

      {selectedReview && (
        <ReviewDetailsModal review={selectedReview} onClose={() => setSelectedReview(null)} onApprove={() => {}} onReject={() => {}} />
      )}
    </div>
  );
}
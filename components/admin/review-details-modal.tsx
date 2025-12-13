'use client';

import { Star, X, Check, Ban, Calendar, User, Building2, Mail, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

interface ReviewDetailsModalProps {
  review: Review;
  onClose: () => void;
  onApprove: (reviewId: string) => void;
  onReject: (reviewId: string) => void;
}

export function ReviewDetailsModal({ review, onClose, onApprove, onReject }: ReviewDetailsModalProps) {
  const handleApprove = () => {
    onApprove(review.id);
    onClose();
  };

  const handleReject = () => {
    if (confirm('هل أنت متأكد من رفض هذا التقييم؟ لن يكون بإمكان استرداده.')) {
      onReject(review.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              تفاصيل التقييم
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Review Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">الحالة:</span>
              <Badge className={review.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {review.isApproved ? 'موافق عليه' : 'في انتظار المراجعة'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{new Date(review.createdAt).toLocaleDateString( )}</span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-start space-x-4 space-x-reverse">
            <Avatar className="w-12 h-12">
              <AvatarImage src={review.user?.avatar} />
              <AvatarFallback>
                {review.userName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-3 space-x-reverse">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">{review.userName}</span>
              </div>
              {review.userEmail && (
                <div className="flex items-center space-x-3 space-x-reverse mt-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{review.userEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">{review.company.name}</span>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              التقييم
            </label>
            <div className="flex items-center space-x-2 space-x-reverse">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < review.rating
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-lg font-medium text-gray-900 dark:text-white ml-2">
                {review.rating}/5
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              عنوان التقييم
            </label>
            <p className="text-gray-900 dark:text-white font-medium">
              {review.title}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              التعليق
            </label>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-900 dark:text-white leading-relaxed">
                {review.comment}
              </p>
            </div>
          </div>

          {/* Images */}
          {review.images.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الصور المرفقة
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {review.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.imageUrl}
                      alt="صورة التقييم"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {review.helpfulCount}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                إعجاب
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {review.notHelpfulCount}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                عدم إعجاب
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-600">
            <Button
              variant="outline"
              onClick={onClose}
            >
              إغلاق
            </Button>
            
            {!review.isApproved && (
              <>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <Ban className="h-4 w-4 ml-2" />
                  رفض
                </Button>
                <Button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="h-4 w-4 ml-2" />
                  موافقة
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

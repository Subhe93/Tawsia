'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, User, MessageSquare, Send, CheckCircle, Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DirectReviewFormProps {
  companyId: string;
  companyName: string;
  companySlug: string;
}

export function DirectReviewForm({ companyId, companyName, companySlug }: DirectReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isValidEmail = (value: string) =>
    !value || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim());

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!rating || rating < 1 || rating > 5) newErrors.rating = 'يرجى اختيار تقييم';
    if (!userName.trim()) newErrors.userName = 'الاسم مطلوب';
    else if (userName.trim().length < 2) newErrors.userName = 'الاسم قصير جداً';
    if (!comment.trim()) newErrors.comment = 'التفاصيل مطلوبة';
    else if (comment.trim().length < 10) newErrors.comment = 'التفاصيل قصيرة جداً';
    else if (comment.trim().length > 500) newErrors.comment = 'التفاصيل طويلة جداً';
    if (!isValidEmail(userEmail)) newErrors.userEmail = 'بريد غير صحيح';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getRatingText = (r: number) => {
    switch (r) {
      case 1: return 'سيء جداً 😞';
      case 2: return 'سيء 😕';
      case 3: return 'متوسط 😐';
      case 4: return 'جيد 🙂';
      case 5: return 'ممتاز 🤩';
      default: return 'اضغط على النجوم';
    }
  };

  // رفع الصور للسيرفر
  const uploadImages = async (): Promise<string[]> => {
    if (photoFiles.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    
    for (const file of photoFiles) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('/api/upload/review-image', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (result.success && result.url) {
          uploadedUrls.push(result.url);
        }
      } catch (error) {
        console.error('خطأ في رفع الصورة:', error);
      }
    }
    
    return uploadedUrls;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 3 - photoFiles.length);
      const newPhotoPreviews = newFiles.map(file => URL.createObjectURL(file));
      
      setPhotoFiles([...photoFiles, ...newFiles]);
      setPhotos([...photos, ...newPhotoPreviews]);
    }
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photos[index]);
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // رفع الصور أولاً
      let uploadedImageUrls: string[] = [];
      if (photoFiles.length > 0) {
        setIsUploading(true);
        uploadedImageUrls = await uploadImages();
        setIsUploading(false);
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          userName,
          userEmail: userEmail || undefined,
          rating,
          comment,
          images: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
      } else {
        alert(result.error?.message || 'حدث خطأ أثناء إرسال التقييم');
      }
    } catch (error) {
      console.error('خطأ في إرسال التقييم:', error);
      alert('حدث خطأ أثناء إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State
  if (isSuccess) {
    return (
      <div className="p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            شكراً لك! 🎉
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            تم استلام تقييمك بنجاح وسيتم نشره بعد المراجعة
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push(`/${companySlug}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
          >
            العودة لصفحة الشركة
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsSuccess(false);
              setRating(0);
              setComment('');
              setUserName('');
              setUserEmail('');
              setPhotos([]);
              setPhotoFiles([]);
            }}
            className="w-full py-3 rounded-xl"
          >
            إضافة تقييم آخر
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Rating Stars - Large and Touch Friendly */}
      <div className="text-center">
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
          كيف كانت تجربتك؟
        </label>
        <div className="flex items-center justify-center gap-2 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transform active:scale-90 transition-transform duration-150 p-1"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={`h-12 w-12 sm:h-10 sm:w-10 transition-all duration-200 ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-500 fill-current scale-110'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>
        <p className={`text-lg font-medium transition-colors ${
          rating > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'
        }`}>
          {getRatingText(hoverRating || rating)}
        </p>
        {errors.rating && (
          <p className="text-sm text-red-600 mt-2">{errors.rating}</p>
        )}
      </div>

      {/* User Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          اسمك *
        </label>
        <div className="relative">
          <User className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className={`w-full pr-12 pl-4 py-4 text-lg border-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
              errors.userName 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="اسمك"
          />
        </div>
        {errors.userName && (
          <p className="text-sm text-red-600 mt-1">{errors.userName}</p>
        )}
      </div>

      {/* Email (Optional) */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          البريد الإلكتروني <span className="text-gray-400 font-normal">(اختياري)</span>
        </label>
        <input
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          className={`w-full px-4 py-4 text-lg border-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
            errors.userEmail 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
          }`}
          placeholder="email@example.com"
        />
        {errors.userEmail && (
          <p className="text-sm text-red-600 mt-1">{errors.userEmail}</p>
        )}
      </div>

      {/* Review Comment */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          تفاصيل تجربتك *
        </label>
        <div className="relative">
          <MessageSquare className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className={`w-full pr-12 pl-4 py-4 text-lg border-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 resize-none transition-all ${
              errors.comment 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="شارك تفاصيل تجربتك..."
          />
        </div>
        <div className="flex justify-between mt-1">
          {errors.comment && (
            <p className="text-sm text-red-600">{errors.comment}</p>
          )}
          <p className={`text-sm mr-auto ${comment.length > 500 ? 'text-red-600' : 'text-gray-400'}`}>
            {comment.length}/500
          </p>
        </div>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          إضافة صور <span className="text-gray-400 font-normal">(اختياري)</span>
        </label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4">
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`صورة ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {photos.length < 3 && (
            <label className="cursor-pointer flex flex-col items-center justify-center py-6">
              <Camera className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                اضغط لإضافة صور (حتى 3)
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || !rating || !userName.trim() || !comment.trim()}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 ml-3 animate-spin" />
            {isUploading ? 'جاري رفع الصور...' : 'جاري الإرسال...'}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Send className="h-5 w-5 ml-2" />
            إرسال التقييم
          </div>
        )}
      </Button>

      {/* Privacy Note */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        بإرسال التقييم، أنت توافق على سياسة الخصوصية وشروط الاستخدام
      </p>
    </form>
  );
}

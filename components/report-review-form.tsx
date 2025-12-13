'use client';

import { useState } from 'react';
import { Flag, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportReviewFormProps {
  reviewId: string;
  reviewTitle: string;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const reportReasons = [
  { value: 'SPAM', label: 'رسائل مزعجة أو إعلانات' },
  { value: 'INAPPROPRIATE_LANGUAGE', label: 'لغة غير لائقة أو مسيئة' },
  { value: 'FAKE_REVIEW', label: 'تقييم مزيف أو غير حقيقي' },
  { value: 'HARASSMENT', label: 'تحرش أو تنمر' },
  { value: 'COPYRIGHT_VIOLATION', label: 'انتهاك حقوق الطبع والنشر' },
  { value: 'OTHER', label: 'أخرى' }
];

export function ReportReviewForm({ reviewId, reviewTitle, onClose, onSubmit }: ReportReviewFormProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason || !description.trim()) {
      alert('يرجى اختيار سبب الإبلاغ وكتابة وصف للمشكلة');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
          description,
          reporterEmail: reporterEmail || undefined
        }),
      });

      const result = await response.json();

      if (response.ok) {
        onSubmit(result.data);
        alert('تم إرسال البلاغ بنجاح. شكراً لك على المساعدة في تحسين جودة المحتوى.');
        onClose();
      } else {
        alert(result.error?.message || 'حدث خطأ أثناء إرسال البلاغ');
      }
    } catch (error) {
      console.error('خطأ في إرسال البلاغ:', error);
      alert('حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Flag className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              إبلاغ عن تقييم
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Review Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              التقييم المُبلغ عنه:
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              "{reviewTitle}"
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              سبب الإبلاغ *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="">اختر سبب الإبلاغ</option>
              {reportReasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              وصف المشكلة *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              placeholder="اشرح بالتفصيل سبب الإبلاغ عن هذا التقييم..."
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description.length}/500 حرف
            </p>
          </div>

          {/* Reporter Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              البريد الإلكتروني (اختياري)
            </label>
            <input
              type="email"
              value={reporterEmail}
              onChange={(e) => setReporterEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="email@example.com"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              للتواصل معك في حالة الحاجة لمزيد من المعلومات
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4 flex items-start space-x-3 space-x-reverse">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <p className="font-medium mb-1">تنبيه:</p>
              <p>
                يرجى الإبلاغ فقط عن المحتوى الذي ينتهك فعلاً قواعد المجتمع. 
                البلاغات الكاذبة قد تؤدي إلى تقييد حسابك.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 space-x-reverse pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !reason || !description.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  جاري الإرسال...
                </div>
              ) : (
                <div className="flex items-center">
                  <Flag className="h-4 w-4 ml-2" />
                  إرسال البلاغ
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
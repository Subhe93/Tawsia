'use client';

import { Flag, X, Check, Ban, Calendar, User, Mail, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ReviewReport {
  id: string;
  reason: string;
  description: string;
  reporterEmail?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  review: {
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
  };
}

interface ReportDetailsModalProps {
  report: ReviewReport;
  onClose: () => void;
  onAction: (reportId: string, action: 'approve' | 'reject') => void;
}

export function ReportDetailsModal({ report, onClose, onAction }: ReportDetailsModalProps) {
  const handleApprove = () => {
    if (confirm('هل أنت متأكد من قبول هذا البلاغ؟ سيتم حذف التقييم المبلغ عنه.')) {
      onAction(report.id, 'approve');
      onClose();
    }
  };

  const handleReject = () => {
    if (confirm('هل أنت متأكد من رفض هذا البلاغ؟ سيبقى التقييم كما هو.')) {
      onAction(report.id, 'reject');
      onClose();
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'معلق';
      case 'APPROVED':
        return 'مقبول';
      case 'REJECTED':
        return 'مرفوض';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Flag className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              تفاصيل البلاغ
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
          {/* Report Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">حالة البلاغ:</span>
              <Badge className={getStatusColor(report.status)}>
                {getStatusText(report.status)}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{new Date(report.createdAt).toLocaleDateString( )}</span>
            </div>
          </div>

          {/* Report Details */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-start space-x-3 space-x-reverse">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center space-x-3 space-x-reverse mb-3">
                  <span className="font-medium text-red-900 dark:text-red-100">سبب البلاغ:</span>
                  <Badge variant="destructive">
                    {getReasonText(report.reason)}
                  </Badge>
                </div>

                <div className="mb-3">
                  <span className="font-medium text-red-900 dark:text-red-100 block mb-2">وصف المشكلة:</span>
                  <p className="text-red-800 dark:text-red-200 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                {report.reporterEmail && (
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Mail className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm text-red-700 dark:text-red-300">
                      المبلغ: {report.reporterEmail}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reported Review */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              التقييم المبلغ عنه
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {report.review.userName}
                  </span>
                  <Badge className={report.review.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {report.review.isApproved ? 'موافق عليه' : 'في انتظار المراجعة'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(report.review.createdAt).toLocaleDateString( )}</span>
                </div>
              </div>

              <div className="mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">الشركة:</span>
                <span className="text-gray-900 dark:text-white ml-2">{report.review.company.name}</span>
              </div>

              <div className="mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">التقييم:</span>
                <div className="flex items-center space-x-1 space-x-reverse ml-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        i < report.review.rating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                    ({report.review.rating}/5)
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">العنوان:</span>
                <p className="text-gray-900 dark:text-white">{report.review.title}</p>
              </div>

              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">التعليق:</span>
                <p className="text-gray-900 dark:text-white leading-relaxed">
                  {report.review.comment}
                </p>
              </div>

              <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-500">
                <span>👍 {report.review.helpfulCount} إعجاب</span>
                <span>👎 {report.review.notHelpfulCount} عدم إعجاب</span>
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
            
            {report.status === 'PENDING' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="text-gray-600 hover:text-gray-700"
                >
                  <Ban className="h-4 w-4 ml-2" />
                  رفض البلاغ
                </Button>
                <Button
                  onClick={handleApprove}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Check className="h-4 w-4 ml-2" />
                  قبول البلاغ وحذف التقييم
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

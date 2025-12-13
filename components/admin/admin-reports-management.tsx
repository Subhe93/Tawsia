'use client';

import { useState, useEffect } from 'react';
import { Trash2, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Define the types for the data
interface Report {
  id: string;
  reason: string;
  description: string;
  reporterEmail: string | null;
  status: string;
  createdAt: string;
  review: {
    id: string;
    title: string;
    comment: string;
    company: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export function AdminReportsManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/reports?page=${currentPage}&limit=10`);
        const data = await response.json();
        if (data.success) {
          setReports(data.data.reports);
          setTotalPages(data.data.totalPages);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [currentPage]);

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد أنك تريد حذف هذا البلاغ؟')) {
      try {
        const response = await fetch(`/api/admin/reports?id=${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          setReports(reports.filter((report) => report.id !== id));
          alert('تم حذف البلاغ بنجاح.');
        } else {
          alert('فشل حذف البلاغ.');
        }
      } catch (error) {
        console.error('Failed to delete report:', error);
        alert('حدث خطأ أثناء حذف البلاغ.');
      }
    }
  };

  const reasonTranslations: { [key: string]: string } = {
    SPAM: 'رسائل مزعجة',
    INAPPROPRIATE_LANGUAGE: 'لغة غير لائقة',
    FAKE_REVIEW: 'تقييم مزيف',
    HARASSMENT: 'تحرش',
    COPYRIGHT_VIOLATION: 'انتهاك حقوق النشر',
    OTHER: 'أخرى',
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">بلاغات المراجعات</h1>
      {isLoading ? (
        <p>جاري التحميل...</p>
      ) : reports.length === 0 ? (
        <p>لم يتم العثور على بلاغات.</p>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المراجعة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السبب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوصف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المُبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{report.review.title}</div>
                      <Link href={`/company/${report.review.company.slug}`} className="text-sm text-blue-500 hover:underline">
                        {report.review.company.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {reasonTranslations[report.reason] || report.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-normal max-w-xs">
                      <p className="text-sm text-gray-900 dark:text-white truncate">{report.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.reporterEmail || 'مجهول'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedReport(report)}>
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(report.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronRight className="h-4 w-4 ml-2" />
              السابق
            </Button>
            <span className="text-sm text-gray-700 dark:text-gray-200">
              صفحة {currentPage} من {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              التالي
              <ChevronLeft className="h-4 w-4 mr-2" />
            </Button>
          </div>
        </>
      )}

      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h3 className="text-xl font-bold">تفاصيل البلاغ</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedReport(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <h4 className="font-bold text-lg mb-2">الشركة</h4>
                {/* <Link href={`/company/${selectedReport.review.company.slug}`} className="text-blue-500 hover:underline"> */}
                  {selectedReport.review.company.name}
                {/* </Link> */}
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">المراجعة</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h5 className="font-bold">{selectedReport.review.title}</h5>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{selectedReport.review.comment}</p>
                </div>
              </div>
              <hr className="my-4 border-gray-200 dark:border-gray-600" />
              <div>
                <h4 className="font-bold text-lg mb-2">تفاصيل البلاغ</h4>
                <div className="space-y-2">
                    <p><strong>السبب:</strong> <span className="px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">{reasonTranslations[selectedReport.reason] || selectedReport.reason}</span></p>
                    <p><strong>الوصف:</strong> {selectedReport.description}</p>
                    <p><strong>المُبلغ:</strong> {selectedReport.reporterEmail || 'مجهول'}</p>
                    <p><strong>تاريخ البلاغ:</strong> {new Date(selectedReport.createdAt).toLocaleString('ar-EG')}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <Button variant="outline" onClick={() => setSelectedReport(null)}>إغلاق</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
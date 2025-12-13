export const dynamic = "force-dynamic";

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCompanyBySlug } from '@/lib/database/queries';
import { DirectReviewForm } from '@/components/direct-review-form';
import { Star, ArrowRight } from 'lucide-react';

export async function generateMetadata(
  { params }: { params: { company: string } }
): Promise<Metadata> {
  try {
    const decodedSlug = decodeURIComponent(params.company);
    const company = await getCompanyBySlug(decodedSlug);
    
    if (!company) {
      return {
        title: 'الشركة غير موجودة',
        description: 'هذه الشركة غير متوفرة',
      };
    }

    return {
      title: `أضف تقييمك لـ ${company.name} | توصية`,
      description: `شارك تجربتك مع ${company.name} وساعد الآخرين في اتخاذ قرارهم`,
    };
  } catch (error) {
    return {
      title: 'إضافة تقييم',
      description: 'أضف تقييمك للشركة',
    };
  }
}

export default async function AddReviewPage({ 
  params 
}: { 
  params: { company: string } 
}) {
  try {
    const decodedSlug = decodeURIComponent(params.company);
    const company = await getCompanyBySlug(decodedSlug);
    
    if (!company) {
      notFound();
    }

    // إذا كانت الشركة غير نشطة
    if (!company.isActive) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="text-yellow-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              الصفحة غير متاحة
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              هذه الشركة متوقفة حالياً عن استقبال التقييمات
            </p>
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-6">
            <Link 
              href={`/${company.slug}`}
              className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-4"
            >
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة لصفحة الشركة
            </Link>
            
            <div className="flex items-center gap-4">
              {company.logoImage && (
                <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                  <img 
                    src={company.logoImage} 
                    alt={company.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{company.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(company.rating) ? 'text-yellow-400 fill-current' : 'text-white/40'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-white/80 text-sm">
                    ({company.reviewsCount} تقييم)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
              {/* Form Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-3">
                    <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      شاركنا تجربتك
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      رأيك يساعد الآخرين في اتخاذ قرارهم
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <DirectReviewForm 
                companyId={company.id}
                companyName={company.name}
                companySlug={company.slug}
              />
            </div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">تقييم آمن</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">مراجعة موثوقة</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">نشر سريع</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('خطأ في تحميل صفحة إضافة التقييم:', error);
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            حدث خطأ
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            عذراً، حدث خطأ أثناء تحميل الصفحة
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }
}


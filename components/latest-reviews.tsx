import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Star, User, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ClientSideDate = dynamic(() => import('@/components/client-side-date').then(mod => ({ default: mod.ClientSideDate })), {
  ssr: true
});

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date | string; // Can be Date object or ISO string
  userName: string; // اسم المستخدم من جدول Review
  userAvatar: string | null; // صورة المستخدم من جدول Review
  user: {
    name: string | null;
    avatar: string | null; // تحديث من image إلى avatar
  } | null;
  company: {
    name: string;
    slug: string;
    city: {
      slug: string;
      country: {
        code: string;
      };
    };
  };
}

interface LatestReviewsProps {
  reviews: Review[];
}

// إزالة fallback reviews للاعتماد على البيانات الحقيقية فقط

export function LatestReviews({ reviews }: LatestReviewsProps) {
  // عدم عرض القسم إذا لم توجد مراجعات
  if (!reviews || reviews.length === 0) {
    return (
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            أحدث التقييمات
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            لا توجد تقييمات متاحة حالياً. كن أول من يضيف تقييماً!
          </p>
        </div>
      </section>
    );
  }
  return (
    <section className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          آخر التقييمات
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          اطلع على آراء العملاء حول الشركات والخدمات
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6"
          >
            <div className="flex items-center space-x-4 space-x-reverse mb-4">
              <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold">
                  {review.company.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <Link
                  href={`/${review.company.slug}`}
                  className="font-bold text-gray-900 dark:text-white hover:text-brand-green dark:hover:text-brand-green transition-colors"
                >
                  {review.company.name}
                </Link>
                <div className="flex items-center space-x-1 space-x-reverse mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
              "{review.comment}"
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2 space-x-reverse">
                {/* عرض صورة المستخدم إذا متوفرة */}
                {(review.userAvatar || review.user?.avatar) ? (
                  <Image
                    src={review.userAvatar || review.user?.avatar || ''}
                    alt={review.userName || review.user?.name || 'مستخدم'}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span>{review.userName || review.user?.name || 'مستخدم'}</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Calendar className="h-4 w-4" />
                <ClientSideDate date={
                  (() => {
                    if (!review.createdAt) return new Date().toISOString().split('T')[0];
                    if (typeof review.createdAt === 'string') return review.createdAt.split('T')[0];
                    if (review.createdAt instanceof Date) return review.createdAt.toISOString().split('T')[0];
                    return new Date(review.createdAt).toISOString().split('T')[0];
                  })()
                } />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
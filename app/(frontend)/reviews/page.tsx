import { Metadata } from 'next';
import { LatestReviews } from '@/components/latest-reviews';

export async function generateMetadata(): Promise<Metadata> {
  const { applySeoOverride } = await import('@/lib/seo/overrides');
  
  const overridden = await applySeoOverride({
    title: 'آخر التقييمات | توصية',
    description: 'اطلع على آراء العملاء حول الشركات والخدمات في توصية'
  }, '/reviews', { targetType: 'CUSTOM_PATH', targetId: '/reviews' });

  return {
    title: overridden.title,
    description: overridden.description,
  };
}

export default function ReviewsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          جميع التقييمات
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          اكتشف آراء العملاء حول الشركات والخدمات المختلفة
        </p>
      </div>
      
      <LatestReviews reviews={[]} />
    </div>
  );
}
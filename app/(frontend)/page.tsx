export const dynamic = "force-dynamic";
import Link from 'next/link';
import { Metadata } from 'next';
import { HomeClientWrapper } from '@/components/home-client-wrapper';
import { getHomePageData, getSiteStats, getAllCountries } from '@/lib/services/homepage.service';
import { generateHomePageMetadata, generateJsonLd, type SiteStats } from '@/lib/seo/metadata';
import { applySeoOverride } from '@/lib/seo/overrides';

// Generate dynamic metadata with stats for SEO
export async function generateMetadata(): Promise<Metadata> {
  const stats = await getSiteStats();
  const baseMetadata = generateHomePageMetadata(stats);
  
  const overridden = await applySeoOverride({
    title: typeof baseMetadata.title === 'string' ? baseMetadata.title : 'توصية - دليل الشركات العربية',
    description: typeof baseMetadata.description === 'string' ? baseMetadata.description : 'دليل الشركات والخدمات في الوطن العربي'
  }, '/', { targetType: 'CUSTOM_PATH', targetId: '/' });

  return {
    ...baseMetadata,
    title: overridden.title,
    description: overridden.description
  };
}

export default async function HomePage() {
  try {
    // جلب البيانات باستخدام طبقة الخدمات المحسنة
    const [data, allCountries, stats] = await Promise.all([
      getHomePageData(),
      getAllCountries(),
      getSiteStats()
    ]);
    
    // تسجيل إحصائيات للتطوير
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 بيانات الصفحة الرئيسية:', {
        countries: data.countries.length,
        allCountries: allCountries.length,
        companies: data.featuredCompanies.length,
        categories: data.categories.length,
        reviews: data.latestReviews.length,
        totalStats: stats
      });
    }
    
    // JSON-LD schema للـ SEO
    const jsonLd = generateJsonLd(stats);

    return (
      <>
        {/* JSON-LD Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        
        <HomeClientWrapper
          allCountries={allCountries}
          initialCategories={data.categories}
          initialFeaturedCompanies={data.featuredCompanies}
          initialLatestReviews={data.latestReviews}
          initialStats={stats}
        />
      </>
    );
    
  } catch (error) {
    console.error('خطأ في تحميل الصفحة الرئيسية:', error);
    
    // صفحة خطأ بسيطة
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          عذراً، حدث خطأ في تحميل الصفحة
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          يرجى المحاولة مرة أخرى أو إعادة تحميل الصفحة
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          إعادة تحميل الصفحة
        </button>
      </div>
    );
  }
}
// ISR: إعادة التحقق كل 4 ساعات
export const revalidate = 14400;
import { Metadata } from 'next';
import { applySeoOverride } from '@/lib/seo/overrides'
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCityBySlug, getCompanies, getCountryByCode, getCategories, getSubAreas } from '@/lib/database/queries';
import { CompaniesGrid } from '@/components/companies-grid';
import { AdvancedSearchFilters } from '@/components/advanced-search-filters';
import { ServicesCategories } from '@/components/services-categories';
import { SubAreasGrid } from '@/components/sub-area/sub-areas-grid';
import { 
  generateItemListSchema,
  generateOrganizationSchema,
  generateWebsiteSchema
} from '@/lib/seo/schema-generator';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

export async function generateMetadata({ 
  params 
}: { 
  params: { country: string; city: string } 
}): Promise<Metadata> {
  try {
    const [city, country] = await Promise.all([
      getCityBySlug(params.city, params.country),
      getCountryByCode(params.country)
    ]);
    
    if (!city) {
      return {
        title: 'المدينة غير موجودة',
        description: 'هذه المدينة غير متوفرة في دليل الشركات',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://murabaat.com';
    const cityUrl = `${baseUrl}/country/${params.country}/city/${params.city}`;
    const countryName = country?.name || params.country.toUpperCase();
    const cityName = city?.name || params.city;

    const overridden = await applySeoOverride({
      title: `دليل الشركات في ${cityName}, ${countryName} | توصية`,
      description: `اكتشف أفضل الشركات والخدمات في ${cityName}, ${countryName}. دليل شامل للشركات المحلية مع تقييمات العملاء.`,
    }, `/country/${params.country}/city/${params.city}`, { targetType: 'CITY', targetId: city.id })

    return {
      title: overridden.title,
      description: overridden.description,
      keywords: overridden.keywords,
      openGraph: {
    title: overridden.title,
      description: overridden.description,
        url: cityUrl,
      },

      alternates: {
        canonical: cityUrl,
      }
    };
  } catch (error) {
    console.error('خطأ في generateMetadata للمدينة:', error);
    return {
      title: 'خطأ في تحميل المدينة',
    };
  }
}

interface CityPageProps {
  params: { country: string; city: string }
  searchParams?: { 
    category?: string
    rating?: string
    verified?: string
    search?: string
    sort?: string
    page?: string
  }
}

export default async function CityPage({ params, searchParams = {} }: CityPageProps) {
  try {
    const [city, country] = await Promise.all([
      getCityBySlug(params.city, params.country),
      getCountryByCode(params.country)
    ]);

    if (!city) {
      notFound();
    }

    const [categories, subAreas] = await Promise.all([
      getCategories(),
      getSubAreas(undefined, params.country)
    ]);

    // إعداد الفلاتر من searchParams
    const filters = {
      country: params.country,
      city: params.city,
      category: searchParams?.category,
      rating: searchParams?.rating ? parseFloat(searchParams.rating) : undefined,
      verified: searchParams?.verified === 'true' ? true : searchParams?.verified === 'false' ? false : undefined,
      query: searchParams?.search,
      sortBy: (searchParams?.sort as any) || 'rating',
      page: parseInt(searchParams?.page || '1'),
      limit: 20
    };

    const companiesResult = await getCompanies(filters);

    // Debug: Log the companies result
    console.log('City Page Debug:', {
      cityName: city.name,
      filters,
      companiesCount: companiesResult?.data?.length || 0,
      totalCount: companiesResult?.pagination?.total || 0,
    });

    // Generate schemas for the city page
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://murabaat.com';
    const itemListSchema = companiesResult.data && companiesResult.data.length > 0 ? generateItemListSchema(
      companiesResult.data,
      baseUrl,
      `شركات ${city.name}`,
      `دليل شامل للشركات والخدمات في ${city.name}`
    ) : null;
    const organizationSchema = generateOrganizationSchema(baseUrl);
    const websiteSchema = generateWebsiteSchema(baseUrl);
    
    // Generate breadcrumb schema for city page
    const countryName = country?.name || params.country.toUpperCase();
    const cityName = city?.name || params.city;
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": baseUrl,
          "name": "الرئيسية"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": `${baseUrl}/services`,
          "name": "جميع التصنيفات"
        },
        {
          "@type": "ListItem", 
          "position": 3,
          "item": `${baseUrl}/country/${params.country}`,
          "name": countryName
        },
        {
          "@type": "ListItem",
          "position": 4,
          "item": `${baseUrl}/country/${params.country}/city/${params.city}`,
          "name": cityName
        }
      ]
    };

    return (
      <>
        {/* JSON-LD Schema للقائمة */}
        {itemListSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(itemListSchema),
            }}
          />
        )}

        {/* JSON-LD Schema للـ BreadcrumbList */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />

        {/* JSON-LD Schema للموقع */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />

        <div className="container mx-auto px-4 py-8">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">الرئيسية</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/services">جميع التصنيفات</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/country/${params.country}`}>{countryName}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{cityName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Hero Section مع صورة المدينة من قاعدة البيانات إن توفرت */}
          <div className="relative rounded-2xl overflow-hidden mb-8">
            {(city as any)?.image ? (
              <>
                <img
                  src={(city as any).image}
                  alt={cityName}
                  className="w-full h-48 md:h-64 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
                <div className="absolute inset-0 p-8 text-white flex flex-col justify-end">
                  <div className="flex items-center space-x-4 space-x-reverse mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                      </svg>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold">{cityName}</h1>
                  </div>
                  <p className="text-sm md:text-base text-white/90">في {countryName}</p>
                  <p className="mt-1 text-sm md:text-base text-white/80 max-w-2xl">اكتشف أفضل الشركات والخدمات في {cityName} مع تقييمات العملاء الحقيقية</p>
                </div>
              </>
            ) : (
              <div className="bg-gradient-to-r from-brand-green to-brand-yellow rounded-2xl p-8 text-white">
                <div className="flex items-center space-x-4 space-x-reverse mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                    </svg>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold">{cityName}</h1>
                </div>
                <p className="text-xl text-white/90 mb-2">في {countryName}</p>
                <p className="text-lg text-white/80 max-w-2xl">اكتشف أفضل الشركات والخدمات في {cityName} مع تقييمات العملاء الحقيقية</p>
              </div>
            )}
          </div>

          {/* عرض التصنيفات المتاحة */}
          <div className="mt-12">
            <ServicesCategories 
              categories={categories} 
              country={params.country}
              city={params.city}
            />
          </div>

          {/* عرض المناطق الفرعية */}
          {subAreas.length > 0 && (
            <div className="mt-12">
              <SubAreasGrid 
                subAreas={subAreas}
                cityName={cityName}
                countryCode={params.country}
                citySlug={params.city}
              />
            </div>
          )}
          
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                جميع الشركات في {cityName}
              </h2>
              <span className="text-gray-600 dark:text-gray-400">
                {companiesResult.pagination.total} شركة
              </span>
            </div>
         
            <AdvancedSearchFilters 
              showLocationFilter={false}
              showCategoryFilter={true}
              showRatingFilter={true}
              showPriceFilter={true}
              showHoursFilter={true}
            />
            
            {companiesResult.data && companiesResult.data.length > 0 ? (
              <CompaniesGrid 
                companies={companiesResult.data} 
                pagination={companiesResult.pagination}
              />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  لا توجد شركات في {cityName} حالياً
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  يرجى المحاولة مرة أخرى لاحقاً أو تصفح مدن أخرى
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    );

  } catch (error) {
    console.error('خطأ في تحميل صفحة المدينة:', error);
    
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          عذراً، حدث خطأ في تحميل المدينة
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية
        </p>
        <Link 
          href="/" 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }
}

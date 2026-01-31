// ISR: إعادة التحقق كل 4 ساعات
export const revalidate = 14400;
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSubAreaBySlug, getCompanies, getCountryByCode, getCityBySlug, getCategories } from '@/lib/database/queries';
import { applySeoOverride } from '@/lib/seo/overrides'

import { SubAreaClientWrapper } from '@/components/sub-area/sub-area-client-wrapper';
import { ServicesCategoriesCompact } from '@/components/services-categories-compact';
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
  params: { country: string; city: string; subarea: string } 
}): Promise<Metadata> {
  try {
    const [subArea, country, city] = await Promise.all([
      getSubAreaBySlug(params.subarea),
      getCountryByCode(params.country),
      getCityBySlug(params.city, params.country)
    ]);
    
    if (!subArea || !city) {
      return {
        title: 'المنطقة الفرعية أو المدينة غير موجودة',
        description: 'هذه المنطقة الفرعية أو المدينة غير متوفرة في دليل الشركات',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';
    const subAreaUrl = `${baseUrl}/country/${params.country}/city/${params.city}/sub-area/${params.subarea}`;
    const countryName = country?.name || params.country.toUpperCase();
    const cityName = city?.name || params.city;
    const subAreaName = subArea?.name || params.subarea;

    const overridden = await applySeoOverride({
      title: `دليل الشركات في ${subAreaName}, ${cityName}, ${countryName} | توصية`,
      description: `اكتشف أفضل الشركات والخدمات في ${subAreaName}, ${cityName}, ${countryName}. دليل شامل للشركات المحلية مع تقييمات العملاء.`,
    }, `/country/${params.country}/city/${params.city}/sub-area/${params.subarea}`, { targetType: 'SUBAREA', targetId: subArea.id });

    const finalMetadata = {
      title: overridden.title,
      description: overridden.description,
      keywords: overridden.keywords,
      
      openGraph: {
  title: overridden.title,
      description: overridden.description,
              url: subAreaUrl,
      },

      alternates: {
        canonical: subAreaUrl,
      }
    };
    
    return finalMetadata;
    
  } catch (error) {
    console.error('خطأ في generateMetadata للمنطقة الفرعية:', error);
    return {
      title: 'خطأ في تحميل المنطقة الفرعية',
    };
  }
}

interface SubAreaPageProps {
  params: { country: string; city: string; subarea: string }
  searchParams?: { 
    category?: string
    rating?: string
    verified?: string
    search?: string
    sort?: string
    page?: string
  }
}

export default async function SubAreaPage({ params, searchParams = {} }: SubAreaPageProps) {
  try {
    const [subArea, country, city] = await Promise.all([
      getSubAreaBySlug(params.subarea),
      getCountryByCode(params.country),
      getCityBySlug(params.city, params.country)
    ]);

    if (!subArea || !city) {
      notFound();
    }

    const categories = await getCategories();

    // إعداد الفلاتر من searchParams
    const filters = {
      country: params.country,
      city: params.city,
      subArea: params.subarea,
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
    console.log('SubArea Page Debug:', {
      subAreaName: subArea.name,
      cityName: city.name,
      filters,
      companiesCount: companiesResult?.data?.length || 0,
      totalCount: companiesResult?.pagination?.total || 0,
    });

    // Generate schemas for the subarea page
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';
    const itemListSchema = companiesResult.data && companiesResult.data.length > 0 ? generateItemListSchema(
      companiesResult.data,
      baseUrl,
      `شركات ${subArea.name}`,
      `دليل شامل للشركات والخدمات في ${subArea.name}`
    ) : null;
    const organizationSchema = generateOrganizationSchema(baseUrl);
    const websiteSchema = generateWebsiteSchema(baseUrl);
    
    // Generate breadcrumb schema for subarea page
    const countryName = country?.name || params.country.toUpperCase();
    const cityName = city?.name || params.city;
    const subAreaName = subArea?.name || params.subarea;
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
        },
        {
          "@type": "ListItem",
          "position": 5,
          "item": `${baseUrl}/country/${params.country}/city/${params.city}/sub-area/${params.subarea}`,
          "name": subAreaName
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
                <BreadcrumbLink asChild>
                  <Link href={`/country/${params.country}/city/${params.city}`}>{cityName}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{subAreaName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Hero Section مع صورة المنطقة من قاعدة البيانات إن توفرت */}
          <div className="relative rounded-2xl overflow-hidden mb-8">
            {(subArea as any)?.image ? (
              <>
                <img
                  src={(subArea as any).image}
                  alt={subAreaName}
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
                    <h1 className="text-3xl md:text-4xl font-bold">{subAreaName}</h1>
                  </div>
                  <p className="text-sm md:text-base text-white/90">في {cityName}, {countryName}</p>
                  {subArea.description && (
                    <p className="mt-1 text-sm md:text-base text-white/80 max-w-2xl">{subArea.description}</p>
                  )}
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
                  <h1 className="text-3xl md:text-4xl font-bold">{subAreaName}</h1>
                </div>
                <p className="text-xl text-white/90 mb-2">في {cityName}, {countryName}</p>
                {subArea.description && (
                  <p className="text-lg text-white/80 max-w-2xl">{subArea.description}</p>
                )}
              </div>
            )}
          </div>

          {/* عرض التصنيفات المتاحة */}
          <div className="mt-8">
            <ServicesCategoriesCompact 
              categories={categories} 
              country={params.country}
              city={params.city}
              subArea={params.subarea}
            />
          </div>
          
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                جميع الشركات في {subAreaName}
              </h2>
              <span className="text-gray-600 dark:text-gray-400">
                {companiesResult.pagination.total} شركة
              </span>
            </div>
         
            <SubAreaClientWrapper
              countrySlug={params.country}
              citySlug={params.city}
              subAreaSlug={params.subarea}
              countryName={countryName}
              cityName={cityName}
              subAreaName={subAreaName}
              searchParams={searchParams}
              companiesResult={companiesResult}
              categories={categories}
            />
          </div>
        </div>
      </>
    );

  } catch (error) {
    console.error('خطأ في تحميل صفحة المنطقة الفرعية:', error);
    
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          عذراً، حدث خطأ في تحميل المنطقة الفرعية
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

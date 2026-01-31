// ISR: إعادة التحقق كل 4 ساعات
export const revalidate = 14400;
import { Metadata } from 'next';
import { applySeoOverride } from '@/lib/seo/overrides'
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, getCompanies, getSubcategories, getCountryByCode, getCityBySlug } from '@/lib/database/queries';
import { CategoryHeader } from '@/components/category-header';
import { CityCategoryClientWrapper } from '@/components/city-category-client-wrapper';
import { SubcategoriesEnhanced } from '@/components/subcategories-enhanced';
import { Building2 } from 'lucide-react';
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
  params: { country: string; city: string; category: string } 
}): Promise<Metadata> {
  try {
    const [category, country, city] = await Promise.all([
      getCategoryBySlug(params.category, params.country),
      getCountryByCode(params.country),
      getCityBySlug(params.city, params.country)
    ]);
    
    if (!category || !city) {
      return {
        title: 'الفئة أو المدينة غير موجودة',
        description: 'هذه الفئة أو المدينة غير متوفرة في دليل الشركات',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';
    const categoryUrl = `${baseUrl}/country/${params.country}/city/${params.city}/category/${params.category}`;
    const countryName = country?.name || params.country.toUpperCase();
    const cityName = city?.name || params.city;

    const overridden = await applySeoOverride({
      title: `أفضل 10 ${category.name} في ${cityName}, ${countryName} |  توصية`,
      description: `اكتشف أفضل شركات ${category.name} في ${cityName}, ${countryName}. شركات متخصصة مع تقييمات العملاء.`,
    }, `/country/${params.country}/city/${params.city}/category/${params.category}`, { targetType: 'CATEGORY', targetId: category.id })

    return {
      title: overridden.title,
      description: overridden.description,
      keywords: overridden.keywords,
      
      openGraph: {
        title: overridden.title,
      description: overridden.description,
        url: categoryUrl,
      },

      alternates: {
        canonical: categoryUrl,
      }
    };
  } catch (error) {
    console.error('خطأ في generateMetadata للفئة حسب المدينة:', error);
    return {
      title: 'خطأ في تحميل الفئة',
    };
  }
}

interface CityCategoryPageProps {
  params: { country: string; city: string; category: string }
  searchParams?: { 
    rating?: string
    verified?: string
    search?: string
    sort?: string
    page?: string
  }
}

export default async function CityCategoryPage({ params, searchParams = {} }: CityCategoryPageProps) {
  try {
    const [category, country, city] = await Promise.all([
      getCategoryBySlug(params.category, params.country),
      getCountryByCode(params.country),
      getCityBySlug(params.city, params.country)
    ]);

    if (!category || !city) {
      notFound();
    }

    const subcategories = await getSubcategories(params.category);

    // إعداد الفلاتر من searchParams
    const filters = {
      country: params.country,
      city: params.city,
      category: params.category,
      rating: searchParams?.rating ? parseFloat(searchParams.rating) : undefined,
      verified: searchParams?.verified === 'true' ? true : searchParams?.verified === 'false' ? false : undefined,
      query: searchParams?.search,
      sortBy: (searchParams?.sort as any) || 'rating',
      page: parseInt(searchParams?.page || '1'),
      limit: 20
    };

    const companiesResult = await getCompanies(filters);

    // Debug: Log the companies result
    console.log('City Category Page Debug:', {
      categoryName: category.name,
      cityName: city.name,
      filters,
      companiesCount: companiesResult?.data?.length || 0,
      totalCount: companiesResult?.pagination?.total || 0,
    });

    // Generate schemas for the category page
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';
    const itemListSchema = companiesResult.data && companiesResult.data.length > 0 ? generateItemListSchema(
      companiesResult.data,
      baseUrl,
      `شركات ${category.name} في ${city.name}`,
      category.description || `دليل شامل لشركات ${category.name} في ${city.name}`
    ) : null;
    const organizationSchema = generateOrganizationSchema(baseUrl);
    const websiteSchema = generateWebsiteSchema(baseUrl);
    
    // Generate breadcrumb schema for city category page
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
        },
        {
          "@type": "ListItem",
          "position": 5,
          "item": `${baseUrl}/country/${params.country}/city/${params.city}/category/${category.slug}`,
          "name": category.name
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
                <BreadcrumbPage>{category.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-brand-green to-brand-yellow rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center space-x-4 space-x-reverse mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {category.name} في {cityName}
              </h1>
            </div>
            
            <p className="text-xl text-white/90 mb-2">
              في {countryName}
            </p>
            {category.description && (
              <p className="text-lg text-white/80 max-w-2xl">
                {category.description}
              </p>
            )}
          </div>

          <SubcategoriesEnhanced 
            subcategories={subcategories} 
            country={params.country} 
            city={params.city}
            category={params.category} 
          />
          
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {category.name} في {cityName}
              </h2>
              <span className="text-gray-600 dark:text-gray-400">
                {companiesResult.pagination.total} شركة
              </span>
            </div>
         
            <CityCategoryClientWrapper
              companiesResult={companiesResult}
              countrySlug={params.country}
              countryName={countryName}
              citySlug={params.city}
              cityName={cityName}
              categorySlug={params.category}
              categoryName={category.name}
            />
          </div>
        </div>
      </>
    );

  } catch (error) {
    console.error('خطأ في تحميل صفحة الفئة حسب المدينة:', error);
    
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          عذراً، حدث خطأ في تحميل الفئة
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

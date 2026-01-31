// ISR: إعادة التحقق كل 4 ساعات
export const revalidate = 14400;
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSubcategoryBySlug, getCompanies, getCategoryBySlug, getCountryByCode, getCityBySlug } from '@/lib/database/queries';
import { applySeoOverride } from '@/lib/seo/overrides';

import { CategoryHeader } from '@/components/category-header';
import { CitySubcategoryClientWrapper } from '@/components/city-subcategory-client-wrapper';
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
  params: { country: string; city: string; category: string; subcategory: string } 
}): Promise<Metadata> {
  try {
    const [subcategory, category, country, city] = await Promise.all([
      getSubcategoryBySlug(params.subcategory),
      getCategoryBySlug(params.category, params.country),
      getCountryByCode(params.country),
      getCityBySlug(params.city, params.country)
    ]);
    
    if (!subcategory || !category || !city) {
      return {
        title: 'الفئة الفرعية أو المدينة غير موجودة',
        description: 'هذه الفئة الفرعية أو المدينة غير متوفرة في دليل الشركات',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';
    const subcategoryUrl = `${baseUrl}/country/${params.country}/city/${params.city}/category/${params.category}/${params.subcategory}`;
    const countryName = country?.name || params.country.toUpperCase();
    const cityName = city?.name || params.city;

    const overridden = await applySeoOverride({
      title: `أفضل 10 ${subcategory.name} في ${cityName}, ${countryName} | ${category.name} | توصية`,
      description: `اكتشف أفضل  ${subcategory.name} في ${cityName}, ${countryName}.`,
    }, `/country/${params.country}/city/${params.city}/category/${params.category}/${params.subcategory}`, { targetType: 'SUBCATEGORY', targetId: subcategory.id })

    return {
      title: overridden.title,
      description: overridden.description,
      keywords:   overridden.keywords,
      
      openGraph: {
   title: overridden.title,
      description: overridden.description,
        url: subcategoryUrl,
      },

      alternates: {
        canonical: subcategoryUrl,
      }
    };
  } catch (error) {
    console.error('خطأ في generateMetadata للفئة الفرعية حسب المدينة:', error);
    return {
      title: 'خطأ في تحميل الفئة الفرعية',
    };
  }
}

interface CitySubcategoryPageProps {
  params: { country: string; city: string; category: string; subcategory: string }
  searchParams?: { 
    rating?: string
    verified?: string
    search?: string
    sort?: string
    page?: string
  }
}

export default async function CitySubcategoryPage({ params, searchParams = {} }: CitySubcategoryPageProps) {
  try {
    const [subcategory, category, country, city] = await Promise.all([
      getSubcategoryBySlug(params.subcategory),
      getCategoryBySlug(params.category, params.country),
      getCountryByCode(params.country),
      getCityBySlug(params.city, params.country)
    ]);

    if (!subcategory || !category || !city) {
      notFound();
    }

    const filters = {
      country: params.country,
      city: params.city,
      category: params.category,
      subcategory: params.subcategory,
      rating: searchParams?.rating ? parseFloat(searchParams.rating) : undefined,
      verified: searchParams?.verified === 'true' ? true : searchParams?.verified === 'false' ? false : undefined,
      query: searchParams?.search,
      sortBy: (searchParams?.sort as any) || 'rating',
      page: parseInt(searchParams?.page || '1'),
      limit: 20
    };

    const companiesResult = await getCompanies(filters);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';
    const itemListSchema = companiesResult.data && companiesResult.data.length > 0 ? generateItemListSchema(
      companiesResult.data,
      baseUrl,
      `شركات ${subcategory.name} في ${city.name}`,
      subcategory.description || `دليل شامل لشركات ${subcategory.name} في ${city.name}`
    ) : null;
    const organizationSchema = generateOrganizationSchema(baseUrl);
    const websiteSchema = generateWebsiteSchema(baseUrl);
    
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
        },
        {
          "@type": "ListItem",
          "position": 6,
          "item": `${baseUrl}/country/${params.country}/city/${params.city}/category/${category.slug}/${subcategory.slug}`,
          "name": subcategory.name
        }
      ]
    };

    return (
      <>
        {itemListSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(itemListSchema),
            }}
          />
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />

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
                <BreadcrumbLink asChild>
                  <Link href={`/country/${params.country}/city/${params.city}/category/${category.slug}`}>{category.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{subcategory.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>


          {/* Hero Section (مثل صفحة التصنيف العامة) */}
          <div className="bg-gradient-to-r from-brand-green to-brand-yellow rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center space-x-4 space-x-reverse mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {subcategory.name}
              </h1>
            </div>
            
            <p className="text-xl text-white/90 mb-2">
               {category.name} • {cityName}
            </p>
            {subcategory.description && (
              <p className="text-lg text-white/80 max-w-2xl">
                {subcategory.description}
              </p>
            )}
          </div>

          <div className="mt-12">
            <CitySubcategoryClientWrapper
              countrySlug={params.country}
              citySlug={params.city}
              categorySlug={params.category}
              subCategorySlug={params.subcategory}
              countryName={countryName}
              cityName={cityName}
              categoryName={category.name}
              subCategoryName={subcategory.name}
              searchParams={searchParams}
              companiesResult={companiesResult}
            />
          </div>
        </div>
      </>
    );

  } catch (error) {
    console.error('خطأ في تحميل صفحة الفئة الفرعية حسب المدينة:', error);
    
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          عذراً، حدث خطأ في تحميل الفئة الفرعية
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

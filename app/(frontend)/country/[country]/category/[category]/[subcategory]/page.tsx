export const dynamic = "force-dynamic";
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSubcategoryBySlug, getCompanies, getCategoryBySlug, getCountryByCode } from '@/lib/database/queries';
import { applySeoOverride } from '@/lib/seo/overrides';
import { CategoryHeader } from '@/components/category-header';
import { CompaniesGrid } from '@/components/companies-grid';
import { AdvancedSearchFilters } from '@/components/advanced-search-filters';
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
  params: { country: string; category: string; subcategory: string } 
}): Promise<Metadata> {
  try {
    const [subcategory, country] = await Promise.all([
      getSubcategoryBySlug(params.subcategory),
      getCountryByCode(params.country)
    ]);
    
    if (!subcategory) {
      return {
        title: 'الفئة الفرعية غير موجودة',
        description: 'هذه الفئة الفرعية غير متوفرة في دليل الشركات',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';
    const subcategoryUrl = `${baseUrl}/country/${params.country}/category/${params.category}/${params.subcategory}`;
    const countryName = country?.name || params.country.toUpperCase();

    const overridden = await applySeoOverride({
      title: `أفضل 10 ${subcategory.name} في ${countryName} | ${subcategory.category.name} | توصية`,
      description: `اكتشف أفضل ${subcategory.name} في ${countryName}.`,
    }, `/country/${params.country}/category/${params.category}/${params.subcategory}`, 
    { targetType: 'SUBCATEGORY', targetId: subcategory.id });

    return {
      ...overridden,
      
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
    console.error('خطأ في generateMetadata للفئة الفرعية:', error);
    return {
      title: 'خطأ في تحميل الفئة الفرعية',
    };
  }
}

interface SubcategoryPageProps {
  params: { country: string; category: string; subcategory: string }
  searchParams?: { 
    city?: string
    rating?: string
    verified?: string
    search?: string
    sort?: string
    page?: string
  }
}

export default async function SubcategoryPage({ params, searchParams = {} }: SubcategoryPageProps) {
  try {
    const [subcategory, category, country] = await Promise.all([
      getSubcategoryBySlug(params.subcategory),
      getCategoryBySlug(params.category, params.country),
      getCountryByCode(params.country)
    ]);

    if (!subcategory) {
      notFound();
    }
    
    if (!category) {
      notFound();
    }

    const filters = {
      country: params.country,
      category: params.category,
      subcategory: params.subcategory,
      city: searchParams?.city,
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
      ` ${subcategory.name}`,
      subcategory.description || `دليل شامل لشركات ${subcategory.name} في المنطقة`
    ) : null;
    const organizationSchema = generateOrganizationSchema(baseUrl);
    const websiteSchema = generateWebsiteSchema(baseUrl);
    
    const countryName = country?.name || params.country.toUpperCase();
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
          "item": `${baseUrl}/country/${params.country}`,
          "name": countryName
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": `${baseUrl}/country/${params.country}/category/${category.slug}`,
          "name": category.name
        },
        {
          "@type": "ListItem",
          "position": 4,
          "item": `${baseUrl}/country/${params.country}/category/${category.slug}/${subcategory.slug}`,
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

        {/* <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        /> */}

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
                  <Link href={`/country/${params.country}`}>{countryName}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/country/${params.country}/category/${category.slug}`}>{category.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{subcategory.name}</BreadcrumbPage>
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
                {subcategory.name} في {countryName}
              </h1>
            </div>
            
            <p className="text-xl text-white/90 mb-2">
              في {category.name}
            </p>
            {subcategory.description && (
              <p className="text-lg text-white/80 max-w-2xl">
                {subcategory.description}
              </p>
            )}
          </div>

          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                 {subcategory.name}
              </h2>
              <span className="text-gray-600 dark:text-gray-400">
                {companiesResult.pagination.total} مرتبط
              </span>
            </div>
            
            <AdvancedSearchFilters 
              showLocationFilter={true}
              showCategoryFilter={false}
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
                  لا توجد  في هذه الفئة الفرعية حالياً
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  يرجى المحاولة مرة أخرى لاحقاً أو تصفح فئات أخرى
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    );

  } catch (error) {
    console.error('خطأ في تحميل صفحة الفئة الفرعية:', error);
    
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
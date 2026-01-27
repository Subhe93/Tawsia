export const dynamic = "force-dynamic";
import { Metadata } from 'next';
import { applySeoOverride } from '@/lib/seo/overrides'
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSubcategoryBySlug, getCompanies, getCategoryBySlug, getAllCountries } from '@/lib/database/queries';
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
  params: { category: string; subcategory: string } 
}): Promise<Metadata> {
  try {
    const [subcategory, category] = await Promise.all([
      getSubcategoryBySlug(params.subcategory),
      getCategoryBySlug(params.category)
    ]);
    
    if (!subcategory || !category) {
      return {
        title: 'فئة فرعية غير موجودة',
      };
    }

    const overridden = await applySeoOverride({
      title: `${subcategory.name} | ${category.name} | توصية`,
      description: subcategory.description || `اكتشف أفضل ${subcategory.name} في ${category.name} في توصية`,
    }, `/category/${category.slug}/${subcategory.slug}`, { targetType: 'SUBCATEGORY', targetId: subcategory.id })

    return {
      title: overridden.title,
      description: overridden.description,
       keywords: overridden.keywords,
      openGraph: {
    title: overridden.title,
      description: overridden.description,    type: 'website',
      },
    };
  } catch (error) {
    console.error('خطأ في generateMetadata للفئة الفرعية العامة:', error);
    return {
      title: 'خطأ في تحميل الفئة الفرعية',
    };
  }
}

interface GlobalSubcategoryPageProps {
  params: { category: string; subcategory: string }
  searchParams?: { 
    country?: string
    city?: string
    rating?: string
    verified?: string
    search?: string
    sort?: string
    page?: string
  }
}

export default async function GlobalSubcategoryPage({ params, searchParams = {} }: GlobalSubcategoryPageProps) {
  try {
    const [subcategory, category] = await Promise.all([
      getSubcategoryBySlug(params.subcategory),
      getCategoryBySlug(params.category)
    ]);

    if (!subcategory || !category) {
      notFound();
    }

    const allCountries = await getAllCountries();

    // إعداد الفلاتر من searchParams
    const filters = {
      category: params.category,
      subcategory: params.subcategory,
      country: searchParams?.country,
      city: searchParams?.city,
      rating: searchParams?.rating ? parseFloat(searchParams.rating) : undefined,
      verified: searchParams?.verified === 'true' ? true : searchParams?.verified === 'false' ? false : undefined,
      query: searchParams?.search,
      sortBy: (searchParams?.sort as any) || 'rating',
      page: parseInt(searchParams?.page || '1'),
      limit: 20
    };

    const companiesResult = await getCompanies(filters);

    // Debug: Log the companies result
    console.log('Global Subcategory Page Debug:', {
      subcategoryName: subcategory.name,
      categoryName: category.name,
      filters,
      companiesCount: companiesResult?.data?.length || 0,
      totalCount: companiesResult?.pagination?.total || 0,
    });

    // Generate schemas for the subcategory page
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';
    const itemListSchema = companiesResult.data && companiesResult.data.length > 0 ? generateItemListSchema(
      companiesResult.data,
      baseUrl,
      `شركات ${subcategory.name}`,
      subcategory.description || `دليل شامل لشركات ${subcategory.name} في ${category.name} في توصية`
    ) : null;
    const organizationSchema = generateOrganizationSchema(baseUrl);
    const websiteSchema = generateWebsiteSchema(baseUrl);
    
    // Generate breadcrumb schema for global subcategory page
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "الرئيسية",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "جميع التصنيفات",
          "item": `${baseUrl}/services`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": category.name,
          "item": `${baseUrl}/category/${params.category}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": subcategory.name,
          "item": `${baseUrl}/category/${params.category}/${params.subcategory}`
        }
      ]
    };

    return (
      <>
        {/* JSON-LD Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
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
                  <Link href={`/category/${params.category}`}>{category.name}</Link>
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
                {subcategory.name}
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
          <AdvancedSearchFilters 
            filterOptions={{ countries: allCountries, categories: [], cities: [], subAreas: [], subCategories: [] }}
            initialValues={{
              country: searchParams?.country,
              city: searchParams?.city,
              rating: searchParams?.rating,
              verified: searchParams?.verified,
              q: searchParams?.search,
              sort: searchParams?.sort,
            }}
          />
          </div>

          <div className="mt-8">
            <CompaniesGrid 
              companies={companiesResult.data || []}
              pagination={companiesResult.pagination}
            />
          </div>
        </div>
      </>
    );
    
  } catch (error) {
    console.error('خطأ في تحميل صفحة الفئة الفرعية العامة:', error);
    
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          عذراً، حدث خطأ في تحميل الصفحة
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          يرجى المحاولة مرة أخرى أو إعادة تحميل الصفحة
        </p>
        <Link 
          href={`/category/${params.category}`}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          العودة إلى {params.category}
        </Link>
      </div>
    );
  }
}

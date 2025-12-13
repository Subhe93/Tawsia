// ISR: إعادة التحقق كل 4 ساعات
export const revalidate = 14400;
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, getCompanies, getSubcategories, getCountryByCode, getSubAreas } from '@/lib/database/queries';
import { applySeoOverride } from '@/lib/seo/overrides';
import { CategoryHeader } from '@/components/category-header';
import { CompaniesGrid } from '@/components/companies-grid';
import { AdvancedSearchFilters } from '@/components/advanced-search-filters';
import { SubcategoriesEnhanced } from '@/components/subcategories-enhanced';
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
  params: { country: string; category: string } 
}): Promise<Metadata> {
  try {
    const [category, country] = await Promise.all([
      getCategoryBySlug(params.category, params.country),
      getCountryByCode(params.country)
    ]);
    
    if (!category) {
      return {
        title: 'الفئة غير موجودة',
        description: 'هذه الفئة غير متوفرة في دليل الشركات',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://murabaat.com';
    const categoryUrl = `${baseUrl}/country/${params.country}/category/${params.category}`;
    const countryName = country?.name || params.country.toUpperCase();

    const overridden = await applySeoOverride({
      title: `أفضل 10 ${category.name} في ${countryName} | توصية`,
      description: `اكتشف أفضل ${category.name} في ${countryName}. متخصصة مع تقييمات العملاء.`,
    }, `/country/${params.country}/category/${params.category}`, 
    { targetType: 'CATEGORY', targetId: category.id });

    return {
      ...overridden,
      
      openGraph: {
       title: overridden.title,
        description: overridden.description,
        url: categoryUrl,
        // images: category.image ? [category.image] : [], 
      },

      alternates: {
        canonical: categoryUrl,
      }
    };
  } catch (error) {
    console.error('خطأ في generateMetadata للفئة:', error);
    return {
      title: 'خطأ في تحميل الفئة',
    };
  }
}

interface CategoryPageProps {
  params: { country: string; category: string }
  searchParams?: { 
    city?: string
    rating?: string
    verified?: string
    search?: string
    sort?: string
    page?: string
  }
}

export default async function CategoryPage({ params, searchParams = {} }: CategoryPageProps) {
  try {
    const [category, country] = await Promise.all([
      getCategoryBySlug(params.category , params.country),
      getCountryByCode(params.country)
    ]);

    if (!category) {
      notFound();
    }

    const subcategories = await getSubcategories(params.category);

    // إعداد الفلاتر من searchParams
    const filters = {
      country: params.country,
      category: params.category,
      city: searchParams?.city,
      rating: searchParams?.rating ? parseFloat(searchParams.rating) : undefined,
      verified: searchParams?.verified === 'true' ? true : searchParams?.verified === 'false' ? false : undefined,
      query: searchParams?.search,
      sortBy: (searchParams?.sort as any) || 'rating',
      page: parseInt(searchParams?.page || '1'),
      limit: 20
    };

    const [companiesResult, subAreas] = await Promise.all([
      getCompanies(filters),
      getSubAreas(undefined, params.country)
    ]);

    // Debug: Log the companies result
    console.log('Category Page Debug:', {
      categoryName: category.name,
      filters,
      companiesCount: companiesResult?.data?.length || 0,
      totalCount: companiesResult?.pagination?.total || 0,
      companiesResult
    });

    // Generate schemas for the category page
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://murabaat.com';
    const itemListSchema = companiesResult.data && companiesResult.data.length > 0 ? generateItemListSchema(
      companiesResult.data,
      baseUrl,
      `شركات ${category.name}`,
      category.description || `دليل شامل لشركات ${category.name} في المنطقة`
    ) : null;
    const organizationSchema = generateOrganizationSchema(baseUrl);
    const websiteSchema = generateWebsiteSchema(baseUrl);
    
    // Generate breadcrumb schema for category page
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

        {/* JSON-LD Schema للمنظمة */}
        {/* <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        /> */}

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
                  <Link href={`/country/${params.country}`}>{countryName}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{category.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <CategoryHeader category={category} /> {/* @ts-ignore */}

          <SubcategoriesEnhanced subcategories={subcategories} country={params.country} category={params.category} />
          
          {/* Sub Areas Section */}
          {/* {subAreas.length > 0 && (
            <div className="mt-12">
              <SubAreasGrid 
                subAreas={subAreas}
                cityName="جميع المدن"
                countryCode={params.country}
                citySlug="all"
              />
            </div>
          )} */}
          
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                 {category.name}
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
                  لا توجد شركات في هذه الفئة حالياً
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
    console.error('خطأ في تحميل صفحة الفئة:', error);
    
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
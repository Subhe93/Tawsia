// ISR: إعادة التحقق كل 4 ساعات
export const revalidate = 14400;
import { Metadata } from 'next';
import { applySeoOverride } from '@/lib/seo/overrides'
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, getCompanies, getSubcategories, getAllCountries } from '@/lib/database/queries';
import { CategoryHeader } from '@/components/category-header';
import { CategoryClientWrapper } from '@/components/category-client-wrapper';
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
  params: { category: string } 
}): Promise<Metadata> {
  try {
    const category = await getCategoryBySlug(params.category);
    
    if (!category) {
      return {
        title: 'فئة غير موجودة',
      };
    }

    const overridden = await applySeoOverride({
      title: `${category.name} | توصية`,
      description: category.description || `اكتشف أفضل ${category.name} في جميع الدول العربية`,
    }, `/category/${category.slug}`, { targetType: 'CATEGORY', targetId: category.id })

    return {
      title: overridden.title,
      description: overridden.description,
      keywords: overridden.keywords,
      openGraph: {
 title: overridden.title,
      description: overridden.description,
        type: 'website',
      },
    };
  } catch (error) {
    console.error('خطأ في generateMetadata للفئة العامة:', error);
    return {
      title: 'خطأ في تحميل الفئة',
    };
  }
}

interface GlobalCategoryPageProps {
  params: { category: string }
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

export default async function GlobalCategoryPage({ params, searchParams = {} }: GlobalCategoryPageProps) {
  try {
    const category = await getCategoryBySlug(params.category);

    if (!category) {
      notFound();
    }

    const [subcategories, allCountries] = await Promise.all([
      getSubcategories(params.category),
      getAllCountries()
    ]);

    // Only fetch data if country is already in search params
    // Otherwise, let the client auto-select and trigger the fetch
    const companiesResult = searchParams?.country ? await getCompanies({
      category: params.category,
      country: searchParams?.country,
      city: searchParams?.city,
      rating: searchParams?.rating ? parseFloat(searchParams.rating) : undefined,
      verified: searchParams?.verified === 'true' ? true : searchParams?.verified === 'false' ? false : undefined,
      query: searchParams?.search,
      sortBy: (searchParams?.sort as any) || 'rating',
      page: parseInt(searchParams?.page || '1'),
      limit: 20
    }) : { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };

    // Generate schemas for the category page
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';
    const itemListSchema = companiesResult.data && companiesResult.data.length > 0 ? generateItemListSchema(
      companiesResult.data,
      baseUrl,
      `شركات ${category.name}`,
      category.description || `دليل شامل لشركات ${category.name} في جميع الدول`
    ) : null;
    const organizationSchema = generateOrganizationSchema(baseUrl);
    const websiteSchema = generateWebsiteSchema(baseUrl);
    
    // Generate breadcrumb schema for global category page
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
                <BreadcrumbPage>{category.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <CategoryHeader category={category} />

          <CategoryClientWrapper
            allCountries={allCountries}
            subcategories={subcategories}
            categorySlug={params.category}
            categoryName={category.name}
            searchParams={searchParams}
            companiesResult={companiesResult}
          />
        </div>
      </>
    );
    
  } catch (error) {
    console.error('خطأ في تحميل صفحة الفئة العامة:', error);
    
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          عذراً، حدث خطأ في تحميل الصفحة
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          يرجى المحاولة مرة أخرى أو إعادة تحميل الصفحة
        </p>
        <Link 
          href="/services"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          العودة إلى الخدمات
        </Link>
      </div>
    );
  }
}

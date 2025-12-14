// ISR: إعادة التحقق كل 4 ساعات
export const revalidate = 14400;

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCompanyBySlug, getSimilarCompanies } from '@/lib/database/queries';
import { CompanyHeader } from '@/components/company-header';
import { CompanyGallery } from '@/components/company-gallery';
import { CompanyInfo } from '@/components/company-info';
import { CompanyReviews } from '@/components/company-reviews';
import { WorkingHoursDisplay } from '@/components/working-hours-display';

import { CompanyMap } from '@/components/company-map';
import { CompanyAwards } from '@/components/company-awards';
import { SimilarCompanies } from '@/components/similar-companies';
import { CompanySearch } from '@/components/company-search';
import type { CompanyWithRelations } from '@/lib/types/database';
import type { Company } from '@/lib/data';
import { 
  generateCompanySchema, 
  generateBreadcrumbSchema, 
  generateOrganizationSchema, 
  generateWebsiteSchema,
  generateItemListSchema
} from '@/lib/seo/schema-generator';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { CompanyCategoriesBadges } from '@/components/company-categories-badges';
import { applySeoOverride } from '@/lib/seo/overrides'

// Transform database company to component-expected format
function transformCompanyForComponents(company: CompanyWithRelations): Company {
  return {
    slug: company.slug,
    name: company.name,
    description: company.description || '',
    shortDescription: company.shortDescription || undefined,
    longDescription: company.longDescription || undefined,
    category: company.category.name,
    city: company.city.name,
    country: company.country.name,
    image: company.mainImage || '',
    logoImage: company.logoImage || undefined,
    images: company.images.map(img => img.imageUrl),
    phone: company.phone || '',
    email: company.email || '',
    website: company.website || '',
    address: company.address || '',
    tags: company.tags.map(tag => tag.tagName),
    rating: company.rating,
    reviewsCount: company.reviewsCount,
    location: {
      lat: company.latitude || 0,
      lng: company.longitude || 0
    },
    workingHours: {},
    socialMedia: company.socialMedia.reduce((acc, sm) => {
      acc[sm.platform] = sm.url;
      return acc;
    }, {} as Record<string, string>),
    services: company.services,
    specialties: company.specialties
  };
}

export async function generateMetadata(
  { params }: { params: { company: string } }
): Promise<Metadata> {
  try {
    const decodedSlug = decodeURIComponent(params.company);
    const company = await getCompanyBySlug(decodedSlug);
    
    if (!company) {
      return {
        title: 'الشركة غير موجودة',
        description: 'هذه الشركة غير متوفرة في دليل الشركات',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';
    const companyUrl = `${baseUrl}/${company.slug}`;

    const titleParts = [
      company.name,
      company.country.name,
      company.city.name
    ];
    
    if (company.subArea) {
      titleParts.push(company.subArea.name);
    }
    
    const title = `${titleParts.join('، ')} | توصية`;
    
    const overridden = await applySeoOverride({
      title: title,
      description: company.shortDescription || company.description || `${company.name} - شركة ${company.category.name} في ${company.city.name}، ${company.country.name}. تقييم ${company.rating}/5 من ${company.reviewsCount} مراجعة.`
    }, `/${company.slug}`, { targetType: 'COMPANY', targetId: company.id })

    return {
      title: overridden.title,
            // title: `${company.name} | ${company.category.name} في ${company.city.name}`,
      description: overridden.description,
      keywords: [
        company.name,
        company.category.name,
        company.city.name,
        company.country.name,
        ...company.services,
        'دليل الشركات'
      ].join(', '),
      
      openGraph: {
        title: `${company.name} - ${company.category.name}`,
        description: company.shortDescription || `${company.name} في ${company.city.name}، ${company.country.name}`,
        url: companyUrl,
        siteName: 'توصية - دليل الشركات',
        images: company.mainImage ? [
          {
            url: baseUrl + company.mainImage,   
            width: 1200,
            height: 630,
            alt: `صورة  ${company.name}`,
          }
        ] : [],
        locale: 'ar_SA',
        type: 'website',
      },

      twitter: {
        card: 'summary_large_image',
        title: `${company.name} - ${company.category.name}`,
        description: company.shortDescription || `${company.name} في ${company.city.name}`,
        images: company.mainImage ? [baseUrl + company.mainImage] : [],
      },

      alternates: {
        canonical: companyUrl,
      },

      other: {
        'business:contact_data:street_address': company.address || '',
        'business:contact_data:locality': company.city.name,
        'business:contact_data:region': company.country.name,
        'business:contact_data:phone_number': company.phone || '',
        'business:contact_data:website': company.website || '',
      }
    };
  } catch (error) {
    console.error('خطأ في generateMetadata للشركة:', error);
    
    // Handle URL decoding errors specifically
    const isUrlError = error instanceof URIError;
    
    return {
      title: isUrlError ? 'رابط الشركة غير صالح' : 'خطأ في تحميل الشركة',
      description: isUrlError 
        ? 'الرابط المطلوب يحتوي على أحرف غير صالحة'
        : 'حدث خطأ أثناء تحميل معلومات الشركة',
    };
  }
}

export default async function CompanyPage({ 
  params 
}: { 
  params: { company: string } 
}) {
  try {
    // Decode URL parameters to handle Arabic characters
    const decodedSlug = decodeURIComponent(params.company);
    
    const company = await getCompanyBySlug(decodedSlug);
    
    if (!company) {
      notFound();
    }

    // التحقق من حالة الشركة - إذا كانت غير نشطة، عرض رسالة التوقف
    if (!company.isActive) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8">
              <div className="text-yellow-600 dark:text-yellow-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                الصفحة متوقفة حالياً
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                عذراً، هذه الشركة متوقفة مؤقتاً عن العمل. يرجى المحاولة مرة أخرى لاحقاً أو التواصل معنا للمزيد من المعلومات.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href={`/country/${company.country.code}/city/${company.city.slug}`}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  تصفح شركات خدمات ومطاعم أخرى في {company.city.name}
                </Link>
                <Link 
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Get similar companies with proper parameters
    const similarCompanies = await getSimilarCompanies(company.slug, company.categoryId, company.cityId, 4);



    // Transform company for components
    const companyForComponents = transformCompanyForComponents(company);

    // Debug: Log rating information
    console.log('Company Rating Debug:', {
      companyName: company.name,
      rating: company.rating,
      reviewsCount: company.reviewsCount,
      actualReviews: company.reviews.length,
      approvedReviews: company.reviews.filter(r => r.isApproved).length
    });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';

    // Generate dynamic schemas based on company type
    const companySchema = generateCompanySchema(company, baseUrl);
    const breadcrumbSchema = generateBreadcrumbSchema(company, baseUrl);
    const organizationSchema = generateOrganizationSchema(baseUrl);
    const websiteSchema = generateWebsiteSchema(baseUrl);
    
    // Generate ItemList schema for similar companies if available
    const similarCompaniesSchema = similarCompanies.length > 0 ? generateItemListSchema(
      similarCompanies as unknown as CompanyWithRelations[],
      baseUrl,
      ` مشابهة لـ ${company.name}`,
      ` ${company.category.name} مشابهة في ${company.city.name}`
    ) : null;

    return (
      <>
        {/* JSON-LD Schema للشركة */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(companySchema),
          }}
        />
        
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

        {/* JSON-LD Schema للشركات المشابهة */}
        {/* {similarCompaniesSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(similarCompaniesSchema),
            }}
          />
        )} */}

        <div className="container mx-auto px-4 py-8">
          <Breadcrumb className="mb-6 text-sm">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">الرئيسية</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {/* <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/services">جميع التصنيفات</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator /> */}
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/country/${company.country.code}`}>{company.country.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/country/${company.country.code}/city/${company.city.slug}`}>{company.city.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
         
               {/* SubArea in breadcrumb */}
              {company.subArea && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={`/country/${company.country.code}/city/${company.city.slug}/sub-area/${company.subArea.slug}`}>
                        {company.subArea.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={(() => {
                    if (company.subArea) {
                      return `/country/${company.country.code}/city/${company.city.slug}/sub-area/${company.subArea.slug}/category/${company.category.slug}`;
                    } else {
                      return `/country/${company.country.code}/city/${company.city.slug}/category/${company.category.slug}`;
                    }
                  })()}>{company.category.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {/* Subcategory in breadcrumb */}
              {company.subCategory && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={(() => {
                        if (company.subArea) {
                          return `/country/${company.country.code}/city/${company.city.slug}/sub-area/${company.subArea.slug}/category/${company.category.slug}/${company.subCategory.slug}`;
                        } else {
                          return `/country/${company.country.code}/city/${company.city.slug}/category/${company.category.slug}/${company.subCategory.slug}`;
                        }
                      })()}>
                        {company.subCategory.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
             
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{company.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

     

          <CompanyHeader company={companyForComponents} />
          
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              {/* Awards Section */}
              {company.awards.length > 0 && (
                <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
                  <CompanyAwards 
                awards={company.awards.map(award => ({
                  ...award,
                  description: award.description || undefined,
                  year: award.year || undefined,
                  issuer: award.issuer || undefined,
                  imageUrl: award.imageUrl || undefined
                }))} 
                companyName={company.name} 
              />
                </div>
              )}
              
              {/* Services Section */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
                     {/* Category, Subcategory, and SubArea Section */}
          <div className="mb-6">
            <CompanyCategoriesBadges
              category={company.category}
              subCategory={company.subCategory}
              subArea={company.subArea}
              countryCode={company.country.code}
              citySlug={company.city.slug}
            />
          </div>
                <CompanyInfo company={companyForComponents} />
                
              </div>
              
              {/* Gallery Section */}
              {company.images.length > 0 && (
                <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
                  <CompanyGallery images={company.images.map(img => img.imageUrl)} />
                </div>
              )}
              
              {/* Reviews Section */}
              <div>
                <CompanyReviews 
                  companyId={company.id}
                  companyName={company.name}
                  overallRating={company.rating}
                  totalReviews={company.reviewsCount}
                  initialReviews={company.reviews as any}
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <WorkingHoursDisplay hours={company.workingHours || []} />
              
              {company.latitude && company.longitude && (
                <CompanyMap 
                  location={{
                    lat: company.latitude,
                    lng: company.longitude
                  }}
                />
              )}
              
              <CompanySearch
                currentCity={company.city.slug}
                currentCountry={company.country.code}
                currentCompanySlug={company.slug}
                cityName={company.city.name}
              />
              
              {similarCompanies.length > 0 && (
                <SimilarCompanies 
                  companies={similarCompanies}
                  currentCompanySlug={company.slug}
                />
              )}
            </div>
          </div>
        </div>
      </>
    );

  } catch (error) {
    console.error('خطأ في تحميل صفحة الشركة:', error);
    
    // Check if it's a URL decoding error (Arabic characters issue)
    const isUrlError = error instanceof URIError || (error as any)?.message?.includes('URI');
    
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {isUrlError ? 'خطأ في رابط الشركة' : 'عذراً، حدث خطأ في تحميل الشركة'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {isUrlError 
            ? 'الرابط يحتوي على أحرف غير صالحة. يرجى التأكد من صحة الرابط أو البحث عن الشركة.'
            : 'يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية'
          }
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة للرئيسية
          </Link>
          <Link 
            href="/search" 
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            البحث
          </Link>
        </div>
      </div>
    );
  }
}
import { Metadata } from 'next';
import { SearchClientWrapper } from '@/components/search-client-wrapper';
import { getCompanies } from '@/lib/database/queries';
import { prisma } from '@/lib/prisma';

export async function generateMetadata(): Promise<Metadata> {
  const { applySeoOverride } = await import('@/lib/seo/overrides');
  
  const overridden = await applySeoOverride({
    title: 'البحث المتقدم | توصية - دليل الشركات',
    description: 'ابحث عن الشركات والخدمات باستخدام الفلاتر المتقدمة. ابحث حسب الموقع، الفئة، التقييم، والمزيد.'
  }, '/search', { targetType: 'CUSTOM_PATH', targetId: '/search' });

  return {
    title: overridden.title,
    description: overridden.description,
    keywords: 'البحث عن شركات, فلاتر البحث, دليل الشركات, البحث المتقدم',
    openGraph: {
      title: overridden.title,
      description: overridden.description,
    }
  };
}

interface SearchPageProps {
  searchParams?: {
    q?: string
    country?: string
    city?: string
    subArea?: string
    category?: string
    subCategory?: string
    rating?: string
    verified?: string
    featured?: string
    hasWebsite?: string
    hasPhone?: string
    hasEmail?: string
    hasImages?: string
    hasWorkingHours?: string
    sort?: string
    page?: string
  }
}

async function getAllCountries() {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        flag: true,
      },
      orderBy: { name: 'asc' }
    });
    return countries;
  } catch (error) {
    console.error('خطأ في جلب الدول:', error);
    return [];
  }
}

async function SearchResults({ searchParams }: { searchParams: SearchPageProps['searchParams'] }) {
  const filters = {
    query: searchParams?.q,
    country: searchParams?.country,
    city: searchParams?.city,
    subArea: searchParams?.subArea,
    category: searchParams?.category,
    subCategory: searchParams?.subCategory,
    rating: searchParams?.rating ? parseFloat(searchParams.rating) : undefined,
    // Only set verified/featured filters when explicitly set to 'true'
    // When not set, leave as undefined to return ALL companies (verified + unverified, featured + unfeatured)
    verified: searchParams?.verified === 'true' ? true : undefined,
    featured: searchParams?.featured === 'true' ? true : undefined,
    // Additional optional filters
    hasWebsite: searchParams?.hasWebsite === 'true' ? true : undefined,
    hasPhone: searchParams?.hasPhone === 'true' ? true : undefined,
    hasEmail: searchParams?.hasEmail === 'true' ? true : undefined,
    hasImages: searchParams?.hasImages === 'true' ? true : undefined,
    hasWorkingHours: searchParams?.hasWorkingHours === 'true' ? true : undefined,
    sortBy: searchParams?.sort as 'name' | 'rating' | 'reviews' | 'newest' | 'oldest' | undefined,
    page: searchParams?.page ? parseInt(searchParams.page) : 1,
  };

  const companiesResult = await getCompanies(filters);

  return companiesResult;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const allCountries = await getAllCountries();
  
  // Only fetch data if country is already in search params
  // Otherwise, let the client auto-select and trigger the fetch
  const companiesResult = searchParams?.country 
    ? await SearchResults({ searchParams })
    : { data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } };

  return (
    <SearchClientWrapper
      allCountries={allCountries}
      initialSearchParams={searchParams}
      companiesResult={companiesResult}
    />
  );
}
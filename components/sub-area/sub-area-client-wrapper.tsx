'use client';

import { AdvancedSearchFilters } from '@/components/advanced-search-filters';
import { CompaniesGrid } from '@/components/companies-grid';

interface SubAreaClientWrapperProps {
  countrySlug: string;
  citySlug: string;
  subAreaSlug: string;
  countryName: string;
  cityName: string;
  subAreaName: string;
  searchParams?: any;
  companiesResult: any;
  categories?: any[];
}

export function SubAreaClientWrapper({
  countrySlug,
  citySlug,
  subAreaSlug,
  countryName,
  cityName,
  subAreaName,
  searchParams,
  companiesResult,
  categories = [],
}: SubAreaClientWrapperProps) {
  return (
    <>
      <AdvancedSearchFilters 
        showLocationFilter={false}
        showCategoryFilter={true}
        showRatingFilter={true}
        showPriceFilter={true}
        showHoursFilter={true}
        redirectToSearch={true}
        countrySlug={countrySlug}
        citySlug={citySlug}
        subAreaSlug={subAreaSlug}
        countryName={countryName}
        cityName={cityName}
        subAreaName={subAreaName}
        filterOptions={{
          countries: [],
          categories: categories.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            companiesCount: c._count?.companies || 0,
          })),
          cities: [],
          subAreas: [],
          subCategories: [],
        }}
        initialValues={{
          country: countrySlug,
          city: citySlug,
          subArea: subAreaSlug,
          category: searchParams?.category,
          rating: searchParams?.rating,
          verified: searchParams?.verified,
          q: searchParams?.search,
          sort: searchParams?.sort,
        }}
      />
      
      {companiesResult.data && companiesResult.data.length > 0 ? (
        <CompaniesGrid 
          companies={companiesResult.data} 
          pagination={companiesResult.pagination}
        />
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد شركات حالياً
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            يرجى المحاولة مرة أخرى لاحقاً أو تصفح مناطق أخرى
          </p>
        </div>
      )}
    </>
  );
}

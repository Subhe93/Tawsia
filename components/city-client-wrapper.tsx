'use client';

import { AdvancedSearchFilters } from '@/components/advanced-search-filters';
import { CompaniesGrid } from '@/components/companies-grid';

interface CityClientWrapperProps {
  countrySlug: string;
  citySlug: string;
  countryName: string;
  cityName: string;
  searchParams?: any;
  companiesResult: any;
  categories?: any[];
}

export function CityClientWrapper({
  countrySlug,
  citySlug,
  countryName,
  cityName,
  searchParams,
  companiesResult,
  categories = [],
}: CityClientWrapperProps) {
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
        countryName={countryName}
        cityName={cityName}
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
            يرجى المحاولة مرة أخرى لاحقاً أو تصفح مدن أخرى
          </p>
        </div>
      )}
    </>
  );
}

'use client';

import { AdvancedSearchFilters } from '@/components/advanced-search-filters';
import { CompaniesGrid } from '@/components/companies-grid';

interface CitySubcategoryClientWrapperProps {
  countrySlug: string;
  citySlug: string;
  categorySlug: string;
  subCategorySlug: string;
  countryName: string;
  cityName: string;
  categoryName: string;
  subCategoryName: string;
  searchParams?: any;
  companiesResult: any;
}

export function CitySubcategoryClientWrapper({
  countrySlug,
  citySlug,
  categorySlug,
  subCategorySlug,
  countryName,
  cityName,
  categoryName,
  subCategoryName,
  searchParams,
  companiesResult,
}: CitySubcategoryClientWrapperProps) {
  return (
    <>
      <AdvancedSearchFilters 
        showLocationFilter={false}
        showCategoryFilter={false}
        showRatingFilter={true}
        showPriceFilter={true}
        showHoursFilter={true}
        redirectToSearch={true}
        countrySlug={countrySlug}
        citySlug={citySlug}
        categorySlug={categorySlug}
        subCategorySlug={subCategorySlug}
        countryName={countryName}
        cityName={cityName}
        categoryName={categoryName}
        subCategoryName={subCategoryName}
        filterOptions={{
          countries: [],
          categories: [],
          cities: [],
          subAreas: [],
          subCategories: [],
        }}
        initialValues={{
          country: countrySlug,
          city: citySlug,
          category: categorySlug,
          subCategory: subCategorySlug,
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
            يرجى المحاولة مرة أخرى لاحقاً أو تصفح فئات أخرى
          </p>
        </div>
      )}
    </>
  );
}

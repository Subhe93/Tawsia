'use client';

import { AdvancedSearchFilters } from '@/components/advanced-search-filters';
import { CompaniesGrid } from '@/components/companies-grid';

interface SubAreaSubcategoryClientWrapperProps {
  countrySlug: string;
  citySlug: string;
  subAreaSlug: string;
  categorySlug: string;
  subCategorySlug: string;
  countryName: string;
  cityName: string;
  subAreaName: string;
  categoryName: string;
  subCategoryName: string;
  searchParams?: any;
  companiesResult: any;
}

export function SubAreaSubcategoryClientWrapper({
  countrySlug,
  citySlug,
  subAreaSlug,
  categorySlug,
  subCategorySlug,
  countryName,
  cityName,
  subAreaName,
  categoryName,
  subCategoryName,
  searchParams,
  companiesResult,
}: SubAreaSubcategoryClientWrapperProps) {
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
        subAreaSlug={subAreaSlug}
        categorySlug={categorySlug}
        subCategorySlug={subCategorySlug}
        countryName={countryName}
        cityName={cityName}
        subAreaName={subAreaName}
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
          subArea: subAreaSlug,
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

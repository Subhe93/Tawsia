'use client'

import { AdvancedSearchFilters } from '@/components/advanced-search-filters'
import { CompaniesGrid } from '@/components/companies-grid'

interface CityCategoryClientWrapperProps {
  companiesResult: any
  countrySlug: string
  countryName: string
  citySlug: string
  cityName: string
  categorySlug: string
  categoryName: string
}

export function CityCategoryClientWrapper({
  companiesResult,
  countrySlug,
  countryName,
  citySlug,
  cityName,
  categorySlug,
  categoryName
}: CityCategoryClientWrapperProps) {
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
        countryName={countryName}
        citySlug={citySlug}
        cityName={cityName}
        categorySlug={categorySlug}
        categoryName={categoryName}
      />
      
      {companiesResult.data && companiesResult.data.length > 0 ? (
        <CompaniesGrid 
          companies={companiesResult.data} 
          pagination={companiesResult.pagination}
        />
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد شركات في هذه الفئة في {cityName} حالياً
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            يرجى المحاولة مرة أخرى لاحقاً أو تصفح فئات أخرى
          </p>
        </div>
      )}
    </>
  )
}

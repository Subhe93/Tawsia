'use client'

import { AdvancedSearchFilters } from '@/components/advanced-search-filters'
import { CompaniesGrid } from '@/components/companies-grid'

interface CountryClientWrapperProps {
  companiesResult: any
  filterOptions: any
  countrySlug: string
  countryName: string
}

export function CountryClientWrapper({
  companiesResult,
  filterOptions,
  countrySlug,
  countryName
}: CountryClientWrapperProps) {
  return (
    <>
      <AdvancedSearchFilters   
        showLocationFilter={false}
        showCategoryFilter={true}
        showRatingFilter={true}
        showPriceFilter={true}
        showHoursFilter={true}
        filterOptions={filterOptions}
        redirectToSearch={true}
        countrySlug={countrySlug}
        countryName={countryName}
      />
      
      {companiesResult.companies && companiesResult.companies.length > 0 ? (
        <CompaniesGrid 
          companies={companiesResult.companies} 
          pagination={{
            page: companiesResult.page || 1,
            limit: 20,
            total: companiesResult.totalCount,
            totalPages: companiesResult.totalPages
          }}
        />
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد شركات في {countryName} حالياً
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            يرجى المحاولة مرة أخرى لاحقاً أو تصفح فئات أخرى
          </p>
        </div>
      )}
    </>
  )
}

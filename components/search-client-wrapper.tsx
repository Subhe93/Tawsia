'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useCountry } from '@/components/providers/country-provider';
import { AdvancedSearchFilters } from '@/components/advanced-search-filters';
import { CompaniesGrid } from '@/components/companies-grid';

interface Country {
  id: string;
  code: string;
  name: string;
  flag: string | null;
}

interface SearchClientWrapperProps {
  allCountries: Country[];
  initialSearchParams?: any;
  companiesResult: any;
}

export function SearchClientWrapper({
  allCountries,
  initialSearchParams,
  companiesResult: initialCompaniesResult,
}: SearchClientWrapperProps) {
  const router = useRouter();
  const { selectedCountry, setSelectedCountry } = useCountry();
  const [hasInitialized, setHasInitialized] = useState(false);

  // Auto-select first country in navbar if none selected
  useEffect(() => {
    if (!selectedCountry && allCountries.length > 0) {
      const firstCountry = {
        id: allCountries[0].id,
        code: allCountries[0].code,
        name: allCountries[0].name,
        flag: allCountries[0].flag || undefined,
      };
      setSelectedCountry(firstCountry);
    }
  }, [selectedCountry, allCountries, setSelectedCountry]);

  // Only update URL if no country in searchParams and we have a selected country (runs once)
  useEffect(() => {
    if (!hasInitialized && !initialSearchParams?.country && selectedCountry) {
      const newSearchParams = new URLSearchParams();
      newSearchParams.set('country', selectedCountry.code);
      
      // Keep other search params if they exist
      if (initialSearchParams?.q) newSearchParams.set('q', initialSearchParams.q);
      if (initialSearchParams?.city) newSearchParams.set('city', initialSearchParams.city);
      if (initialSearchParams?.category) newSearchParams.set('category', initialSearchParams.category);
      
      router.push(`/search?${newSearchParams.toString()}`);
      setHasInitialized(true);
    } else if (!hasInitialized && initialSearchParams?.country) {
      // Already has country in URL, just mark as initialized
      setHasInitialized(true);
    }
  }, [selectedCountry, initialSearchParams, router, hasInitialized]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          البحث المتقدم
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          استخدم الفلاتر المتقدمة للعثور على الشركات والخدمات المناسبة لك
        </p>
      </div>

      <AdvancedSearchFilters
        showLocationFilter={true}
        showCategoryFilter={true}
        showRatingFilter={true}
        showPriceFilter={true}
        showHoursFilter={true}
        initialValues={{
          ...initialSearchParams,
          country: initialSearchParams?.country || selectedCountry?.code,
        }}
      />

      <div className="mt-8">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              نتائج البحث
              {initialSearchParams?.q && (
                <span className="text-blue-600 dark:text-blue-400">
                  {' '}
                  عن &quot;{initialSearchParams.q}&quot;
                </span>
              )}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {initialCompaniesResult.pagination.total} شركة
            </p>
          </div>

          {initialCompaniesResult.pagination.total === 0 && initialSearchParams?.q && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mt-4">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                لم يتم العثور على نتائج
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                جرب استخدام كلمات مختلفة أو قم بتوسيع معايير البحث
              </p>
            </div>
          )}
        </div>

        <CompaniesGrid
          companies={initialCompaniesResult.data}
          pagination={initialCompaniesResult.pagination}
        />
      </div>
    </div>
  );
}

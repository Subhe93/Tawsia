'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCountry } from '@/components/providers/country-provider';
import { AdvancedSearchFilters } from '@/components/advanced-search-filters';
import { CompaniesGrid } from '@/components/companies-grid';
import { SubcategoriesEnhanced } from '@/components/subcategories-enhanced';
import { CountriesGrid } from '@/components/countries-grid';

interface Country {
  id: string;
  code: string;
  name: string;
  flag: string | null;
  image?: string | null;
  description?: string | null;
  companiesCount?: number;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  companiesCount?: number;
  _count?: {
    companies: number;
  };
}

interface CategoryClientWrapperProps {
  allCountries: Country[];
  subcategories: Subcategory[];
  categorySlug: string;
  searchParams?: any;
  companiesResult: any;
}

export function CategoryClientWrapper({
  allCountries,
  subcategories,
  categorySlug,
  searchParams,
  companiesResult,
}: CategoryClientWrapperProps) {
  const router = useRouter();
  const { selectedCountry, setSelectedCountry } = useCountry();

  // Auto-select country and sync with URL
  useEffect(() => {
    if (!selectedCountry && allCountries.length > 0) {
      // No country selected in context, select first one
      const firstCountry = {
        id: allCountries[0].id,
        code: allCountries[0].code,
        name: allCountries[0].name,
        flag: allCountries[0].flag || undefined,
      };
      setSelectedCountry(firstCountry);
    } else if (selectedCountry && !searchParams?.country) {
      // Country selected in context but not in URL, update URL
      const newSearchParams = new URLSearchParams();
      newSearchParams.set('country', selectedCountry.code);
      
      // Keep other search params if they exist
      if (searchParams?.city) newSearchParams.set('city', searchParams.city);
      if (searchParams?.rating) newSearchParams.set('rating', searchParams.rating);
      if (searchParams?.verified) newSearchParams.set('verified', searchParams.verified);
      if (searchParams?.search) newSearchParams.set('search', searchParams.search);
      if (searchParams?.sort) newSearchParams.set('sort', searchParams.sort);
      if (searchParams?.page) newSearchParams.set('page', searchParams.page);
      
      router.push(`/category/${categorySlug}?${newSearchParams.toString()}`);
    }
  }, [selectedCountry, allCountries, setSelectedCountry, searchParams, categorySlug, router]);

  // Update URL when selected country changes (from navbar)
  useEffect(() => {
    if (selectedCountry && searchParams?.country && selectedCountry.code !== searchParams.country) {
      const newSearchParams = new URLSearchParams();
      newSearchParams.set('country', selectedCountry.code);
      
      // Keep other search params if they exist
      if (searchParams?.city) newSearchParams.set('city', searchParams.city);
      if (searchParams?.rating) newSearchParams.set('rating', searchParams.rating);
      if (searchParams?.verified) newSearchParams.set('verified', searchParams.verified);
      if (searchParams?.search) newSearchParams.set('search', searchParams.search);
      if (searchParams?.sort) newSearchParams.set('sort', searchParams.sort);
      if (searchParams?.page) newSearchParams.set('page', searchParams.page);
      
      router.push(`/category/${categorySlug}?${newSearchParams.toString()}`);
    }
  }, [selectedCountry, searchParams, categorySlug, router]);

  return (
    <>
      <SubcategoriesEnhanced 
        subcategories={subcategories.map(sc => ({
          ...sc,
          _count: sc._count || { companies: sc.companiesCount || 0 }
        }))} 
        category={categorySlug} 
      />
      
      <div className="mt-12">
        <AdvancedSearchFilters 
          filterOptions={{ 
            countries: allCountries.map(c => ({
              id: c.id,
              code: c.code,
              name: c.name,
              companiesCount: c.companiesCount || 0,
            })), 
            categories: [], 
            cities: [], 
            subAreas: [], 
            subCategories: [] 
          }}
          initialValues={{
            country: searchParams?.country || selectedCountry?.code,
            city: searchParams?.city,
            rating: searchParams?.rating,
            verified: searchParams?.verified,
            q: searchParams?.search,
            sort: searchParams?.sort,
          }}
        />
      </div>

      <div className="mt-8">
        <CompaniesGrid 
          companies={companiesResult.data || []}
          pagination={companiesResult.pagination}
        />
      </div>

      {/* عرض الدول المتاحة لهذا التصنيف */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            متوفر في الدول التالية
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            اختر الدولة لعرض الشركات في هذا التصنيف
          </p>
        </div>
        <CountriesGrid 
          countries={allCountries.map(c => ({
            id: c.id,
            code: c.code,
            name: c.name,
            flag: c.flag,
            image: c.image || null,
            description: c.description || null,
            companiesCount: c.companiesCount || 0,
          }))} 
          categorySlug={categorySlug} 
        />
      </div>
    </>
  );
}

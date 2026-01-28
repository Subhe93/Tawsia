'use client';

import { useEffect, useState } from 'react';
import { useCountry } from '@/components/providers/country-provider';
import { HomeHero } from '@/components/home-hero';
import { FeaturedCompanies } from '@/components/featured-companies';
import { LatestReviews } from '@/components/latest-reviews';
import { CitiesGrid } from '@/components/cities-grid';

interface Country {
  id: string;
  code: string;
  name: string;
  flag: string | null;
  image: string | null;
  description: string | null;
  companiesCount: number;
}

interface City {
  id: string;
  slug: string;
  name: string;
  image?: string;
  companiesCount: number;
}

interface HomeClientWrapperProps {
  allCountries: Country[];
  initialCategories: any[];
  initialFeaturedCompanies: any[];
  initialLatestReviews: any[];
  initialCities: City[];
  initialStats: {
    countriesCount: number;
    companiesCount: number;
    categoriesCount: number;
    reviewsCount: number;
  };
}

export function HomeClientWrapper({
  allCountries,
  initialCategories,
  initialFeaturedCompanies,
  initialLatestReviews,
  initialCities,
  initialStats,
}: HomeClientWrapperProps) {
  const { selectedCountry, setSelectedCountry } = useCountry();
  
  // Track the initial country code to skip redundant fetch
  const [initialCountryCode] = useState(() => allCountries.length > 0 ? allCountries[0].code : null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // State for country-filtered data
  const [cities, setCities] = useState<City[]>(initialCities);
  const [featuredCompanies, setFeaturedCompanies] = useState(initialFeaturedCompanies);
  const [latestReviews, setLatestReviews] = useState(initialLatestReviews);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);

  // Auto-select first country if none selected
  useEffect(() => {
    if (!selectedCountry && allCountries.length > 0) {
      setSelectedCountry({
        id: allCountries[0].id,
        code: allCountries[0].code,
        name: allCountries[0].name,
        flag: allCountries[0].flag || undefined,
      });
    }
  }, [selectedCountry, allCountries, setSelectedCountry]);

  // Fetch data when country changes
  useEffect(() => {
    if (!selectedCountry) return;

    // Skip fetch on first load for initial country (we already have data from SSR)
    if (isFirstLoad && selectedCountry.code === initialCountryCode) {
      setIsFirstLoad(false);
      return;
    }
    setIsFirstLoad(false);

    const fetchCountryData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/home-data?country=${selectedCountry.code}`);
        if (response.ok) {
          const data = await response.json();
          setCities(data.cities || []);
          setFeaturedCompanies(data.featuredCompanies || []);
          setLatestReviews(data.latestReviews || []);
          setStats(data.stats || initialStats);
        }
      } catch (error) {
        console.error('Error fetching country data:', error);
        // Keep initial data on error
      } finally {
        setLoading(false);
      }
    };

    fetchCountryData();
  }, [selectedCountry, initialStats]);

  // Transform stats for HomeHero component
  const heroStats = {
    totalCountries: stats.countriesCount,
    totalCompanies: stats.companiesCount,
    totalCategories: stats.categoriesCount,
    totalReviews: stats.reviewsCount,
  };

  return (
    <div className="space-y-12">
      <HomeHero
        stats={heroStats}
        selectedCountry={selectedCountry?.code}
      />
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      ) : (
        <>
          {cities.length > 0 && selectedCountry && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  المدن في {selectedCountry.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  اختر مدينتك لاستكشاف أفضل الشركات
                </p>
              </div>
              <CitiesGrid cities={cities} countryCode={selectedCountry.code} />
            </div>
          )}
          <FeaturedCompanies companies={featuredCompanies} selectedCountry={selectedCountry?.code} />
          <LatestReviews reviews={latestReviews} />
        </>
      )}
      <br></br>
    </div>
  );
}

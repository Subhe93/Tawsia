'use client';

import { useEffect, useState } from 'react';
import { useCountry } from '@/components/providers/country-provider';
import { HomeHero } from '@/components/home-hero';
import { CountriesGrid } from '@/components/countries-grid';
import { FeaturedCompanies } from '@/components/featured-companies';
import { LatestReviews } from '@/components/latest-reviews';
import { ServicesCategories } from '@/components/services-categories';
import Link from 'next/link';

interface Country {
  id: string;
  code: string;
  name: string;
  flag: string | null;
  image: string | null;
  description: string | null;
  companiesCount: number;
}

interface HomeClientWrapperProps {
  allCountries: Country[];
  initialCategories: any[];
  initialFeaturedCompanies: any[];
  initialLatestReviews: any[];
  initialStats: {
    totalCountries: number;
    totalCompanies: number;
    totalCategories: number;
    totalReviews: number;
  };
}

export function HomeClientWrapper({
  allCountries,
  initialCategories,
  initialFeaturedCompanies,
  initialLatestReviews,
  initialStats,
}: HomeClientWrapperProps) {
  const { selectedCountry, setSelectedCountry } = useCountry();
  
  // State for country-filtered data
  const [categories, setCategories] = useState(initialCategories);
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

    const fetchCountryData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/home-data?country=${selectedCountry.code}`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
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

  return (
    <div className="space-y-12">
      <HomeHero
        stats={stats}
        selectedCountry={selectedCountry?.code}
      />
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      ) : (
        <>
          <ServicesCategories
            categories={categories}
            selectedCountryCode={selectedCountry?.code}
          />
          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-flex items-center px-8 py-4 bg-brand-orange hover:bg-orange-600 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 animate-fade-in-up delay-1200"
            >
              عرض جميع الخدمات
            </Link>
          </div>
          <CountriesGrid countries={allCountries} />
          <FeaturedCompanies companies={featuredCompanies} />
          <LatestReviews reviews={latestReviews} />
        </>
      )}
      <br></br>
    </div>
  );
}

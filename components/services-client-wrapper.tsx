'use client';

import { useEffect, useState } from 'react';
import { useCountry } from '@/components/providers/country-provider';
import { ServicesCategories } from '@/components/services-categories';
import { Grid3X3 } from 'lucide-react';

interface Country {
  id: string;
  code: string;
  name: string;
  flag: string | null;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  description: string | null;
  companiesCount: number;
}

interface ServicesClientWrapperProps {
  initialCategories: Category[];
  allCountries: Country[];
}

export function ServicesClientWrapper({ 
  initialCategories, 
  allCountries 
}: ServicesClientWrapperProps) {
  const { selectedCountry, setSelectedCountry } = useCountry();
  const [categories, setCategories] = useState(initialCategories);
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

  // Fetch categories when country changes
  useEffect(() => {
    if (!selectedCountry) return;

    const fetchCategoriesByCountry = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/categories?country=${selectedCountry.code}`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesByCountry();
  }, [selectedCountry]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-yellow rounded-2xl p-8 text-white mb-12">
        <div className="flex items-center space-x-4 space-x-reverse mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Grid3X3 className="h-6 w-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">جميع الخدمات والمهن</h1>
        </div>
        
        <p className="text-xl text-white/90 max-w-2xl">
          {selectedCountry 
            ? `اكتشف جميع الخدمات والمهن المتاحة في ${selectedCountry.name}`
            : 'اكتشف جميع الخدمات والمهن المتاحة في منطقتك'}
        </p>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      ) : (
        <ServicesCategories 
          categories={categories} 
          selectedCountryCode={selectedCountry?.code}
        />
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Building2, MapPin, Globe, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCountry } from '@/components/providers/country-provider';
import Link from 'next/link';
import Image from 'next/image';

interface SearchResult {
  companies: {
    id: string;
    name: string;
    slug: string;
    logoImage: string | null;
    rating: number;
    country: { code: string; name: string } | null;
    city: { slug: string; name: string } | null;
    category: { slug: string; name: string } | null;
  }[];
  countries: {
    id: string;
    code: string;
    name: string;
    flag: string | null;
    _count: { companies: number };
  }[];
  cities: {
    id: string;
    slug: string;
    name: string;
    country: { code: string; name: string } | null;
    _count: { companies: number };
  }[];
  categories: {
    id: string;
    slug: string;
    name: string;
    icon: string | null;
    _count: { companies: number };
  }[];
}

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({
    companies: [],
    countries: [],
    cities: [],
    categories: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const { selectedCountry } = useCountry();

  const searchItems = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults({ companies: [], countries: [], cities: [], categories: [] });
      return;
    }

    setIsLoading(true);
    
    try {
      let url = `/api/search/quick?q=${encodeURIComponent(searchQuery.trim())}`;
      if (selectedCountry?.code) {
        url += `&country=${encodeURIComponent(selectedCountry.code)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults({ companies: [], countries: [], cities: [], categories: [] });
    } finally {
      setIsLoading(false);
    }
  }, [selectedCountry]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchItems(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchItems]);

  const handleClose = () => {
    setQuery('');
    setResults({ companies: [], countries: [], cities: [], categories: [] });
    onClose();
  };

  const hasResults = results.companies.length > 0 || 
                     results.countries.length > 0 || 
                     results.cities.length > 0 || 
                     results.categories.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>البحث في توصية</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن شركة، دولة، مدينة، أو تصنيف..."
            className="w-full pr-12 pl-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="mr-2 text-gray-600 dark:text-gray-400">جاري البحث...</span>
          </div>
        )}

        <div className="max-h-96 overflow-y-auto space-y-4">
          {/* Countries */}
          {results.countries.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                الدول
              </h3>
              <div className="space-y-2">
                {results.countries.map((country) => (
                  <Link
                    key={country.code}
                    href={`/country/${country.code}`}
                    onClick={handleClose}
                    className="flex items-center space-x-3 space-x-reverse p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <span className="text-2xl">{country.flag || '🌍'}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{country.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{country._count.companies} شركة</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Cities */}
          {results.cities.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                المدن
              </h3>
              <div className="space-y-2">
                {results.cities.map((city) => (
                  <Link
                    key={city.id}
                    href={`/country/${city.country?.code || 'sy'}/city/${city.slug}`}
                    onClick={handleClose}
                    className="flex items-center space-x-3 space-x-reverse p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{city.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {city.country?.name} • {city._count.companies} شركة
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {results.categories.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                التصنيفات
              </h3>
              <div className="space-y-2">
                {results.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    onClick={handleClose}
                    className="flex items-center space-x-3 space-x-reverse p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Tag className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{category.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{category._count.companies} شركة</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Companies */}
          {results.companies.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                الشركات
              </h3>
              <div className="space-y-2">
                {results.companies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/${company.slug}`}
                    onClick={handleClose}
                    className="flex items-center space-x-3 space-x-reverse p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {company.logoImage ? (
                        <Image src={company.logoImage} alt={company.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {company.category?.name} • {company.city?.name}
                        {company.rating > 0 && ` • ⭐ ${company.rating.toFixed(1)}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {query && query.length >= 2 && !isLoading && !hasResults && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">لم يتم العثور على نتائج</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">جرب كلمات مفتاحية مختلفة</p>
            </div>
          )}

          {query && query.length < 2 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">أدخل حرفين على الأقل للبحث</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
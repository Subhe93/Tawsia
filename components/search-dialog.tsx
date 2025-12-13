'use client';

import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { companies, countries, cities } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    companies: typeof companies;
    countries: typeof countries;
    cities: typeof cities;
  }>({
    companies: [],
    countries: [],
    cities: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchItems = async () => {
      if (!query.trim()) {
        setResults({ companies: [], countries: [], cities: [] });
        return;
      }

      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      const searchTerm = query.toLowerCase();
      
      const filteredCompanies = companies.filter(
        company =>
          company.name.toLowerCase().includes(searchTerm) ||
          company.description.toLowerCase().includes(searchTerm) ||
          company.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );

      const filteredCountries = countries.filter(
        country => country.name.toLowerCase().includes(searchTerm)
      );

      const filteredCities = cities.filter(
        city => city.name.toLowerCase().includes(searchTerm)
      );

      setResults({
        companies: filteredCompanies.slice(0, 5),
        countries: filteredCountries,
        cities: filteredCities.slice(0, 3),
      });
      
      setIsLoading(false);
    };

    searchItems();
  }, [query]);

  const handleClose = () => {
    setQuery('');
    setResults({ companies: [], countries: [], cities: [] });
    onClose();
  };

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
            placeholder="ابحث عن شركة، دولة، أو مدينة..."
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
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">الدول</h3>
              <div className="space-y-2">
                {results.countries.map((country) => (
                  <Link
                    key={country.code}
                    href={`/country/${country.code}`}
                    onClick={handleClose}
                    className="flex items-center space-x-3 space-x-reverse p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{country.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{country.companiesCount} شركة</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Cities */}
          {results.cities.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">المدن</h3>
              <div className="space-y-2">
                {results.cities.map((city) => (
                  <Link
                    key={`${city.country}-${city.slug}`}
                    href={`/country/${city.country}/city/${city.slug}`}
                    onClick={handleClose}
                    className="flex items-center space-x-3 space-x-reverse p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 relative rounded-lg overflow-hidden">
                      <Image src={city.image} alt={city.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{city.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{city.companiesCount} شركة</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Companies */}
          {results.companies.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">الشركات</h3>
              <div className="space-y-2">
                {results.companies.map((company) => (
                  <Link
                    key={company.slug}
                    href={`/country/${company.country}/city/${company.city}/company/${company.slug}`}
                    onClick={handleClose}
                    className="flex items-center space-x-3 space-x-reverse p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 relative rounded-lg overflow-hidden">
                      <Image src={company.image} alt={company.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{company.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {query && !isLoading && results.companies.length === 0 && results.countries.length === 0 && results.cities.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">لم يتم العثور على نتائج</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">جرب كلمات مفتاحية مختلفة</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
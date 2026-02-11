'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Building2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface CompanySearchResult {
  slug: string;
  name: string;
  description: string;
  category: string; // category slug
  city: string; // city slug
  country: string; // country code
  image: string;
  rating: number;
  reviewsCount: number;
  tags: string[];
}

interface CompanySearchProps {
  currentCity: string; // city slug for API/links
  currentCountry: string; // country code for API/links
  currentCompanySlug: string;
  cityName: string; // Arabic display name
}

export function CompanySearch({ currentCity, currentCountry, currentCompanySlug, cityName }: CompanySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([
    { value: '', label: 'جميع الفئات' },
  ]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Debounced query to avoid spamming API
  const debouncedQuery = useMemo(() => searchQuery, [searchQuery]);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams();
        params.set('country', currentCountry);
        params.set('city', currentCity);
        params.set('limit', '12');
        if (debouncedQuery.trim()) params.set('query', debouncedQuery.trim());
        if (selectedCategory) params.set('category', selectedCategory);

        const res = await fetch(`/api/companies?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error('فشل جلب الشركات');
        const data = await res.json();

        const companies = (data?.data || []) as Array<any>;
        const mapped: CompanySearchResult[] = companies
          .filter((c) => c.slug !== currentCompanySlug)
          .map((c) => ({
            slug: c.slug,
            name: c.name,
            description: c.shortDescription || c.description || '',
            category: c.category?.slug || '',
            city: c.city?.slug || '',
            country: c.country?.code || '',
            image: c.mainImage || c.images?.[0]?.imageUrl || '/img/default-company-cover.svg',
            rating: typeof c.rating === 'number' ? c.rating : 0,
            reviewsCount: typeof c.reviewsCount === 'number' ? c.reviewsCount : (c._count?.reviews || 0),
            tags: Array.isArray(c.tags) ? c.tags.map((t: any) => t.tagName || String(t)) : [],
          }));

        if (!isCancelled) setResults(mapped);
      } catch (e: any) {
        if (!isCancelled && e.name !== 'AbortError') setError(e.message || 'حدث خطأ غير متوقع');
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }, 300);

    return () => {
      isCancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [currentCity, currentCountry, currentCompanySlug, debouncedQuery, selectedCategory]);

  // Load categories dynamically
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();
    const load = async () => {
      try {
        setCategoriesLoading(true);
        const res = await fetch('/api/categories?activeOnly=true', { signal: controller.signal });
        if (!res.ok) throw new Error('فشل جلب الفئات');
        const data = await res.json();
        const cats: Array<{ slug: string; name: string }> = data?.categories || [];
        if (!isCancelled) {
          setCategories([
            { value: '', label: 'جميع الفئات' },
            ...cats.map((c) => ({ value: c.slug, label: c.name })),
          ]);
        }
      } catch (e) {
        // ignore errors silently in UI, keep default option
      } finally {
        if (!isCancelled) setCategoriesLoading(false);
      }
    };
    load();
    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, []);

  // categories state used instead of static list

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center space-x-3 space-x-reverse mb-6">
        <Search className="h-6 w-6 text-blue-600" />
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          البحث في شركات {cityName}
        </p>
      </div>

      {/* Search Form */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن شركة أو خدمة..."
              className="w-full pr-10 pl-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Building2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              className="w-full pr-10 pl-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="h-4 w-4" />
          <span>عرض النتائج من {cityName} فقط</span>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        {isLoading && (
          <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">جاري البحث...</div>
        )}
        {error && (
          <div className="text-center py-6 text-sm text-red-600">{error}</div>
        )}
        {!isLoading && !error && (results.length === 0 ? (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || selectedCategory 
                ? `لا توجد نتائج للبحث "${searchQuery}" في ${cityName}`
                : `لا توجد شركات أخرى في ${cityName} حالياً`
              }
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                تم العثور على {results.length} شركة في {cityName}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.slice(0, 6).map((company) => (
                <Link
                  key={company.slug}
                  href={`/${company.slug}`}
                  className="group block"
                >
                  <div className="flex items-center space-x-4 space-x-reverse p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300">
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={company.image}
                        alt={company.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {company.name}
                        </h3>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {company.rating}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-1">
                        {company.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {company.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {results.length > 6 && (
              <div className="text-center mt-4">
                <Link href={`/country/${currentCountry}/city/${currentCity}`}>
                  <Button variant="outline" className="px-6">
                    عرض المزيد من الشركات في {cityName}
                  </Button>
                </Link>
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
}



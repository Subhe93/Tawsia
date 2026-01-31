'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, MapPin, Building2, Star, Calendar, DollarSign, Clock, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useFilterData } from '@/hooks/use-filter-data';

interface FilterOptions {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    companiesCount: number;
  }>;
  cities: Array<{
    id: string;
    name: string;
    slug: string;
    country?: { code: string };
    companiesCount: number;
  }>;
  countries: Array<{
    id: string;
    code: string;
    name: string;
    companiesCount: number;
  }>;
  subAreas?: Array<{
    id: string;
    name: string;
    slug: string;
    cityId?: string;
    companiesCount: number;
  }>;
  subCategories?: Array<{
    id: string;
    name: string;
    slug: string;
    categoryId?: string;
    companiesCount: number;
  }>;
}

interface AdvancedSearchFiltersProps {
  onFiltersChange?: (filters: any) => void;
  showLocationFilter?: boolean;
  showCategoryFilter?: boolean;
  showRatingFilter?: boolean;
  showPriceFilter?: boolean;
  showHoursFilter?: boolean;
  filterOptions?: FilterOptions;
  initialValues?: {
    q?: string;
    country?: string;
    city?: string;
    subArea?: string;
    category?: string;
    subCategory?: string;
    rating?: string;
    verified?: string;
    featured?: string;
    hasWebsite?: string;
    hasPhone?: string;
    hasEmail?: string;
    hasImages?: string;
    hasWorkingHours?: string;
    sort?: string;
    page?: string;
  };
}

export function AdvancedSearchFilters({
  onFiltersChange,
  showLocationFilter = true,
  showCategoryFilter = true,
  showRatingFilter = true,
  showPriceFilter = true,
  showHoursFilter = true,
  filterOptions,
  initialValues,
}: AdvancedSearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // استخدام hook لجلب البيانات النشطة (فقط إذا لم يتم تمرير filterOptions)
  const filterDataHook = useFilterData();
  const { 
    categories: hookCategories, 
    countries: hookCountries, 
    cities: hookCities, 
    subAreas: hookSubAreas,
    subCategories: hookSubCategories,
    loading: hookLoading, 
    error: hookError, 
    fetchCitiesByCountry 
  } = filterDataHook;
  
  // استخدام البيانات من props إذا كانت متوفرة، وإلا استخدام البيانات من الـ hook
  const categories = filterOptions?.categories || hookCategories;
  const countries = filterOptions?.countries || hookCountries;
  const cities = filterOptions?.cities || hookCities;
  const subAreas = filterOptions?.subAreas || hookSubAreas;
  const subCategories = filterOptions?.subCategories || hookSubCategories;
  const loading = filterOptions ? false : hookLoading;
  const error = filterOptions ? null : hookError;
  
  const [searchQuery, setSearchQuery] = useState(initialValues?.q || '');
  const [selectedCountry, setSelectedCountry] = useState(initialValues?.country || '');
  const [selectedCity, setSelectedCity] = useState(initialValues?.city || '');
  const [selectedSubArea, setSelectedSubArea] = useState(initialValues?.subArea || '');
  const [selectedCategory, setSelectedCategory] = useState(initialValues?.category || '');
  const [selectedSubCategory, setSelectedSubCategory] = useState(initialValues?.subCategory || '');
  const [selectedRating, setSelectedRating] = useState<number | null>(
    initialValues?.rating ? parseFloat(initialValues.rating) : null
  );
  const [isVerified, setIsVerified] = useState(initialValues?.verified === 'true');
  const [isFeatured, setIsFeatured] = useState(initialValues?.featured === 'true');
  const [hasWebsite, setHasWebsite] = useState(initialValues?.hasWebsite === 'true');
  const [hasPhone, setHasPhone] = useState(initialValues?.hasPhone === 'true');
  const [hasEmail, setHasEmail] = useState(initialValues?.hasEmail === 'true');
  const [hasImages, setHasImages] = useState(initialValues?.hasImages === 'true');
  const [hasWorkingHours, setHasWorkingHours] = useState(initialValues?.hasWorkingHours === 'true');
  const [sortBy, setSortBy] = useState(initialValues?.sort || 'rating');
  const [openNow, setOpenNow] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // جلب المدن عند تغيير البلد المحدد (فقط إذا لم يتم تمرير filterOptions)
  useEffect(() => {
    if (!filterOptions) {
      if (selectedCountry) {
        fetchCitiesByCountry(selectedCountry);
      }
    }
  }, [selectedCountry, fetchCitiesByCountry, filterOptions]);

  // إعادة تعيين المدينة والمنطقة الفرعية عند تغيير البلد
  useEffect(() => {
    if (!initialValues?.city || initialValues.country !== selectedCountry) {
      setSelectedCity('');
      setSelectedSubArea('');
    }
  }, [selectedCountry]);

  // تطبيق الفلاتر
  const applyFilters = () => {
    const filters: any = {};
    
    if (searchQuery) filters.q = searchQuery;
    if (selectedCountry) filters.country = selectedCountry;
    if (selectedCity) filters.city = selectedCity;
    if (selectedSubArea) filters.subArea = selectedSubArea;
    if (selectedCategory) filters.category = selectedCategory;
    if (selectedSubCategory) filters.subCategory = selectedSubCategory;
    if (selectedRating) filters.rating = selectedRating;
    if (isVerified) filters.verified = true;
    if (isFeatured) filters.featured = true;
    if (hasWebsite) filters.hasWebsite = true;
    if (hasPhone) filters.hasPhone = true;
    if (hasEmail) filters.hasEmail = true;
    if (hasImages) filters.hasImages = true;
    if (hasWorkingHours) filters.hasWorkingHours = true;
    if (sortBy) filters.sort = sortBy;
    
    if (onFiltersChange) {
      // استخدام callback function (لصفحة ranking)
      onFiltersChange(filters);
    } else {
      // استخدام router.push لتحديث URL (لصفحة البحث)
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, String(value));
      });
      router.push(`/search?${params.toString()}`);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    // Keep the selected country - don't clear it
    // setSelectedCountry('');
    setSelectedCity('');
    setSelectedSubArea('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedRating(null);
    setIsVerified(false);
    setIsFeatured(false);
    setHasWebsite(false);
    setHasPhone(false);
    setHasEmail(false);
    setHasImages(false);
    setHasWorkingHours(false);
    setSortBy('rating');
    setOpenNow(false);
    
    if (onFiltersChange) {
      onFiltersChange({ country: selectedCountry });
    } else {
      // Keep country in URL when clearing other filters
      if (selectedCountry) {
        router.push(`/search?country=${selectedCountry}`);
      } else {
        router.push('/search');
      }
    }
  };

  // تطبيق الفلاتر عند التحميل الأولي
  useEffect(() => {
    if (onFiltersChange) {
      applyFilters();
    }
  }, []); // فقط عند التحميل الأول

  // تطبيق الفلاتر عند تغيير البحث فقط (للبحث الفوري)
  useEffect(() => {
    if (searchQuery) {
      const timer = setTimeout(() => {
        applyFilters();
      }, 500); // debounce
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // الحصول على القوائم المفلترة
  const allCities = cities || [];
  const filteredCities = selectedCountry
    ? allCities.filter(city => city.country?.code === selectedCountry)
    : allCities;

  const allSubAreas = subAreas || [];
  const filteredSubAreas = selectedCity
    ? allSubAreas.filter(subArea => {
        const cityData = allCities.find(c => c.slug === selectedCity);
        return cityData && subArea.cityId === cityData.id;
      })
    : allSubAreas;

  const allSubCategories = subCategories || [];
  const filteredSubCategories = selectedCategory
    ? allSubCategories.filter(subCat => {
        const categoryData = (categories || []).find(c => c.slug === selectedCategory);
        return categoryData && subCat.categoryId === categoryData.id;
      })
    : allSubCategories;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="mr-2 text-gray-600">جاري تحميل البيانات...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث عن شركة، خدمة، أو كلمة مفتاحية..."
          className="w-full pr-12 pl-4 py-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              applyFilters();
            }
          }}
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          variant={isExpanded ? "default" : "outline"}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center"
        >
          <Filter className="h-4 w-4 ml-2" />
          فلاتر متقدمة
        </Button>
        
        {/* {showHoursFilter && (
          <Button
            variant={openNow ? "default" : "outline"}
            size="sm"
            onClick={() => setOpenNow(!openNow)}
            className="flex items-center"
          >
            <Clock className="h-4 w-4 ml-2" />
            مفتوح الآن
          </Button>
        )} */}

        {selectedRating && (
          <Badge variant="secondary" className="flex items-center">
            <Star className="h-3 w-3 ml-1" />
            {selectedRating} نجوم فأكثر
            <X 
              className="h-3 w-3 mr-1 cursor-pointer" 
              onClick={() => setSelectedRating(null)}
            />
          </Badge>
        )}

        {selectedCategory && (
          <Badge variant="secondary" className="flex items-center">
            <Building2 className="h-3 w-3 ml-1" />
            {(categories || []).find(c => c.slug === selectedCategory)?.name || 'فئة'}
            <X 
              className="h-3 w-3 mr-1 cursor-pointer" 
              onClick={() => setSelectedCategory('')}
            />
          </Badge>
        )}

        {selectedCountry && (
          <Badge variant="secondary" className="flex items-center">
            <MapPin className="h-3 w-3 ml-1" />
            {(countries || []).find(c => c.code === selectedCountry)?.name || 'دولة'}
            <X 
              className="h-3 w-3 mr-1 cursor-pointer" 
              onClick={() => setSelectedCountry('')}
            />
          </Badge>
        )}

        {selectedCity && (
          <Badge variant="secondary" className="flex items-center">
            <MapPin className="h-3 w-3 ml-1" />
            {(cities || []).find(c => c.slug === selectedCity)?.name || 'مدينة'}
            <X 
              className="h-3 w-3 mr-1 cursor-pointer" 
              onClick={() => setSelectedCity('')}
            />
          </Badge>
        )}

        {selectedSubArea && (
          <Badge variant="secondary" className="flex items-center">
            <MapPin className="h-3 w-3 ml-1" />
            {allSubAreas.find(s => s.slug === selectedSubArea)?.name || 'منطقة'}
            <X 
              className="h-3 w-3 mr-1 cursor-pointer" 
              onClick={() => setSelectedSubArea('')}
            />
          </Badge>
        )}

        {selectedSubCategory && (
          <Badge variant="secondary" className="flex items-center">
            <Building2 className="h-3 w-3 ml-1" />
            {allSubCategories.find(s => s.slug === selectedSubCategory)?.name || 'فئة فرعية'}
            <X 
              className="h-3 w-3 mr-1 cursor-pointer" 
              onClick={() => setSelectedSubCategory('')}
            />
          </Badge>
        )}

        {isVerified && (
          <Badge variant="secondary" className="flex items-center">
            موثق فقط
            <X 
              className="h-3 w-3 mr-1 cursor-pointer" 
              onClick={() => setIsVerified(false)}
            />
          </Badge>
        )}

        {isFeatured && (
          <Badge variant="secondary" className="flex items-center">
            مميزة فقط
            <X 
              className="h-3 w-3 mr-1 cursor-pointer" 
              onClick={() => setIsFeatured(false)}
            />
          </Badge>
        )}

        {hasWebsite && (
          <Badge variant="secondary" className="flex items-center">
            لديها موقع إلكتروني
            <X 
              className="h-3 w-3 mr-1 cursor-pointer" 
              onClick={() => setHasWebsite(false)}
            />
          </Badge>
        )}

        {hasPhone && (
          <Badge variant="secondary" className="flex items-center">
            لديها رقم هاتف
            <X 
              className="h-3 w-3 mr-1 cursor-pointer" 
              onClick={() => setHasPhone(false)}
            />
          </Badge>
        )}

        {hasEmail && (
          <Badge variant="secondary" className="flex items-center">
            لديها بريد إلكتروني
            <X 
              className="h-3 w-3 mr-1 cursor-pointer" 
              onClick={() => setHasEmail(false)}
            />
          </Badge>
        )}

        {hasImages && (
          <Badge variant="secondary" className="flex items-center">
            لديها صور
            <X 
              className="h-3 w-3 mr-1 cursor-pointer" 
              onClick={() => setHasImages(false)}
            />
          </Badge>
        )}

        {hasWorkingHours && (
          <Badge variant="secondary" className="flex items-center">
            لديها ساعات عمل
            <X 
              className="h-3 w-3 mr-1 cursor-pointer" 
              onClick={() => setHasWorkingHours(false)}
            />
          </Badge>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Location Filters */}
            {showLocationFilter && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <MapPin className="h-4 w-4 ml-2" />
                  الموقع
                </h4>
                <div className="space-y-3">
                  <select
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setSelectedCity('');
                    }}
                    disabled={loading}
                  >
                    <option value="">جميع الدول</option>
                    {(countries || []).map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSelectedSubArea(''); // إعادة تعيين المنطقة الفرعية عند تغيير المدينة
                    }}
                    disabled={(filterOptions ? false : !selectedCountry) || loading}
                  >
                    <option value="">جميع المدن</option>
                    {filteredCities.map((city) => (
                      <option key={city.slug} value={city.slug}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Sub Areas */}
                  {allSubAreas.length > 0 && (
                    <select
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-3"
                      value={selectedSubArea}
                      onChange={(e) => setSelectedSubArea(e.target.value)}
                      disabled={(filterOptions ? !selectedCity : !selectedCity) || loading}
                    >
                      <option value="">جميع المناطق الفرعية</option>
                      {filteredSubAreas.map((subArea) => (
                        <option key={subArea.slug} value={subArea.slug}>
                          {subArea.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* Category Filters */}
            {showCategoryFilter && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Building2 className="h-4 w-4 ml-2" />
                  الفئات
                </h4>
                <select
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubCategory(''); // إعادة تعيين الفئة الفرعية عند تغيير الفئة
                  }}
                  disabled={loading}
                >
                  <option value="">جميع الفئات</option>
                  {(categories || []).map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                
                {/* Sub Categories */}
                {allSubCategories.length > 0 && (
                  <select
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-3"
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    disabled={!selectedCategory || loading}
                  >
                    <option value="">جميع الفئات الفرعية</option>
                    {filteredSubCategories.map((subCategory) => (
                      <option key={subCategory.slug} value={subCategory.slug}>
                        {subCategory.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Rating Filter */}
            {showRatingFilter && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Star className="h-4 w-4 ml-2" />
                  التقييم
                </h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`rating-${rating}`}
                        checked={selectedRating === rating}
                        onCheckedChange={(checked) => 
                          setSelectedRating(checked ? rating : null)
                        }
                      />
                      <label
                        htmlFor={`rating-${rating}`}
                        className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex items-center"
                      >
                        <div className="flex items-center ml-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < rating
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        فأكثر
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Filters */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Filter className="h-4 w-4 ml-2" />
                فلاتر إضافية
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="verified"
                    checked={isVerified}
                    onCheckedChange={(checked) => setIsVerified(!!checked)}
                  />
                  <label
                    htmlFor="verified"
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    شركات موثقة فقط ✓
                  </label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="featured"
                    checked={isFeatured}
                    onCheckedChange={(checked) => setIsFeatured(!!checked)}
                  />
                  <label
                    htmlFor="featured"
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    شركات مميزة ⭐
                  </label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="hasWebsite"
                    checked={hasWebsite}
                    onCheckedChange={(checked) => setHasWebsite(!!checked)}
                  />
                  <label
                    htmlFor="hasWebsite"
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    لديها موقع إلكتروني 🌐
                  </label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="hasPhone"
                    checked={hasPhone}
                    onCheckedChange={(checked) => setHasPhone(!!checked)}
                  />
                  <label
                    htmlFor="hasPhone"
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    لديها رقم هاتف 📞
                  </label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="hasEmail"
                    checked={hasEmail}
                    onCheckedChange={(checked) => setHasEmail(!!checked)}
                  />
                  <label
                    htmlFor="hasEmail"
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    لديها بريد إلكتروني 📧
                  </label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="hasImages"
                    checked={hasImages}
                    onCheckedChange={(checked) => setHasImages(!!checked)}
                  />
                  <label
                    htmlFor="hasImages"
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    لديها صور 📷
                  </label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="hasWorkingHours"
                    checked={hasWorkingHours}
                    onCheckedChange={(checked) => setHasWorkingHours(!!checked)}
                  />
                  <label
                    htmlFor="hasWorkingHours"
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    لديها ساعات عمل 🕐
                  </label>
                </div>
                
                <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                  <label className="text-sm text-gray-700 dark:text-gray-300 block mb-2 font-medium">
                    ترتيب النتائج:
                  </label>
                  <select
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="rating">الأعلى تقييماً</option>
                    <option value="name">الاسم (أ-ي)</option>
                    <option value="newest">الأحدث</option>
                    <option value="reviews">الأكثر مراجعة</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
            <Button variant="outline" onClick={clearFilters}>
              مسح الفلاتر
            </Button>
            <Button 
              onClick={() => {
                applyFilters();
                setIsExpanded(false);
              }}
              className="bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white"
            >
              تطبيق الفلاتر
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
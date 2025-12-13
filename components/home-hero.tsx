'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, X, Tag } from 'lucide-react';
import { AnimatedLogo } from '@/components/animated-logo';
import { FloatingShapes } from '@/components/floating-shapes';
import { AnimatedStats } from '@/components/animated-stats';
import { SearchAnimation } from '@/components/search-animation';
import { countries, categories } from '@/lib/data';

interface Stats {
  totalCountries: number;
  totalCompanies: number;
  totalCategories: number;
  totalReviews: number;
}

interface HomeHeroProps {
  stats?: Stats;
}

export function HomeHero({ stats }: HomeHeroProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // إغلاق القوائم المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    // إنشاء معاملات البحث
    const searchParams = new URLSearchParams();
    
    if (searchQuery.trim()) {
      searchParams.set('q', searchQuery.trim());
    }
    
    if (selectedCountry) {
      searchParams.set('country', selectedCountry);
    }
    
    if (selectedCategory) {
      searchParams.set('category', selectedCategory);
    }
    
    // توجيه المستخدم إلى صفحة البحث
    const url = selectedCountry && !searchQuery.trim()
      ? `/${selectedCountry}${selectedCategory ? `/category/${selectedCategory}` : ''}`
      : `/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    router.push(url);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedCountry('');
    setSelectedCategory('');
    setCountrySearch('');
    setCategorySearch('');
    setShowCountryDropdown(false);
    setShowCategoryDropdown(false);
  };

  const handlePopularSearch = (term: string) => {
    setSearchQuery(term);
    // يمكن تنفيذ البحث مباشرة أو انتظار المستخدم ليضغط بحث
    // handleSearch(); // إلغاء التعليق لتنفيذ البحث مباشرة
  };

  // كلمات البحث الشائع
  const popularSearches = [
    'تطوير المواقع',
    'تطبيقات الهاتف', 
    'التسويق الرقمي',
    'الطب العام',
    'المطاعم',
    'التعليم',
    'تصميم جرافيك',
    'محاسبة',
    'استشارات قانونية',
    'عقارات'
  ];

  return (
    <section className="relative bg-gradient-to-br from-brand-green via-brand-yellow to-brand-orange text-white py-20 overflow-hidden">
      {/* خلفية متحركة بـ SVG */}
      <FloatingShapes />
      
      <div className="container mx-auto px-4 text-center">
        {/* لوغو متحرك بـ SVG */}
        <AnimatedLogo />
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up delay-300">
          توصية
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto animate-fade-in-up delay-500">
          اكتشف أفضل الشركات والخدمات في جميع أنحاء العالم العربي. ابحث، اعثر، واتصل بسهولة.
        </p>
        
        <div className="max-w-2xl mx-auto animate-fade-in-up delay-700">
          <div className="space-y-4">
            {/* حقل البحث الرئيسي مع الأزرار */}
            <div className="relative bg-white rounded-2xl p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-2xl">
              {/* رسوم متحركة خلف البحث */}
              <SearchAnimation />
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="ابحث عن شركة، خدمة، أو مدينة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full text-black px-6 py-4 text-gray-800 bg-transparent outline-none text-lg focus:placeholder-gray-400 transition-colors"
                />
              </div>
              
              <div className="flex gap-2">
                {/* زر البحث الأساسي */}
                <Button 
                  onClick={handleSearch}
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl transform hover:scale-105 transition-all duration-200 hover:shadow-lg flex-1 sm:flex-none"
                >
                  <Search className="h-5 w-5 ml-2" />
                  بحث
                </Button>
                
                {/* زر البحث المتقدم */}
                <Button
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  variant="outline"
                  size="lg"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 px-4 sm:px-6 py-4 rounded-xl transform hover:scale-105 transition-all duration-200 hover:shadow-lg flex-1 sm:flex-none"
                >
                  <Search className="h-4 w-4 ml-2 hidden sm:block" />
                  <span className="hidden sm:inline">متقدم</span>
                  <span className="sm:hidden">⚙️</span>
                  <ChevronDown className={`h-4 w-4 mr-2 transition-transform duration-200 ${showAdvancedSearch ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>

            {/* كلمات البحث الشائع */}
            {!showAdvancedSearch && (
            <div className="text-center">
              <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center justify-center">
                  <Tag className="h-5 w-5 ml-2" />
                  البحث الشائع
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {popularSearches.map((term, index) => (
                    <button
                      key={term}
                      onClick={() => handlePopularSearch(term)}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-white/30 animate-fade-in-up opacity-0"
                      style={{
                        animationDelay: `${1000 + index * 100}ms`
                      }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            )}  
            {/* قائمة البحث المتقدم */}
            {showAdvancedSearch && (
              <div className="bg-white rounded-2xl p-6 shadow-2xl animate-fade-in-up z-10 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* اختيار الدولة */}
                  <div className="relative" ref={countryDropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر الدولة
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowCountryDropdown(!showCountryDropdown);
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-right border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-blue-500 focus:outline-none focus:border-blue-500 flex items-center justify-between"
                      >
                        <span>
                          {selectedCountry 
                            ? countries.find(c => c.code === selectedCountry)?.name || 'جميع الدول'
                            : 'جميع الدول'
                          }
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showCountryDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showCountryDropdown && (
                        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                          <div className="p-2">
                            <input
                              type="text"
                              placeholder="ابحث عن دولة..."
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              className="w-full text-black  px-3 py-2 border border-gray-200 rounded text-right focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="max-h-40 overflow-y-auto">
                            <button
                              onClick={() => {
                                setSelectedCountry('');
                                setShowCountryDropdown(false);
                                setCountrySearch('');
                              }}
                              className="w-full px-4 py-2 text-right hover:bg-gray-50 text-gray-700 border-b border-gray-100"
                            >
                              جميع الدول
                            </button>
                            {filteredCountries.map((country) => (
                              <button
                                key={country.code}
                                onClick={() => {
                                  setSelectedCountry(country.code);
                                  setShowCountryDropdown(false);
                                  setCountrySearch('');
                                }}
                                className="w-full px-4 py-2 text-right hover:bg-gray-50 text-gray-700 border-b border-gray-100 flex items-center"
                              >
                                <span className="ml-2">{country.flag}</span>
                                {country.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* اختيار التصنيف */}
                  <div className="relative" ref={categoryDropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر التصنيف
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowCategoryDropdown(!showCategoryDropdown);
                          setShowCountryDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-right border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-blue-500 focus:outline-none focus:border-blue-500 flex items-center justify-between"
                      >
                        <span>
                          {selectedCategory 
                            ? categories.find(c => c.slug === selectedCategory)?.name || 'جميع التصنيفات'
                            : 'جميع التصنيفات'
                          }
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showCategoryDropdown && (
                        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                          <div className="p-2">
                            <input
                              type="text"
                              placeholder="ابحث عن تصنيف..."
                              value={categorySearch}
                              onChange={(e) => setCategorySearch(e.target.value)}
                              className="w-full text-black  px-3 py-2 border border-gray-200 rounded text-right focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="max-h-40 overflow-y-auto">
                            <button
                              onClick={() => {
                                setSelectedCategory('');
                                setShowCategoryDropdown(false);
                                setCategorySearch('');
                              }}
                              className="w-full px-4 py-2 text-right hover:bg-gray-50 text-gray-700 border-b border-gray-100"
                            >
                              جميع التصنيفات
                            </button>
                            {filteredCategories.map((category) => (
                              <button
                                key={category.slug}
                                onClick={() => {
                                  setSelectedCategory(category.slug);
                                  setShowCategoryDropdown(false);
                                  setCategorySearch('');
                                }}
                                className="w-full px-4 py-2 text-right hover:bg-gray-50 text-gray-700 border-b border-gray-100"
                              >
                                {category.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* أزرار العمل */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={handleSearch}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"
                  >
                    <Search className="h-4 w-4 ml-2" />
                    بحث
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    className="px-8 py-3 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 ml-2" />
                    مسح
                  </Button>
                </div>
              </div>
            )}
          </div>
             {/* إحصائيات متحركة */}
        <AnimatedStats stats={stats} />
        </div>

     
      </div>
    </section>
  );
}
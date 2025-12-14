'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Search, Menu, X, Moon, Sun, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchDialog } from '@/components/search-dialog';
import { NotificationBell } from '@/components/notifications/notification-bell';

interface Category {
  id: string;
  slug: string;
  name: string;
  subCategories?: SubCategory[];
}

interface SubCategory {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
}

interface Country {
  id: string;
  code: string;
  name: string;
  cities?: City[];
}

interface City {
  id: string;
  slug: string;
  name: string;
  countryCode: string;
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedCountries, setExpandedCountries] = useState<string[]>([]);
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleCountry = (countryId: string) => {
    setExpandedCountries(prev => 
      prev.includes(countryId) 
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    );
  };

  // جلب التصنيفات والدول
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, countriesRes] = await Promise.all([
          fetch('/api/categories?activeOnly=true'),
          fetch('/api/countries?activeOnly=true'),
        ]);

        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          const categoriesWithSubs = catData.categories || catData.data || [];
          
          // جلب الفئات الفرعية لكل فئة
          const categoriesWithSubCategories = await Promise.all(
            categoriesWithSubs.map(async (cat: Category) => {
              try {
                const subCatRes = await fetch(`/api/sub-categories?categoryId=${cat.id}&activeOnly=true`);
                if (subCatRes.ok) {
                  const subCatData = await subCatRes.json();
                  return {
                    ...cat,
                    subCategories: subCatData.subCategories || subCatData.data || []
                  };
                }
              } catch (error) {
                console.error('خطأ في جلب الفئات الفرعية:', error);
              }
              return cat;
            })
          );
          
          setCategories(categoriesWithSubCategories);
        }

        if (countriesRes.ok) {
          const countryData = await countriesRes.json();
          const countriesList = countryData.countries || countryData.data || [];
          
          // جلب المدن لكل دولة
          const countriesWithCities = await Promise.all(
            countriesList.map(async (country: Country) => {
              try {
                const citiesRes = await fetch(`/api/cities?countryCode=${country.code}&activeOnly=true`);
                if (citiesRes.ok) {
                  const citiesData = await citiesRes.json();
                  return {
                    ...country,
                    cities: citiesData.cities || citiesData.data || []
                  };
                }
              } catch (error) {
                console.error('خطأ في جلب المدن:', error);
              }
              return country;
            })
          );
          
          setCountries(countriesWithCities);
        }
      } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 space-x-reverse">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                {/* <span className="text-white font-bold text-sm">دش</span> */}
                <img src="/img/twsia-logo.png" alt="Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">توصية</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6 space-x-reverse">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                الرئيسية
              </Link>
              <Link href="/services" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
               التصنيفات
              </Link>
              <Link href="/search" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                البحث المتقدم
              </Link>
              
              {/* قائمة التصنيفات المخصصة */}
              <div className="relative group">
                <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
                  التصنيفات
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {/* Mega Menu للتصنيفات */}
                <div className="absolute top-full right-0 mt-2 w-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 max-h-[500px] overflow-y-auto">
                    <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <Link 
                        href="/services"
                        className="text-lg font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        جميع التصنيفات
                      </Link>
                    </div>
                    {categories.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">جاري التحميل...</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map((category) => (
                          <div key={category.id} className="border-b border-gray-100 dark:border-gray-700 pb-2">
                            <div className="flex items-center justify-between">
                              <Link 
                                href={`/category/${category.slug}`}
                                className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1"
                              >
                                {category.name}
                              </Link>
                              {category.subCategories && category.subCategories.length > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleCategory(category.id);
                                  }}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                >
                                  <ChevronDown 
                                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                                      expandedCategories.includes(category.id) ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>
                              )}
                            </div>
                            {category.subCategories && category.subCategories.length > 0 && (
                              <div 
                                className={`overflow-hidden transition-all duration-200 ${
                                  expandedCategories.includes(category.id) 
                                    ? 'max-h-[500px] opacity-100 mt-2' 
                                    : 'max-h-0 opacity-0'
                                }`}
                              >
                                <ul className="space-y-1 pr-3">
                                  {category.subCategories.slice(0, 5).map((subCat) => (
                                    <li key={subCat.id}>
                                      <Link 
                                        href={`/category/${category.slug}/${subCat.slug}`}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block py-1"
                                      >
                                        • {subCat.name}
                                      </Link>
                                    </li>
                                  ))}
                                  {category.subCategories.length > 5 && (
                                    <li>
                                      <Link 
                                        href={`/category/${category.slug}`}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline py-1 block"
                                      >
                                        +{category.subCategories.length - 5} المزيد
                                      </Link>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* قائمة الدول المخصصة */}
              <div className="relative group">
                <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
                  الدول
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {/* Mega Menu للدول */}
                <div className="absolute top-full right-0 mt-2 w-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 max-h-[500px] overflow-y-auto">
                    {countries.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">جاري التحميل...</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {countries.map((country) => (
                          <div key={country.id} className="border-b border-gray-100 dark:border-gray-700 pb-2">
                            <div className="flex items-center justify-between">
                              <Link 
                                href={`/country/${country.code}`}
                                className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1"
                              >
                                {country.name}
                              </Link>
                              {country.cities && country.cities.length > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleCountry(country.id);
                                  }}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                >
                                  <ChevronDown 
                                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                                      expandedCountries.includes(country.id) ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>
                              )}
                            </div>
                            {country.cities && country.cities.length > 0 && (
                              <div 
                                className={`overflow-hidden transition-all duration-200 ${
                                  expandedCountries.includes(country.id) 
                                    ? 'max-h-[500px] opacity-100 mt-2' 
                                    : 'max-h-0 opacity-0'
                                }`}
                              >
                                <ul className="space-y-1 pr-3">
                                  {country.cities.slice(0, 6).map((city) => (
                                    <li key={city.id}>
                                      <Link 
                                        href={`/country/${country.code}/city/${city.slug}`}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block py-1"
                                      >
                                        • {city.name}
                                      </Link>
                                    </li>
                                  ))}
                                  {country.cities.length > 6 && (
                                    <li>
                                      <Link 
                                        href={`/country/${country.code}`}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline py-1 block"
                                      >
                                        +{country.cities.length - 6} المزيد
                                      </Link>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
              
              {/* إشعارات للشركات */}
              {session?.user?.role === 'COMPANY_OWNER' && (
                <NotificationBell />
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* قائمة المستخدم */}
              {status === 'loading' ? (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-6 md:w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="w-6 md:w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user.image || undefined} />
                        <AvatarFallback>
                          {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{session.user.name}</p>
                        <p className="text-xs text-gray-500">{session.user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {(session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN') && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Settings className="h-4 w-4 ml-2" />
                          لوحة تحكم المدير
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {session.user.role === 'COMPANY_OWNER' && (
                      <DropdownMenuItem asChild>
                        <Link href="/company-dashboard">
                          <Settings className="h-4 w-4 ml-2" />
                          لوحة تحكم الشركة
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {/* <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="h-4 w-4 ml-2" />
                        الملف الشخصي
                      </Link>
                    </DropdownMenuItem> */}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="h-4 w-4 ml-2" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center space-x-2 space-x-reverse">
                  <Button variant="ghost" asChild>
                    <Link href="/auth/signin">
                      تسجيل الدخول
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/add-company">
                      إضافة شركة
                    </Link>
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <div className="space-y-3">
                <Link 
                  href="/" 
                  className="block text-gray-700 dark:text-gray-300 hover:text-brand-green dark:hover:text-brand-green"
                  onClick={() => setIsMenuOpen(false)}
                >
                  الرئيسية
                </Link>
                <Link 
                  href="/services" 
                  className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  جميع التصنيفات
                </Link>
                <Link 
                  href="/search" 
                  className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  البحث المتقدم
                </Link>
                
                {/* قائمة التصنيفات للموبايل */}
                <div className="space-y-2">
                  <div className="font-semibold text-gray-900 dark:text-white">التصنيفات</div>
                  <Link 
                    href="/services"
                    className="block text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium pr-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    جميع التصنيفات
                  </Link>
                  {categories.length === 0 ? (
                    <div className="text-sm text-gray-500 pr-4">جاري التحميل...</div>
                  ) : (
                    categories.map((category) => (
                      <div key={category.id} className="pr-4">
                        <Link 
                          href={`/category/${category.slug}`}
                          className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                        {category.subCategories && category.subCategories.length > 0 && (
                          <div className="pr-4 mt-1 space-y-1">
                            {category.subCategories.map((subCat) => (
                              <Link 
                                key={subCat.id}
                                href={`/category/${category.slug}/${subCat.slug}`}
                                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                • {subCat.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* قائمة الدول للموبايل */}
                <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="font-semibold text-gray-900 dark:text-white">الدول</div>
                  {countries.length === 0 ? (
                    <div className="text-sm text-gray-500 pr-4">جاري التحميل...</div>
                  ) : (
                    countries.map((country) => (
                      <div key={country.id} className="pr-4">
                        <Link 
                          href={`/country/${country.code}`}
                          className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {country.name}
                        </Link>
                        {country.cities && country.cities.length > 0 && (
                          <div className="pr-4 mt-1 space-y-1">
                            {country.cities.map((city) => (
                              <Link 
                                key={city.id}
                                href={`/country/${country.code}/city/${city.slug}`}
                                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                • {city.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {!session && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link 
                      href="/auth/signin"
                      className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-3"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      تسجيل الدخول
                    </Link>
                    <Link 
                      href="/add-company"
                      className="block text-white bg-brand-green hover:bg-brand-green/90 px-4 py-2 rounded-md text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      إضافة شركة
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
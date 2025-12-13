'use client';

import { useFilterData } from '@/hooks/use-filter-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, ExternalLink, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function ActiveLocationsList() {
  const { countries, cities, loading, error, fetchCitiesByCountry } = useFilterData();
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [countryCities, setCountryCities] = useState<Record<string, any[]>>({});

  const activeCountries = countries.filter(country => country.companiesCount > 0);

  const toggleCountryExpansion = async (countryCode: string) => {
    if (expandedCountry === countryCode) {
      setExpandedCountry(null);
    } else {
      setExpandedCountry(countryCode);
      
      // جلب مدن البلد إذا لم تكن محملة مسبقاً
      if (!countryCities[countryCode]) {
        try {
          const cities = await fetchCitiesByCountry(countryCode);
          setCountryCities(prev => ({
            ...prev,
            [countryCode]: cities
          }));
        } catch (error) {
          console.error('خطأ في جلب مدن البلد:', error);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري تحميل المواقع...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          البلدان والمدن النشطة
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          اكتشف الشركات حسب الموقع الجغرافي
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeCountries.map((country) => (
          <Card key={country.code} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 ml-2 text-green-600" />
                  <span className="text-lg">{country.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {country.companiesCount} شركة
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCountryExpansion(country.code)}
                    className="p-1"
                  >
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform ${
                        expandedCountry === country.code ? 'rotate-180' : ''
                      }`} 
                    />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* مدن البلد */}
              {expandedCountry === country.code && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    المدن المتاحة:
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {countryCities[country.code]?.map((city) => (
                                             <Link 
                         key={city.slug} 
                         href={`/search?country=${country.code}&city=${city.slug}`}
                         className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                       >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {city.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {city.companiesCount} شركة
                          </Badge>
                          <ExternalLink className="h-3 w-3 text-gray-400" />
                        </div>
                      </Link>
                    )) || (
                      <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                        جاري تحميل المدن...
                      </div>
                    )}
                  </div>
                </div>
              )}
              
                             <Link href={`/search?country=${country.code}`}>
                 <Button className="w-full mt-4" variant="outline">
                   <ExternalLink className="h-4 w-4 ml-2" />
                   استكشاف البلد
                 </Button>
               </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeCountries.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد بلدان نشطة حالياً
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            سيتم إضافة البلدان النشطة هنا عند تسجيل الشركات
          </p>
        </div>
      )}
    </div>
  );
}

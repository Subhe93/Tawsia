'use client';

import { useFilterData } from '@/hooks/use-filter-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Loader2 } from 'lucide-react';

export function ActiveFiltersSummary() {
  const { categories, countries, cities, loading, error } = useFilterData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري تحميل البيانات النشطة...</span>
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

  const activeCategories = categories.filter(cat => cat.companiesCount > 0);
  const activeCountries = countries.filter(country => country.companiesCount > 0);
  const totalCities = cities.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* الفئات النشطة */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Building2 className="h-5 w-5 ml-2 text-blue-600" />
            الفئات النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeCategories.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              فئة نشطة مع شركات مسجلة
            </p>
            <div className="flex flex-wrap gap-1 mt-3">
              {activeCategories.slice(0, 3).map((category) => (
                <Badge key={category.slug} variant="secondary" className="text-xs">
                  {category.name}
                </Badge>
              ))}
              {activeCategories.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{activeCategories.length - 3} أكثر
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* البلدان النشطة */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <MapPin className="h-5 w-5 ml-2 text-green-600" />
            البلدان النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeCountries.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              بلد نشط مع شركات مسجلة
            </p>
            <div className="flex flex-wrap gap-1 mt-3">
              {activeCountries.slice(0, 3).map((country) => (
                <Badge key={country.code} variant="secondary" className="text-xs">
                  {country.name}
                </Badge>
              ))}
              {activeCountries.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{activeCountries.length - 3} أكثر
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات عامة */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <MapPin className="h-5 w-5 ml-2 text-purple-600" />
            المدن المتاحة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalCities}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              مدينة متاحة للبحث
            </p>
            <div className="mt-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                إجمالي الشركات: {activeCountries.reduce((sum, country) => sum + country.companiesCount, 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

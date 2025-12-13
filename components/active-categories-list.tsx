'use client';

import { useFilterData } from '@/hooks/use-filter-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function ActiveCategoriesList() {
  const { categories, loading, error } = useFilterData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري تحميل الفئات...</span>
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          الفئات النشطة
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          اكتشف الشركات حسب الفئات المتاحة
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCategories.map((category) => (
          <Card key={category.slug} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 ml-2 text-blue-600" />
                  <span className="text-lg">{category.name}</span>
                </div>
                <Badge variant="secondary">
                  {category.companiesCount} شركة
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {category.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {category.description}
                </p>
              )}
                             <Link href={`/search?category=${category.slug}`}>
                 <Button className="w-full" variant="outline">
                   <ExternalLink className="h-4 w-4 ml-2" />
                   استكشاف الفئة
                 </Button>
               </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeCategories.length === 0 && (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد فئات نشطة حالياً
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            سيتم إضافة الفئات النشطة هنا عند تسجيل الشركات
          </p>
        </div>
      )}
    </div>
  );
}

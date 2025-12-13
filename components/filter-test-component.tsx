'use client';

import { useState, useEffect } from 'react';
import { AdvancedSearchFilters } from '@/components/advanced-search-filters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function FilterTestComponent() {
  const [currentFilters, setCurrentFilters] = useState<any>({});
  const [urlParams, setUrlParams] = useState<string>('');

  useEffect(() => {
    // مراقبة تغييرات URL
    const updateUrlInfo = () => {
      const url = window.location.href;
      const params = new URLSearchParams(window.location.search);
      const filters: any = {};
      
      params.forEach((value, key) => {
        filters[key] = value;
      });
      
      setCurrentFilters(filters);
      setUrlParams(window.location.search);
    };

    // تحديث المعلومات عند تحميل الصفحة
    updateUrlInfo();

    // مراقبة تغييرات التاريخ
    const handlePopState = () => {
      updateUrlInfo();
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleFiltersChange = (filters: any) => {
    setCurrentFilters(filters);
    setUrlParams(window.location.search);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>اختبار الفلاتر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">URL الحالي:</h4>
              <code className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm block break-all">
                {window.location.href}
              </code>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">معاملات URL:</h4>
              <code className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm block">
                {urlParams || 'لا توجد معاملات'}
              </code>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">الفلاتر المطبقة:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.keys(currentFilters).length > 0 ? (
                  Object.entries(currentFilters).map(([key, value]) => (
                    <Badge key={key} variant="secondary">
                      {key}: {String(value)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500">لا توجد فلاتر مطبقة</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AdvancedSearchFilters onFiltersChange={handleFiltersChange} />
    </div>
  );
}

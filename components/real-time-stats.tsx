'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Loader2, RefreshCw } from 'lucide-react';

interface Stats {
  totalCompanies: number;
  totalCategories: number;
  totalCountries: number;
  totalCities: number;
  activeCompanies: number;
  activeCategories: number;
  activeCountries: number;
  activeCities: number;
}

export function RealTimeStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/dashboard-stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        throw new Error(data.error || 'فشل في جلب الإحصائيات');
      }
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
      setError('حدث خطأ في جلب الإحصائيات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري تحميل الإحصائيات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-2">
          <RefreshCw className="h-4 w-4 ml-2" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">لا توجد إحصائيات متاحة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          الإحصائيات الحقيقية
        </h2>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* إجمالي الشركات */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Building2 className="h-5 w-5 ml-2 text-blue-600" />
              إجمالي الشركات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalCompanies}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                شركة مسجلة
              </p>
              <Badge variant="secondary" className="text-xs">
                {stats.activeCompanies} نشطة
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* إجمالي الفئات */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Building2 className="h-5 w-5 ml-2 text-green-600" />
              إجمالي الفئات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalCategories}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                فئة مسجلة
              </p>
              <Badge variant="secondary" className="text-xs">
                {stats.activeCategories} نشطة
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* إجمالي البلدان */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <MapPin className="h-5 w-5 ml-2 text-purple-600" />
              إجمالي البلدان
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalCountries}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                بلد مسجل
              </p>
              <Badge variant="secondary" className="text-xs">
                {stats.activeCountries} نشط
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* إجمالي المدن */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <MapPin className="h-5 w-5 ml-2 text-orange-600" />
              إجمالي المدن
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalCities}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                مدينة مسجلة
              </p>
              <Badge variant="secondary" className="text-xs">
                {stats.activeCities} نشطة
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

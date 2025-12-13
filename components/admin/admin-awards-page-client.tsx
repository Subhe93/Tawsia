'use client';

import { useRouter } from 'next/navigation';
import { Award, Plus, Calendar, Building, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminAddAwardForm } from '@/components/admin/admin-add-award-form';
import { AwardsFilter } from '@/components/admin/awards-filter';
import { AwardsList } from '@/components/admin/awards-list';

interface Award {
  id: string;
  title: string;
  description?: string | null;
  year?: number | null;
  awardType: 'GOLD' | 'SILVER' | 'BRONZE' | 'CERTIFICATE';
  issuer?: string | null;
  imageUrl?: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
    city: {
      name: string;
    };
    country: {
      name: string;
    };
  };
}

interface Company {
  id: string;
  name: string;
}

interface AdminAwardsPageClientProps {
  awards: Award[];
  companies: Company[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export function AdminAwardsPageClient({ 
  awards, 
  companies, 
  total, 
  totalPages, 
  currentPage 
}: AdminAwardsPageClientProps) {
  const router = useRouter();

  const handleUpdate = () => {
    router.refresh();
  };

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    router.push(url.toString());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            إدارة الجوائز والشهادات
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة جوائز وشهادات جميع الشركات
          </p>
        </div>
        <AdminAddAwardForm companies={companies} onUpdate={handleUpdate} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  إجمالي الجوائز
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400 fill-current" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  جوائز ذهبية
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {awards.filter(award => award.awardType === 'GOLD').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-gray-600 dark:text-gray-400 fill-current" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  جوائز فضية
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {awards.filter(award => award.awardType === 'SILVER').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  شهادات
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {awards.filter(award => award.awardType === 'CERTIFICATE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <AwardsFilter onUpdate={handleUpdate} />
        </CardContent>
      </Card>

      {/* Awards List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            قائمة الجوائز والشهادات
          </h2>
          <Badge variant="outline" className="text-sm">
            {total} جائزة
          </Badge>
        </div>

        {awards.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد جوائز أو شهادات
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ابدأ بإضافة أول جائزة أو شهادة
              </p>
              <AdminAddAwardForm companies={companies} onUpdate={handleUpdate} />
            </CardContent>
          </Card>
        ) : (
          <AwardsList awards={awards} onUpdate={handleUpdate} />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2 space-x-reverse">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? 'default' : 'outline'}
                size="sm"
                className="w-10 h-10"
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic"; 
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Phone, Globe, Verified } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// نوع البيانات الحديث من قاعدة البيانات
interface Company {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  mainImage?: string | null;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  services: string[];
  country: {
    code: string;
    name: string;
  };
  city: {
    slug: string;
    name: string;
  };
  category: {
    slug: string;
    name: string;
  };
  tags?: Array<{ tagName: string }>;
}

interface CompaniesGridProps {
  companies: Company[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function CompaniesGrid({ companies, pagination }: CompaniesGridProps) {
  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد شركات لعرضها</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
        {companies.map((company) => (
          <Link
            key={company.slug}
            href={`/${company.slug}`}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="relative h-48 overflow-hidden">
              <Image
                src={company.mainImage || 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg'}
                alt={company.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {company.isVerified && (
                  <div className="flex items-center space-x-1 space-x-reverse bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg px-2 py-1 text-xs font-medium">
                    <Verified className="h-3 w-3 fill-current" />
                    <span>موثق</span>
                  </div>
                )}
                {company.isFeatured && (
                  <div className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-lg px-2 py-1 text-xs font-medium">
                    مميز
                  </div>
                )}
              </div>
              
              {/* Rating */}
              <div className="absolute bottom-4 right-4">
                <div className="flex items-center space-x-1 space-x-reverse bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-900">{company.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 flex-1">
                  {company.name}
                </h3>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse text-blue-600 dark:text-blue-400 mb-3">
                <span className="text-sm font-medium">{company.category.name}</span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm">
                {company.shortDescription || company.description || 'لا يوجد وصف متاح'}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 space-x-reverse text-gray-500 dark:text-gray-400">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{company.city.name}</span>
                </div>
                {company.phone && (
                  <div className="flex items-center space-x-2 space-x-reverse text-gray-500 dark:text-gray-400">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{company.phone}</span>
                  </div>
                )}
              </div>

              {/* Services/Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {company.services.slice(0, 2).map((service, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {company.tags && company.tags.slice(0, 1).map((tag) => (
                  <Badge key={tag.tagName} variant="outline" className="text-xs">
                    {tag.tagName}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {company.reviewsCount} تقييم
                </span>
                <div className="flex items-center space-x-1 space-x-reverse text-blue-600 dark:text-blue-400">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm font-medium">عرض التفاصيل</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2 space-x-reverse">
            {/* Previous Page */}
            {pagination.page > 1 && (
              <Link
                href={`?page=${pagination.page - 1}`}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                السابق
              </Link>
            )}
            
            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = Math.max(1, pagination.page - 2) + i;
              if (pageNum <= pagination.totalPages) {
                return (
                  <Link
                    key={pageNum}
                    href={`?page=${pageNum}`}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pageNum === pagination.page
                        ? 'text-blue-600 bg-blue-50 border border-blue-300 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-600'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              }
              return null;
            })}
            
            {/* Next Page */}
            {pagination.page < pagination.totalPages && (
              <Link
                href={`?page=${pagination.page + 1}`}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                التالي
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
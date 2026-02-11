import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Building2, ArrowLeft, Verified } from 'lucide-react';
import { DEFAULT_COMPANY_IMAGE } from '@/lib/constants/default-images';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SimilarCompany {
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
}

interface SimilarCompaniesProps {
  companies: SimilarCompany[];
  currentCompanySlug: string;
}

export function SimilarCompanies({ companies, currentCompanySlug }: SimilarCompaniesProps) {
  // فلترة الشركات لاستبعاد الشركة الحالية
  const similarCompanies = companies.filter(company => company.slug !== currentCompanySlug);

  if (similarCompanies.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Building2 className="h-6 w-6 text-blue-600" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">شركات مشابهة</p>
        </div>
        {similarCompanies.length > 0 && (
          <Link href={`/country/${similarCompanies[0].country.code}/category/${similarCompanies[0].category.slug}`}>
            <Button variant="outline" size="sm" className="flex items-center">
              عرض المزيد
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {similarCompanies.slice(0, 3).map((company) => (
          <Link
            key={company.slug}
            href={`/${company.slug}`}
            className="group block"
          >
            <div className="flex items-center space-x-4 space-x-reverse p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 relative rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={company.mainImage || DEFAULT_COMPANY_IMAGE}
                  alt={company.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {company.name}
                    </h3>
                    {company.isVerified && (
                      <Verified className="h-4 w-4 text-green-500 fill-current" />
                    )}
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {company.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse text-blue-600 dark:text-blue-400 mb-2">
                  <span className="text-sm font-medium">{company.category.name}</span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {company.shortDescription || company.description || 'لا يوجد وصف متاح'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {company.services.slice(0, 2).map((service, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse text-gray-500 dark:text-gray-400">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">{company.city.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
        <p className="text-sm text-green-700 dark:text-green-300 flex items-center">
          <Building2 className="h-4 w-4 ml-2" />
          هذه الشركات تعمل في نفس المجال وقد تهمك أيضاً
        </p>
      </div>
    </div>
  );
}
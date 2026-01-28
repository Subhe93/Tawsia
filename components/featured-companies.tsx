import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FeaturedCompany {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  mainImage: string | null;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  category: {
    name: string;
    slug: string;
  };
  city: {
    name: string;
    slug: string;
    country: {
      code: string;
      name: string;
    };
  };
}

interface FeaturedCompaniesProps {
  companies: FeaturedCompany[];
  selectedCountry?: string;
}

export function FeaturedCompanies({ companies: featuredCompanies, selectedCountry }: FeaturedCompaniesProps) {
  // عدم عرض القسم إذا لم توجد شركات
  if (!featuredCompanies || featuredCompanies.length === 0) {
    return (
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            شركات مميزة
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            لا توجد شركات متاحة حالياً. يتم تحديث القائمة باستمرار.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          شركات مميزة ({featuredCompanies.length})
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          اكتشف أفضل الشركات الموصى بها من قبل المستخدمين
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredCompanies.map((company) => (
          <Link
            key={company.slug}
            href={`/${company.slug}`}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 overflow-hidden animate-fade-in-up"
            style={{ animationDelay: `${featuredCompanies.indexOf(company) * 150}ms` }}
          >
            <div className="relative h-48 overflow-hidden">
              {company.mainImage ? (
                <Image
                  src={company.mainImage}
                  alt={company.name}
                  fill
                  className="object-cover group-hover:scale-120 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">{company.name.charAt(0)}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/40 transition-all duration-300" />
              {company.isFeatured && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500 hover:bg-green-600 text-white animate-pulse transform group-hover:scale-110 transition-transform duration-300">
                    مميز
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 transform group-hover:translate-x-2 line-clamp-1">
                {company.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                {company.shortDescription || 'شركة رائدة في مجالها'}
              </p>
              
              <div className="flex items-center space-x-2 space-x-reverse mb-3 transform group-hover:translate-x-1 transition-transform duration-300">
                <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {company.city.name}، {company.city.country.name}
                </span>
              </div>

              <div className="flex items-center justify-between transform group-hover:translate-x-1 transition-transform duration-300">
                <div className="flex items-center space-x-1 space-x-reverse">
                  <Star className="h-4 w-4 text-yellow-500 fill-current animate-pulse" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {company.rating}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({company.reviewsCount})
                  </span>
                </div>
                
                <div className="flex items-center space-x-1 space-x-reverse transform group-hover:scale-110 transition-transform duration-300">
                  <Tag className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {company.category.name}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          href={selectedCountry ? `/companies?country=${selectedCountry}` : '/companies'}
          className="inline-flex items-center px-8 py-4 bg-brand-green hover:bg-green-600 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 animate-fade-in-up delay-1000"
        >
          عرض جميع الشركات
        </Link>
      </div>
    </section>
  );
}
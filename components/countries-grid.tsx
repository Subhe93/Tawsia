import Link from 'next/link';
import Image from 'next/image';
import { Building2, MapPin } from 'lucide-react';

interface Country {
  id: string;
  code: string;
  name: string;
  flag: string | null;
  image: string | null;
  description: string | null;
  companiesCount: number;
}

interface CountriesGridProps {
  countries: Country[];
  categorySlug?: string;
  subcategorySlug?: string;
}

export function CountriesGrid({ countries, categorySlug, subcategorySlug }: CountriesGridProps) {
  // عدم عرض القسم إذا لم توجد بلدان
  if (!countries || countries.length === 0) {
    return (
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            استكشف الدول
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            لا توجد دول متاحة حالياً. يتم تحديث القائمة باستمرار.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          استكشف الدول ({countries.length})
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          اختر دولتك واكتشف أفضل الشركات والخدمات
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {countries.map((country) => {
          // تحديد الرابط بناءً على وجود التصنيف أو التصنيف الفرعي
          let href = `/country/${country.code}`;
          if (categorySlug && subcategorySlug) {
            href = `/country/${country.code}/category/${categorySlug}/${subcategorySlug}`;
          } else if (categorySlug) {
            href = `/country/${country.code}/category/${categorySlug}`;
          }

          return (
            <Link
              key={country.code}
              href={href}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${countries.indexOf(country) * 100}ms` }}
            >
            <div className="relative h-48 overflow-hidden">
              {country.image ? (
                <Image
                  src={country.image}
                  alt={country.name}
                  fill
                  className="object-cover group-hover:scale-125 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-6xl">{country.flag || '🌍'}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/40 transition-all duration-300" />
              <div className="absolute bottom-4 right-4">
                <span className="text-4xl transform group-hover:scale-125 transition-transform duration-300 animate-bounce">{country.flag || '🌍'}</span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-green dark:group-hover:text-brand-green transition-all duration-300 transform group-hover:translate-x-2">
                {country.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                {country.description}
              </p>
              
              <div className="flex items-center justify-between transform group-hover:translate-x-1 transition-transform duration-300">
                <div className="flex items-center space-x-2 space-x-reverse text-gray-500 dark:text-gray-400">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">{country.companiesCount} شركة</span>
                </div>
                <div className="flex items-center space-x-1 space-x-reverse text-brand-orange dark:text-brand-orange transform group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">استكشف</span>
                </div>
              </div>
            </div>
          </Link>
          );
        })}
      </div>
    </section>
  );
}
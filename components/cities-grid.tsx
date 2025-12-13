import Link from 'next/link';
import Image from 'next/image';
import { Building2 } from 'lucide-react';
interface City {
  slug: string;
  name: string;
  image?: string;
  companiesCount: number;
}

interface CitiesGridProps {
  cities: City[];
  countryCode: string;
}

export function CitiesGrid({ cities, countryCode }: CitiesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cities.map((city) => (
        <Link
          key={city.slug}
          href={`/country/${countryCode}/city/${city.slug}`}
          className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
        >
          <div className="relative h-32 overflow-hidden">
            <Image
              src={city.image || '/images/city-placeholder.jpg'}
              alt={city.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-green dark:group-hover:text-brand-green transition-colors">
              {city.name}
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse text-gray-500 dark:text-gray-400">
                <Building2 className="h-4 w-4" />
                <span className="text-sm">{city.companiesCount} شركة</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
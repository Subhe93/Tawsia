'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, ArrowLeft, ArrowUp } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);

  // Show only 3 when collapsed, all when expanded
  const displayCities = isExpanded ? cities : cities.slice(0, 3);
  const hasMoreCities = cities.length > 3;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {displayCities.map((city) => (
        <Link
          key={city.slug}
          href={`/country/${countryCode}/city/${city.slug}`}
          className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          <div className="relative h-24 overflow-hidden">
            <Image
              src={city.image || '/images/city-placeholder.jpg'}
              alt={city.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-brand-green dark:group-hover:text-brand-green transition-colors line-clamp-1">
              {city.name}
            </h3>
            
            <div className="flex items-center space-x-1.5 space-x-reverse text-gray-500 dark:text-gray-400">
              <Building2 className="h-3.5 w-3.5" />
              <span className="text-xs">{city.companiesCount}</span>
            </div>
          </div>
        </Link>
      ))}

      {/* Toggle View All / Collapse Card */}
      {hasMoreCities && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="group bg-gradient-to-br from-brand-green to-brand-yellow rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center text-white cursor-pointer min-h-[140px]"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
            {isExpanded ? (
              <ArrowUp className="h-6 w-6 text-white" />
            ) : (
              <ArrowLeft className="h-6 w-6 text-white" />
            )}
          </div>
          
          <span className="text-sm font-semibold">
            {isExpanded ? 'عرض أقل' : 'عرض المزيد'}
          </span>
          
          {!isExpanded && (
            <span className="text-xs text-white/80 mt-1">
              +{cities.length - 3} مدينة
            </span>
          )}
        </button>
      )}
    </div>
  );
}
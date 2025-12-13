import Image from 'next/image';
import { Building2, MapPin } from 'lucide-react';
import { City } from '@/lib/data';

interface CityHeaderProps {
  city: any;
}

export function CityHeader({ city }: CityHeaderProps) {
  return (
    <div className="relative h-56 rounded-2xl overflow-hidden">
      <Image
        src={city.image}
        alt={city.name}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      
      <div className="absolute bottom-0 right-0 p-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{city.name}</h1>
        
        <p className="text-lg text-blue-100 mb-4 max-w-2xl">
          {city.description}
        </p>
        
        <div className="flex items-center space-x-6 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Building2 className="h-5 w-5" />
            <span>{city.companiesCount} شركة</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <MapPin className="h-5 w-5" />
            <span>المدينة الرئيسية</span>
          </div>
        </div>
      </div>
    </div>
  );
}
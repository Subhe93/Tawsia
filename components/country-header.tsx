import Image from 'next/image';
import { Building2, MapPin } from 'lucide-react';
import { Country } from '@/lib/data';

interface CountryHeaderProps {
  country: any;
}

export function CountryHeader({ country }: CountryHeaderProps) {
  return (
    <div className="relative h-64 rounded-2xl overflow-hidden">
      <Image
        src={country.image}
        alt={country.name}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      
      <div className="absolute bottom-0 right-0 p-8 text-white">
        <div className="flex items-center space-x-3 space-x-reverse mb-4">
          <span className="text-4xl">{country.flag}</span>
          <h1 className="text-4xl md:text-5xl font-bold">{country.name}</h1>
        </div>
        
        <p className="text-xl text-blue-100 mb-4 max-w-2xl">
          {country.description}
        </p>
        
        <div className="flex items-center space-x-6 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Building2 className="h-5 w-5" />
            <span>{country.companiesCount} شركة</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <MapPin className="h-5 w-5" />
            <span>عدة مدن</span>
          </div>
        </div>
      </div>
    </div>
  );
}
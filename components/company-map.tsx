'use client';

import { MapPin } from 'lucide-react';

interface CompanyMapProps {
  location: {
    lat: number;
    lng: number;
  };
}

export function CompanyMap({ location }: CompanyMapProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center space-x-3 space-x-reverse mb-6">
        <MapPin className="h-6 w-6 text-brand-red dark:text-brand-red" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">الموقع على الخريطة</h3>
      </div>
      
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">الخريطة التفاعلية</p>
            <p className="text-sm text-gray-400" dir="ltr">
              {location.lat}, {location.lng}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <button className="text-brand-green dark:text-brand-green hover:underline text-sm">
          فتح في خرائط جوجل
        </button>
      </div>
    </div>
  );
}
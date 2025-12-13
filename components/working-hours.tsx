'use client';

import { Clock } from 'lucide-react';
import { WorkingHoursFormatted, ALL_DAYS_OF_WEEK_ARABIC } from '@/lib/types/working-hours';

interface WorkingHoursProps {
  hours: WorkingHoursFormatted;
}

export function WorkingHours({ hours }: WorkingHoursProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center space-x-3 space-x-reverse mb-6">
        <Clock className="h-6 w-6 text-brand-green dark:text-brand-green" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">ساعات العمل</h3>
      </div>
      
      <div className="space-y-1">
        {ALL_DAYS_OF_WEEK_ARABIC.map((day) => {
          const dayHours = hours[day];
          if (!dayHours) return null;
          
          return (
            <div key={day} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <span className="font-medium text-gray-900 dark:text-white text-sm">{day}</span>
              {dayHours.closed ? (
                <span className="text-red-500 font-medium text-sm">مغلق</span>
              ) : (
                <span className="text-gray-600 dark:text-gray-400 text-sm" dir="ltr">
                  {dayHours.open} - {dayHours.close}
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <p className="text-sm text-brand-green dark:text-brand-green">
          💡 ننصح بالاتصال للتأكد من أوقات العمل قبل الزيارة
        </p>
      </div>
    </div>
  );
}
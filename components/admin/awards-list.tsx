'use client';

import { Award, Calendar, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditAwardForm } from '@/components/admin/edit-award-form';
import { DeleteAwardButton } from '@/components/admin/delete-award-button';

interface Award {
  id: string;
  title: string;
  description?: string | null;
  year?: number | null;
  awardType: 'GOLD' | 'SILVER' | 'BRONZE' | 'CERTIFICATE';
  issuer?: string | null;
  imageUrl?: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
    city: {
      name: string;
    };
    country: {
      name: string;
    };
  };
}

interface AwardsListProps {
  awards: Award[];
  onUpdate: () => void;
}

// نوع الجائزة
type AwardType = 'GOLD' | 'SILVER' | 'BRONZE' | 'CERTIFICATE';

// تحويل نوع الجائزة إلى العربية
const getAwardTypeLabel = (type: AwardType) => {
  switch (type) {
    case 'GOLD':
      return 'ذهبية';
    case 'SILVER':
      return 'فضية';
    case 'BRONZE':
      return 'برونزية';
    case 'CERTIFICATE':
      return 'شهادة';
    default:
      return 'غير محدد';
  }
};

// الحصول على لون الجائزة
const getAwardTypeColor = (type: AwardType) => {
  switch (type) {
    case 'GOLD':
      return 'bg-yellow-500 text-white';
    case 'SILVER':
      return 'bg-gray-400 text-white';
    case 'BRONZE':
      return 'bg-orange-600 text-white';
    case 'CERTIFICATE':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

export function AwardsList({ awards, onUpdate }: AwardsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {awards.map((award) => (
        <Card key={award.id} className="group hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Badge className={getAwardTypeColor(award.awardType)}>
                  {getAwardTypeLabel(award.awardType)}
                </Badge>
                {award.year && (
                  <Badge variant="outline" className="text-xs">
                    {award.year}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                <EditAwardForm award={award} onUpdate={onUpdate} />
                <DeleteAwardButton 
                  awardId={award.id} 
                  awardTitle={award.title} 
                  onDelete={onUpdate} 
                />
              </div>
            </div>
            <CardTitle className="text-lg">{award.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {award.imageUrl && (
              <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 overflow-hidden">
                <img
                  src={award.imageUrl}
                  alt={award.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {award.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                {award.description}
              </p>
            )}

            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse text-sm">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  {award.company.name}
                </span>
              </div>
              
              {award.issuer && (
                <div className="flex items-center space-x-2 space-x-reverse text-sm">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {award.issuer}
                  </span>
                </div>
              )}
              
              {award.year && (
                <div className="flex items-center space-x-2 space-x-reverse text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {award.year}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500">
                <span>{award.company.city.name}</span>
                <span>•</span>
                <span>{award.company.country.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

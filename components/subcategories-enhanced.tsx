'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Car, 
  Heart, 
  Home, 
  ShoppingBag, 
  Utensils, 
  Wrench, 
  GraduationCap,
  Stethoscope,
  Paintbrush,
  Briefcase,
  Camera,
  Music,
  Gamepad2,
  Dumbbell,
  Plane,
  Ship,
  Truck,
  TreePine,
  Zap,
  Shield,
  Star,
  Globe,
  Users,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  TrendingUp,
  Target,
  Lightbulb,
  Palette,
  Scissors,
  Hammer,
  Cog,
  Settings,
  Smartphone,
  Laptop,
  Monitor,
  Headphones,
  Printer,
  Router,
  Database,
  Cloud,
  Lock,
  Key,
  Eye,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react';

interface Subcategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  _count: {
    companies: number;
  };
}

interface SubcategoriesEnhancedProps {
  subcategories: Subcategory[];
  country?: string;
  city?: string;
  subArea?: string;
  category: string;
}

// دالة للحصول على الأيقونة المناسبة
const getIcon = (iconName?: string) => {
  const iconMap: { [key: string]: any } = {
    'building': Building2,
    'car': Car,
    'heart': Heart,
    'home': Home,
    'shopping': ShoppingBag,
    'utensils': Utensils,
    'wrench': Wrench,
    'graduation': GraduationCap,
    'stethoscope': Stethoscope,
    'paintbrush': Paintbrush,
    'briefcase': Briefcase,
    'camera': Camera,
    'music': Music,
    'gamepad': Gamepad2,
    'dumbbell': Dumbbell,
    'plane': Plane,
    'ship': Ship,
    'truck': Truck,
    'tree': TreePine,
    'zap': Zap,
    'shield': Shield,
    'star': Star,
    'globe': Globe,
    'users': Users,
    'phone': Phone,
    'mail': Mail,
    'map': MapPin,
    'clock': Clock,
    'award': Award,
    'trending': TrendingUp,
    'target': Target,
    'lightbulb': Lightbulb,
    'palette': Palette,
    'scissors': Scissors,
    'hammer': Hammer,
    'cog': Cog,
    'settings': Settings,
    'smartphone': Smartphone,
    'laptop': Laptop,
    'monitor': Monitor,
    'headphones': Headphones,
    'printer': Printer,
    'router': Router,
    'database': Database,
    'cloud': Cloud,
    'lock': Lock,
    'key': Key,
    'eye': Eye,
    'search': Search,
    'filter': Filter,
  };

  const IconComponent = iconMap[iconName?.toLowerCase() || ''] || Building2;
  return IconComponent;
};

export function SubcategoriesEnhanced({ subcategories, country, city, subArea, category }: SubcategoriesEnhancedProps) {
  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          الفئات الفرعية
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm">
          اكتشف التخصصات المختلفة في هذه الفئة
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3">
        {subcategories.map((subcategory, index) => {
          const IconComponent = getIcon(subcategory.icon);
          
          return (
            <Link 
              key={subcategory.id} 
              href={(() => {
                if (subArea && city && country) {
                  return `/country/${country}/city/${city}/sub-area/${subArea}/category/${category}/${subcategory.slug}`;
                } else if (city && country) {
                  return `/country/${country}/city/${city}/category/${category}/${subcategory.slug}`;
                } else if (country) {
                  return `/country/${country}/category/${category}/${subcategory.slug}`;
                } else {
                  return `/category/${category}/${subcategory.slug}`;
                }
              })()}
              className="group"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <Card className="subcategory-card h-20 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600 animate-in fade-in slide-in-from-bottom-2">
                <CardContent className="p-3 h-full">
                  <div className="flex items-center gap-3 h-full">
                    {/* الأيقونة على اليسار */}
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300 shadow-sm">
                        <IconComponent className="h-4 w-4" />
                      </div>
                    </div>
                    
                    {/* المحتوى على اليمين */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate">
                          {subcategory.name}
                        </h3>
                        <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0" />
                      </div>
                      
                      {subcategory.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-1">
                          {subcategory.description}
                        </p>
                      )}
                      
                      {/* <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-300 px-2 py-0.5"
                        >
                          <Building2 className="h-2.5 w-2.5 ml-1" />
                          {subcategory._count.companies}
                        </Badge>
                        
                        <span className="text-xs text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                          استكشف
                        </span>
                      </div> */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      
      {subcategories.length > 12 && (
        <div className="text-center mt-6">
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            عرض {subcategories.length} فئة فرعية متخصصة
          </p>
        </div>
      )}
    </div>
  );
}

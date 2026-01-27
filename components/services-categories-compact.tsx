'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { 
  Laptop, 
  Heart, 
  GraduationCap, 
  Banknote, 
  Utensils, 
  ShoppingBag,
  Car,
  Home,
  Briefcase,
  Scissors,
  Wrench,
  Camera
} from 'lucide-react';

interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  description: string | null;
  companiesCount: number;
}

interface ServicesCategoriesCompactProps {
  categories: ServiceCategory[];
  country: string;
  city: string;
  subArea?: string;
}

// خريطة الأيقونات
const iconMap: { [key: string]: any } = {
  'laptop': Laptop,
  'heart': Heart,
  'graduation-cap': GraduationCap,
  'banknote': Banknote,
  'utensils': Utensils,
  'shopping-bag': ShoppingBag,
  'car': Car,
  'home': Home,
  'briefcase': Briefcase,
  'scissors': Scissors,
  'wrench': Wrench,
  'camera': Camera,
};

// ألوان افتراضية للفئات
const colorOptions = [
  'text-blue-500',
  'text-red-500', 
  'text-green-500',
  'text-yellow-600',
  'text-purple-500',
  'text-pink-500',
  'text-indigo-500',
  'text-orange-500',
  'text-teal-500',
  'text-cyan-500',
  'text-emerald-500',
  'text-rose-500',
];

export function ServicesCategoriesCompact({ categories, country, city, subArea }: ServicesCategoriesCompactProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Prepare all categories with icons and colors
  const allCategories = categories.map((cat, index) => ({
    ...cat,
    IconComponent: iconMap[cat.icon || 'briefcase'] || Briefcase,
    color: colorOptions[index % colorOptions.length],
    count: cat.companiesCount || 0,
  }));

  // Show only 5 when collapsed (for desktop), all when expanded
  const displayCategories = isExpanded ? allCategories : allCategories.slice(0, 5);
  const hasMoreCategories = categories.length > 5;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          التصنيفات
        </h2>
      </div>

      {/* Desktop Grid: 6 columns (5 services + 1 arrow) */}
      <div className="hidden md:grid md:grid-cols-6 gap-3">
        {displayCategories.map((category) => {
          const IconComponent = category.IconComponent;
          const href = subArea
            ? `/country/${country}/city/${city}/sub-area/${subArea}/category/${category.slug}`
            : `/country/${country}/city/${city}/category/${category.slug}`;

          return (
            <Link
              key={category.slug}
              href={href}
              className="group flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 p-3 border border-gray-100 dark:border-gray-700"
            >
              <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <IconComponent className={`h-5 w-5 ${category.color}`} />
              </div>
              
              <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-green dark:group-hover:text-brand-green transition-colors duration-300 line-clamp-1">
                {category.name}
              </h3>
            </Link>
          );
        })}

        {/* Toggle View All / Collapse Card - Desktop */}
        {hasMoreCategories && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex items-center justify-center gap-3 bg-gradient-to-br from-brand-green to-brand-yellow rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 p-3 text-white cursor-pointer"
          >
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              {isExpanded ? (
                <ArrowUp className="h-5 w-5 text-white" />
              ) : (
                <ArrowLeft className="h-5 w-5 text-white" />
              )}
            </div>
            
            <span className="text-sm font-medium">
              {isExpanded ? 'أقل' : 'المزيد'}
            </span>
          </button>
        )}
      </div>

      {/* Mobile Grid: 2 columns with compact cards */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        {displayCategories.map((category) => {
          const IconComponent = category.IconComponent;
          const href = subArea
            ? `/country/${country}/city/${city}/sub-area/${subArea}/category/${category.slug}`
            : `/country/${country}/city/${city}/category/${category.slug}`;

          return (
            <Link
              key={category.slug}
              href={href}
              className="group flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5 border border-gray-200 dark:border-gray-700 hover:border-brand-green transition-colors duration-200"
            >
              <IconComponent className={`h-5 w-5 flex-shrink-0 ${category.color}`} />
              <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {category.name}
              </span>
            </Link>
          );
        })}

        {/* Toggle View All / Collapse Card - Mobile */}
        {hasMoreCategories && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-brand-green to-brand-yellow rounded-lg px-3 py-2.5 text-white cursor-pointer"
          >
            {isExpanded ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowLeft className="h-4 w-4" />
            )}
            <span className="text-xs font-medium">
              {isExpanded ? 'أقل' : `+${categories.length - 5}`}
            </span>
          </button>
        )}
      </div>
    </section>
  );
}

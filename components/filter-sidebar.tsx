'use client';

import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { categories } from '@/lib/data';

export function FilterSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  const cities = ['دمشق', 'حلب', 'بيروت', 'عمان'];
  const ratings = [5, 4, 3];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <Filter className="h-5 w-5 ml-2" />
          الفلاتر
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isOpen && (
        <div className="space-y-6">
          {/* Categories Filter */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">الفئات</h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.slug} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={category.slug}
                    checked={selectedCategories.includes(category.slug)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCategories([...selectedCategories, category.slug]);
                      } else {
                        setSelectedCategories(selectedCategories.filter(c => c !== category.slug));
                      }
                    }}
                  />
                  <label
                    htmlFor={category.slug}
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Cities Filter */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">المدن</h4>
            <div className="space-y-2">
              {cities.map((city) => (
                <div key={city} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={city}
                    checked={selectedCities.includes(city)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCities([...selectedCities, city]);
                      } else {
                        setSelectedCities(selectedCities.filter(c => c !== city));
                      }
                    }}
                  />
                  <label
                    htmlFor={city}
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    {city}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">التقييم</h4>
            <div className="space-y-2">
              {ratings.map((rating) => (
                <div key={rating} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox id={`rating-${rating}`} />
                  <label
                    htmlFor={`rating-${rating}`}
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    {rating} نجوم وأكثر
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <Button className="w-full" variant="outline">
              مسح الفلاتر
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
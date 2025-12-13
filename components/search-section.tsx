'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Building2, Tag } from 'lucide-react';
import { categories } from '@/lib/data';

export function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  return (
    <section className="container mx-auto px-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ابحث عن شركتك المفضلة
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            استخدم الفلاتر للعثور على ما تبحث عنه بسرعة ودقة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن شركة أو خدمة..."
              className="w-full pr-12 pl-4 py-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Country Filter */}
          <div className="relative">
            <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              className="w-full pr-12 pl-4 py-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="">جميع الدول</option>
              <option value="sy">سوريا</option>
              <option value="lb">لبنان</option>
              <option value="jo">الأردن</option>
              <option value="eg">مصر</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Building2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              className="w-full pr-12 pl-4 py-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">جميع الفئات</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Search className="h-5 w-5 ml-2" />
            بحث متقدم
          </Button>
        </div>

        {/* Popular Tags */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Tag className="h-5 w-5 ml-2" />
            البحث الشائع
          </h3>
          <div className="flex flex-wrap gap-3">
            {['تطوير المواقع', 'تطبيقات الهاتف', 'التسويق الرقمي', 'الطب العام', 'المطاعم', 'التعليم'].map((tag) => (
              <button
                key={tag}
                className="px-4 py-2 bg-green-50 dark:bg-green-900/30 text-brand-green dark:text-brand-green rounded-full text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
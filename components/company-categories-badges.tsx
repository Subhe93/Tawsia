'use client'

import Link from 'next/link'
import { FolderTree, Tag, MapPin } from 'lucide-react'

interface CompanyCategoriesBadgesProps {
  category: {
    name: string
    slug: string
  }
  subCategory?: {
    name: string
    slug: string
  } | null
  subArea?: {
    name: string
    slug: string
  } | null
  countryCode: string
  citySlug: string
}

export function CompanyCategoriesBadges({ 
  category, 
  subCategory, 
  subArea, 
  countryCode, 
  citySlug 
}: CompanyCategoriesBadgesProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Category Badge */}
      <Link 
        href={`/country/${countryCode}/category/${category.slug}`}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:shadow-md hover:scale-105 transition-all duration-200 group"
      >
        <FolderTree className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">الفئة</span>
          <span className="text-sm font-bold text-blue-700 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-blue-200">
            {category.name}
          </span>
        </div>
      </Link>

      {/* Subcategory Badge */}
      {subCategory && (
        <Link 
          href={`/country/${countryCode}/category/${category.slug}/${subCategory.slug}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-lg hover:shadow-md hover:scale-105 transition-all duration-200 group"
        >
          <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">الفئة الفرعية</span>
            <span className="text-sm font-bold text-purple-700 dark:text-purple-300 group-hover:text-purple-800 dark:group-hover:text-purple-200">
              {subCategory.name}
            </span>
          </div>
        </Link>
      )}

      {/* SubArea Badge */}
      {subArea && (
        <Link 
          href={`/country/${countryCode}/city/${citySlug}/sub-area/${subArea.slug}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-lg hover:shadow-md hover:scale-105 transition-all duration-200 group"
        >
          <MapPin className="h-4 w-4 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">المنطقة الفرعية</span>
            <span className="text-sm font-bold text-green-700 dark:text-green-300 group-hover:text-green-800 dark:group-hover:text-green-200">
              {subArea.name}
            </span>
          </div>
        </Link>
      )}
    </div>
  )
}

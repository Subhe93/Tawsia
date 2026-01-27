'use client'

import { useState } from 'react'
import { MapPin, Building2, ArrowLeft, ArrowUp } from 'lucide-react'
import Link from 'next/link'

interface SubAreasGridProps {
  subAreas: Array<{
    id: string
    name: string
    slug: string
    description?: string
    image?: string
    city: {
      name: string
      slug: string
    }
    country: {
      name: string
      code: string
    }
    _count: {
      companies: number
    }
  }>
  cityName: string
  countryCode: string
  citySlug: string
}

export function SubAreasGrid({ subAreas, cityName, countryCode, citySlug }: SubAreasGridProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // فلترة المناطق الفرعية الخاصة بالمدينة الحالية فقط
  const filteredSubAreas = subAreas.filter(subArea => {
    if (citySlug && subArea.city?.slug !== citySlug) return false
    return true
  })

  // Show only 5 when collapsed, all when expanded
  const displaySubAreas = isExpanded ? filteredSubAreas : filteredSubAreas.slice(0, 5)
  const hasMoreSubAreas = filteredSubAreas.length > 5

  if (filteredSubAreas.length === 0) {
    return null
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          المناطق في {cityName}
        </h2>
      </div>

      {/* Desktop Grid: 6 columns (5 sub-areas + 1 arrow) */}
      <div className="hidden md:grid md:grid-cols-6 gap-3">
        {displaySubAreas.map((subArea) => (
          <Link 
            key={subArea.id} 
            href={`/country/${countryCode}/city/${citySlug}/sub-area/${subArea.slug}`}
            className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 p-3 transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="h-5 w-5 text-orange-500" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-green transition-colors truncate">
                {subArea.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Building2 className="h-3 w-3" />
                <span>{subArea._count.companies}</span>
              </div>
            </div>
          </Link>
        ))}

        {/* Toggle View All / Collapse Card - Desktop */}
        {hasMoreSubAreas && (
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
        {displaySubAreas.map((subArea) => (
          <Link 
            key={subArea.id} 
            href={`/country/${countryCode}/city/${citySlug}/sub-area/${subArea.slug}`}
            className="group flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5 border border-gray-200 dark:border-gray-700 hover:border-brand-green transition-colors duration-200"
          >
            <MapPin className="h-5 w-5 flex-shrink-0 text-orange-500" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-gray-900 dark:text-white truncate block">
                {subArea.name}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Building2 className="h-3 w-3" />
                <span>{subArea._count.companies}</span>
              </div>
            </div>
          </Link>
        ))}

        {/* Toggle View All / Collapse Card - Mobile */}
        {hasMoreSubAreas && (
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
              {isExpanded ? 'أقل' : `+${filteredSubAreas.length - 5}`}
            </span>
          </button>
        )}
      </div>
    </section>
  )
}

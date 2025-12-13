'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building2, Search, Filter, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')

  // فلترة وترتيب المناطق الفرعية
  const filteredSubAreas = subAreas
    .filter(subArea => {
      // عرض المناطق الفرعية الخاصة بالمدينة الحالية فقط (مطابقة citySlug)
      if (citySlug && subArea.city?.slug !== citySlug) return false

      const matchesSearch = subArea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           subArea.description?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'companies':
          return b._count.companies - a._count.companies
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  if (subAreas.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          لا توجد مناطق فرعية
        </h3>
        <p className="text-gray-600">
          لا توجد مناطق فرعية محددة في {cityName} حالياً
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            المناطق الفرعية في {cityName}
          </h2>
          <p className="text-gray-600">
            اكتشف المناطق الفرعية والشركات في كل منطقة
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="h-4 w-4" />
          <span>{filteredSubAreas.length} من أصل {subAreas.length} منطقة</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في المناطق الفرعية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">الاسم</SelectItem>
              <SelectItem value="companies">عدد الشركات</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sub Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubAreas.map((subArea) => (
          <Card key={subArea.id} className="hover:shadow-lg transition-shadow duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {subArea.name}
                  </CardTitle>
                  
                  {/* Description */}
                  {subArea.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {subArea.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span>{subArea._count.companies} شركة</span>
                    </div>
                    
                    <Badge variant="secondary" className="text-xs">
                      منطقة فرعية
                    </Badge>
                  </div>
                </div>

                {/* Image */}
                {subArea.image && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={subArea.image}
                      alt={subArea.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <Link 
                href={`/country/${countryCode}/city/${citySlug}/sub-area/${subArea.slug}`}
                className="w-full"
              >
                <Button className="w-full group-hover:bg-blue-600 transition-colors">
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  عرض المنطقة
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredSubAreas.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            لا توجد نتائج
          </h3>
          <p className="text-gray-600">
            لم يتم العثور على مناطق فرعية تطابق معايير البحث
          </p>
        </div>
      )}
    </div>
  )
}

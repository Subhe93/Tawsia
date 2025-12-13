'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Star, MapPin, Tag, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterOptions {
  categories: Array<{
    id: string
    name: string
    slug: string
    companiesCount: number
  }>
  cities: Array<{
    id: string
    name: string
    slug: string
    companiesCount: number
  }>
  ratingRanges: Array<{
    min: number
    max: number
    count: number
  }>
  verificationStatus: {
    verified: number
    unverified: number
  }
}

interface CurrentFilters {
  categoryId?: string
  cityId?: string
  minRating?: number
  isVerified?: boolean
  searchQuery?: string
  sortBy?: string
  page?: number
}

interface CountryFiltersProps {
  filterOptions: FilterOptions
  currentFilters: CurrentFilters
  countryCode: string
}

export function CountryFiltersSimple({ filterOptions, currentFilters, countryCode }: CountryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchQuery, setSearchQuery] = useState(currentFilters.searchQuery || '')

  // دالة لتحديث الفلاتر
  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // إعادة تعيين الصفحة عند تغيير الفلاتر
    params.delete('page')
    
    router.push(`/${countryCode}?${params.toString()}`)
  }

  // دالة البحث
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', searchQuery.trim() || undefined)
  }

  // إزالة فلتر معين
  const removeFilter = (key: string) => {
    updateFilter(key, undefined)
    if (key === 'search') {
      setSearchQuery('')
    }
  }

  // مسح جميع الفلاتر
  const clearAllFilters = () => {
    setSearchQuery('')
    router.push(`/${countryCode}`)
  }

  // حساب عدد الفلاتر النشطة
  const activeFiltersCount = [
    currentFilters.categoryId,
    currentFilters.cityId,
    currentFilters.minRating,
    currentFilters.isVerified !== undefined ? 'verified' : undefined,
    currentFilters.searchQuery
  ].filter(Boolean).length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
      {/* شريط البحث */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="ابحث عن الشركات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button type="submit" className="px-6">
          بحث
        </Button>
      </form>

      {/* الفلاتر النشطة */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            الفلاتر النشطة ({activeFiltersCount}):
          </span>
          
          {currentFilters.searchQuery && (
            <Badge variant="secondary" className="gap-1">
              بحث: {currentFilters.searchQuery}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter('search')}
              />
            </Badge>
          )}
          
          {currentFilters.categoryId && (
            <Badge variant="secondary" className="gap-1">
              <Tag className="h-3 w-3" />
              {filterOptions.categories.find(c => c.id === currentFilters.categoryId)?.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter('category')}
              />
            </Badge>
          )}
          
          {currentFilters.cityId && (
            <Badge variant="secondary" className="gap-1">
              <MapPin className="h-3 w-3" />
              {filterOptions.cities.find(c => c.id === currentFilters.cityId)?.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter('city')}
              />
            </Badge>
          )}
          
          {currentFilters.minRating && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3" />
              {currentFilters.minRating}+ نجوم
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter('rating')}
              />
            </Badge>
          )}
          
          {currentFilters.isVerified !== undefined && (
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              {currentFilters.isVerified ? 'موثق' : 'غير موثق'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter('verified')}
              />
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700"
          >
            مسح الكل
          </Button>
        </div>
      )}

      {/* الفلاتر */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* فلتر الفئة */}
        {filterOptions.categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">الفئة</label>
            <Select
              value={currentFilters.categoryId || 'all'}
              onValueChange={(value) => updateFilter('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="جميع الفئات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {filterOptions.categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category.companiesCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* فلتر المدينة */}
        {filterOptions.cities.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">المدينة</label>
            <Select
              value={currentFilters.cityId || 'all'}
              onValueChange={(value) => updateFilter('city', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="جميع المدن" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المدن</SelectItem>
                {filterOptions.cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name} ({city.companiesCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* فلتر التقييم */}
        <div>
          <label className="block text-sm font-medium mb-2">التقييم</label>
          <Select
            value={currentFilters.minRating?.toString() || 'all'}
            onValueChange={(value) => updateFilter('rating', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="جميع التقييمات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التقييمات</SelectItem>
              {filterOptions.ratingRanges
                .filter(range => range.count > 0)
                .map((range) => (
                  <SelectItem key={range.min} value={range.min.toString()}>
                    {range.min}+ نجوم ({range.count})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* فلتر التوثيق */}
        <div>
          <label className="block text-sm font-medium mb-2">حالة التوثيق</label>
          <Select
            value={
              currentFilters.isVerified === true ? 'true' : 
              currentFilters.isVerified === false ? 'false' : 'all'
            }
            onValueChange={(value) => updateFilter('verified', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="جميع الشركات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الشركات</SelectItem>
              {filterOptions.verificationStatus.verified > 0 && (
                <SelectItem value="true">
                  موثق ({filterOptions.verificationStatus.verified})
                </SelectItem>
              )}
              {filterOptions.verificationStatus.unverified > 0 && (
                <SelectItem value="false">
                  غير موثق ({filterOptions.verificationStatus.unverified})
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ترتيب النتائج */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-2">ترتيب النتائج</label>
        <Select
          value={currentFilters.sortBy || 'name'}
          onValueChange={(value) => updateFilter('sort', value)}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">الاسم (أ-ي)</SelectItem>
            <SelectItem value="rating">أعلى تقييم</SelectItem>
            <SelectItem value="reviewsCount">الأكثر تقييماً</SelectItem>
            <SelectItem value="newest">الأحدث</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

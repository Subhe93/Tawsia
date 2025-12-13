'use client'

import { useState } from 'react'
import { Search, Filter, X, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface SearchFilters {
  search: string
  category?: string
  country?: string
  city?: string
  status?: string
  verified?: boolean
  featured?: boolean
  dateFrom?: string
  dateTo?: string
}

interface AdvancedSearchProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  categories?: Array<{ id: string; name: string; slug: string }>
  countries?: Array<{ id: string; name: string; code: string }>
  cities?: Array<{ id: string; name: string; countryId: string }>
  placeholder?: string
  showAdvanced?: boolean
}

export function AdvancedSearch({
  filters,
  onFiltersChange,
  categories = [],
  countries = [],
  cities = [],
  placeholder = "البحث...",
  showAdvanced = true
}: AdvancedSearchProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  
  const activeFiltersCount = Object.keys(filters).filter(key => 
    key !== 'search' && filters[key as keyof SearchFilters] !== undefined && filters[key as keyof SearchFilters] !== ''
  ).length

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: filters.search
    })
  }

  const filteredCities = cities.filter(city => 
    !filters.country || city.countryId === filters.country
  )

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* البحث الأساسي */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={placeholder}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pr-10"
              />
            </div>
            
            {showAdvanced && (
              <Dialog open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="relative">
                    <Filter className="h-4 w-4 ml-2" />
                    فلترة متقدمة
                    {activeFiltersCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs flex items-center justify-center"
                      >
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>البحث المتقدم</DialogTitle>
                    <DialogDescription>
                      استخدم الفلاتر المتقدمة للبحث بدقة أكبر
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* الفئة */}
                    {categories.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الفئة</label>
                        <Select 
                          value={filters.category || 'all'} 
                          onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الفئة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع الفئات</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.slug}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* البلد */}
                    {countries.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">البلد</label>
                        <Select 
                          value={filters.country || 'all'} 
                          onValueChange={(value) => {
                            handleFilterChange('country', value === 'all' ? undefined : value)
                            if (value === 'all') handleFilterChange('city', undefined)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر البلد" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع البلدان</SelectItem>
                            {countries.map((country) => (
                              <SelectItem key={country.id} value={country.id}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* المدينة */}
                    {filteredCities.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">المدينة</label>
                        <Select 
                          value={filters.city || 'all'} 
                          onValueChange={(value) => handleFilterChange('city', value === 'all' ? undefined : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المدينة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع المدن</SelectItem>
                            {filteredCities.map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* الحالة */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الحالة</label>
                      <Select 
                        value={filters.status || 'all'} 
                        onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الحالات</SelectItem>
                          <SelectItem value="active">نشط</SelectItem>
                          <SelectItem value="inactive">غير نشط</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="h-4 w-4 ml-2" />
                      مسح الفلاتر
                    </Button>
                    <Button onClick={() => setIsAdvancedOpen(false)}>
                      تطبيق الفلاتر
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* عرض الفلاتر النشطة */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  فئة: {categories.find(c => c.slug === filters.category)?.name}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('category', undefined)}
                  />
                </Badge>
              )}
              
              {filters.country && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  بلد: {countries.find(c => c.id === filters.country)?.name}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => {
                      handleFilterChange('country', undefined)
                      handleFilterChange('city', undefined)
                    }}
                  />
                </Badge>
              )}
              
              {filters.status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  حالة: {filters.status === 'active' ? 'نشط' : 'غير نشط'}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('status', undefined)}
                  />
                </Badge>
              )}

              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 ml-1" />
                مسح الكل
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

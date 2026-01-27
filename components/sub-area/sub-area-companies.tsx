'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Building2, Star, MapPin, Phone, Globe, Search, Filter, SortAsc } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface SubAreaCompaniesProps {
  subArea: {
    id: string
    name: string
    city: {
      name: string
      slug: string
    }
    country: {
      name: string
      code: string
    }
  }
  companies: Array<{
    id: string
    name: string
    slug: string
    description?: string
    rating: number
    reviewsCount: number
    isVerified: boolean
    isFeatured: boolean
    phone?: string
    website?: string
    mainImage?: string
    category: {
      name: string
      slug: string
    }
  }>
}

export function SubAreaCompanies({ subArea, companies }: SubAreaCompaniesProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [filterCategory, setFilterCategory] = useState('all')

  // فلترة وترتيب الشركات
  const filteredCompanies = companies
    .filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === 'all' || company.category.slug === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'reviews':
          return b.reviewsCount - a.reviewsCount
        case 'featured':
          return Number(b.isFeatured) - Number(a.isFeatured)
        default:
          return b.rating - a.rating
      }
    })

  // الحصول على الفئات الفريدة
  const categories = Array.from(new Set(companies.map(c => c.category.slug)))
    .map(slug => companies.find(c => c.category.slug === slug)?.category)
    .filter(Boolean)

  return (
    <div id="companies-section" className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            الشركات في {subArea.name}
          </h2>
          <p className="text-lg text-gray-600">
            اكتشف أفضل الشركات والخدمات في المنطقة
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في الشركات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الفئات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category?.slug} value={category?.slug || ''}>
                    {category?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">التقييم</SelectItem>
                <SelectItem value="name">الاسم</SelectItem>
                <SelectItem value="reviews">عدد المراجعات</SelectItem>
                <SelectItem value="featured">المميزة أولاً</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            عرض {filteredCompanies.length} من أصل {companies.length} شركة
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span>فلترة وترتيب</span>
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-1">
                        {company.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {company.category.name}
                        </Badge>
                        {company.isVerified && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            موثق
                          </Badge>
                        )}
                        {company.isFeatured && (
                          <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800">
                            مميز
                          </Badge>
                        )}
                      </div>
                    </div>
                    {company.mainImage && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={company.mainImage}
                          alt={company.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {company.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {company.description}
                    </p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-semibold">{company.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({company.reviewsCount} مراجعة)
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {company.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{company.phone}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="h-4 w-4" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer nofollow"
                          className="text-blue-600 hover:underline"
                        >
                          الموقع الإلكتروني
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link 
                    href={`/${company.slug}`}
                    className="w-full"
                  >
                    <Button className="w-full" variant="outline">
                      <Building2 className="h-4 w-4 ml-2" />
                      عرض التفاصيل
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              لا توجد شركات
            </h3>
            <p className="text-gray-600">
              لم يتم العثور على شركات تطابق معايير البحث
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

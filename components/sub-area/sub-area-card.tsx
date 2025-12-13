'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Building2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface SubAreaCardProps {
  subArea: {
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
  }
  showCity?: boolean
  showCountry?: boolean
}

export function SubAreaCard({ 
  subArea, 
  showCity = true, 
  showCountry = true 
}: SubAreaCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {subArea.name}
            </CardTitle>
            
            {/* Location Info */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>
                {showCountry && subArea.country.name}
                {showCountry && showCity && ' - '}
                {showCity && subArea.city.name}
              </span>
            </div>

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
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={subArea.image}
                alt={subArea.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Link 
          href={`/country/${subArea.country.code}/city/${subArea.city.slug}/sub-area/${subArea.slug}`}
          className="w-full"
        >
          <Button className="w-full group-hover:bg-blue-600 transition-colors">
            <ArrowLeft className="h-4 w-4 ml-2" />
            عرض المنطقة
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

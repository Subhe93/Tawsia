'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Building2, Star, Users, Phone, Globe } from 'lucide-react'
import Image from 'next/image'

interface SubAreaHeroProps {
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
}

export function SubAreaHero({ subArea }: SubAreaHeroProps) {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      {/* Background Image */}
      {subArea.image && (
        <div className="absolute inset-0">
          <Image
            src={subArea.image}
            alt={subArea.name}
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-100">
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {subArea.country.name} - {subArea.city.name}
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold">
                {subArea.name}
              </h1>
              
              {subArea.description && (
                <p className="text-xl text-blue-100 leading-relaxed">
                  {subArea.description}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <Building2 className="h-5 w-5" />
                <span className="font-semibold">
                  {subArea._count?.companies || 0} مرتبط
                </span>
              </div>
              
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                منطقة فرعية
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  const companiesSection = document.getElementById('companies-section')
                  companiesSection?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <Building2 className="h-5 w-5 ml-2" />
                عرض الكل
              </Button>
              
              <Button 
                size="lg" 
                variant="default" 
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => {
                  const mapSection = document.getElementById('map-section')
                  mapSection?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <MapPin className="h-5 w-5 ml-2" />
                عرض الخريطة
              </Button>
            </div>
          </div>

          {/* Image or Map Placeholder */}
          <div className="relative">
            {subArea.image ? (
              <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={subArea.image}
                  alt={subArea.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-80 lg:h-96 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MapPin className="h-16 w-16 mx-auto text-white/60" />
                  <p className="text-white/80">خريطة المنطقة</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'

interface SubAreaMapProps {
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
    companies: Array<{
      id: string
      name: string
      latitude?: number
      longitude?: number
    }>
  }
}

export function SubAreaMap({ subArea }: SubAreaMapProps) {
  // فلترة الشركات التي لديها إحداثيات
  const companiesWithLocation = subArea.companies.filter(
    company => company.latitude && company.longitude
  )

  // حساب الإحداثيات الوسطى للمنطقة
  const centerLat = companiesWithLocation.length > 0 
    ? companiesWithLocation.reduce((sum, c) => sum + (c.latitude || 0), 0) / companiesWithLocation.length
    : 33.5138 // دمشق كإحداثيات افتراضية

  const centerLng = companiesWithLocation.length > 0 
    ? companiesWithLocation.reduce((sum, c) => sum + (c.longitude || 0), 0) / companiesWithLocation.length
    : 36.2765 // دمشق كإحداثيات افتراضية

  // إنشاء رابط Google Maps
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${centerLat},${centerLng}&query_place_id=${subArea.name}`
  
  // إنشاء رابط OpenStreetMap
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${centerLat}&mlon=${centerLng}&zoom=15`

  return (
    <div id="map-section" className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            موقع {subArea.name}
          </h2>
          <p className="text-lg text-gray-600">
            اكتشف موقع المنطقة والشركات على الخريطة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  معلومات الموقع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">المنطقة</h4>
                  <p className="text-gray-600">{subArea.name}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">المدينة</h4>
                  <p className="text-gray-600">{subArea.city.name}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">البلد</h4>
                  <p className="text-gray-600">{subArea.country.name}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">الشركات على الخريطة</h4>
                  <p className="text-gray-600">{companiesWithLocation.length} شركة</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button 
                    className="w-full" 
                    onClick={() => window.open(googleMapsUrl, '_blank')}
                  >
                    <Navigation className="h-4 w-4 ml-2" />
                    فتح في خرائط جوجل
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(openStreetMapUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 ml-2" />
                    فتح في OpenStreetMap
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Placeholder */}
          <div className="lg:col-span-2">
            <Card className="h-96">
              <CardContent className="p-0 h-full">
                <div className="relative h-full bg-gray-100 rounded-lg overflow-hidden">
                  {/* Map Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <MapPin className="h-16 w-16 mx-auto text-gray-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          خريطة {subArea.name}
                        </h3>
                        <p className="text-gray-600">
                          {companiesWithLocation.length > 0 
                            ? `${companiesWithLocation.length} شركة على الخريطة`
                            : 'لا توجد شركات بمواقع محددة'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Map Overlay */}
                  <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">المنطقة</span>
                    </div>
                  </div>

                  {/* Companies Count Overlay */}
                  {companiesWithLocation.length > 0 && (
                    <div className="absolute bottom-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg p-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {companiesWithLocation.length} شركة
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Companies List */}
        {companiesWithLocation.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              الشركات على الخريطة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companiesWithLocation.map((company) => (
                <div key={company.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">{company.name}</h4>
                      <p className="text-sm text-gray-600">
                        {company.latitude?.toFixed(4)}, {company.longitude?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

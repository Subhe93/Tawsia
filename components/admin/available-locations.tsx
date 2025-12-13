'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Flag, Copy, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface Country {
  id: string
  name: string
  code: string
  flag: string
}

interface City {
  id: string
  name: string
  slug: string
  countryId: string
  countryCode: string
}

interface AvailableLocationsProps {
  onLocationSelect?: (location: { country: Country, city: City }) => void
}

export function AvailableLocations({ onLocationSelect }: AvailableLocationsProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  useEffect(() => {
    fetchLocations()
  }, [])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filteredCountriesResult = countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCountries(filteredCountriesResult)

      const filteredCitiesResult = cities.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.slug.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCities(filteredCitiesResult)
    } else {
      setFilteredCountries(countries)
      setFilteredCities(cities)
    }
  }, [searchTerm, countries, cities])

  useEffect(() => {
    if (selectedCountry) {
      const countryCities = cities.filter(city => city.countryId === selectedCountry)
      setFilteredCities(countryCities)
    } else {
      setFilteredCities(cities)
    }
  }, [selectedCountry, cities])

  const fetchLocations = async () => {
    try {
      setIsLoading(true)
      
      // جلب الدول
      const countriesResponse = await fetch('/api/admin/locations/countries')
      if (countriesResponse.ok) {
        const countriesData = await countriesResponse.json()
        setCountries(countriesData.countries || [])
        setFilteredCountries(countriesData.countries || [])
      }

      // جلب المدن
      const citiesResponse = await fetch('/api/admin/locations/cities')
      if (citiesResponse.ok) {
        const citiesData = await citiesResponse.json()
        setCities(citiesData.cities || [])
        setFilteredCities(citiesData.cities || [])
      }
    } catch (error) {
      console.error('خطأ في جلب المواقع:', error)
      toast.error('فشل في جلب المواقع المتاحة')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(text)
      toast.success(`تم نسخ ${type}`, {
        description: `"${text}" تم نسخه إلى الحافظة`,
        duration: 2000
      })
      
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (error) {
      toast.error('فشل في نسخ النص')
    }
  }

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country.id)
    setSearchTerm('')
  }

  const handleCitySelect = (city: City) => {
    const country = countries.find(c => c.id === city.countryId)
    if (country && onLocationSelect) {
      onLocationSelect({ country, city })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            المواقع المتاحة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">جاري تحميل المواقع...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          المواقع المتاحة
          <Badge variant="secondary">{countries.length} دولة</Badge>
          <Badge variant="outline">{cities.length} مدينة</Badge>
        </CardTitle>
        <CardDescription>
          استخدم هذه الأسماء تماماً في أعمدة "الدولة" و "المدينة" في ملف CSV للحصول على مطابقة دقيقة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* شريط البحث */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث في الدول والمدن..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* التبويبات */}
        <Tabs defaultValue="countries" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="countries" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              الدول ({filteredCountries.length})
            </TabsTrigger>
            <TabsTrigger value="cities" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              المدن ({filteredCities.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="countries" className="space-y-4">
            <ScrollArea className="h-64 w-full">
              <div className="space-y-2">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <div
                      key={country.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{country.flag}</span>
                        <div>
                          <div className="font-medium text-sm">{country.name}</div>
                          <div className="text-xs text-gray-500">{country.code.toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(country.name, 'الدولة')}
                          className="h-8 w-8 p-0"
                        >
                          {copiedItem === country.name ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCountrySelect(country)}
                          className="text-xs px-2 py-1 h-6"
                        >
                          اختر
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'لا توجد دول مطابقة للبحث' : 'لا توجد دول متاحة'}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="cities" className="space-y-4">
            {selectedCountry && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  📍 عرض مدن الدولة المحددة: {countries.find(c => c.id === selectedCountry)?.name}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedCountry(null)}
                  className="mt-2"
                >
                  عرض جميع المدن
                </Button>
              </div>
            )}
            
            <ScrollArea className="h-64 w-full">
              <div className="space-y-2">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => {
                    const country = countries.find(c => c.id === city.countryId)
                    return (
                      <div
                        key={city.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-sm">{city.name}</div>
                            <div className="text-xs text-gray-500">
                              {country?.name} ({city.countryCode.toUpperCase()})
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(city.name, 'المدينة')}
                            className="h-8 w-8 p-0"
                          >
                            {copiedItem === city.name ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          {onLocationSelect && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCitySelect(city)}
                              className="text-xs px-2 py-1 h-6"
                            >
                              اختر
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'لا توجد مدن مطابقة للبحث' : 'لا توجد مدن متاحة'}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* نصائح */}
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <h4 className="font-medium text-sm mb-2">💡 نصائح للمطابقة:</h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• استخدم أعمدة منفصلة للدولة والمدينة في ملف CSV</li>
            <li>• انسخ الاسم تماماً كما هو مكتوب</li>
            <li>• يمكن تجاهل حالة الأحرف (كبيرة/صغيرة)</li>
            <li>• في حالة عدم المطابقة، ستُنشأ دولة/مدينة جديدة</li>
            <li>• استخدم البحث للعثور على الموقع المناسب</li>
          </ul>
        </div>

        {/* إحصائيات */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>إجمالي الدول: {countries.length}</span>
          <span>إجمالي المدن: {cities.length}</span>
          <span>المعروضة: {filteredCountries.length + filteredCities.length}</span>
        </div>
      </CardContent>
    </Card>
  )
}

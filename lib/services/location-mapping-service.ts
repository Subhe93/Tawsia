import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface LocationResult {
  country: {
    id: string
    code: string
    name: string
  }
  city: {
    id: string
    slug: string
    name: string
  }
}

export class LocationMappingService {
  // قاموس المدن السورية والعربية
  private cityMappings: { [key: string]: { country: string, city: string, slug: string } } = {
    // سوريا
    'damascus': { country: 'sy', city: 'دمشق', slug: 'damascus' },
    'دمشق': { country: 'sy', city: 'دمشق', slug: 'damascus' },
    'aleppo': { country: 'sy', city: 'حلب', slug: 'aleppo' },
    'حلب': { country: 'sy', city: 'حلب', slug: 'aleppo' },
    'homs': { country: 'sy', city: 'حمص', slug: 'homs' },
    'حمص': { country: 'sy', city: 'حمص', slug: 'homs' },
    'lattakia': { country: 'sy', city: 'اللاذقية', slug: 'lattakia' },
    'اللاذقية': { country: 'sy', city: 'اللاذقية', slug: 'lattakia' },
    'tartous': { country: 'sy', city: 'طرطوس', slug: 'tartous' },
    'طرطوس': { country: 'sy', city: 'طرطوس', slug: 'tartous' },
    'daraa': { country: 'sy', city: 'درعا', slug: 'daraa' },
    'درعا': { country: 'sy', city: 'درعا', slug: 'daraa' },
    'deir ez-zor': { country: 'sy', city: 'دير الزور', slug: 'deir-ez-zor' },
    'دير الزور': { country: 'sy', city: 'دير الزور', slug: 'deir-ez-zor' },
    'hasaka': { country: 'sy', city: 'الحسكة', slug: 'hasaka' },
    'الحسكة': { country: 'sy', city: 'الحسكة', slug: 'hasaka' },
    'qamishli': { country: 'sy', city: 'القامشلي', slug: 'qamishli' },
    'القامشلي': { country: 'sy', city: 'القامشلي', slug: 'qamishli' },
    'raqqa': { country: 'sy', city: 'الرقة', slug: 'raqqa' },
    'الرقة': { country: 'sy', city: 'الرقة', slug: 'raqqa' },

    // لبنان
    'beirut': { country: 'lb', city: 'بيروت', slug: 'beirut' },
    'بيروت': { country: 'lb', city: 'بيروت', slug: 'beirut' },
    'tripoli': { country: 'lb', city: 'طرابلس', slug: 'tripoli-lebanon' },
    'طرابلس': { country: 'lb', city: 'طرابلس', slug: 'tripoli-lebanon' },
    'sidon': { country: 'lb', city: 'صيدا', slug: 'sidon' },
    'صيدا': { country: 'lb', city: 'صيدا', slug: 'sidon' },
    'tyre': { country: 'lb', city: 'صور', slug: 'tyre' },
    'صور': { country: 'lb', city: 'صور', slug: 'tyre' },
    'zahle': { country: 'lb', city: 'زحلة', slug: 'zahle' },
    'زحلة': { country: 'lb', city: 'زحلة', slug: 'zahle' },

    // الأردن
    'amman': { country: 'jo', city: 'عمان', slug: 'amman' },
    'عمان': { country: 'jo', city: 'عمان', slug: 'amman' },
    'zarqa': { country: 'jo', city: 'الزرقاء', slug: 'zarqa' },
    'الزرقاء': { country: 'jo', city: 'الزرقاء', slug: 'zarqa' },
    'irbid': { country: 'jo', city: 'إربد', slug: 'irbid' },
    'إربد': { country: 'jo', city: 'إربد', slug: 'irbid' },
    'aqaba': { country: 'jo', city: 'العقبة', slug: 'aqaba' },
    'العقبة': { country: 'jo', city: 'العقبة', slug: 'aqaba' },

    // مصر
    'cairo': { country: 'eg', city: 'القاهرة', slug: 'cairo' },
    'القاهرة': { country: 'eg', city: 'القاهرة', slug: 'cairo' },
    'alexandria': { country: 'eg', city: 'الإسكندرية', slug: 'alexandria' },
    'الإسكندرية': { country: 'eg', city: 'الإسكندرية', slug: 'alexandria' },
    'giza': { country: 'eg', city: 'الجيزة', slug: 'giza' },
    'الجيزة': { country: 'eg', city: 'الجيزة', slug: 'giza' },
    'luxor': { country: 'eg', city: 'الأقصر', slug: 'luxor' },
    'الأقصر': { country: 'eg', city: 'الأقصر', slug: 'luxor' },
    'aswan': { country: 'eg', city: 'أسوان', slug: 'aswan' },
    'أسوان': { country: 'eg', city: 'أسوان', slug: 'aswan' }
  }

  // قاموس البلدان
  private countryMappings: { [key: string]: { code: string, name: string } } = {
    'syria': { code: 'sy', name: 'سوريا' },
    'سوريا': { code: 'sy', name: 'سوريا' },
    'lebanon': { code: 'lb', name: 'لبنان' },
    'لبنان': { code: 'lb', name: 'لبنان' },
    'jordan': { code: 'jo', name: 'الأردن' },
    'الأردن': { code: 'jo', name: 'الأردن' },
    'egypt': { code: 'eg', name: 'مصر' },
    'مصر': { code: 'eg', name: 'مصر' }
  }

  async mapLocation(address: string, createMissing: boolean = true): Promise<LocationResult | null> {
    if (!address || !address.trim()) {
      return null
    }

    const normalizedAddress = address.toLowerCase().trim()
    
    // محاولة استخراج المدينة والبلد من العنوان
    const locationInfo = this.parseAddress(normalizedAddress)
    
    if (!locationInfo) {
      return null
    }

    // البحث عن البلد
    const country = await this.findOrCreateCountry(locationInfo.countryCode, createMissing)
    if (!country) {
      return null
    }

    // البحث عن المدينة
    const city = await this.findOrCreateCity(
      locationInfo.citySlug,
      locationInfo.cityName,
      country.id,
      locationInfo.countryCode,
      createMissing
    )
    
    if (!city) {
      return null
    }

    return {
      country: {
        id: country.id,
        code: country.code,
        name: country.name
      },
      city: {
        id: city.id,
        slug: city.slug,
        name: city.name
      }
    }
  }

  private parseAddress(address: string): { cityName: string, citySlug: string, countryCode: string } | null {
    // البحث عن مطابقة مباشرة في قاموس المدن
    for (const [key, mapping] of Object.entries(this.cityMappings)) {
      if (address.includes(key.toLowerCase())) {
        return {
          cityName: mapping.city,
          citySlug: mapping.slug,
          countryCode: mapping.country
        }
      }
    }

    // محاولة استخراج المعلومات من النص
    // البحث عن أنماط شائعة مثل "City, Country" أو "City Country"
    const patterns = [
      /([^,]+),\s*([^,]+)$/,  // "Damascus, Syria"
      /([^,]+)\s+([^,]+)$/,   // "Damascus Syria"
    ]

    for (const pattern of patterns) {
      const match = address.match(pattern)
      if (match) {
        const [, cityPart, countryPart] = match
        
        // البحث عن المدينة
        const cityMapping = this.findCityMapping(cityPart.trim())
        if (cityMapping) {
          return {
            cityName: cityMapping.city,
            citySlug: cityMapping.slug,
            countryCode: cityMapping.country
          }
        }

        // البحث عن البلد
        const countryMapping = this.findCountryMapping(countryPart.trim())
        if (countryMapping) {
          // محاولة تخمين المدينة بناءً على البلد
          const guessedCity = this.guessCityFromCountry(cityPart.trim(), countryMapping.code)
          if (guessedCity) {
            return guessedCity
          }
        }
      }
    }

    // إذا لم نجد مطابقة، نحاول البحث عن أي مدينة في النص
    for (const [key, mapping] of Object.entries(this.cityMappings)) {
      const words = address.split(/[\s,]+/)
      if (words.some(word => word === key.toLowerCase())) {
        return {
          cityName: mapping.city,
          citySlug: mapping.slug,
          countryCode: mapping.country
        }
      }
    }

    return null
  }

  private findCityMapping(cityName: string) {
    const normalized = cityName.toLowerCase().trim()
    return this.cityMappings[normalized]
  }

  private findCountryMapping(countryName: string) {
    const normalized = countryName.toLowerCase().trim()
    return this.countryMappings[normalized]
  }

  private guessCityFromCountry(cityName: string, countryCode: string): { cityName: string, citySlug: string, countryCode: string } | null {
    // قائمة بالمدن الرئيسية لكل بلد
    const mainCities: { [key: string]: string[] } = {
      'sy': ['damascus', 'aleppo', 'homs', 'lattakia'],
      'lb': ['beirut', 'tripoli', 'sidon', 'tyre'],
      'jo': ['amman', 'zarqa', 'irbid', 'aqaba'],
      'eg': ['cairo', 'alexandria', 'giza', 'luxor']
    }

    const cities = mainCities[countryCode] || []
    const normalized = cityName.toLowerCase().trim()

    // البحث عن أقرب مطابقة
    for (const city of cities) {
      const mapping = this.cityMappings[city]
      if (mapping && (normalized.includes(city) || city.includes(normalized))) {
        return {
          cityName: mapping.city,
          citySlug: mapping.slug,
          countryCode: mapping.country
        }
      }
    }

    // إذا لم نجد مطابقة، نستخدم العاصمة
    const capitals: { [key: string]: string } = {
      'sy': 'damascus',
      'lb': 'beirut',
      'jo': 'amman',
      'eg': 'cairo'
    }

    const capital = capitals[countryCode]
    if (capital && this.cityMappings[capital]) {
      const mapping = this.cityMappings[capital]
      return {
        cityName: mapping.city,
        citySlug: mapping.slug,
        countryCode: mapping.country
      }
    }

    return null
  }

  private async findOrCreateCountry(countryCode: string, createMissing: boolean) {
    // البحث عن البلد في قاعدة البيانات
    let country = await prisma.country.findUnique({
      where: { code: countryCode }
    })

    if (country) {
      return country
    }

    // إنشاء البلد إذا لم يكن موجوداً
    if (createMissing) {
      const countryInfo = this.getCountryInfo(countryCode)
      if (countryInfo) {
        country = await prisma.country.create({
          data: {
            code: countryCode,
            name: countryInfo.name,
            flag: countryInfo.flag,
            description: `دليل الشركات في ${countryInfo.name}`,
            companiesCount: 0
          }
        })
        return country
      }
    }

    return null
  }

  private async findOrCreateCity(
    citySlug: string,
    cityName: string,
    countryId: string,
    countryCode: string,
    createMissing: boolean
  ) {
    // البحث عن المدينة في قاعدة البيانات
    let city = await prisma.city.findUnique({
      where: { slug: citySlug }
    })

    if (city) {
      return city
    }

    // إنشاء المدينة إذا لم تكن موجودة
    if (createMissing) {
      city = await prisma.city.create({
        data: {
          slug: citySlug,
          name: cityName,
          countryId,
          countryCode,
          description: `دليل الشركات في ${cityName}`,
          companiesCount: 0
        }
      })
      return city
    }

    return null
  }

  private getCountryInfo(countryCode: string) {
    const countries: { [key: string]: { name: string, flag: string } } = {
      'sy': { name: 'سوريا', flag: '🇸🇾' },
      'lb': { name: 'لبنان', flag: '🇱🇧' },
      'jo': { name: 'الأردن', flag: '🇯🇴' },
      'eg': { name: 'مصر', flag: '🇪🇬' }
    }

    return countries[countryCode]
  }

  // إضافة مطابقة مدينة جديدة
  addCityMapping(key: string, mapping: { country: string, city: string, slug: string }) {
    this.cityMappings[key.toLowerCase()] = mapping
  }

  // الحصول على جميع البلدان المتاحة
  async getAllCountries() {
    return prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
  }

  // الحصول على مدن بلد معين
  async getCitiesByCountry(countryCode: string) {
    return prisma.city.findMany({
      where: { 
        countryCode,
        isActive: true 
      },
      orderBy: { name: 'asc' }
    })
  }

  // الحصول على إحصائيات المواقع
  async getLocationStats() {
    const countries = await prisma.country.findMany({
      include: {
        _count: {
          select: { 
            companies: true,
            cities: true
          }
        }
      }
    })

    return countries.map(country => ({
      ...country,
      companiesCount: country._count.companies,
      citiesCount: country._count.cities
    }))
  }
}

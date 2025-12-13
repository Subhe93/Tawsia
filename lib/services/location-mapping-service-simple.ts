import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class LocationMappingService {
  private existingCountries: any[] = []
  private existingCities: any[] = []
  private countriesLoaded = false
  private citiesLoaded = false

  // تحميل جميع الدول الموجودة
  private async loadExistingCountries() {
    if (!this.countriesLoaded) {
      this.existingCountries = await prisma.country.findMany({
        select: { id: true, name: true, code: true, flag: true }
      })
      this.countriesLoaded = true
      console.log(`تم تحميل ${this.existingCountries.length} دولة من قاعدة البيانات`)
    }
  }

  // تحميل جميع المدن الموجودة
  private async loadExistingCities() {
    if (!this.citiesLoaded) {
      this.existingCities = await prisma.city.findMany({
        select: { id: true, name: true, slug: true, countryId: true, countryCode: true }
      })
      this.citiesLoaded = true
      console.log(`تم تحميل ${this.existingCities.length} مدينة من قاعدة البيانات`)
    }
  }

  // مطابقة الدولة
  async mapCountry(countryName: string, createMissing: boolean = true) {
    if (!countryName) return null

    await this.loadExistingCountries()
    const trimmedName = countryName.trim()
    console.log(`محاولة مطابقة الدولة: "${trimmedName}"`)

    // البحث الأول: مطابقة دقيقة
    let matchedCountry = this.existingCountries.find(country => 
      country.name === trimmedName
    )

    if (matchedCountry) {
      console.log(`✅ مطابقة دولة دقيقة: "${trimmedName}" -> "${matchedCountry.name}"`)
      return matchedCountry
    }

    // البحث الثاني: مطابقة مع تجاهل حالة الأحرف
    matchedCountry = this.existingCountries.find(country => 
      country.name.toLowerCase() === trimmedName.toLowerCase()
    )

    if (matchedCountry) {
      console.log(`✅ مطابقة دولة مع تجاهل الأحرف: "${trimmedName}" -> "${matchedCountry.name}"`)
      return matchedCountry
    }

    // البحث الثالث: مطابقة جزئية
    matchedCountry = this.existingCountries.find(country => 
      country.name.toLowerCase().includes(trimmedName.toLowerCase()) ||
      trimmedName.toLowerCase().includes(country.name.toLowerCase())
    )

    if (matchedCountry) {
      console.log(`✅ مطابقة دولة جزئية: "${trimmedName}" -> "${matchedCountry.name}"`)
      return matchedCountry
    }

    // إنشاء دولة جديدة
    if (createMissing) {
      const countryCode = this.generateCountryCode(trimmedName)
      const newCountry = await prisma.country.create({
        data: {
          code: countryCode,
          name: trimmedName,
          flag: '🏳️',
          description: `دليل الشركات في ${trimmedName}`,
          companiesCount: 0
        }
      })
      console.log(`تم إنشاء دولة جديدة: "${trimmedName}"`)
      return newCountry
    }

    console.log(`لم يتم العثور على دولة مطابقة لـ: "${trimmedName}"`)
    return null
  }

  // مطابقة المدينة
  async mapCity(cityName: string, countryId: string, createMissing: boolean = true) {
    if (!cityName || !countryId) return null

    await this.loadExistingCities()
    const trimmedName = cityName.trim()
    console.log(`محاولة مطابقة المدينة: "${trimmedName}" في الدولة ${countryId}`)

    // البحث الأول: مطابقة دقيقة في نفس الدولة
    let matchedCity = this.existingCities.find(city => 
      city.name === trimmedName && city.countryId === countryId
    )

    if (matchedCity) {
      console.log(`✅ مطابقة مدينة دقيقة: "${trimmedName}" -> "${matchedCity.name}"`)
      return matchedCity
    }

    // البحث الثاني: مطابقة مع تجاهل حالة الأحرف
    matchedCity = this.existingCities.find(city => 
      city.name.toLowerCase() === trimmedName.toLowerCase() && city.countryId === countryId
    )

    if (matchedCity) {
      console.log(`✅ مطابقة مدينة مع تجاهل الأحرف: "${trimmedName}" -> "${matchedCity.name}"`)
      return matchedCity
    }

    // البحث الثالث: مطابقة جزئية
    matchedCity = this.existingCities.find(city => 
      (city.name.toLowerCase().includes(trimmedName.toLowerCase()) ||
       trimmedName.toLowerCase().includes(city.name.toLowerCase())) &&
      city.countryId === countryId
    )

    if (matchedCity) {
      console.log(`✅ مطابقة مدينة جزئية: "${trimmedName}" -> "${matchedCity.name}"`)
      return matchedCity
    }

    // إنشاء مدينة جديدة
    if (createMissing) {
      const citySlug = this.generateSlugFromName(trimmedName)
      const country = await prisma.country.findUnique({ where: { id: countryId } })
      
      const newCity = await prisma.city.create({
        data: {
          slug: citySlug,
          name: trimmedName,
          countryId: countryId,
          countryCode: country?.code || 'xx',
          description: `مدينة ${trimmedName}`,
          companiesCount: 0
        }
      })
      console.log(`تم إنشاء مدينة جديدة: "${trimmedName}"`)
      return newCity
    }

    console.log(`لم يتم العثور على مدينة مطابقة لـ: "${trimmedName}"`)
    return null
  }

  // دالة قديمة للتوافق مع الكود الموجود
  async mapLocation(address: string, createMissing: boolean = true) {
    if (!address) return null

    // البحث عن سوريا ودمشق كافتراضي
    let country = await prisma.country.findUnique({
      where: { code: 'sy' }
    })

    if (!country && createMissing) {
      country = await prisma.country.create({
        data: {
          code: 'sy',
          name: 'سوريا',
          flag: '🇸🇾',
          description: 'دليل الشركات في سوريا',
          companiesCount: 0
        }
      })
    }

    if (!country) return null

    // البحث عن دمشق
    let city = await prisma.city.findUnique({
      where: { slug: 'damascus' }
    })

    if (!city && createMissing) {
      city = await prisma.city.create({
        data: {
          slug: 'damascus',
          name: 'دمشق',
          countryId: country.id,
          countryCode: 'sy',
          description: 'عاصمة سوريا',
          companiesCount: 0
        }
      })
    }

    if (!city) return null

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

  // دالة جديدة لمطابقة الدولة والمدينة منفصلتين
  async mapCountryAndCity(countryName: string, cityName: string, createMissing: boolean = true) {
    const country = await this.mapCountry(countryName, createMissing)
    if (!country) return null

    const city = await this.mapCity(cityName, country.id, createMissing)
    if (!city) return null

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

  private generateCountryCode(countryName: string): string {
    // تحويل اسم الدولة إلى كود مكون من حرفين
    const arabicToEnglish: { [key: string]: string } = {
      'سوريا': 'sy',
      'الأردن': 'jo',
      'السعودية': 'sa',
      'الإمارات': 'ae',
      'لبنان': 'lb',
      'العراق': 'iq',
      'مصر': 'eg',
      'الكويت': 'kw',
      'قطر': 'qa',
      'البحرين': 'bh',
      'عمان': 'om',
      'اليمن': 'ye'
    }

    const normalized = countryName.toLowerCase().trim()
    return arabicToEnglish[normalized] || normalized.substring(0, 2).toLowerCase()
  }

  private generateSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-\u0600-\u06FF]/g, '')
      .replace(/\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '') || 'city'
  }

  // دوال مساعدة
  async getAllCountries() {
    await this.loadExistingCountries()
    return this.existingCountries
  }

  async getAllCities() {
    await this.loadExistingCities()
    return this.existingCities
  }

  async searchCountries(searchTerm: string) {
    await this.loadExistingCountries()
    const term = searchTerm.toLowerCase().trim()
    
    return this.existingCountries.filter(country => 
      country.name.toLowerCase().includes(term) ||
      country.code.toLowerCase().includes(term)
    )
  }

  async searchCities(searchTerm: string, countryId?: string) {
    await this.loadExistingCities()
    const term = searchTerm.toLowerCase().trim()
    
    return this.existingCities.filter(city => 
      (city.name.toLowerCase().includes(term) ||
       city.slug.toLowerCase().includes(term)) &&
      (!countryId || city.countryId === countryId)
    )
  }

  // مطابقة المنطقة الفرعية
  private existingSubAreas: any[] = []
  private subAreasLoaded = false

  // تحميل جميع المناطق الفرعية الموجودة
  private async loadExistingSubAreas() {
    if (!this.subAreasLoaded) {
      this.existingSubAreas = await prisma.subArea.findMany({
        select: { id: true, name: true, slug: true, cityId: true, countryId: true, cityCode: true, countryCode: true }
      })
      this.subAreasLoaded = true
      console.log(`تم تحميل ${this.existingSubAreas.length} منطقة فرعية من قاعدة البيانات`)
    }
  }

  // مطابقة المنطقة الفرعية
  async mapSubArea(subAreaName: string, cityId: string, countryId: string, createMissing: boolean = true) {
    if (!subAreaName || !cityId || !countryId) return null

    await this.loadExistingSubAreas()
    const trimmedName = subAreaName.trim()
    console.log(`محاولة مطابقة المنطقة الفرعية: "${trimmedName}" في المدينة ${cityId}`)

    // البحث الأول: مطابقة دقيقة في نفس المدينة
    let matchedSubArea = this.existingSubAreas.find(subArea => 
      subArea.name === trimmedName && subArea.cityId === cityId
    )

    if (matchedSubArea) {
      console.log(`✅ مطابقة منطقة فرعية دقيقة: "${trimmedName}" -> "${matchedSubArea.name}"`)
      return matchedSubArea
    }

    // البحث الثاني: مطابقة مع تجاهل حالة الأحرف
    matchedSubArea = this.existingSubAreas.find(subArea => 
      subArea.name.toLowerCase() === trimmedName.toLowerCase() && subArea.cityId === cityId
    )

    if (matchedSubArea) {
      console.log(`✅ مطابقة منطقة فرعية مع تجاهل الأحرف: "${trimmedName}" -> "${matchedSubArea.name}"`)
      return matchedSubArea
    }

    // البحث الثالث: مطابقة جزئية
    matchedSubArea = this.existingSubAreas.find(subArea => 
      (subArea.name.toLowerCase().includes(trimmedName.toLowerCase()) ||
       trimmedName.toLowerCase().includes(subArea.name.toLowerCase())) &&
      subArea.cityId === cityId
    )

    if (matchedSubArea) {
      console.log(`✅ مطابقة منطقة فرعية جزئية: "${trimmedName}" -> "${matchedSubArea.name}"`)
      return matchedSubArea
    }

    // إنشاء منطقة فرعية جديدة
    if (createMissing) {
      const subAreaSlug = this.generateSlugFromName(trimmedName)
      const city = await prisma.city.findUnique({ where: { id: cityId } })
      const country = await prisma.country.findUnique({ where: { id: countryId } })
      
      const newSubArea = await prisma.subArea.create({
        data: {
          slug: subAreaSlug,
          name: trimmedName,
          cityId: cityId,
          cityCode: city?.slug || 'xx',
          countryId: countryId,
          countryCode: country?.code || 'xx',
          description: `منطقة ${trimmedName}`,
          companiesCount: 0
        }
      })
      console.log(`تم إنشاء منطقة فرعية جديدة: "${trimmedName}"`)
      return newSubArea
    }

    console.log(`لم يتم العثور على منطقة فرعية مطابقة لـ: "${trimmedName}"`)
    return null
  }

  async getAllSubAreas() {
    await this.loadExistingSubAreas()
    return this.existingSubAreas
  }

  async searchSubAreas(searchTerm: string, cityId?: string) {
    await this.loadExistingSubAreas()
    const term = searchTerm.toLowerCase().trim()
    
    return this.existingSubAreas.filter(subArea => 
      (subArea.name.toLowerCase().includes(term) ||
       subArea.slug.toLowerCase().includes(term)) &&
      (!cityId || subArea.cityId === cityId)
    )
  }
}

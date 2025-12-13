'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  Save, 
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Clock,
  Star,
  Image as ImageIcon,
  Plus,
  X,
  Tag
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { DAYS_OF_WEEK_ARABIC, ALL_DAYS_OF_WEEK } from '@/lib/types/working-hours'
import { WorkingHoursEditor, WorkingHourData } from '@/components/working-hours-editor'
import Link from 'next/link'

interface Country {
  id: string
  code: string
  name: string
  flag?: string
}

interface City {
  id: string
  name: string
  slug: string
  countryId: string
}

interface SubArea {
  id: string
  name: string
  slug: string
  cityId: string
  countryId: string
}

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
}

interface SubCategory {
  id: string;
  name: string;
}

export default function AddCompanyPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [subAreas, setSubAreas] = useState<SubArea[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const { data: session, status } = useSession()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    longDescription: '',
    categoryId: '',
    subCategoryId: '',
    countryId: '',
    cityId: '',
    subAreaId: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    mainImage: '',
    logoImage: '',
    latitude: '',
    longitude: '',
    services: [] as string[],
    specialties: [] as string[],
    isVerified: false,
    isFeatured: false,
  })

  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState<string | null>(null)

  const [workingHours, setWorkingHours] = useState<Record<string, { openTime: string; closeTime: string; isClosed: boolean }>>({
    الأحد: { openTime: '09:00', closeTime: '17:00', isClosed: false },
    الاثنين: { openTime: '09:00', closeTime: '17:00', isClosed: false },
    الثلاثاء: { openTime: '09:00', closeTime: '17:00', isClosed: false },
    الأربعاء: { openTime: '09:00', closeTime: '17:00', isClosed: false },
    الخميس: { openTime: '09:00', closeTime: '17:00', isClosed: false },
    الجمعة: { openTime: '', closeTime: '', isClosed: true },
    السبت: { openTime: '09:00', closeTime: '17:00', isClosed: false },
  })

  const [socialMedia, setSocialMedia] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
  })

  const [newService, setNewService] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')

  // دالة رفع الصور
  const uploadImage = async (file: File, imageType: string): Promise<string> => {
    setUploadingImage(imageType)
    try {
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('type', imageType)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      })
      
      if (!response.ok) {
        throw new Error('فشل في رفع الصورة')
      }
      
      const result = await response.json()
      console.log('نتيجة رفع الصورة:', result)
      toast.success('تم رفع الصورة بنجاح', {
        description: `تم رفع ${imageType === 'main' ? 'الصورة الرئيسية' : imageType === 'logo' ? 'اللوغو' : 'الصورة'} بنجاح.`,
        duration: 3000,
      })
      return result.url
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error)
      toast.error('فشل في رفع الصورة', {
        description: `تعذر رفع ${imageType === 'main' ? 'الصورة الرئيسية' : imageType === 'logo' ? 'اللوغو' : 'الصورة'}. يرجى التحقق من حجم الصورة والمحاولة مرة أخرى.`,
        duration: 4000,
      })
      throw error
    } finally {
      setUploadingImage(null)
    }
  }

  // دالة تحديث الصورة في formData
  const updateImageField = (imageType: 'main' | 'logo', imageUrl: string) => {
    console.log(`تحديث ${imageType} بالرابط:`, imageUrl)
    if (imageType === 'main') {
      setFormData(prev => ({ ...prev, mainImage: imageUrl }))
      toast.success('تم تحديث الصورة الرئيسية', {
        description: 'تم تحديث رابط الصورة الرئيسية في الحقل النصي.',
        duration: 2000,
      })
    } else if (imageType === 'logo') {
      setFormData(prev => ({ ...prev, logoImage: imageUrl }))
      toast.success('تم تحديث اللوغو', {
        description: 'تم تحديث رابط اللوغو في الحقل النصي.',
        duration: 2000,
      })
    }
  }

  // جلب البيانات المساعدة
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, categoriesRes] = await Promise.all([
          fetch('/api/admin/countries?activeOnly=true'),
          fetch('/api/admin/categories?activeOnly=true')
        ])

        if (countriesRes.ok) {
          const countriesData = await countriesRes.json()
          console.log('Countries loaded:', countriesData?.countries?.length || 0)
          setCountries(countriesData.countries || [])
        } else {
          console.error('Failed to load countries:', countriesRes.status)
          toast.error('فشل في تحميل البلدان', {
            description: `رمز الخطأ: ${countriesRes.status}. يرجى المحاولة مرة أخرى.`,
            duration: 4000,
          })
          setCountries([])
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          console.log('Categories loaded:', categoriesData?.categories?.length || 0)
          setCategories(categoriesData.categories || [])
        } else {
          console.error('Failed to load categories:', categoriesRes.status)
          toast.error('فشل في تحميل الفئات', {
            description: `رمز الخطأ: ${categoriesRes.status}. يرجى المحاولة مرة أخرى.`,
            duration: 4000,
          })
          setCategories([])
        }
      } catch (error) {
        console.error('خطأ في جلب البيانات:', error)
        toast.error('خطأ في الاتصال بالخادم', {
          description: 'تعذر تحميل البيانات الأساسية. يرجى التحقق من اتصالك بالإنترنت.',
          duration: 5000,
        })
      }
    }

    if (session) {
      fetchData()
    }
  }, [session])

  // جلب المدن عند تغيير البلد
  useEffect(() => {
    const fetchCities = async () => {
      if (formData.countryId) {
        try {
          const response = await fetch(`/api/admin/countries/${formData.countryId}/cities`)
          if (response.ok) {
            const citiesData = await response.json()
            console.log('Cities loaded for country:', formData.countryId, citiesData?.length || 0)
            setCities(Array.isArray(citiesData) ? citiesData : [])
          } else {
            console.error('Failed to load cities:', response.status)
            toast.error('فشل في تحميل المدن', {
              description: `رمز الخطأ: ${response.status}. يرجى المحاولة مرة أخرى.`,
              duration: 4000,
            })
            setCities([])
          }
        } catch (error) {
          console.error('خطأ في جلب المدن:', error)
          toast.error('خطأ في الاتصال بالخادم', {
            description: 'تعذر تحميل مدن البلد المحدد. يرجى المحاولة مرة أخرى.',
            duration: 4000,
          })
        }
      } else {
        setCities([])
        setFormData(prev => ({ ...prev, cityId: '' }))
      }
    }

    fetchCities()
  }, [formData.countryId])

  // جلب المناطق الفرعية عند تغيير المدينة
  useEffect(() => {
    const fetchSubAreas = async () => {
      if (formData.cityId) {
        try {
          const response = await fetch(`/api/admin/sub-areas/by-city/${formData.cityId}`, {
            credentials: 'include'
          })
          if (response.ok) {
            const data = await response.json()
            console.log('SubAreas loaded for city:', formData.cityId, data?.length || 0)
            setSubAreas(Array.isArray(data) ? data : [])
          } else {
            console.error('Failed to load sub-areas:', response.status)
            toast.error('فشل في تحميل المناطق الفرعية', {
              description: `رمز الخطأ: ${response.status}. يرجى المحاولة مرة أخرى.`,
              duration: 4000,
            })
            setSubAreas([])
          }
        } catch (error) {
          console.error('خطأ في جلب المناطق الفرعية:', error)
          toast.error('خطأ في الاتصال بالخادم', {
            description: 'تعذر تحميل المناطق الفرعية للمدينة المحددة. يرجى المحاولة مرة أخرى.',
            duration: 4000,
          })
        }
      } else {
        setSubAreas([])
        setFormData(prev => ({ ...prev, subAreaId: '' }))
      }
    }

    fetchSubAreas()
  }, [formData.cityId])

  // Fetch sub-categories when category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (formData.categoryId) {
        try {
          const response = await fetch(`/api/subcategories?categoryId=${formData.categoryId}`)
          if (response.ok) {
            const data = await response.json()
            setSubCategories(data.subCategories || [])
          } else {
            setSubCategories([])
          }
        } catch (error) {
          console.error('Failed to fetch sub-categories:', error)
          setSubCategories([])
        }
      } else {
        setSubCategories([])
      }
    }
    fetchSubCategories()
  }, [formData.categoryId])

  // دوال المساعدة
  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }))
      setNewService('')
    }
  }

  const removeService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service)
    }))
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }))
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // التحقق من البيانات المطلوبة
      if (!formData.name || !formData.slug || !formData.categoryId || !formData.countryId || !formData.cityId) {
        toast.error('حقول مطلوبة مفقودة', {
          description: 'يرجى ملء جميع الحقول المطلوبة: اسم الشركة، السلوغ، الفئة، البلد، والمدينة.',
          duration: 4000,
        })
        return
      }

      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
          additionalImages,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'خطأ في إضافة الشركة')
      }

      const company = await response.json()
      
      // إضافة الصور الإضافية إلى قاعدة البيانات
      if (additionalImages.length > 0) {
        const imagesData = additionalImages.map((imageUrl, index) => ({
          imageUrl,
          altText: `صورة ${company.name} ${index + 1}`,
          sortOrder: index
        }))

        await fetch(`/api/admin/companies/${company.id}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(imagesData)
        })
      }
      
      // إضافة ساعات العمل إذا تم تحديدها
      const workingHoursData = Object.entries(workingHours)
        .filter(([day, hours]) => !hours.isClosed && hours.openTime && hours.closeTime)
        .map(([day, hours]) => ({
          dayOfWeek: day,
          openTime: hours.openTime,
          closeTime: hours.closeTime,
          isClosed: false
        }))

      if (workingHoursData.length > 0) {
        await fetch(`/api/admin/companies/${company.id}/working-hours`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workingHoursData)
        })
      }

      // إضافة وسائل التواصل الاجتماعي إذا تم تحديدها
      const socialMediaData = Object.entries(socialMedia)
        .filter(([platform, url]) => url.trim())
        .map(([platform, url]) => ({ platform, url }))

      if (socialMediaData.length > 0) {
        await fetch(`/api/admin/companies/${company.id}/social-media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(socialMediaData)
        })
      }

      toast.success('تم إضافة الشركة بنجاح', {
        description: `الشركة "${formData.name}" تم إضافتها بنجاح وهي الآن ${formData.isVerified ? 'موثقة' : 'غير موثقة'} و${formData.isFeatured ? 'مميزة' : 'عادية'}.`,
        duration: 5000,
      })
      router.push('/admin/companies')
    } catch (error) {
      console.error('خطأ في إضافة الشركة:', error)
      toast.error('فشل في إضافة الشركة', {
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء إضافة الشركة. يرجى المحاولة مرة أخرى.',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <Link href="/admin/companies">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 rotate-180" />
            العودة
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            إضافة شركة جديدة
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إضافة شركة جديدة إلى المنصة
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* المعلومات الأساسية */}
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الأساسية</CardTitle>
                <CardDescription>البيانات الأساسية للشركة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم الشركة *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="شركة ABC للتقنية"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">رابط الشركة (Slug) *</Label>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      /[country]/city/[city]/company/
                    </span>
                    <Input
                      id="slug"
                      value={formData.slug || ''}
                      onChange={(e) => {
                        const value = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9\-]/g, '') // السماح بالأحرف الإنجليزية والأرقام والشرطات فقط
                          .replace(/\-+/g, '-') // استبدال عدة شرطات بشرطة واحدة
                          .replace(/^-+/, '') // إزالة الشرطات من البداية
                          .replace(/-+$/, ''); // إزالة الشرطات من النهاية
                        setFormData(prev => ({ ...prev, slug: value }))
                      }}
                      placeholder="abc-technology-company"
                      className="text-left flex-1"
                      dir="ltr"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (formData.name) {
                          // دالة بسيطة لتحويل الاسم العربي إلى سلوغ إنجليزي
                          const generateSlugFromName = (name: string) => {
                            const arabicToEnglish: { [key: string]: string } = {
                              'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa',
                              'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
                              'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
                              'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
                              'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
                              'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
                              'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
                              'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
                              'ة': 'h', 'ء': 'a', 'ئ': 'e', 'ؤ': 'o'
                            };
                            
                            let result = name.toLowerCase().trim();
                            
                            // تحويل "ال" التعريف
                            result = result.replace(/ال/g, 'al-');
                            
                            // تحويل الأحرف العربية
                            for (const [arabic, english] of Object.entries(arabicToEnglish)) {
                              const regex = new RegExp(arabic, 'g');
                              result = result.replace(regex, english);
                            }
                            
                            return result
                              .replace(/\s+/g, '-')
                              .replace(/[^\w\-]/g, '')
                              .replace(/\-+/g, '-')
                              .replace(/^-+/, '')
                              .replace(/-+$/, '') || 'company';
                          };
                          
                          const generatedSlug = generateSlugFromName(formData.name);
                          setFormData(prev => ({ ...prev, slug: generatedSlug }));
                        }
                      }}
                      disabled={!formData.name}
                      title="توليد السلوغ من اسم الشركة"
                    >
                      توليد
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط. سيتم استخدامه في رابط الشركة.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">وصف مختصر *</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف مختصر عن الشركة..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longDescription">وصف مفصل</Label>
                  <Textarea
                    id="longDescription"
                    value={formData.longDescription || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                    placeholder="وصف مفصل عن الشركة وخدماتها..."
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">الفئة *</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value, subCategoryId: '' }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={categories.length > 0 ? "اختر الفئة" : "جاري تحميل الفئات..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-gray-500">
                            جاري تحميل الفئات...
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subCategory">التصنيف الفرعي</Label>
                    <Select value={formData.subCategoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, subCategoryId: value }))} disabled={!formData.categoryId || subCategories.length === 0}>
                      <SelectTrigger>
                        <SelectValue placeholder={!formData.categoryId ? "اختر الفئة أولاً" : subCategories.length > 0 ? "اختر التصنيف الفرعي" : "لا توجد تصنيفات فرعية"} />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategories.map((subCategory) => (
                          <SelectItem key={subCategory.id} value={subCategory.id}>
                            {subCategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">البلد *</Label>
                    <Select value={formData.countryId} onValueChange={(value) => setFormData(prev => ({ ...prev, countryId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={countries.length > 0 ? "اختر البلد" : "جاري تحميل البلدان..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.length > 0 ? (
                          countries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              {country.flag && `${country.flag} `}{country.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-gray-500">
                            جاري تحميل البلدان...
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">المدينة *</Label>
                  <Select 
                    value={formData.cityId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, cityId: value, subAreaId: '' }))}
                    disabled={!formData.countryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !formData.countryId 
                          ? "اختر البلد أولاً" 
                          : cities.length > 0 
                            ? "اختر المدينة" 
                            : "جاري تحميل المدن..."
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.length > 0 ? (
                        cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          {!formData.countryId ? "اختر البلد أولاً" : "جاري تحميل المدن..."}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subArea">المنطقة الفرعية</Label>
                  <Select 
                    value={formData.subAreaId || "none"} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subAreaId: value === "none" ? "" : value }))}
                    disabled={!formData.cityId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !formData.cityId 
                          ? "اختر المدينة أولاً" 
                          : subAreas.length > 0 
                            ? "اختر المنطقة الفرعية (اختياري)" 
                            : "جاري تحميل المناطق الفرعية..."
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">لا يوجد</SelectItem>
                      {subAreas.length > 0 ? (
                        subAreas.map((subArea) => (
                          <SelectItem key={subArea.id} value={subArea.id}>
                            {subArea.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          {!formData.cityId ? "اختر المدينة أولاً" : "جاري تحميل المناطق الفرعية..."}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    اختياري - يمكن تحديد منطقة فرعية أكثر تحديداً داخل المدينة
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* معلومات التواصل */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات التواصل</CardTitle>
                <CardDescription>بيانات التواصل مع الشركة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                                      <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="الشارع، الحي، المدينة"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+963-11-1234567"
                      className="text-left"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="info@company.com"
                      className="text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">الموقع الإلكتروني</Label>
                                      <Input
                      id="website"
                      value={formData.website || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://company.com"
                      className="text-left"
                      dir="ltr"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">خط العرض</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                      placeholder="33.5138"
                      className="text-left"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">خط الطول</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                      placeholder="36.2765"
                      className="text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* الصور */}
            <Card>
              <CardHeader>
                <CardTitle>صور الشركة</CardTitle>
                <CardDescription>الصورة الرئيسية واللوغو والصور الإضافية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* الصورة الرئيسية */}
                <div className="border rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/50">
                  <h4 className="font-medium text-lg mb-4 flex items-center gap-2">
                    📸 الصورة الرئيسية
                    <span className="text-sm text-red-500">*</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="mainImageUrl">رابط الصورة</Label>
                      <Input
                        id="mainImageUrl"
                        value={formData.mainImage || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, mainImage: e.target.value }))}
                        placeholder="https://example.com/main-image.jpg"
                        className="text-left"
                        dir="ltr"
                      />
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-2 font-medium">أو</div>
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                console.log('بدء رفع الصورة الرئيسية:', file.name)
                                try {
                                  const imageUrl = await uploadImage(file, 'main')
                                  console.log('تم رفع الصورة الرئيسية:', imageUrl)
                                  updateImageField('main', imageUrl)
                                } catch (error) {
                                  console.error('خطأ في رفع الصورة:', error)
                                }
                              }
                            }}
                            className="w-full"
                            disabled={uploadingImage === 'main'}
                          />
                          {uploadingImage === 'main' && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded">
                              <div className="text-blue-600 text-sm font-medium">جاري الرفع...</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      {formData.mainImage ? (
                        <div className="relative">
                          <img
                            src={formData.mainImage}
                            alt="معاينة الصورة الرئيسية"
                            className="w-40 h-40 object-cover rounded-lg border-2 border-dashed border-gray-300"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -left-2 h-6 w-6 p-0 rounded-full"
                            onClick={() => setFormData(prev => ({ ...prev, mainImage: '' }))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <Building2 className="h-8 w-8 mx-auto mb-2" />
                            <div className="text-sm">الصورة الرئيسية</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* لوغو الشركة */}
                <div className="border rounded-lg p-4 bg-blue-50/50 dark:bg-blue-900/20">
                  <h4 className="font-medium text-lg mb-4 flex items-center gap-2">
                    🏢 لوغو الشركة
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="logoImageUrl">رابط اللوغو</Label>
                      <Input
                        id="logoImageUrl"
                        value={formData.logoImage || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, logoImage: e.target.value }))}
                        placeholder="https://example.com/logo.png"
                        className="text-left"
                        dir="ltr"
                      />
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-2 font-medium">أو</div>
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*,.svg"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                console.log('بدء رفع اللوغو:', file.name)
                                try {
                                  const imageUrl = await uploadImage(file, 'logo')
                                  console.log('تم رفع اللوغو:', imageUrl)
                                  updateImageField('logo', imageUrl)
                                } catch (error) {
                                  console.error('خطأ في رفع اللوغو:', error)
                                }
                              }
                            }}
                            className="w-full"
                            disabled={uploadingImage === 'logo'}
                          />
                          {uploadingImage === 'logo' && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded">
                              <div className="text-blue-600 text-sm font-medium">جاري رفع اللوغو...</div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          يُفضل ملفات SVG أو PNG شفافة
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      {formData.logoImage ? (
                        <div className="relative">
                          <div className="w-32 h-32 bg-white rounded-lg border-2 border-dashed border-blue-300 p-3 flex items-center justify-center">
                            <img
                              src={formData.logoImage}
                              alt="معاينة اللوغو"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -left-2 h-6 w-6 p-0 rounded-full"
                            onClick={() => setFormData(prev => ({ ...prev, logoImage: '' }))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center text-gray-500 bg-white">
                          <div className="text-center">
                            <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                            <div className="text-sm">اللوغو</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* معرض الصور الإضافية */}
                <div className="border rounded-lg p-4 bg-green-50/50 dark:bg-green-900/20">
                  <h4 className="font-medium text-lg mb-4 flex items-center gap-2">
                    🖼️ معرض الصور
                    <Badge variant="secondary" className="text-xs">
                      {additionalImages.length} صورة
                    </Badge>
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="relative inline-block w-full max-w-md">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={async (e) => {
                            const files = e.target.files
                            if (files && files.length > 0) {
                              for (let i = 0; i < files.length; i++) {
                                try {
                                  const imageUrl = await uploadImage(files[i], 'gallery')
                                  setAdditionalImages(prev => [...prev, imageUrl])
                                } catch (error) {
                                  console.error(`خطأ في رفع الصورة ${i + 1}:`, error)
                                }
                              }
                            }
                          }}
                          className="w-full"
                          disabled={uploadingImage === 'gallery'}
                        />
                        {uploadingImage === 'gallery' && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded">
                            <div className="text-green-600 text-sm font-medium">جاري رفع الصور...</div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        يمكنك اختيار عدة صور معاً • الحد الأقصى: 5MB لكل صورة
                      </p>
                    </div>
                    
                    {additionalImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {additionalImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-green-400 transition-colors">
                              <img
                                src={imageUrl}
                                alt={`صورة ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={() => setAdditionalImages(prev => prev.filter((_, i) => i !== index))}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                        
                        {/* زر إضافة المزيد */}
                        <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-green-400 transition-colors cursor-pointer"
                             onClick={() => document.getElementById('additional-images-input')?.click()}>
                          <div className="text-center text-gray-500">
                            <Plus className="h-8 w-8 mx-auto mb-1" />
                            <div className="text-xs">إضافة المزيد</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <input
                      id="additional-images-input"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files
                        if (files && files.length > 0) {
                          for (let i = 0; i < files.length; i++) {
                            try {
                              const imageUrl = await uploadImage(files[i], 'gallery')
                              setAdditionalImages(prev => [...prev, imageUrl])
                            } catch (error) {
                              console.error(`خطأ في رفع الصورة ${i + 1}:`, error)
                            }
                          }
                        }
                      }}
                      disabled={uploadingImage === 'gallery'}
                    />
                  </div>
                </div>

                {uploadingImage && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      جاري رفع {uploadingImage === 'main' ? 'الصورة الرئيسية' : uploadingImage === 'logo' ? 'اللوغو' : 'الصور الإضافية'}...
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  الحد الأقصى لكل صورة: 5MB، الأنواع المدعومة: JPG, PNG, WebP, GIF
                </p>
                
                {/* مؤشرات حالة الصور */}
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>الصورة الرئيسية:</span>
                    <Badge variant={formData.mainImage ? "default" : "secondary"}>
                      {formData.mainImage ? "محددة" : "غير محددة"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>اللوغو:</span>
                    <Badge variant={formData.logoImage ? "default" : "secondary"}>
                      {formData.logoImage ? "محدد" : "غير محدد"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>الصور الإضافية:</span>
                    <Badge variant={additionalImages.length > 0 ? "default" : "secondary"}>
                      {additionalImages.length > 0 ? `${additionalImages.length} صورة` : "لا توجد"}
                    </Badge>
                  </div>
                </div>
                
                {/* مؤشرات حالة الصور */}
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>الصورة الرئيسية:</span>
                    <Badge variant={formData.mainImage ? "default" : "secondary"}>
                      {formData.mainImage ? "محددة" : "غير محددة"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>اللوغو:</span>
                    <Badge variant={formData.logoImage ? "default" : "secondary"}>
                      {formData.logoImage ? "محدد" : "غير محدد"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>الصور الإضافية:</span>
                    <Badge variant={additionalImages.length > 0 ? "default" : "secondary"}>
                      {additionalImages.length > 0 ? `${additionalImages.length} صورة` : "لا توجد"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* الخدمات والتخصصات */}
            <Card>
              <CardHeader>
                <CardTitle>الخدمات والتخصصات</CardTitle>
                <CardDescription>قائمة بالخدمات والتخصصات التي تقدمها الشركة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* الخدمات */}
                <div className="space-y-3">
                  <Label>الخدمات</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="أدخل خدمة جديدة"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addService()
                        }
                      }}
                    />
                    <Button type="button" onClick={addService} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.services.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {service}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeService(service)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* التخصصات */}
                <div className="space-y-3">
                  <Label>التخصصات</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder="أدخل تخصص جديد"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addSpecialty()
                        }
                      }}
                    />
                    <Button type="button" onClick={addSpecialty} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {specialty}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeSpecialty(specialty)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ساعات العمل */}
            <WorkingHoursEditor
              onSave={async (hours: WorkingHourData[]) => {
                setWorkingHours(
                  Object.fromEntries(
                    hours.map(hour => [
                      hour.dayOfWeek,
                      {
                        openTime: hour.openTime || '',
                        closeTime: hour.closeTime || '',
                        isClosed: hour.isClosed
                      }
                    ])
                  )
                );
              }}
              isLoading={isLoading}
            />

            {/* وسائل التواصل الاجتماعي */}
            <Card>
              <CardHeader>
                <CardTitle>وسائل التواصل الاجتماعي</CardTitle>
                <CardDescription>روابط صفحات الشركة على وسائل التواصل الاجتماعي</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">فيسبوك</Label>
                    <Input
                      id="facebook"
                      value={socialMedia.facebook || ''}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, facebook: e.target.value }))}
                      placeholder="https://facebook.com/company"
                      className="text-left"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">تويتر</Label>
                    <Input
                      id="twitter"
                      value={socialMedia.twitter || ''}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, twitter: e.target.value }))}
                      placeholder="https://twitter.com/company"
                      className="text-left"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram">إنستغرام</Label>
                    <Input
                      id="instagram"
                      value={socialMedia.instagram || ''}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, instagram: e.target.value }))}
                      placeholder="https://instagram.com/company"
                      className="text-left"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">لينكدإن</Label>
                    <Input
                      id="linkedin"
                      value={socialMedia.linkedin || ''}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/company/company"
                      className="text-left"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube">يوتيوب</Label>
                    <Input
                      id="youtube"
                      value={socialMedia.youtube || ''}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, youtube: e.target.value }))}
                      placeholder="https://youtube.com/@company"
                      className="text-left"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tiktok">تيك توك</Label>
                    <Input
                      id="tiktok"
                      value={socialMedia.tiktok || ''}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, tiktok: e.target.value }))}
                      placeholder="https://tiktok.com/@company"
                      className="text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إجراءات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري الحفظ...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      <span>حفظ الشركة</span>
                    </div>
                  )}
                </Button>

                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link href="/admin/companies">
                    إلغاء
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>خيارات متقدمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="isVerified"
                    checked={formData.isVerified}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVerified: checked as boolean }))}
                  />
                  <Label htmlFor="isVerified" className="text-sm">
                    شركة موثقة
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked as boolean }))}
                  />
                  <Label htmlFor="isFeatured" className="text-sm">
                    شركة مميزة
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ملاحظات</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• الحقول المطلوبة: الاسم، الوصف، الفئة، البلد، المدينة</li>
                  <li>• يمكن إضافة ساعات العمل ووسائل التواصل لاحقاً</li>
                  <li>• الشركة ستكون نشطة بعد الحفظ مباشرة</li>
                  <li>• يمكن تعديل جميع البيانات لاحقاً</li>
                  <li>• اللوغو مخصص للعرض في القوائم</li>
                  <li>• الصورة الرئيسية للعرض في صفحة الشركة</li>
                </ul>
                
                {/* مؤشرات الحالة */}
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>البلدان:</span>
                    <Badge variant={countries.length > 0 ? "default" : "secondary"}>
                      {countries.length > 0 ? `${countries.length} محمل` : "جاري التحميل"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>الفئات:</span>
                    <Badge variant={categories.length > 0 ? "default" : "secondary"}>
                      {categories.length > 0 ? `${categories.length} محمل` : "جاري التحميل"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>المدن:</span>
                    <Badge variant={cities.length > 0 && formData.countryId ? "default" : "secondary"}>
                      {formData.countryId ? (cities.length > 0 ? `${cities.length} محمل` : "جاري التحميل") : "اختر البلد"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
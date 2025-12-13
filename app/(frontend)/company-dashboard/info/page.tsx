'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Save,
  Pencil,
  Camera,
  Tag,
  FileText,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface SubCategory {
  id: string;
  name: string;
}

export default function CompanyBasicInfoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [companyData, setCompanyData] = useState<any>(null)

  const [categories, setCategories] = useState<any[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [countries, setCountries] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [subAreas, setSubAreas] = useState<any[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'COMPANY_OWNER' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      router.push('/')
      return
    }

    // جلب البيانات
    fetchCompanyData()
    fetchCategories()
    fetchCountries()
  }, [session, status, router])

  const fetchCompanyData = async () => {
    try {
      setIsDataLoading(true)
      const response = await fetch('/api/company/info')
      if (response.ok) {
        const data = await response.json()
        setCompanyData(data.company)
        
        // جلب المدن للبلد المحدد
        if (data.company?.countryId) {
          fetchCities(data.company.countryId)
        }
        // جلب المناطق الفرعية للمدينة المحددة
        if (data.company?.cityId) {
          fetchSubAreas(data.company.cityId)
        }
        // Fetch sub-categories for the initial category
        if (data.company?.categoryId) {
          fetchSubCategories(data.company.categoryId);
        }
      } else {
        toast.error('فشل في جلب بيانات الشركة')
      }
    } catch (error) {
      toast.error('حدث خطأ في جلب البيانات')
    } finally {
      setIsDataLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('خطأ في جلب الفئات:', error)
    }
  }

  const fetchSubCategories = async (categoryId: string) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const response = await fetch(`/api/subcategories?categoryId=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setSubCategories(data.subCategories || []);
      }
    } catch (error) {
      console.error('Failed to fetch sub-categories:', error);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries?activeOnly=true')
      if (response.ok) {
        const data = await response.json()
        setCountries(data.countries || [])
      }
    } catch (error) {
      console.error('خطأ في جلب البلدان:', error)
    }
  }

  const fetchCities = async (countryId: string) => {
    if (!countryId) {
      setCities([])
      setSubAreas([])
      return
    }
    
    try {
      const response = await fetch(`/api/cities?countryId=${countryId}&activeOnly=true`)
      if (response.ok) {
        const data = await response.json()
        setCities(data.cities || [])
      }
    } catch (error) {
      console.error('خطأ في جلب المدن:', error)
    }
  }

  const fetchSubAreas = async (cityId: string) => {
    if (!cityId) {
      setSubAreas([])
      return
    }
    
    try {
      const response = await fetch(`/api/sub-areas?cityId=${cityId}`)
      if (response.ok) {
        const data = await response.json()
        setSubAreas(data || [])
      }
    } catch (error) {
      console.error('خطأ في جلب المناطق الفرعية:', error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/company/info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData)
      })

      if (response.ok) {
        const data = await response.json()
        setCompanyData(data.company)
        toast.success('تم حفظ المعلومات بنجاح')
        setIsEditing(false)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في حفظ المعلومات')
      }
    } catch (error) {
      toast.error('حدث خطأ في حفظ المعلومات')
    } finally {
      setIsLoading(false)
    }
  }

  const addService = () => {
    setCompanyData((prev: any) => ({
      ...prev,
      services: [...(prev.services || []), '']
    }))
  }

  const updateService = (index: number, value: string) => {
    setCompanyData((prev: any) => ({
      ...prev,
      services: (prev.services || []).map((service: string, i: number) => i === index ? value : service)
    }))
  }

  const removeService = (index: number) => {
    setCompanyData((prev: any) => ({
      ...prev,
      services: (prev.services || []).filter((_: any, i: number) => i !== index)
    }))
  }

  const addSpecialization = () => {
    setCompanyData((prev: any) => ({
      ...prev,
      specialties: [...(prev.specialties || []), '']
    }))
  }

  const updateSpecialization = (index: number, value: string) => {
    setCompanyData((prev: any) => ({
      ...prev,
      specialties: (prev.specialties || []).map((specialization: string, i: number) => i === index ? value : specialization)
    }))
  }

  const removeSpecialization = (index: number) => {
    setCompanyData((prev: any) => ({
      ...prev,
      specialties: (prev.specialties || []).filter((_: any, i: number) => i !== index)
    }))
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setCompanyData((prev: any) => ({
          ...prev,
          logoImage: data.url
        }))
        toast.success('تم رفع اللوغو بنجاح')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في رفع اللوغو')
      }
    } catch (error) {
      toast.error('حدث خطأ في رفع اللوغو')
    } finally {
      setIsUploadingLogo(false)
      if (logoInputRef.current) {
        logoInputRef.current.value = ''
      }
    }
  }

  const handleCountryChange = (countryId: string) => {
    setCompanyData((prev: any) => ({
      ...prev,
      countryId,
      cityId: '', // إعادة تعيين المدينة عند تغيير البلد
      subAreaId: '' // إعادة تعيين المنطقة الفرعية عند تغيير البلد
    }))
    fetchCities(countryId)
  }

  const handleCityChange = (cityId: string) => {
    setCompanyData((prev: any) => ({
      ...prev,
      cityId,
      subAreaId: '' // إعادة تعيين المنطقة الفرعية عند تغيير المدينة
    }))
    fetchSubAreas(cityId)
  }

  const handleCategoryChange = (categoryId: string) => {
    setCompanyData((prev: any) => ({
      ...prev,
      categoryId,
      subCategoryId: '' // Reset sub-category when main category changes
    }));
    fetchSubCategories(categoryId);
  };

  if (status === 'loading' || isDataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || !companyData) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            المعلومات الأساسية
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة المعلومات الأساسية لشركتك
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 ml-2" />
              تعديل
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Save className="h-4 w-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    حفظ التغييرات
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* معلومات الحالة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">حالة الشركة</p>
                <Badge variant={companyData.isActive ? 'default' : 'secondary'}>
                  {companyData.isActive ? 'نشطة' : 'غير نشطة'}
                </Badge>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">حالة التوثيق</p>
                <Badge variant={companyData.isVerified ? 'default' : 'destructive'}>
                  {companyData.isVerified ? 'موثقة' : 'غير موثقة'}
                </Badge>
              </div>
              <AlertCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">عدد الخدمات</p>
                <p className="text-2xl font-bold">{companyData.services?.length || 0}</p>
              </div>
              <Tag className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">عدد التخصصات</p>
                <p className="text-2xl font-bold">{companyData.specialties?.length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قسم اللوغو */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            لوغو الشركة
          </CardTitle>
          <CardDescription>
            رفع وإدارة لوغو شركتك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* عرض اللوغو الحالي */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                {companyData?.logoImage ? (
                  <img
                    src={companyData.logoImage}
                    alt="لوغو الشركة"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">لا يوجد لوغو</p>
                  </div>
                )}
              </div>
              
              {isEditing && (
                <div className="mt-4 space-y-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="w-full"
                  >
                    {isUploadingLogo ? (
                      <>
                        <Camera className="h-4 w-4 ml-2 animate-spin" />
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 ml-2" />
                        {companyData?.logoImage ? 'تغيير اللوغو' : 'رفع لوغو'}
                      </>
                    )}
                  </Button>
                  
                  {companyData?.logoImage && (
                    <Button
                      variant="outline"
                                          onClick={() => setCompanyData((prev: any) => ({ ...prev, logoImage: null }))}
                    className="w-full text-red-600 hover:text-red-700"
                    >
                      حذف اللوغو
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* معلومات اللوغو */}
            <div className="flex-1">
              <h3 className="font-medium mb-2">متطلبات اللوغو:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• الحد الأقصى لحجم الملف: 5MB</li>
                <li>• الأنواع المدعومة: JPG, PNG, WebP</li>
                <li>• الحجم المفضل: 512x512 بكسل</li>
                <li>• خلفية شفافة (PNG) للحصول على أفضل النتائج</li>
              </ul>
              
              {companyData?.logoImage && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ تم رفع اللوغو بنجاح. سيظهر في صفحة شركتك وجميع المواقع ذات الصلة.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* معلومات أساسية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            المعلومات الأساسية
          </CardTitle>
          <CardDescription>
            المعلومات الأساسية التي تظهر للعملاء
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الشركة *</Label>
              <Input
                id="name"
                value={companyData.name}
                onChange={(e) => setCompanyData((prev: any) => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">الفئة *</Label>
              <Select 
                value={companyData.categoryId} 
                onValueChange={handleCategoryChange}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCategory">التصنيف الفرعي</Label>
              <Select 
                value={companyData.subCategoryId || ''} 
                onValueChange={(value) => setCompanyData((prev: any) => ({ ...prev, subCategoryId: value }))}
                disabled={!isEditing || !companyData.categoryId || subCategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!companyData.categoryId ? "اختر الفئة أولاً" : subCategories.length > 0 ? "اختر التصنيف الفرعي" : "لا توجد تصنيفات فرعية"} />
                </SelectTrigger>
                <SelectContent>
                  {subCategories.map(subCategory => (
                    <SelectItem key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={companyData.email}
                onChange={(e) => setCompanyData((prev: any) => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={companyData.phone}
                onChange={(e) => setCompanyData((prev: any) => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">الموقع الإلكتروني</Label>
              <Input
                id="website"
                value={companyData.website}
                onChange={(e) => setCompanyData((prev: any) => ({ ...prev, website: e.target.value }))}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">البلد *</Label>
              <Select 
                value={companyData.countryId} 
                onValueChange={handleCountryChange}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر البلد" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.id} value={country.id}>
                      <div className="flex items-center gap-2">
                        {country.flag && <span>{country.flag}</span>}
                        {country.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">المدينة *</Label>
              <Select 
                value={companyData.cityId} 
                onValueChange={handleCityChange}
                disabled={!isEditing || !companyData.countryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={companyData.countryId ? "اختر المدينة" : "اختر البلد أولاً"} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subArea">المنطقة الفرعية</Label>
              <Select 
                value={companyData.subAreaId || 'none'} 
                onValueChange={(value) => setCompanyData((prev: any) => ({ ...prev, subAreaId: value === "none" ? "" : value }))}
                disabled={!isEditing || !companyData.cityId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={companyData.cityId ? "اختر المنطقة الفرعية (اختياري)" : "اختر المدينة أولاً"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">لا يوجد</SelectItem>
                  {subAreas.map(subArea => (
                    <SelectItem key={subArea.id} value={subArea.id}>
                      {subArea.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">العنوان</Label>
            <Input
              id="address"
              value={companyData.address}
              onChange={(e) => setCompanyData((prev: any) => ({ ...prev, address: e.target.value }))}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">وصف مختصر</Label>
            <Input
              id="shortDescription"
              value={companyData.shortDescription}
              onChange={(e) => setCompanyData((prev: any) => ({ ...prev, shortDescription: e.target.value }))}
              disabled={!isEditing}
              placeholder="وصف قصير يظهر في نتائج البحث"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={companyData.description}
              onChange={(e) => setCompanyData((prev: any) => ({ ...prev, description: e.target.value }))}
              disabled={!isEditing}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longDescription">وصف مفصل</Label>
            <Textarea
              id="longDescription"
              value={companyData.longDescription}
              onChange={(e) => setCompanyData((prev: any) => ({ ...prev, longDescription: e.target.value }))}
              disabled={!isEditing}
              rows={5}
              placeholder="وصف مفصل عن الشركة وخدماتها"
            />
          </div>
        </CardContent>
      </Card>

      {/* الخدمات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            الخدمات المقدمة
          </CardTitle>
          <CardDescription>
            قائمة بالخدمات التي تقدمها شركتك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(companyData.services || []).map((service: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={service}
                onChange={(e) => updateService(index, e.target.value)}
                disabled={!isEditing}
                placeholder="اسم الخدمة"
              />
              {isEditing && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeService(index)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
          
          {isEditing && (
            <Button variant="outline" onClick={addService}>
              <Tag className="h-4 w-4 ml-2" />
              إضافة خدمة
            </Button>
          )}
        </CardContent>
      </Card>

      {/* التخصصات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            التخصصات
          </CardTitle>
          <CardDescription>
            قائمة بالتخصصات التي تركز عليها شركتك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(companyData.specialties || []).map((specialization: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={specialization}
                onChange={(e) => updateSpecialization(index, e.target.value)}
                disabled={!isEditing}
                placeholder="اسم التخصص"
              />
              {isEditing && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeSpecialization(index)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
          
          {isEditing && (
            <Button variant="outline" onClick={addSpecialization}>
              <FileText className="h-4 w-4 ml-2" />
              إضافة تخصص
            </Button>
          )}
        </CardContent>
      </Card>

      {/* إعدادات الرؤية */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الرؤية</CardTitle>
          <CardDescription>
            التحكم في ظهور شركتك للعملاء
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isActive">الشركة نشطة</Label>
              <p className="text-sm text-gray-500">
                عند تفعيل هذا الخيار، ستظهر شركتك في نتائج البحث
              </p>
            </div>
            <Switch
              id="isActive"
              checked={companyData.isActive}
              onCheckedChange={(checked) => setCompanyData((prev: any) => ({ ...prev, isActive: checked }))}
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {!companyData.isVerified && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            شركتك غير موثقة بعد. يرجى التواصل مع الإدارة لتوثيق شركتك والحصول على مزايا إضافية.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
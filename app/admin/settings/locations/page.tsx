'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Building2,
  Flag,
  Save,
  X
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageUpload } from '@/components/admin/image-upload'
import { useToast } from '@/hooks/use-toast'

interface Country {
  id: string
  code: string
  name: string
  flag?: string
  image?: string
  description?: string
  companiesCount: number
  isActive: boolean
  createdAt: string
}

interface City {
  id: string
  slug: string
  name: string
  countryId: string
  countryCode: string
  image?: string
  description?: string
  companiesCount: number
  isActive: boolean
  createdAt: string
  country: {
    name: string
    code: string
  }
}

export default function AdminLocationsPage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('countries')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'country' | 'city'>('country')
  const [editingItem, setEditingItem] = useState<Country | City | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    slug: '',
    flag: '',
    image: '',
    description: '',
    countryId: '',
    isActive: true,
    companiesCount: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }
  }, [session, status, router])

  const fetchLocations = async () => {
    try {
      setIsLoading(true)
      const [countriesResponse, citiesResponse] = await Promise.all([
        fetch('/api/admin/countries'),
        fetch('/api/admin/cities')
      ])

      let successCount = 0
      let errorCount = 0
      let countriesCount = 0
      let citiesCount = 0

      if (countriesResponse.ok) {
        const countriesData = await countriesResponse.json()
        setCountries(countriesData.countries || [])
        countriesCount = countriesData.countries?.length || 0
        successCount++
      } else {
        console.error('فشل في جلب البلدان:', countriesResponse.status)
        setCountries([])
        errorCount++
        toast({
          variant: 'destructive',
          title: 'فشل في تحميل البلدان',
          description: `رمز الخطأ: ${countriesResponse.status}. يرجى المحاولة مرة أخرى.`,
        })
      }

      if (citiesResponse.ok) {
        const citiesData = await citiesResponse.json()
        setCities(citiesData.cities || [])
        citiesCount = citiesData.cities?.length || 0
        successCount++
      } else {
        console.error('فشل في جلب المدن:', citiesResponse.status)
        setCities([])
        errorCount++
        toast({
          variant: 'destructive',
          title: 'فشل في تحميل المدن',
          description: `رمز الخطأ: ${citiesResponse.status}. يرجى المحاولة مرة أخرى.`,
        })
      }

      // إظهار إشعار النجاح إذا تم تحميل البيانات بنجاح
      if (successCount === 2) {
        toast({
          title: 'تم تحميل البيانات بنجاح',
          description: `تم تحميل ${countriesCount} بلد و ${citiesCount} مدينة`,
        })
      }

    } catch (error) {
      console.error('خطأ في جلب المواقع:', error)
      setCountries([])
      setCities([])
      toast({
        variant: 'destructive',
        title: 'خطأ في الاتصال بالخادم',
        description: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchLocations()
    }
  }, [session])

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      slug: '',
      flag: '',
      image: '',
      description: '',
      countryId: '',
      isActive: true,
      companiesCount: 0
    })
    setEditingItem(null)
  }

  const openCreateDialog = (type: 'country' | 'city') => {
    resetForm()
    setDialogType(type)
    setIsDialogOpen(true)
  }

  const openEditDialog = (item: Country | City, type: 'country' | 'city') => {
    if (type === 'country') {
      const country = item as Country
      setFormData({
        name: country.name,
        code: country.code,
        slug: '',
        flag: country.flag || '',
        image: country.image || '',
        description: country.description || '',
        countryId: '',
        isActive: country.isActive,
        companiesCount: country.companiesCount
      })
    } else {
      const city = item as City
      setFormData({
        name: city.name,
        code: '',
        slug: city.slug,
        flag: '',
        image: city.image || '',
        description: city.description || '',
        countryId: city.countryId,
        isActive: city.isActive,
        companiesCount: city.companiesCount
      })
    }
    setEditingItem(item)
    setDialogType(type)
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      const url = editingItem 
        ? `/api/admin/${dialogType === 'country' ? 'countries' : 'cities'}/${editingItem.id}`
        : `/api/admin/${dialogType === 'country' ? 'countries' : 'cities'}`
      
      const method = editingItem ? 'PATCH' : 'POST'
      const action = editingItem ? 'تحديث' : 'إضافة'
      const itemType = dialogType === 'country' ? 'البلد' : 'المدينة'

      const body = { ...formData }
      if (typeof body.companiesCount === 'string') {
        body.companiesCount = parseInt(body.companiesCount, 10)
      }


      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        
        if (dialogType === 'country') {
          if (editingItem) {
            setCountries(prev => 
              prev.map(country => 
                country.id === editingItem.id ? data.country : country
              )
            )
          } else {
            setCountries(prev => [data.country, ...prev])
          }
        } else {
          if (editingItem) {
            setCities(prev => 
              prev.map(city => 
                city.id === editingItem.id ? data.city : city
              )
            )
          } else {
            setCities(prev => [data.city, ...prev])
          }
        }
        
        // إشعار نجاح مفصل
        toast({
          title: `تم ${action} ${itemType} بنجاح`,
          description: `${itemType} "${formData.name}" تم ${action}ه بنجاح وهو الآن ${formData.isActive ? 'نشط' : 'غير نشط'}.`,
        })
        
        setIsDialogOpen(false)
        resetForm()
      } else {
        // معالجة أخطاء HTTP المختلفة
        const errorData = await response.json()
        let errorMessage = `فشل في ${action} ${itemType}`
        let errorDescription = ''

        switch (response.status) {
          case 400:
            errorDescription = errorData.error || 'البيانات المدخلة غير صحيحة. يرجى التحقق من جميع الحقول.'
            break
          case 401:
            errorDescription = 'ليس لديك صلاحية لتنفيذ هذا الإجراء.'
            break
          case 404:
            errorDescription = 'العنصر المطلوب غير موجود.'
            break
          case 409:
            errorDescription = errorData.error || `${itemType} بهذا الاسم موجود مسبقاً.`
            break
          case 500:
            errorDescription = 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.'
            break
          default:
            errorDescription = `رمز الخطأ: ${response.status}. ${errorData.error || 'يرجى المحاولة مرة أخرى.'}`
        }

        toast({
          variant: 'destructive',
          title: errorMessage,
          description: errorDescription,
        })
      }
    } catch (error) {
      console.error('خطأ في حفظ الموقع:', error)
      const itemType = dialogType === 'country' ? 'البلد' : 'المدينة'
      const action = editingItem ? 'تحديث' : 'إضافة'
      
      toast({
        variant: 'destructive',
        title: `خطأ في ${action} ${itemType}`,
        description: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, type: 'country' | 'city') => {
    try {
      const itemType = type === 'country' ? 'البلد' : 'المدينة'
      const item = type === 'country' 
        ? countries.find(c => c.id === id)
        : cities.find(c => c.id === id)

      const response = await fetch(`/api/admin/${type === 'country' ? 'countries' : 'cities'}/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        if (type === 'country') {
          setCountries(prev => prev.filter(country => country.id !== id))
        } else {
          setCities(prev => prev.filter(city => city.id !== id))
        }

        toast({
          title: `تم حذف ${itemType} بنجاح`,
          description: `${itemType} "${item?.name || 'غير معروف'}" تم حذفه نهائياً من النظام.`,
        })
      } else {
        const errorData = await response.json()
        let errorDescription = ''

        switch (response.status) {
          case 400:
            errorDescription = errorData.error || `لا يمكن حذف ${itemType} في الوقت الحالي.`
            break
          case 401:
            errorDescription = 'ليس لديك صلاحية لحذف هذا العنصر.'
            break
          case 404:
            errorDescription = `${itemType} غير موجود أو تم حذفه مسبقاً.`
            break
          case 409:
            errorDescription = `لا يمكن حذف ${itemType} لأنه مرتبط ببيانات أخرى.`
            break
          default:
            errorDescription = errorData.error || 'حدث خطأ غير متوقع.'
        }

        toast({
          variant: 'destructive',
          title: `فشل في حذف ${itemType}`,
          description: errorDescription,
        })
      }
    } catch (error) {
      console.error('خطأ في حذف الموقع:', error)
      const itemType = type === 'country' ? 'البلد' : 'المدينة'
      
      toast({
        variant: 'destructive',
        title: `خطأ في حذف ${itemType}`,
        description: 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
      })
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean, type: 'country' | 'city') => {
    try {
      const itemType = type === 'country' ? 'البلد' : 'المدينة'
      const item = type === 'country' 
        ? countries.find(c => c.id === id)
        : cities.find(c => c.id === id)
      const statusText = isActive ? 'تفعيل' : 'إلغاء تفعيل'

      const response = await fetch(`/api/admin/${type === 'country' ? 'countries' : 'cities'}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        if (type === 'country') {
          setCountries(prev => 
            prev.map(country => 
              country.id === id ? { ...country, isActive } : country
            )
          )
        } else {
          setCities(prev => 
            prev.map(city => 
              city.id === id ? { ...city, isActive } : city
            )
          )
        }

        toast({
          title: `تم ${statusText} ${itemType} بنجاح`,
          description: `${itemType} "${item?.name || 'غير معروف'}" أصبح الآن ${isActive ? 'نشط' : 'غير نشط'}.`,
        })
      } else {
        const errorData = await response.json()
        toast({
          variant: 'destructive',
          title: `فشل في ${statusText} ${itemType}`,
          description: errorData.error || 'حدث خطأ أثناء تحديث الحالة.',
        })
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة الموقع:', error)
      const itemType = type === 'country' ? 'البلد' : 'المدينة'
      const statusText = isActive ? 'تفعيل' : 'إلغاء تفعيل'
      
      toast({
        variant: 'destructive',
        title: `خطأ في ${statusText} ${itemType}`,
        description: 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
      })
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
  }

  const filteredCountries = countries?.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.code.toLowerCase().includes(search.toLowerCase())
  ) || []

  const filteredCities = cities?.filter(city =>
    city.name.toLowerCase().includes(search.toLowerCase()) ||
    city.country.name.toLowerCase().includes(search.toLowerCase())
  ) || []

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* الرأس */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          إدارة المواقع
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          إدارة البلدان والمدن المتاحة في المنصة
        </p>
      </div>

      {/* البحث */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في المواقع..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* التبويبات */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="countries">البلدان ({countries?.length || 0})</TabsTrigger>
            <TabsTrigger value="cities">المدن ({cities?.length || 0})</TabsTrigger>
          </TabsList>
          <Button onClick={() => openCreateDialog(activeTab === 'countries' ? 'country' : 'city')}> 
            <Plus className="h-4 w-4 ml-2" />
            إضافة {activeTab === 'countries' ? 'بلد' : 'مدينة'}
          </Button>
        </div>

        <TabsContent value="countries">
          <Card>
            <CardHeader>
              <CardTitle>قائمة البلدان</CardTitle>
              <CardDescription>
                إدارة البلدان المتاحة ({filteredCountries.length} بلد)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>البلد</TableHead>
                      <TableHead>الكود</TableHead>
                      <TableHead>عدد الشركات</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCountries.map((country) => (
                      <TableRow key={country.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                              {country.image ? (
                                <img
                                  src={country.image}
                                  alt={country.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : country.flag ? (
                                <span className="text-lg">{country.flag}</span>
                              ) : (
                                <Flag className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {country.name}
                              </p>
                              {country.description && (
                                <p className="text-sm text-gray-500 line-clamp-1">
                                  {country.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {country.code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span>{country.companiesCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Switch
                              checked={country.isActive}
                              onCheckedChange={(checked) => handleToggleActive(country.id, checked, 'country')}
                            />
                            <Badge 
                              variant={country.isActive ? 'default' : 'secondary'}
                              className={country.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                            >
                              {country.isActive ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditDialog(country, 'country')}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  disabled={country.companiesCount > 0}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>حذف البلد</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف "{country.name}"?
                                    {country.companiesCount > 0 && (
                                      <span className="block mt-2 text-red-600">
                                        يحتوي هذا البلد على {country.companiesCount} شركة ولا يمكن حذفه.
                                      </span>
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  {country.companiesCount === 0 && (
                                    <AlertDialogAction
                                      onClick={() => handleDelete(country.id, 'country')}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      حذف
                                    </AlertDialogAction>
                                  )}
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities">
          <Card>
            <CardHeader>
              <CardTitle>قائمة المدن</CardTitle>
              <CardDescription>
                إدارة المدن المتاحة ({filteredCities.length} مدينة)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المدينة</TableHead>
                      <TableHead>البلد</TableHead>
                      <TableHead>المعرف</TableHead>
                      <TableHead>عدد الشركات</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCities.map((city) => (
                      <TableRow key={city.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                              {city.image ? (
                                <img
                                  src={city.image}
                                  alt={city.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <MapPin className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {city.name}
                              </p>
                              {city.description && (
                                <p className="text-sm text-gray-500 line-clamp-1">
                                  {city.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{city.country.name}</Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {city.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span>{city.companiesCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Switch
                              checked={city.isActive}
                              onCheckedChange={(checked) => handleToggleActive(city.id, checked, 'city')}
                            />
                            <Badge 
                              variant={city.isActive ? 'default' : 'secondary'}
                              className={city.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                            >
                              {city.isActive ? 'نشطة' : 'غير نشطة'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditDialog(city, 'city')}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  disabled={city.companiesCount > 0}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>حذف المدينة</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف "{city.name}"?
                                    {city.companiesCount > 0 && (
                                      <span className="block mt-2 text-red-600">
                                        تحتوي هذه المدينة على {city.companiesCount} شركة ولا يمكن حذفها.
                                      </span>
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  {city.companiesCount === 0 && (
                                    <AlertDialogAction
                                      onClick={() => handleDelete(city.id, 'city')}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      حذف
                                    </AlertDialogAction>
                                  )}
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* نافذة إضافة/تعديل */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'تعديل' : 'إضافة'} {dialogType === 'country' ? 'بلد' : 'مدينة'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'تعديل معلومات' : 'إضافة'} {dialogType === 'country' ? 'البلد' : 'المدينة'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  الاسم *
                </label>
                <Input
                  placeholder={dialogType === 'country' ? 'مثال: المملكة العربية السعودية' : 'مثال: الرياض'}
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setFormData(prev => ({
                      ...prev,
                      name,
                      ...(dialogType === 'city' && { slug: generateSlug(name) })
                    }))
                  }}
                />
              </div>

              {dialogType === 'country' ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      كود البلد *
                    </label>
                    <Input
                      placeholder="مثال: sa, ae, kw"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      العلم (اختياري)
                    </label>
                    <Input
                      placeholder="🇸🇦"
                      value={formData.flag}
                      onChange={(e) => setFormData(prev => ({ ...prev, flag: e.target.value }))}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      المعرف (Slug) *
                    </label>
                    <Input
                      placeholder="riyadh, jeddah, dubai"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      البلد *
                    </label>
                    <Select 
                      value={formData.countryId} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, countryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر البلد" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries?.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.flag} {country.name} {!country.isActive && '(غير نشط)'}
                          </SelectItem>
                        )) || []}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  الوصف (اختياري)
                </label>
                <Textarea
                  placeholder="وصف مختصر..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                  label={`صورة ${dialogType === 'country' ? 'البلد' : 'المدينة'} (اختياري)`}
                  maxSize={5}
                />
                <div className="mt-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    أو أدخل رابط الصورة مباشرة
                  </label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  />
                </div>
              </div>
              
              {/* {editingItem && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    عدد الشركات
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.companiesCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, companiesCount: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              )} */}

              <div className="flex items-center justify-between pt-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {dialogType === 'country' ? 'بلد نشط' : 'مدينة نشطة'}
                </label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 ml-2" />
              إلغاء
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={
                !formData.name || 
                (dialogType === 'country' && !formData.code) ||
                (dialogType === 'city' && (!formData.slug || !formData.countryId)) ||
                isSubmitting
              }
            >
              <Save className="h-4 w-4 ml-2" />
              {isSubmitting ? 'جاري الحفظ...' : (editingItem ? 'تحديث' : 'إضافة')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
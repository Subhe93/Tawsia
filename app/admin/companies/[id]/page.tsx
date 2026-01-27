'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Building2, 
  ArrowLeft,
  Edit,
  Star,
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock,
  Users,
  MessageSquare,
  Calendar,
  Award,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  Save,
  X
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { WorkingHoursDisplay } from '@/components/working-hours-display'
import { WorkingHour } from '@/lib/types/working-hours'

interface CompanyDetails {
  id: string
  name: string
  slug: string
  description?: string
  shortDescription?: string
  longDescription?: string
  mainImage?: string
  rating: number
  reviewsCount: number
  isActive: boolean
  isVerified: boolean
  isFeatured: boolean
  phone?: string
  email?: string
  website?: string
  address?: string
  latitude?: number
  longitude?: number
  services: string[]
  specialties: string[]
  createdAt: string
  updatedAt: string
  country: { id: string; name: string; code: string; flag?: string }
  city: { id: string; name: string; slug: string }
  category: { id: string; name: string; slug: string; icon?: string }
  images: Array<{
    id: string
    imageUrl: string
    altText?: string
    sortOrder: number
  }>
  workingHours: Array<{
    dayOfWeek: string
    openTime?: string
    closeTime?: string
    isClosed: boolean
  }>
  socialMedia: Array<{
    platform: string
    url: string
  }>
  awards: Array<{
    id: string
    title: string
    description?: string
    year?: number
    awardType: string
    issuer?: string
  }>
  owners: Array<{
    role: string
    isPrimary: boolean
    user: {
      name: string
      email: string
    }
  }>
  _count: {
    reviews: number
  }
}

export default function CompanyDetailsPage() {
  const [company, setCompany] = useState<CompanyDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
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

  const fetchCompany = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/companies/${params.id}`)
      
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات الشركة')
      }

      const data = await response.json()
      setCompany(data)

    } catch (error) {
      console.error('خطأ في جلب بيانات الشركة:', error)
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: 'خطأ في جلب بيانات الشركة',
      })
    } finally {
      setIsLoading(false)
    }
  }



  useEffect(() => {
    if (session && params.id) {
      fetchCompany()
    }
  }, [session, params.id])

  const handleStatusToggle = async (field: 'isActive' | 'isVerified' | 'isFeatured') => {
    if (!company) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/admin/companies/${company.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: !company[field]
        }),
      })

      if (!response.ok) {
        throw new Error('فشل في تحديث حالة الشركة')
      }

      const updatedCompany = await response.json()
      setCompany(updatedCompany)
      
      const statusMap = {
        isActive: company[field] ? 'تم إلغاء تفعيل الشركة' : 'تم تفعيل الشركة',
        isVerified: company[field] ? 'تم إلغاء توثيق الشركة' : 'تم توثيق الشركة',
        isFeatured: company[field] ? 'تم إلغاء تمييز الشركة' : 'تم تمييز الشركة'
      }
      
      toast({
        title: 'تم بنجاح',
        description: statusMap[field],
      })
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error)
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: 'خطأ في تحديث الحالة',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
    return null
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          الشركة غير موجودة
        </h3>
        <p className="text-gray-500 mb-4">
          لم يتم العثور على الشركة المطلوبة
        </p>
        <Button asChild>
          <Link href="/admin/companies">
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة إلى قائمة الشركات
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4 space-x-reverse">
            <Link href="/admin/companies">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة
            </Button>
            </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {company.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              تفاصيل وإدارة الشركة
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
          <Link href={`/admin/companies/${company.id}/edit`}>
            <Edit className="h-4 w-4 ml-2" />
            تعديل
          </Link>
        </Button>
          <Button
            variant={company.isActive ? "destructive" : "default"}
            onClick={() => handleStatusToggle('isActive')}
            disabled={isUpdating}
          >
            {company.isActive ? (
              <>
                <EyeOff className="h-4 w-4 ml-2" />
                إلغاء التفعيل
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 ml-2" />
                تفعيل
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* المعلومات الرئيسية */}
        <div className="lg:col-span-2 space-y-6">
          {/* معلومات أساسية */}
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={company.mainImage} />
                  <AvatarFallback>
                    <Building2 className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{company.name}</h3>
                  <p className="text-gray-600 mt-1">{company.description}</p>
                  {company.longDescription && (
                    <p className="text-sm text-gray-500 mt-2">{company.longDescription}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{company.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({company._count.reviews} مراجعة)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{company.city.name}, {company.country.name}</span>
                </div>
                <div>
                  <Badge variant="secondary">{company.category.name}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* معلومات التواصل */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات التواصل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{company.email}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer nofollow" className="text-blue-600 hover:underline">
                      {company.website}
                    </a>
                  </div>
                )}
                {company.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{company.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* الخدمات والتخصصات */}
          {(company.services.length > 0 || company.specialties.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>الخدمات والتخصصات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              {company.services.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">الخدمات:</h4>
                  <div className="flex flex-wrap gap-2">
                    {company.services.map((service, index) => (
                        <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
                {company.specialties.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">التخصصات:</h4>
                    <div className="flex flex-wrap gap-2">
                      {company.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline">
                          {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {/* ساعات العمل */}
          {company.workingHours.length > 0 && (
            <WorkingHoursDisplay hours={company.workingHours} />
          )}

          {/* وسائل التواصل الاجتماعي */}
          {company.socialMedia.length > 0 && (
          <Card>
              <CardHeader>
                <CardTitle>وسائل التواصل الاجتماعي</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                  {company.socialMedia.map((social) => (
                    <div key={social.platform} className="flex justify-between items-center py-2">
                      <span className="font-medium capitalize">{social.platform}</span>
                      <a 
                        href={social.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {social.url}
                      </a>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
          )}
        </div>

        {/* الشريط الجانبي */}
        <div className="space-y-6">
          {/* الحالة والإجراءات */}
          <Card>
            <CardHeader>
              <CardTitle>الحالة والإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">الحالة:</span>
                  <Badge variant={company.isActive ? 'default' : 'secondary'}>
                    {company.isActive ? 'نشطة' : 'غير نشطة'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">موثقة:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusToggle('isVerified')}
                    disabled={isUpdating}
                  >
                    {company.isVerified ? (
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                    ) : (
                      <Shield className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">مميزة:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusToggle('isFeatured')}
                    disabled={isUpdating}
                  >
                    <Star className={`h-4 w-4 ${company.isFeatured ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/admin/companies/${company.id}/edit`}>
                    <Edit className="h-4 w-4 ml-2" />
                    تعديل الشركة
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/${company.slug}`} target="_blank">
                    <Eye className="h-4 w-4 ml-2" />
                    عرض في الموقع
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* الإحصائيات */}
          <Card>
            <CardHeader>
              <CardTitle>الإحصائيات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">المراجعات:</span>
                </div>
                  <span className="font-medium">{company._count.reviews}</span>
              </div>

              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">التقييم:</span>
                </div>
                  <span className="font-medium">{company.rating.toFixed(1)}</span>
              </div>

              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">تاريخ الإنشاء:</span>
                </div>
                <span className="text-sm text-gray-600">
                    {new Date(company.createdAt).toLocaleDateString('ar')}
                </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* المالكون */}
          {company.owners.length > 0 && (
          <Card>
            <CardHeader>
                <CardTitle>المالكون</CardTitle>
            </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {company.owners.map((owner, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                        <p className="font-medium text-sm">{owner.user.name}</p>
                        <p className="text-xs text-gray-500">{owner.user.email}</p>
                  </div>
                      <div className="text-left">
                        <Badge variant={owner.isPrimary ? 'default' : 'secondary'} className="text-xs">
                          {owner.role}
                        </Badge>
                        {owner.isPrimary && (
                          <p className="text-xs text-blue-600 mt-1">مالك رئيسي</p>
                        )}
                  </div>
                </div>
                  ))}
              </div>
            </CardContent>
          </Card>
          )}

          {/* الجوائز */}
          {company.awards.length > 0 && (
          <Card>
            <CardHeader>
                <CardTitle>الجوائز والشهادات</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                  {company.awards.map((award) => (
                    <div key={award.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium text-sm">{award.title}</span>
                      </div>
                      {award.description && (
                        <p className="text-xs text-gray-600 mb-2">{award.description}</p>
                      )}
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{award.issuer}</span>
                        <span>{award.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>
          )}
        </div>
      </div>
    </div>
  )
}

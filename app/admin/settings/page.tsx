'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Settings, 
  Save, 
  RefreshCw,
  Globe,
  Database,
  Mail,
  Shield,
  Image,
  FileText,
  MapPin,
  Tag,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

interface Setting {
  key: string
  value: string
  type: string
  description: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      router.push('/admin')
      return
    }
  }, [session, status, router])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      // في الوقت الحالي سنستخدم إعدادات افتراضية
      // يمكن لاحقاً إنشاء API endpoint للإعدادات
      const defaultSettings: Setting[] = [
        { key: 'site_name', value: 'توصية', type: 'STRING', description: 'اسم الموقع' },
        { key: 'site_description', value: 'دليل الشركات والخدمات', type: 'STRING', description: 'وصف الموقع' },
        { key: 'max_images_per_company', value: '10', type: 'NUMBER', description: 'أقصى عدد صور للشركة' },
        { key: 'max_images_per_review', value: '3', type: 'NUMBER', description: 'أقصى عدد صور للمراجعة' },
        { key: 'auto_approve_reviews', value: 'false', type: 'BOOLEAN', description: 'الموافقة التلقائية على المراجعات' },
        { key: 'require_email_verification', value: 'true', type: 'BOOLEAN', description: 'تطلب تأكيد البريد الإلكتروني' },
        { key: 'enable_company_registration', value: 'true', type: 'BOOLEAN', description: 'تفعيل تسجيل الشركات' },
        { key: 'contact_email', value: 'info@tawsia.com', type: 'STRING', description: 'بريد التواصل' },
      ]
      setSettings(defaultSettings)
    } catch (error) {
      console.error('خطأ في جلب الإعدادات:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchSettings()
    }
  }, [session])

  const updateSetting = (key: string, value: string) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.key === key ? { ...setting, value } : setting
      )
    )
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      // هنا يمكن إرسال الإعدادات إلى API
      // await fetch('/api/admin/settings', { method: 'POST', body: JSON.stringify(settings) })
      console.log('حفظ الإعدادات:', settings)
      
      // محاكاة حفظ
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return null
  }

  return (
    <div className="space-y-6">
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            إعدادات النظام
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة الإعدادات العامة للمنصة
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 ml-2" />
          )}
          حفظ التغييرات
        </Button>
      </div>

      {/* الإعدادات العامة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Globe className="h-5 w-5" />
            <span>الإعدادات العامة</span>
          </CardTitle>
          <CardDescription>إعدادات الموقع الأساسية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="site_name">اسم الموقع</Label>
              <Input
                id="site_name"
                value={settings.find(s => s.key === 'site_name')?.value || ''}
                onChange={(e) => updateSetting('site_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">بريد التواصل</Label>
              <Input
                id="contact_email"
                type="email"
                value={settings.find(s => s.key === 'contact_email')?.value || ''}
                onChange={(e) => updateSetting('contact_email', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="site_description">وصف الموقع</Label>
            <Textarea
              id="site_description"
              value={settings.find(s => s.key === 'site_description')?.value || ''}
              onChange={(e) => updateSetting('site_description', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* إعدادات المحتوى */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <FileText className="h-5 w-5" />
            <span>إعدادات المحتوى</span>
          </CardTitle>
          <CardDescription>إعدادات الشركات والمراجعات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="max_images_company">أقصى عدد صور للشركة</Label>
              <Input
                id="max_images_company"
                type="number"
                value={settings.find(s => s.key === 'max_images_per_company')?.value || ''}
                onChange={(e) => updateSetting('max_images_per_company', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_images_review">أقصى عدد صور للمراجعة</Label>
              <Input
                id="max_images_review"
                type="number"
                value={settings.find(s => s.key === 'max_images_per_review')?.value || ''}
                onChange={(e) => updateSetting('max_images_per_review', e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto_approve">الموافقة التلقائية على المراجعات</Label>
                <p className="text-sm text-gray-500">
                  الموافقة على المراجعات تلقائياً بدون مراجعة يدوية
                </p>
              </div>
              <Switch
                id="auto_approve"
                checked={settings.find(s => s.key === 'auto_approve_reviews')?.value === 'true'}
                onCheckedChange={(checked) => updateSetting('auto_approve_reviews', checked.toString())}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_verification">تطلب تأكيد البريد الإلكتروني</Label>
                <p className="text-sm text-gray-500">
                  يجب على المستخدمين تأكيد بريدهم الإلكتروني قبل التفعيل
                </p>
              </div>
              <Switch
                id="email_verification"
                checked={settings.find(s => s.key === 'require_email_verification')?.value === 'true'}
                onCheckedChange={(checked) => updateSetting('require_email_verification', checked.toString())}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="company_registration">تفعيل تسجيل الشركات</Label>
                <p className="text-sm text-gray-500">
                  السماح للمستخدمين بتسجيل شركات جديدة
                </p>
              </div>
              <Switch
                id="company_registration"
                checked={settings.find(s => s.key === 'enable_company_registration')?.value === 'true'}
                onCheckedChange={(checked) => updateSetting('enable_company_registration', checked.toString())}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الصفحات الفرعية */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات البيانات</CardTitle>
          <CardDescription>إدارة الفئات والمواقع والإعدادات المتقدمة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex items-center justify-between p-4" asChild>
              <Link href="/admin/settings/categories">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Tag className="h-6 w-6 text-blue-600" />
                  <div className="text-right">
                    <p className="font-medium">إدارة الفئات</p>
                    <p className="text-sm text-gray-500">إضافة وتعديل فئات الشركات</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex items-center justify-between p-4" asChild>
              <Link href="/admin/settings/locations">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <MapPin className="h-6 w-6 text-green-600" />
                  <div className="text-right">
                    <p className="font-medium">إدارة المواقع</p>
                    <p className="text-sm text-gray-500">إضافة وتعديل البلدان والمدن</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex items-center justify-between p-4" asChild>
              <Link href="/admin/settings/sub-areas">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <MapPin className="h-6 w-6 text-purple-600" />
                  <div className="text-right">
                    <p className="font-medium">إدارة المناطق الفرعية</p>
                    <p className="text-sm text-gray-500">إضافة وتعديل المناطق الفرعية</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* إعدادات قاعدة البيانات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Database className="h-5 w-5" />
            <span>إعدادات قاعدة البيانات</span>
          </CardTitle>
          <CardDescription>أدوات إدارة قاعدة البيانات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.open('/api/admin/export?type=backup', '_blank')}
            >
              <Database className="h-6 w-6" />
              <span className="text-sm">نسخ احتياطي</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.open('/api/admin/export?format=csv', '_blank')}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">تصدير CSV</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.open('/api/admin/export?format=json', '_blank')}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">تصدير JSON</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

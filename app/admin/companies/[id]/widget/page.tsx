'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Copy, Code, Eye, Monitor, Smartphone, Tablet, ArrowRight, Building2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PageProps {
  params: {
    id: string
  }
}

export default function AdminCompanyWidgetPage({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [company, setCompany] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [size, setSize] = useState<'xl' | 'l' | 'm' | 's'>('xl')
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [commentsCount, setCommentsCount] = useState<number>(5)
  const [previewKey, setPreviewKey] = useState(0)

  // When orientation changes to vertical, reset size if it's XL
  useEffect(() => {
    if (orientation === 'vertical' && size === 'xl') {
      setSize('l')
    }
  }, [orientation, size])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`/api/admin/companies/${params.id}`)
        if (!response.ok) {
          const errorData = await response.json()
          console.error('API error:', errorData)
          toast.error(errorData.error || 'فشل في تحميل بيانات الشركة')
          setIsLoading(false)
          return
        }
        const data = await response.json()
        console.log('Admin widget - Company data:', data)
        if (data.company) {
          setCompany(data.company)
        } else if (data && data.id) {
          // Fallback for direct company object
          setCompany(data)
        } else {
          console.error('No company data found in response:', data)
          toast.error('لم يتم العثور على بيانات الشركة')
        }
      } catch (error) {
        console.error('Error fetching company:', error)
        toast.error('فشل في تحميل بيانات الشركة')
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated' && params.id) {
      fetchCompany()
    }
  }, [status, params.id])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
    router.push('/')
    return null
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">لم يتم العثور على الشركة</p>
        </div>
      </div>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const widgetUrl = `${baseUrl}/api/widget/reviews/${company.id}?size=${size}&orientation=${orientation}&theme=${theme}${orientation === 'vertical' ? `&commentsCount=${commentsCount}` : ''}`

  const getEmbedHeight = () => {
    if (orientation === 'vertical') {
      switch (size) {
        case 'm': return '220'
        case 's': return '100'
        default: return '600'
      }
    }
    switch (size) {
      case 'xl': return '210'
      case 'l': return '160'
      case 'm': return '125'
      case 's': return '45'
      default: return '210'
    }
  }

  const embedCode = `<!-- Tawsia Reviews Widget for ${company.name} -->
<iframe 
  src="${widgetUrl}"
  width="100%" 
  height="${getEmbedHeight()}"
  frameborder="0"
  scrolling="${orientation === 'vertical' || size === 'xl' ? 'yes' : 'no'}"
  style="border: none; border-radius: 8px;"
></iframe>`

  const scriptCode = `<!-- Tawsia Reviews Widget Script for ${company.name} -->
<script>
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = '${widgetUrl}';
  iframe.width = '100%';
  iframe.height = '${getEmbedHeight()}';
  iframe.frameBorder = '0';
  iframe.scrolling = '${orientation === 'vertical' || size === 'xl' ? 'yes' : 'no'}';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '8px';
  
  var container = document.getElementById('tawsia-reviews-widget');
  if (container) {
    container.appendChild(iframe);
  }
})();
</script>
<div id="tawsia-reviews-widget"></div>`

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} تم نسخه بنجاح`)
  }

  const refreshPreview = () => {
    setPreviewKey(prev => prev + 1)
  }

  const getHeightForSize = () => {
    if (orientation === 'vertical') return '600px'
    switch (size) {
      case 'xl': return '210px'
      case 'l': return '160px'
      case 'm': return '125px'
      case 's': return '45px'
      default: return '210px'
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/admin/companies" className="hover:text-primary">
              إدارة الشركات
            </Link>
            <ArrowRight className="h-4 w-4" />
            <Link href={`/admin/companies/${company.id}`} className="hover:text-primary">
              {company.name}
            </Link>
            <ArrowRight className="h-4 w-4" />
            <span>ويدجت المراجعات</span>
          </div>
          <h1 className="text-3xl font-bold">ويدجت المراجعات</h1>
          <p className="text-muted-foreground mt-2">
            إنشاء كود ويدجت لعرض مراجعات {company.name}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/companies/${company.id}`}>
            رجوع
          </Link>
        </Button>
      </div>

      {/* Company Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Building2 className="h-5 w-5" />
            معلومات الشركة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {company.logoImage && (
              <img 
                src={company.logoImage} 
                alt={company.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold text-lg">{company.name}</h3>
              <p className="text-sm text-muted-foreground">{company.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <Badge variant="secondary">{company.reviewsCount || 0} تقييم</Badge>
                <Badge variant="secondary">⭐ {company.rating?.toFixed(1) || 0}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>إعدادات العرض</CardTitle>
            <CardDescription>
              اختر حجم ونمط العرض المناسب للموقع الإلكتروني
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Orientation Selection - FIRST */}
              <div className="space-y-3">
                <Label>الاتجاه</Label>
                <Select value={orientation} onValueChange={(v) => setOrientation(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="horizontal">أفقي (Grid)</SelectItem>
                    <SelectItem value="vertical">عمودي (Stack)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Size Selection - SECOND */}
              <div className="space-y-3">
                <Label>حجم الويدجت</Label>
                <RadioGroup value={size} onValueChange={(v) => setSize(v as any)}>
                  {orientation === 'horizontal' && (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="xl" id="xl" />
                      <Label htmlFor="xl" className="flex items-center gap-2 cursor-pointer">
                        <Monitor className="h-4 w-4" />
                        <span className="font-medium">كبير جداً (XL)</span>
                      </Label>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="l" id="l" />
                    <Label htmlFor="l" className="flex items-center gap-2 cursor-pointer">
                      <Tablet className="h-4 w-4" />
                      <span className="font-medium">كبير (L)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="m" id="m" />
                    <Label htmlFor="m" className="flex items-center gap-2 cursor-pointer">
                      <Smartphone className="h-4 w-4" />
                      <span className="font-medium">متوسط (M)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="s" id="s" />
                    <Label htmlFor="s" className="flex items-center gap-2 cursor-pointer">
                      <Smartphone className="h-4 w-4" />
                      <span className="font-medium">صغير (S)</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Comments Count for Vertical Orientation L size only */}
              {orientation === 'vertical' && size === 'l' && (
                <div className="space-y-3">
                  <Label>عدد التعليقات</Label>
                  <Select value={commentsCount.toString()} onValueChange={(v) => setCommentsCount(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 تعليقات</SelectItem>
                      <SelectItem value="4">4 تعليقات</SelectItem>
                      <SelectItem value="3">3 تعليقات</SelectItem>
                      <SelectItem value="2">2 تعليقات</SelectItem>
                      <SelectItem value="1">1 تعليق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Theme Selection - FOURTH */}
              <div className="space-y-3">
                <Label>المظهر</Label>
                <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">فاتح</SelectItem>
                    <SelectItem value="dark">داكن</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                معاينة مباشرة
              </Label>
              <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                <iframe
                  key={previewKey}
                  src={widgetUrl}
                  width="100%"
                  height={getHeightForSize()}
                  className="border-0"
                  title="معاينة ويدجت المراجعات"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Tabs - Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Embed Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                كود التضمين
              </CardTitle>
              <CardDescription>
                انسخ الكود والصقه في الموقع الإلكتروني
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="iframe">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="iframe">Iframe Code</TabsTrigger>
                  <TabsTrigger value="script">Script Code</TabsTrigger>
                </TabsList>
                <TabsContent value="iframe" className="space-y-3">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-64" dir="ltr">
                      <code>{embedCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 left-2"
                      onClick={() => copyToClipboard(embedCode, 'كود Iframe')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    الصق هذا الكود مباشرة في HTML الخاص بالموقع
                  </p>
                </TabsContent>
                <TabsContent value="script" className="space-y-3">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-64" dir="ltr">
                      <code>{scriptCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 left-2"
                      onClick={() => copyToClipboard(scriptCode, 'كود Script')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    يتم تحميل الويدجت ديناميكياً في عنصر div بمعرف tawsia-reviews-widget
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Direct Link */}
          <Card>
            <CardHeader>
              <CardTitle>رابط الويدجت المباشر</CardTitle>
              <CardDescription>
                استخدم هذا الرابط للوصول المباشر إلى الويدجت
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={widgetUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
                  dir="ltr"
                />
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(widgetUrl, 'الرابط المباشر')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات مهمة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Badge variant="secondary">نصيحة</Badge>
              <p className="text-sm">
                الويدجت يعرض المراجعات المعتمدة فقط
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">تحديث</Badge>
              <p className="text-sm">
                يتم تحديث المراجعات تلقائياً عند كل تحميل
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">شعار</Badge>
              <p className="text-sm">
                الضغط على الشعار يفتح صفحة الشركة في توصية
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

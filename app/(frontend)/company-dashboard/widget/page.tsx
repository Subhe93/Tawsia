'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Copy, Code, Eye, Monitor, Smartphone, Tablet } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CompanyWidgetPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [companyId, setCompanyId] = useState<string>('')
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
    // Get company ID from session
    const fetchCompanyId = async () => {
      try {
        const response = await fetch('/api/company-dashboard/info')
        const data = await response.json()
        console.log('Company dashboard widget - fetched data:', data)
        if (data.company?.id) {
          console.log('Setting company ID:', data.company.id)
          setCompanyId(data.company.id)
        } else {
          console.error('No company ID in response')
          toast.error('لم يتم العثور على معرف الشركة')
        }
      } catch (error) {
        console.error('Error fetching company ID:', error)
        toast.error('فشل في تحميل بيانات الشركة')
      }
    }

    if (status === 'authenticated') {
      fetchCompanyId()
    }
  }, [status])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const widgetUrl = `${baseUrl}/api/widget/reviews/${companyId}?size=${size}&orientation=${orientation}&theme=${theme}${orientation === 'vertical' ? `&commentsCount=${commentsCount}` : ''}`

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

  const embedCode = `<!-- Tawsia Reviews Widget -->
<iframe 
  src="${widgetUrl}"
  width="100%" 
  height="${getEmbedHeight()}"
  frameborder="0"
  scrolling="${orientation === 'vertical' || size === 'xl' ? 'yes' : 'no'}"
  style="border: none; border-radius: 8px;"
></iframe>`

  const scriptCode = `<!-- Tawsia Reviews Widget Script -->
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ويدجت المراجعات</h1>
        <p className="text-muted-foreground mt-2">
          اعرض مراجعات شركتك على موقعك الإلكتروني باستخدام كود بسيط
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات العرض</CardTitle>
              <CardDescription>
                اختر حجم ونمط العرض المناسب لموقعك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Settings Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Orientation Selection */}
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

                {/* Theme Selection */}
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

              {/* Size Selection */}
              <div className="space-y-3">
                <Label>حجم الويدجت</Label>
                <RadioGroup value={size} onValueChange={(v) => setSize(v as any)} className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {orientation === 'horizontal' && (
                    <div className="flex items-center space-x-2 space-x-reverse p-2 border rounded-lg">
                      <RadioGroupItem value="xl" id="xl" />
                      <Label htmlFor="xl" className="flex items-center gap-2 cursor-pointer">
                        <Monitor className="h-4 w-4" />
                        <span className="font-medium text-sm">XL</span>
                      </Label>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 space-x-reverse p-2 border rounded-lg">
                    <RadioGroupItem value="l" id="l" />
                    <Label htmlFor="l" className="flex items-center gap-2 cursor-pointer">
                      <Tablet className="h-4 w-4" />
                      <span className="font-medium text-sm">L</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse p-2 border rounded-lg">
                    <RadioGroupItem value="m" id="m" />
                    <Label htmlFor="m" className="flex items-center gap-2 cursor-pointer">
                      <Smartphone className="h-4 w-4" />
                      <span className="font-medium text-sm">M</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse p-2 border rounded-lg">
                    <RadioGroupItem value="s" id="s" />
                    <Label htmlFor="s" className="flex items-center gap-2 cursor-pointer">
                      <Smartphone className="h-4 w-4" />
                      <span className="font-medium text-sm">S</span>
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

              {/* Preview Section */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  معاينة مباشرة
                </Label>
                {companyId ? (
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
                ) : (
                  <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
                    <p className="text-muted-foreground">جاري تحميل البيانات...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Embed Code */}
          <Card>
            <CardHeader>
              <CardTitle>كود التضمين</CardTitle>
              <CardDescription>
                انسخ الكود والصقه في موقعك الإلكتروني
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="iframe">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="iframe">Iframe</TabsTrigger>
                  <TabsTrigger value="script">Script</TabsTrigger>
                </TabsList>
                <TabsContent value="iframe" className="space-y-3">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto" dir="ltr">
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
                    الصق هذا الكود مباشرة في HTML الخاص بموقعك
                  </p>
                </TabsContent>
                <TabsContent value="script" className="space-y-3">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto" dir="ltr">
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
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
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
                  الضغط على الشعار يفتح صفحة شركتك في توصية
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

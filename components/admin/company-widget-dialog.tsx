'use client'

import { useState, useEffect } from 'react'
import { Copy, Code } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface CompanyWidgetDialogProps {
  companyId: string
  companyName: string
  companySlug: string
}

export function CompanyWidgetDialog({ companyId, companyName, companySlug }: CompanyWidgetDialogProps) {
  const [size, setSize] = useState<'xl' | 'l' | 'm' | 's'>('xl')
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [commentsCount, setCommentsCount] = useState<number>(5)

  // When orientation changes to vertical, reset size if it's XL
  useEffect(() => {
    if (orientation === 'vertical' && size === 'xl') {
      setSize('l')
    }
  }, [orientation, size])

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

  const embedCode = `<!-- Tawsia Reviews Widget for ${companyName} -->
<iframe 
  src="${widgetUrl}"
  width="100%" 
  height="${getEmbedHeight()}"
  frameborder="0"
  scrolling="${orientation === 'vertical' || size === 'xl' ? 'yes' : 'no'}"
  style="border: none; border-radius: 8px;"
></iframe>`

  const scriptCode = `<!-- Tawsia Reviews Widget Script for ${companyName} -->
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="كود الويدجت">
          <Code className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>كود ويدجت المراجعات</DialogTitle>
          <DialogDescription>
            قم بإنشاء كود ويدجت لعرض مراجعات {companyName} على الموقع الإلكتروني
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Configuration */}
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>حجم الويدجت</Label>
              <RadioGroup value={size} onValueChange={(v) => setSize(v as any)}>
                {orientation === 'horizontal' && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="xl" id="admin-xl" />
                    <Label htmlFor="admin-xl" className="cursor-pointer">
                      كبير جداً (XL) - عرض كامل للمراجعات
                    </Label>
                  </div>
                )}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="l" id="admin-l" />
                  <Label htmlFor="admin-l" className="cursor-pointer">
                    كبير (L) - ملخص التقييم
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="m" id="admin-m" />
                  <Label htmlFor="admin-m" className="cursor-pointer">
                    متوسط (M) - ملخص متوسط
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="s" id="admin-s" />
                  <Label htmlFor="admin-s" className="cursor-pointer">
                    صغير (S) - ملخص مضغوط
                  </Label>
                </div>
              </RadioGroup>
            </div>

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

          {/* Preview */}
          <div className="space-y-3">
            <Label>معاينة</Label>
            <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
              <iframe
                src={widgetUrl}
                width="100%"
                height={orientation === 'vertical' ? '600' : size === 'xl' ? '210' : size === 'l' ? '160' : size === 'm' ? '125' : '45'}
                className="border-0"
                title="معاينة الويدجت"
              />
            </div>
          </div>

          {/* Embed Code */}
          <div className="space-y-3">
            <Tabs defaultValue="iframe">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="iframe">Iframe Code</TabsTrigger>
                <TabsTrigger value="script">Script Code</TabsTrigger>
              </TabsList>
              <TabsContent value="iframe" className="space-y-3">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-48" dir="ltr">
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
              </TabsContent>
              <TabsContent value="script" className="space-y-3">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-48" dir="ltr">
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
              </TabsContent>
            </Tabs>
          </div>

          {/* Direct Link */}
          <div className="space-y-3">
            <Label>رابط مباشر</Label>
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

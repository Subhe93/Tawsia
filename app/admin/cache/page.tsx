'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Server, 
  Building, 
  Globe, 
  RefreshCw, 
  Trash2, 
  Info,
  Clock,
  Database,
  HardDrive
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface CacheInfo {
  availableActions: Record<string, string>
  examples: Record<string, any>
}

export default function CacheManagementPage() {
  const { data: session } = useSession()
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [clearingType, setClearingType] = useState<string | null>(null)
  const [lastClearTime, setLastClearTime] = useState<string | null>(null)

  useEffect(() => {
    fetchCacheInfo()
    
    // تحديث معلومات آخر تفريغ من localStorage
    const lastClear = localStorage.getItem('lastCacheClear')
    if (lastClear) {
      setLastClearTime(lastClear)
    }
  }, [])

  const fetchCacheInfo = async () => {
    try {
      const response = await fetch('/api/admin/cache/clear')
      if (response.ok) {
        const data = await response.json()
        setCacheInfo(data)
      }
    } catch (error) {
      console.error('خطأ في جلب معلومات الكاش:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearCache = async (type: string) => {
    setClearingType(type)
    
    try {
      const response = await fetch('/api/admin/cache/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type })
      })

      if (!response.ok) {
        throw new Error('فشل في تفريغ الكاش')
      }

      const data = await response.json()
      
      toast.success('تم تفريغ الكاش بنجاح', {
        description: `تم تفريغ ${data.clearedItems?.length || 0} عنصر من الكاش`,
        duration: 3000,
      })

      // حفظ وقت التفريغ
      const currentTime = new Date().toLocaleString()
      setLastClearTime(currentTime)
      localStorage.setItem('lastCacheClear', currentTime)

      // إعادة تحميل الصفحة بعد ثانيتين للأنواع الشاملة
      if (type === 'all') {
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }

    } catch (error) {
      console.error('خطأ في تفريغ الكاش:', error)
      toast.error('فشل في تفريغ الكاش', {
        description: 'حدث خطأ أثناء محاولة تفريغ الكاش. يرجى المحاولة مرة أخرى.',
        duration: 4000,
      })
    } finally {
      setClearingType(null)
    }
  }

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return null
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          إدارة الكاش
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          تفريغ وإدارة كاش الموقع لضمان عرض البيانات المحدثة
        </p>
      </div>

      {lastClearTime && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            آخر تفريغ للكاش كان في: {lastClearTime}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* داشبورد الأدمن */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-500" />
              داشبورد الأدمن
            </CardTitle>
            <CardDescription>
              تفريغ كاش لوحة تحكم المدير وجميع صفحاتها
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>الصفحات المشمولة:</span>
                <Badge variant="secondary">7 صفحات</Badge>
              </div>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• الصفحة الرئيسية</li>
                <li>• إدارة الشركات</li>
                <li>• إدارة المستخدمين</li>
                <li>• المراجعات والتقييمات</li>
                <li>• الإحصائيات</li>
              </ul>
            </div>
            <Button 
              onClick={() => clearCache('admin')}
              disabled={clearingType === 'admin'}
              className="w-full"
            >
              {clearingType === 'admin' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  جاري التفريغ...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  تفريغ كاش الأدمن
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* داشبورد الشركات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-green-500" />
              داشبورد الشركات
            </CardTitle>
            <CardDescription>
              تفريغ كاش جميع لوحات تحكم الشركات
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>الصفحات المشمولة:</span>
                <Badge variant="secondary">5 صفحات</Badge>
              </div>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• الملف الشخصي</li>
                <li>• المراجعات</li>
                <li>• الإحصائيات</li>
                <li>• الإعدادات</li>
              </ul>
            </div>
            <Button 
              onClick={() => clearCache('company')}
              disabled={clearingType === 'company'}
              className="w-full"
              variant="outline"
            >
              {clearingType === 'company' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  جاري التفريغ...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  تفريغ كاش الشركات
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* الموقع بالكامل */}
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-orange-500" />
              الموقع بالكامل
            </CardTitle>
            <CardDescription>
              تفريغ كاش الموقع بالكامل - استخدم بحذر!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                سيؤثر على جميع الصفحات وقد يبطئ الموقع مؤقتاً
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => clearCache('all')}
              disabled={clearingType === 'all'}
              className="w-full"
              variant="destructive"
            >
              {clearingType === 'all' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  جاري التفريغ الشامل...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  تفريغ شامل
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* معلومات إضافية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            معلومات الكاش
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                أنواع الكاش
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• كاش الصفحات (Page Cache)</li>
                <li>• كاش البيانات (Data Cache)</li>
                <li>• كاش الصور (Image Cache)</li>
                <li>• كاش API (API Cache)</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">متى يجب تفريغ الكاش؟</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• بعد تحديث البيانات</li>
                <li>• عند عدم ظهور التغييرات</li>
                <li>• بعد تحديث الإعدادات</li>
                <li>• عند مواجهة مشاكل في العرض</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">نصائح مهمة</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• استخدم التفريغ المحدد أولاً</li>
                <li>• تجنب التفريغ الشامل إلا عند الضرورة</li>
                <li>• انتظر اكتمال العملية</li>
                <li>• تحقق من النتائج بعد التفريغ</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Globe, 
  Save,
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

export default function SocialMediaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)

  const [socialMedia, setSocialMedia] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
  })

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

    fetchSocialMedia()
  }, [session, status, router])

  const fetchSocialMedia = async () => {
    try {
      setIsDataLoading(true)
      const response = await fetch('/api/company/social-media')
      if (response.ok) {
        const data = await response.json()
        // تحويل البيانات من النظام القديم إلى النظام الجديد
        if (data.socialMedia && Array.isArray(data.socialMedia)) {
          const socialMap = Object.fromEntries(
            data.socialMedia.map((social: any) => [social.platform, social.url])
          )
          setSocialMedia(prev => ({ ...prev, ...socialMap }))
        }
      } else {
        toast.error('فشل في جلب وسائل التواصل')
      }
    } catch (error) {
      toast.error('حدث خطأ في جلب البيانات')
    } finally {
      setIsDataLoading(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // تحويل البيانات إلى تنسيق مناسب للحفظ
      const socialMediaData = Object.entries(socialMedia)
        .filter(([platform, url]) => url.trim())
        .map(([platform, url]) => ({ platform, url }))

      const response = await fetch('/api/company/social-media', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(socialMediaData)
      })

      if (response.ok) {
        toast.success('تم حفظ وسائل التواصل بنجاح')
        fetchSocialMedia() // إعادة جلب البيانات
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في حفظ وسائل التواصل')
      }
    } catch (error) {
      toast.error('حدث خطأ في حفظ وسائل التواصل')
    } finally {
      setIsLoading(false)
    }
  }

  const validateUrl = (url: string) => {
    if (!url) return true // السماح بالحقول الفارغة
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const openUrl = (url: string) => {
    if (validateUrl(url) && url) {
      window.open(url, '_blank')
    }
  }

  if (status === 'loading' || isDataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          وسائل التواصل الاجتماعي
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          إدارة حسابات شركتك على وسائل التواصل الاجتماعي
        </p>
      </div>

      {/* وسائل التواصل الاجتماعي */}
      <Card>
        <CardHeader>
          <CardTitle>وسائل التواصل الاجتماعي</CardTitle>
          <CardDescription>روابط صفحات الشركة على وسائل التواصل الاجتماعي</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">فيسبوك</Label>
                <Input
                  id="facebook"
                  value={socialMedia.facebook}
                  onChange={(e) => setSocialMedia(prev => ({ ...prev, facebook: e.target.value }))}
                  placeholder="https://facebook.com/company"
                  className="text-left"
                  dir="ltr"
                />
                {socialMedia.facebook && !validateUrl(socialMedia.facebook) && (
                  <p className="text-sm text-red-600">الرابط غير صحيح</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">تويتر</Label>
                <Input
                  id="twitter"
                  value={socialMedia.twitter}
                  onChange={(e) => setSocialMedia(prev => ({ ...prev, twitter: e.target.value }))}
                  placeholder="https://twitter.com/company"
                  className="text-left"
                  dir="ltr"
                />
                {socialMedia.twitter && !validateUrl(socialMedia.twitter) && (
                  <p className="text-sm text-red-600">الرابط غير صحيح</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">إنستغرام</Label>
                <Input
                  id="instagram"
                  value={socialMedia.instagram}
                  onChange={(e) => setSocialMedia(prev => ({ ...prev, instagram: e.target.value }))}
                  placeholder="https://instagram.com/company"
                  className="text-left"
                  dir="ltr"
                />
                {socialMedia.instagram && !validateUrl(socialMedia.instagram) && (
                  <p className="text-sm text-red-600">الرابط غير صحيح</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">لينكدإن</Label>
                <Input
                  id="linkedin"
                  value={socialMedia.linkedin}
                  onChange={(e) => setSocialMedia(prev => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/company/company"
                  className="text-left"
                  dir="ltr"
                />
                {socialMedia.linkedin && !validateUrl(socialMedia.linkedin) && (
                  <p className="text-sm text-red-600">الرابط غير صحيح</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube">يوتيوب</Label>
                <Input
                  id="youtube"
                  value={socialMedia.youtube}
                  onChange={(e) => setSocialMedia(prev => ({ ...prev, youtube: e.target.value }))}
                  placeholder="https://youtube.com/@company"
                  className="text-left"
                  dir="ltr"
                />
                {socialMedia.youtube && !validateUrl(socialMedia.youtube) && (
                  <p className="text-sm text-red-600">الرابط غير صحيح</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok">تيك توك</Label>
                <Input
                  id="tiktok"
                  value={socialMedia.tiktok}
                  onChange={(e) => setSocialMedia(prev => ({ ...prev, tiktok: e.target.value }))}
                  placeholder="https://tiktok.com/@company"
                  className="text-left"
                  dir="ltr"
                />
                {socialMedia.tiktok && !validateUrl(socialMedia.tiktok) && (
                  <p className="text-sm text-red-600">الرابط غير صحيح</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>جاري الحفظ...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span>حفظ التغييرات</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* نصائح */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>نصائح مهمة:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>تأكد من صحة الروابط قبل الحفظ</li>
            <li>استخدم الروابط الكاملة بدءاً من https://</li>
            <li>الحقول الفارغة لن تظهر للزوار</li>
            <li>يمكنك ترك أي حقل فارغاً إذا لم تكن تملك حساباً على تلك المنصة</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* معاينة الروابط النشطة */}
      {Object.entries(socialMedia).some(([platform, url]) => url && validateUrl(url)) && (
        <Card>
          <CardHeader>
            <CardTitle>معاينة الروابط النشطة</CardTitle>
            <CardDescription>
              هذه الروابط ستظهر للزوار في صفحة شركتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(socialMedia)
                .filter(([platform, url]) => url && validateUrl(url))
                .map(([platform, url]) => (
                  <Button
                    key={platform}
                    variant="outline"
                    size="sm"
                    onClick={() => openUrl(url)}
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="capitalize">{platform}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


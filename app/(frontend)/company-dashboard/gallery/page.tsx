'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Camera, 
  Upload, 
  Image as ImageIcon,
  Trash2,
  Edit,
  Save,
  X,
  Plus,
  Eye,
  Download,
  Star,
  MoreHorizontal
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface GalleryImage {
  id: string
  imageUrl: string
  altText: string
  sortOrder: number
  isActive: boolean
  createdAt: string
}

export default function GalleryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [images, setImages] = useState<GalleryImage[]>([])
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)

  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [editingImage, setEditingImage] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'جميع الصور' },
    { id: 'office', name: 'المكتب' },
    { id: 'team', name: 'فريق العمل' },
    { id: 'products', name: 'المنتجات' },
    { id: 'services', name: 'الخدمات' },
    { id: 'events', name: 'الفعاليات' }
  ]

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

    fetchImages()
  }, [session, status, router])

  const fetchImages = async () => {
    try {
      setIsDataLoading(true)
      const response = await fetch('/api/company/gallery')
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
        setMainImage(data.mainImage || null)
      } else {
        toast.error('فشل في جلب الصور')
      }
    } catch (error) {
      toast.error('حدث خطأ في جلب البيانات')
    } finally {
      setIsDataLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // رفع الملف أولاً (هنا نحتاج API لرفع الملفات)
        const formData = new FormData()
        formData.append('file', file)
        
        // محاكاة رفع الملف - في التطبيق الحقيقي نحتاج upload API
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        let imageUrl = URL.createObjectURL(file) // fallback للمحاكاة
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
        }
        
        // إضافة الصورة إلى قاعدة البيانات
        const response = await fetch('/api/company/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl,
            altText: file.name.split('.')[0],
            title: file.name.split('.')[0],
            category: 'office'
          })
        })
        
        if (!response.ok) {
          throw new Error('فشل في إضافة الصورة')
        }
      }
      
      toast.success(`تم رفع ${files.length} صورة بنجاح`)
      fetchImages() // تحديث البيانات
    } catch (error) {
      toast.error('حدث خطأ في رفع الصور')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const updateImage = async (id: string, updates: Partial<GalleryImage>) => {
    try {
      const response = await fetch(`/api/company/gallery/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        fetchImages()
        toast.success('تم تحديث الصورة بنجاح')
      } else {
        toast.error('فشل في تحديث الصورة')
      }
    } catch (error) {
      toast.error('حدث خطأ في تحديث الصورة')
    }
  }

  const deleteImage = async (id: string) => {
    try {
      const response = await fetch(`/api/company/gallery/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchImages()
        toast.success('تم حذف الصورة')
      } else {
        toast.error('فشل في حذف الصورة')
      }
    } catch (error) {
      toast.error('حدث خطأ في حذف الصورة')
    }
  }

  const setAsMainImage = async (id: string) => {
    try {
      const response = await fetch(`/api/company/gallery/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isMainImage: true })
      })

      if (response.ok) {
        fetchImages()
        toast.success('تم تعيين الصورة كصورة رئيسية')
      } else {
        toast.error('فشل في تعيين الصورة الرئيسية')
      }
    } catch (error) {
      toast.error('حدث خطأ في العملية')
    }
  }

  const downloadImage = async (url: string, title: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${title}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      toast.error('فشل في تحميل الصورة')
    }
  }

  const filteredImages = images // يمكن إضافة فلترة لاحقاً حسب الحاجة

  const mainImageData = images.length > 0 ? images[0] : null

  if (status === 'loading' || isDataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            معرض الصور
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة صور شركتك ومعرض الأعمال
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 ml-2 animate-spin" />
                جاري الرفع...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 ml-2" />
                رفع صور
              </>
            )}
          </Button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الصور</p>
                <p className="text-2xl font-bold">{images.length}</p>
              </div>
              <ImageIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الصور النشطة</p>
                <p className="text-2xl font-bold">{images.filter(img => img.isActive).length}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الصورة الرئيسية</p>
                <p className="text-lg font-bold">{mainImage ? 'محددة' : 'غير محددة'}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الفئات</p>
                <p className="text-2xl font-bold">{categories.length - 1}</p>
              </div>
              <Camera className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الصورة الرئيسية */}
      {mainImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              الصورة الرئيسية
            </CardTitle>
            <CardDescription>
              هذه الصورة تظهر كصورة رئيسية لشركتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-full md:w-64 h-48">
                <img
                  src={mainImage}
                  alt="الصورة الرئيسية للشركة"
                  className="w-full h-full object-cover rounded-lg"
                />
                <Badge className="absolute top-2 right-2">
                  رئيسية
                </Badge>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg">الصورة الرئيسية</h3>
                <p className="text-gray-600">صورة رئيسية لشركتك</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* البحث */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="البحث في الصور..."
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* معرض الصور */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            معرض الصور
          </CardTitle>
          <CardDescription>
            جميع صور شركتك ({filteredImages.length} صورة)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد صور
              </h3>
              <p className="text-gray-500 mb-4">
                ابدأ برفع صور شركتك لإنشاء معرض جذاب
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 ml-2" />
                رفع أول صورة
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <img
                        src={image.imageUrl}
                        alt={image.altText}
                        className="w-full h-full object-cover"
                      />
                      {mainImage === image.imageUrl && (
                        <Badge className="absolute top-2 right-2">
                          <Star className="h-3 w-3 ml-1" />
                          رئيسية
                        </Badge>
                      )}
                      {!image.isActive && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Badge variant="secondary">غير نشطة</Badge>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      {editingImage === image.id ? (
                        <div className="space-y-3">
                          <Input
                            value={image.altText}
                            onChange={(e) => updateImage(image.id, { altText: e.target.value })}
                            placeholder="وصف الصورة"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => setEditingImage(null)}
                            >
                              <Save className="h-3 w-3 ml-1" />
                              حفظ
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingImage(null)}
                            >
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-sm mb-1">{image.altText}</h3>
                          <p className="text-gray-600 text-xs mb-2">
                            {new Date(image.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              ترتيب: {image.sortOrder}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedImage(image)}>
                                  <Eye className="h-4 w-4 ml-2" />
                                  عرض
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditingImage(image.id)}>
                                  <Edit className="h-4 w-4 ml-2" />
                                  تعديل
                                </DropdownMenuItem>
                                {mainImage !== image.imageUrl && (
                                  <DropdownMenuItem onClick={() => setAsMainImage(image.id)}>
                                    <Star className="h-4 w-4 ml-2" />
                                    جعلها رئيسية
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => updateImage(image.id, { isActive: !image.isActive })}>
                                  <Eye className="h-4 w-4 ml-2" />
                                  {image.isActive ? 'إخفاء' : 'إظهار'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => downloadImage(image.imageUrl, image.altText)}>
                                  <Download className="h-4 w-4 ml-2" />
                                  تحميل
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => deleteImage(image.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  حذف
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* مودال عرض الصورة */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.altText}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.altText}
                className="w-full max-h-96 object-contain rounded-lg"
              />
              <div className="space-y-2">
                <p className="text-gray-600">تاريخ الإضافة: {new Date(selectedImage.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    ترتيب: {selectedImage.sortOrder}
                  </Badge>
                  {mainImage === selectedImage.imageUrl && (
                    <Badge>
                      <Star className="h-3 w-3 ml-1" />
                      صورة رئيسية
                    </Badge>
                  )}
                  <Badge variant={selectedImage.isActive ? 'default' : 'secondary'}>
                    {selectedImage.isActive ? 'نشطة' : 'غير نشطة'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

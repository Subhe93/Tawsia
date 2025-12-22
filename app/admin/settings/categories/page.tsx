'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  Building2,
  Eye,
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
  DialogTrigger,
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
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface Category {
  id: string
  slug: string
  name: string
  icon?: string
  description?: string
  companiesCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    description: '',
    isActive: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

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

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        ...(search && { search })
      })

      const response = await fetch(`/api/admin/categories?${params}`)
      if (!response.ok) {
        let errorMessage = 'فشل في تحميل الفئات'
        let errorDescription = ''

        switch (response.status) {
          case 401:
            errorDescription = 'ليس لديك صلاحية لعرض الفئات.'
            break
          case 500:
            errorDescription = 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.'
            break
          default:
            errorDescription = `رمز الخطأ: ${response.status}. يرجى المحاولة مرة أخرى.`
        }

        toast.error(errorMessage, {
          description: errorDescription,
          duration: 4000,
        })

        throw new Error('فشل في جلب الفئات')
      }

      const data = await response.json()
      setCategories(data.categories)

      // إشعار نجاح (فقط عند التحميل الأولي)
      if (!search) {
        toast.success('تم تحميل الفئات بنجاح', {
          description: `تم تحميل ${data.categories?.length || 0} فئة`,
          duration: 2000,
        })
      }
    } catch (error) {
      console.error('خطأ في جلب الفئات:', error)
      if (!error.message?.includes('فشل في جلب الفئات')) {
        toast.error('خطأ في الاتصال بالخادم', {
          description: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
          duration: 5000,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchCategories()
    }
  }, [session, search])

  const handleSearch = (value: string) => {
    setSearch(value)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      icon: '',
      description: '',
      isActive: true
    })
    setEditingCategory(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon || '',
      description: category.description || '',
      isActive: category.isActive
    })
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'

      const method = editingCategory ? 'PATCH' : 'POST'
      const action = editingCategory ? 'تحديث' : 'إضافة'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()

        if (editingCategory) {
          setCategories(prev =>
            prev.map(cat =>
              cat.id === editingCategory.id ? data.category : cat
            )
          )
        } else {
          setCategories(prev => [data.category, ...prev])
        }

        // إشعار نجاح مفصل
        toast.success(`تم ${action} الفئة بنجاح`, {
          description: `الفئة "${formData.name}" تم ${action}ها بنجاح وهي الآن ${formData.isActive ? 'نشطة' : 'غير نشطة'}.`,
          duration: 4000,
        })

        setIsDialogOpen(false)
        resetForm()
      } else {
        // معالجة أخطاء HTTP المختلفة
        const errorData = await response.json()
        let errorMessage = `فشل في ${action} الفئة`
        let errorDescription = ''

        switch (response.status) {
          case 400:
            errorDescription = errorData.error || 'البيانات المدخلة غير صحيحة. يرجى التحقق من جميع الحقول.'
            break
          case 401:
            errorDescription = 'ليس لديك صلاحية لتنفيذ هذا الإجراء.'
            break
          case 404:
            errorDescription = 'الفئة المطلوبة غير موجودة.'
            break
          case 409:
            errorDescription = errorData.error || 'فئة بهذا الاسم موجودة مسبقاً.'
            break
          case 500:
            errorDescription = 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.'
            break
          default:
            errorDescription = `رمز الخطأ: ${response.status}. ${errorData.error || 'يرجى المحاولة مرة أخرى.'}`
        }

        toast.error(errorMessage, {
          description: errorDescription,
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('خطأ في حفظ الفئة:', error)
      const action = editingCategory ? 'تحديث' : 'إضافة'

      toast.error(`خطأ في ${action} الفئة`, {
        description: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    try {
      const category = categories.find(c => c.id === categoryId)

      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId))

        toast.success('تم حذف الفئة بنجاح', {
          description: `الفئة "${category?.name || 'غير معروف'}" تم حذفها نهائياً من النظام.`,
          duration: 4000,
        })
      } else {
        const errorData = await response.json()
        let errorDescription = ''

        switch (response.status) {
          case 400:
            errorDescription = errorData.error || 'لا يمكن حذف الفئة في الوقت الحالي.'
            break
          case 401:
            errorDescription = 'ليس لديك صلاحية لحذف هذه الفئة.'
            break
          case 404:
            errorDescription = 'الفئة غير موجودة أو تم حذفها مسبقاً.'
            break
          case 409:
            errorDescription = 'لا يمكن حذف الفئة لأنها مرتبطة بشركات.'
            break
          default:
            errorDescription = errorData.error || 'حدث خطأ غير متوقع.'
        }

        toast.error('فشل في حذف الفئة', {
          description: errorDescription,
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('خطأ في حذف الفئة:', error)
      toast.error('خطأ في حذف الفئة', {
        description: 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
        duration: 5000,
      })
    }
  }

  const handleToggleActive = async (categoryId: string, isActive: boolean) => {
    try {
      const category = categories.find(c => c.id === categoryId)
      const statusText = isActive ? 'تفعيل' : 'إلغاء تفعيل'

      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        setCategories(prev =>
          prev.map(cat =>
            cat.id === categoryId ? { ...cat, isActive } : cat
          )
        )

        toast.success(`تم ${statusText} الفئة بنجاح`, {
          description: `الفئة "${category?.name || 'غير معروف'}" أصبحت الآن ${isActive ? 'نشطة' : 'غير نشطة'}.`,
          duration: 3000,
        })
      } else {
        const errorData = await response.json()
        toast.error(`فشل في ${statusText} الفئة`, {
          description: errorData.error || 'حدث خطأ أثناء تحديث الحالة.',
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة الفئة:', error)
      const statusText = isActive ? 'تفعيل' : 'إلغاء تفعيل'

      toast.error(`خطأ في ${statusText} الفئة`, {
        description: 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
        duration: 4000,
      })
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // استبدال أي شيء غير إنجليزي أو أرقام بـ -
      .replace(/^-+|-+$/g, '') // إزالة - من البداية والنهاية
  }

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            إدارة الفئات
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة فئات الشركات والخدمات
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة فئة جديدة
        </Button>
      </div>

      {/* البحث */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في الفئات..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* جدول الفئات */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الفئات</CardTitle>
          <CardDescription>
            إدارة جميع فئات الشركات ({categories.length} فئة)
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
          ) : categories.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الفئة</TableHead>
                    <TableHead>المعرف</TableHead>
                    <TableHead>عدد الشركات</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            {category.icon ? (
                              <Tag className="h-5 w-5 text-gray-600" />
                            ) : (
                              <Tag className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </p>
                            {category.description && (
                              <p className="text-sm text-gray-500 line-clamp-1 max-w-[200px]">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {category.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span>{category.companiesCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Switch
                            checked={category.isActive}
                            onCheckedChange={(checked) => handleToggleActive(category.id, checked)}
                          />
                          <Badge
                            variant={category.isActive ? 'default' : 'secondary'}
                            className={category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                          >
                            {category.isActive ? 'نشطة' : 'غير نشطة'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                disabled={category.companiesCount > 0}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف الفئة</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف فئة "{category.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
                                  {category.companiesCount > 0 && (
                                    <span className="block mt-2 text-red-600">
                                      تحتوي هذه الفئة على {category.companiesCount} شركة ولا يمكن حذفها.
                                    </span>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                {category.companiesCount === 0 && (
                                  <AlertDialogAction
                                    onClick={() => handleDelete(category.id)}
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
            </div>
          ) : (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد فئات
              </h3>
              <p className="text-gray-500 mb-4">
                لم يتم العثور على فئات تطابق معايير البحث
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة أول فئة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة إضافة/تعديل فئة */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'تعديل معلومات الفئة' : 'إضافة فئة جديدة للشركات'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                اسم الفئة *
              </label>
              <Input
                placeholder="مثال: مطاعم، فنادق، خدمات طبية"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  }))
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                المعرف (Slug) *
              </label>
              <Input
                placeholder="restaurants, hotels, medical-services"
                value={formData.slug}
                onChange={(e) => {
                  const val = e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '');
                  setFormData(prev => ({ ...prev, slug: val }));
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                الأيقونة (اختياري)
              </label>
              <Input
                placeholder="اسم الأيقونة من Lucide React"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                الوصف (اختياري)
              </label>
              <Textarea
                placeholder="وصف مختصر للفئة..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                فئة نشطة
              </label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
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
              disabled={!formData.name || !formData.slug || isSubmitting}
            >
              <Save className="h-4 w-4 ml-2" />
              {isSubmitting ? 'جاري الحفظ...' : (editingCategory ? 'تحديث' : 'إضافة')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Edit, Trash2, Tag, Save, X, ArrowDownUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface SubCategory {
  id: string
  slug: string
  name: string
  icon?: string
  description?: string
  companiesCount: number
  isActive: boolean
  categoryId: string
  categoryName: string
}

interface Category {
  id: string
  name: string
}

export default function AdminSubCategoriesPage() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    description: '',
    isActive: true,
    categoryId: ''
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
      const response = await fetch('/api/admin/categories?activeOnly=true')
      if (response.ok) {
        const data = await response.json()
        setAllCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories', error)
      toast.error('فشل في تحميل الفئات الرئيسية')
    }
  }

  const fetchSubCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/subcategories`)
      if (!response.ok) {
        toast.error('فشل في تحميل التصنيفات الفرعية')
        throw new Error('Failed to fetch subcategories')
      }
      const data = await response.json()
      setSubCategories(data.subCategories)
      toast.success(`تم تحميل ${data.subCategories?.length || 0} تصنيف فرعي بنجاح`)
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchCategories()
      fetchSubCategories()
    }
  }, [session])

  const resetForm = () => {
    setFormData({ name: '', slug: '', icon: '', description: '', isActive: true, categoryId: '' })
    setEditingSubCategory(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (subCategory: SubCategory) => {
    setFormData({
      name: subCategory.name,
      slug: subCategory.slug,
      icon: subCategory.icon || '',
      description: subCategory.description || '',
      isActive: subCategory.isActive,
      categoryId: subCategory.categoryId
    })
    setEditingSubCategory(subCategory)
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.categoryId) {
        toast.error('يجب اختيار الفئة الرئيسية');
        return;
    }
    try {
      setIsSubmitting(true)
      const url = editingSubCategory ? `/api/admin/subcategories/${editingSubCategory.id}` : '/api/admin/subcategories'
      const method = editingSubCategory ? 'PATCH' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`تم ${editingSubCategory ? 'تحديث' : 'إضافة'} التصنيف الفرعي بنجاح`)
        fetchSubCategories() // Refresh the list
        setIsDialogOpen(false)
        resetForm()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في حفظ التصنيف الفرعي')
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (subCategoryId: string) => {
    try {
      const response = await fetch(`/api/admin/subcategories/${subCategoryId}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('تم حذف التصنيف الفرعي بنجاح')
        fetchSubCategories() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في حذف التصنيف الفرعي')
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم')
    }
  }
  
  const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')

  if (status === 'loading' || isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
  }

  if (!session) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة التصنيفات الفرعية</h1>
          <p className="text-gray-600 mt-2">إضافة وتعديل وحذف التصنيفات الفرعية للشركات</p>
        </div>
        <Button onClick={openCreateDialog}><Plus className="h-4 w-4 ml-2" /> إضافة تصنيف فرعي</Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Input placeholder="البحث في التصنيفات الفرعية..." onChange={(e) => setSearch(e.target.value)} className="pr-10" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>قائمة التصنيفات الفرعية ({subCategories.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>التصنيف الفرعي</TableHead><TableHead>التصنيف الرئيسي</TableHead><TableHead>المعرف</TableHead><TableHead>الحالة</TableHead><TableHead>الإجراءات</TableHead></TableRow></TableHeader>
            <TableBody>
              {subCategories.filter(sc => sc.name.includes(search)).map((subCategory) => (
                <TableRow key={subCategory.id}>
                  <TableCell>{subCategory.name}</TableCell>
                  <TableCell>{subCategory.categoryName}</TableCell>
                  <TableCell><code>{subCategory.slug}</code></TableCell>
                  <TableCell><Badge variant={subCategory.isActive ? 'default' : 'secondary'}>{subCategory.isActive ? 'نشط' : 'غير نشط'}</Badge></TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(subCategory)}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-red-600"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>حذف التصنيف الفرعي</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف "{subCategory.name}"؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(subCategory.id)} className="bg-red-600">حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingSubCategory ? 'تعديل' : 'إضافة'} تصنيف فرعي</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label>الفئة الرئيسية *</label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                <SelectTrigger><SelectValue placeholder="اختر الفئة الرئيسية" /></SelectTrigger>
                <SelectContent>
                  {allCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label>اسم التصنيف الفرعي *</label>
              <Input placeholder="مثال: تطوير مواقع الويب" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value, slug: generateSlug(e.target.value) }))} />
            </div>
            <div>
              <label>المعرف (Slug) *</label>
              <Input placeholder="web-development" value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} />
            </div>
            <div>
              <label>الأيقونة (اختياري)</label>
              <Input placeholder="اسم أيقونة من Lucide React" value={formData.icon} onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))} />
            </div>
            <div>
              <label>الوصف (اختياري)</label>
              <Textarea placeholder="وصف مختصر..." value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between">
              <label>فعال</label>
              <Switch checked={formData.isActive} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name || !formData.slug || !formData.categoryId}>{isSubmitting ? 'جاري الحفظ...' : 'حفظ'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
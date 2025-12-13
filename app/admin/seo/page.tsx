'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminPagination } from '@/components/admin/pagination'
import { useFilterData } from '@/hooks/use-filter-data'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExternalLink, Search, Settings, Globe, MapPin, Building, Tag, Star, Plus, Edit, Trash2, RefreshCw } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

type SeoTargetType = 'COMPANY' | 'CATEGORY' | 'SUBCATEGORY' | 'COUNTRY' | 'CITY' | 'SUBAREA' | 'RANKING_PAGE' | 'CUSTOM_PATH'

interface TargetItem {
  type: SeoTargetType
  id: string
  name: string
  path: string
  defaultTitle: string
  defaultDescription: string
  override?: {
    title?: string | null
    metaDescription?: string | null
    noindex?: boolean
  }
}

interface ExploreItem {
  path: string
  title: string
  description: string
  type: string
  hasOverride: boolean
  noindex: boolean
}

export default function AdminSeoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  // States
  const [activeTab, setActiveTab] = useState<'manage' | 'explore'>('manage')
  const [type, setType] = useState<SeoTargetType>((searchParams.get('type') as SeoTargetType) || 'COMPANY')
  const [search, setSearch] = useState<string>(searchParams.get('search') || '')
  const [exploreSearch, setExploreSearch] = useState<string>('')
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '1', 10))
  const [limit, setLimit] = useState<number>(5)

  const [items, setItems] = useState<TargetItem[]>([])
  const [exploreItems, setExploreItems] = useState<ExploreItem[]>([])
  const [totalPages, setTotalPages] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isExploreLoading, setIsExploreLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Editing states
  const [editing, setEditing] = useState<TargetItem | null>(null)
  const [title, setTitle] = useState<string>('')
  const [metaDescription, setMetaDescription] = useState<string>('')
  const [noindex, setNoindex] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Custom path states
  const [customPath, setCustomPath] = useState<string>('')
  const [customTitle, setCustomTitle] = useState<string>('')
  const [customDescription, setCustomDescription] = useState<string>('')
  const [customNoindex, setCustomNoindex] = useState<boolean>(false)
  const [isSavingCustom, setIsSavingCustom] = useState<boolean>(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'customized' | 'default'>('all')
  const [noindexFilter, setNoindexFilter] = useState<'all' | 'true' | 'false'>('all')

  // Cascading filters
  const { countries, cities, subAreas, categories, subCategories, fetchCitiesByCountry } = useFilterData()
  const ALL = 'ALL'
  const [countryCode, setCountryCode] = useState<string>(ALL)
  const [citySlug, setCitySlug] = useState<string>(ALL)
  const [subAreaSlug, setSubAreaSlug] = useState<string>(ALL)
  const [categorySlug, setCategorySlug] = useState<string>(ALL)
  const [subcategorySlug, setSubcategorySlug] = useState<string>(ALL)

  // Auth check
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

  const typeOptions: { value: SeoTargetType; label: string; icon: any }[] = useMemo(() => [
    { value: 'COMPANY', label: 'شركات', icon: Building },
    { value: 'CATEGORY', label: 'تصنيفات', icon: Tag },
    { value: 'SUBCATEGORY', label: 'تصنيفات فرعية', icon: Tag },
    { value: 'COUNTRY', label: 'دول', icon: Globe },
    { value: 'CITY', label: 'مدن', icon: MapPin },
    { value: 'SUBAREA', label: 'مناطق فرعية', icon: MapPin },
    { value: 'RANKING_PAGE', label: 'صفحات الترتيب', icon: Star },
    { value: 'CUSTOM_PATH', label: 'مسارات مخصصة', icon: Plus },
  ], [])

  // Fetch items for manage tab
  const fetchItems = async () => {
    try {
      setIsLoading(true)
      setErrorMsg(null)
      
      const useOverridesList = type === 'CUSTOM_PATH'
      const qs = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search.trim()) qs.set('search', search.trim())
      if (useOverridesList) qs.set('targetType', 'CUSTOM_PATH')
      if (statusFilter !== 'all') qs.set('status', statusFilter)
      if (noindexFilter !== 'all') qs.set('noindex', noindexFilter)
      if (countryCode !== ALL) qs.set('country', countryCode)
      if (citySlug !== ALL) qs.set('city', citySlug)
      if (subAreaSlug !== ALL) qs.set('subarea', subAreaSlug)
      if (categorySlug !== ALL) qs.set('category', categorySlug)
      if (subcategorySlug !== ALL) qs.set('subcategory', subcategorySlug)

      const endpoint = useOverridesList ? '/api/admin/seo' : '/api/admin/seo/targets'
      if (!useOverridesList) {
        qs.set('type', type)
      }
      const res = await fetch(`${endpoint}?${qs.toString()}`)
      
      if (!res.ok) throw new Error('فشل في جلب البيانات')
      
      const json = await res.json()
      
      console.log('API Response:', json) // للتشخيص
      
      if (!json.success && json.error) {
        throw new Error(json.error.message || json.error)
      }
      
      const data = json.data || json.items || []
      const mapped: TargetItem[] = data.map((item: any) => ({
        type: item.type || type,
        id: item.id,
        name: item.name,
        path: item.path,
        defaultTitle: item.defaultTitle || '',
        defaultDescription: item.defaultDescription || '',
        override: item.override
      }))

      setItems(mapped)
      setTotalPages(json.pagination?.totalPages || 1)
    } catch (e: any) {
      console.error(e)
      setErrorMsg(e?.message || 'حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch explore items
  const fetchExploreItems = async () => {
    try {
      setIsExploreLoading(true)
      const qs = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (countryCode !== ALL) qs.set('country', countryCode)
      if (citySlug !== ALL) qs.set('city', citySlug)
      if (subAreaSlug !== ALL) qs.set('subarea', subAreaSlug)
      if (categorySlug !== ALL) qs.set('category', categorySlug)
      if (subcategorySlug !== ALL) qs.set('subcategory', subcategorySlug)
      if (exploreSearch.trim()) qs.set('search', exploreSearch.trim())
      if (type !== 'COMPANY') qs.set('type', type)
      
      const res = await fetch(`/api/admin/seo/explore?${qs.toString()}`)
      if (!res.ok) throw new Error('فشل في استكشاف الروابط')
      
      const json = await res.json()
      
      console.log('Explore API Response:', json) // للتشخيص
      
      if (!json.success && json.error) {
        throw new Error(json.error.message || json.error)
      }
      
      setExploreItems(json.data || [])
      setTotalPages(json.pagination?.totalPages || 1)
    } catch (e: any) {
      console.error(e)
      setErrorMsg(e?.message || 'حدث خطأ في الاستكشاف')
    } finally {
      setIsExploreLoading(false)
    }
  }

  // Effects
  useEffect(() => {
    if (!session) return
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') return
    if (activeTab === 'manage') {
    fetchItems()
    } else {
      fetchExploreItems()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, type, page, limit, statusFilter, noindexFilter, search, activeTab])

  // Open edit modal
  const openEdit = (item: TargetItem) => {
    setEditing(item)
    setTitle(item.override?.title || '')
    setMetaDescription(item.override?.metaDescription || '')
    setNoindex(item.override?.noindex || false)
  }

  // Save changes
  const saveChanges = async () => {
    if (!editing) return
    
    try {
      setIsSaving(true)
      const res = await fetch('/api/admin/seo/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: editing.type === 'CUSTOM_PATH' ? undefined : editing.type,
          targetId: editing.type === 'CUSTOM_PATH' ? undefined : editing.id,
      path: editing.type === 'CUSTOM_PATH' ? editing.path : undefined,
          title: title.trim() || null,
          metaDescription: metaDescription.trim() || null,
          noindex
        })
      })

      if (!res.ok) throw new Error('فشل في الحفظ')
      
      setEditing(null)
      if (activeTab === 'manage') {
      fetchItems()
      } else {
        fetchExploreItems()
      }
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'حدث خطأ أثناء الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  // Save custom path
  const saveCustomPath = async () => {
    if (!customPath.trim()) return
    
    try {
      setIsSavingCustom(true)
      const res = await fetch('/api/admin/seo/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: customPath.trim(),
          title: customTitle.trim() || null,
          metaDescription: customDescription.trim() || null,
          noindex: customNoindex
        })
      })

      if (!res.ok) throw new Error('فشل في حفظ المسار المخصص')
      
      setCustomPath('')
      setCustomTitle('')
      setCustomDescription('')
      setCustomNoindex(false)
        fetchItems()
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'حدث خطأ أثناء حفظ المسار المخصص')
    } finally {
      setIsSavingCustom(false)
    }
  }

  // Delete override
  const deleteOverride = async (item: TargetItem) => {
    if (!confirm('هل أنت متأكد من حذف هذا التخصيص؟')) return
    
    try {
      // Use the target ID for deletion, which should match the override
      const deleteId = item.type === 'CUSTOM_PATH' ? item.path : item.id
      const res = await fetch(`/api/admin/seo/delete/${encodeURIComponent(deleteId)}`, { 
        method: 'DELETE' 
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'فشل في الحذف')
      }
      
      // Show success message
      alert('تم حذف التخصيص بنجاح')
      
      if (activeTab === 'manage') {
        fetchItems()
      } else {
        fetchExploreItems()
      }
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'حدث خطأ أثناء الحذف')
    }
  }

  // Get type icon
  const getTypeIcon = (type: string) => {
    const option = typeOptions.find(opt => opt.value === type)
    const Icon = option?.icon || Settings
    return <Icon className="h-4 w-4" />
  }

  // Get status badge
  const getStatusBadge = (item: TargetItem | ExploreItem) => {
    const hasOverride = 'override' in item ? !!item.override : (item as ExploreItem).hasOverride
    const isNoindex = 'override' in item ? item.override?.noindex : (item as ExploreItem).noindex
    
    return (
      <div className="flex gap-1">
        {hasOverride && <Badge variant="secondary">مخصص</Badge>}
        {isNoindex && <Badge variant="destructive">noindex</Badge>}
        {!hasOverride && <Badge variant="outline">افتراضي</Badge>}
      </div>
    )
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-64">جاري التحميل...</div>
  }

  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
    return <div className="flex items-center justify-center h-64">غير مصرح لك بالوصول</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة تحسين محركات البحث</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => activeTab === 'manage' ? fetchItems() : fetchExploreItems()}
            disabled={isLoading || isExploreLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'manage' | 'explore')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            إدارة النصوص
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            استكشاف الروابط
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          {/* Filters */}
      <Card>
        <CardHeader>
              <CardTitle>الفلاتر والبحث</CardTitle>
        </CardHeader>
            <CardContent className="space-y-4">
              {/* Type and search */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                  <Label>نوع الصفحة</Label>
              <Select value={type} onValueChange={(v) => { setType(v as SeoTargetType); setPage(1) }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                <SelectContent>
                      {typeOptions.map(opt => {
                        const Icon = opt.icon
                        return (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {opt.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                </SelectContent>
              </Select>
            </div>
                <div>
                  <Label>البحث</Label>
                  <Input
                    placeholder="ابحث..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (setPage(1), fetchItems())}
                  />
            </div>
            <div>
              <Label>الحالة</Label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as any); setPage(1) }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="customized">مخصص</SelectItem>
                  <SelectItem value="default">افتراضي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
                  <Label>عدد النتائج</Label>
                  <Select value={String(limit)} onValueChange={(v) => { setLimit(parseInt(v)); setPage(1) }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

              {/* Geographic filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>الدولة</Label>
              <Select value={countryCode} onValueChange={(v) => { setCountryCode(v); setCitySlug(ALL); setSubAreaSlug(ALL); if (v !== ALL) fetchCitiesByCountry(v) }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>الكل</SelectItem>
                  {countries.map(c => (<SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>المدينة</Label>
              <Select value={citySlug} onValueChange={(v) => { setCitySlug(v); setSubAreaSlug(ALL) }} disabled={countryCode === ALL}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>الكل</SelectItem>
                  {cities.filter(ci => ci.country?.code === countryCode).map(ci => (<SelectItem key={ci.slug} value={ci.slug}>{ci.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>منطقة فرعية</Label>
              <Select value={subAreaSlug} onValueChange={setSubAreaSlug} disabled={citySlug === ALL}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>الكل</SelectItem>
                  {subAreas.filter(sa => {
                        const city = cities.find(c => c.id === sa.cityId)
                        return city?.slug === citySlug
                  }).map(sa => (<SelectItem key={sa.slug} value={sa.slug}>{sa.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>التصنيف</Label>
              <Select value={categorySlug} onValueChange={(v) => { setCategorySlug(v); setSubcategorySlug(ALL) }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>الكل</SelectItem>
                  {categories.map(cat => (<SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>التصنيف الفرعي</Label>
              <Select value={subcategorySlug} onValueChange={setSubcategorySlug} disabled={categorySlug === ALL}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>الكل</SelectItem>
                      {subCategories.filter(sub => {
                        const category = categories.find(c => c.id === sub.categoryId)
                        return category?.slug === categorySlug
                      }).map(sub => (<SelectItem key={sub.slug} value={sub.slug}>{sub.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
            </CardContent>
          </Card>
          
          {/* Custom path section */}
          {type === 'CUSTOM_PATH' && (
            <Card>
              <CardHeader>
                <CardTitle>إضافة مسار مخصص</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                    <Label>المسار</Label>
                    <Input
                      placeholder="/custom-path"
                      value={customPath}
                      onChange={(e) => setCustomPath(e.target.value)}
                    />
              </div>
              <div>
                <Label>العنوان</Label>
                    <Input
                      placeholder="العنوان المخصص"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                    />
                  </div>
              </div>
                <div>
                <Label>الوصف</Label>
                  <Textarea
                    placeholder="الوصف المخصص"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                  />
              </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={customNoindex}
                    onCheckedChange={setCustomNoindex}
                  />
                  <Label>منع الفهرسة (noindex)</Label>
              </div>
                <Button onClick={saveCustomPath} disabled={isSavingCustom || !customPath.trim()}>
                  {isSavingCustom ? 'جاري الحفظ...' : 'حفظ المسار'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results table */}
          <Card>
            <CardHeader>
              <CardTitle>النتائج ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                  {errorMsg}
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">جاري التحميل...</span>
                </div>
              ) : (
                <>
            <Table>
              <TableHeader>
                <TableRow>
                        <TableHead>النوع</TableHead>
                        <TableHead>الاسم</TableHead>
                        <TableHead>المسار</TableHead>
                  <TableHead>العنوان الحالي</TableHead>
                        <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && !isLoading && (
                  <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            {search.trim() 
                              ? `لا توجد نتائج للبحث عن "${search}"` 
                              : 'لا توجد بيانات مطابقة للفلاتر المحددة'
                            }
                          </TableCell>
                  </TableRow>
                )}
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(item.type)}
                              <span className="text-sm">{typeOptions.find(opt => opt.value === item.type)?.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{item.path}</code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(item.path, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="font-medium text-sm truncate ">
                                {item.override?.title || item.defaultTitle}
                              </div>
                              <div className="text-xs text-gray-500 truncate ">
                                {item.override?.metaDescription || item.defaultDescription}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(item)}</TableCell>
                      <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEdit(item)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              {item.override && (item.override.title || item.override.metaDescription || item.override.noindex) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteOverride(item)}
                                  title="حذف التخصيص"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                      </TableCell>
                    </TableRow>
                      ))}
              </TableBody>
            </Table>

                  {totalPages > 1 && (
          <div className="mt-4">
                      <AdminPagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        totalItems={totalPages * limit}
                        itemsPerPage={limit}
                      />
          </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explore" className="space-y-6">
          {/* Explore filters */}
          <Card>
            <CardHeader>
              <CardTitle>استكشاف جميع الروابط المحتملة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search field */}
              <div>
                <Label>البحث في الروابط والنصوص</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="ابحث في المسار أو العنوان أو الوصف..."
                    value={exploreSearch}
                    onChange={(e) => setExploreSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setPage(1)
                        fetchExploreItems()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPage(1)
                      fetchExploreItems()
                    }}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  {exploreSearch && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setExploreSearch('')
                        setPage(1)
                        fetchExploreItems()
                      }}
                    >
                      مسح
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <Label>نوع الصفحة</Label>
                  <Select value={type} onValueChange={(v) => setType(v as SeoTargetType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">جميع الأنواع</SelectItem>
                      {typeOptions.map(opt => {
                        const Icon = opt.icon
                        return (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {opt.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>الدولة</Label>
                  <Select value={countryCode} onValueChange={(v) => { setCountryCode(v); setCitySlug(ALL); setSubAreaSlug(ALL); if (v !== ALL) fetchCitiesByCountry(v) }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>الكل</SelectItem>
                      {countries.map(c => (<SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>المدينة</Label>
                  <Select value={citySlug} onValueChange={(v) => { setCitySlug(v); setSubAreaSlug(ALL) }} disabled={countryCode === ALL}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>الكل</SelectItem>
                      {cities.filter(ci => ci.country?.code === countryCode).map(ci => (<SelectItem key={ci.slug} value={ci.slug}>{ci.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
              </div>
                <div>
                  <Label>منطقة فرعية</Label>
                  <Select value={subAreaSlug} onValueChange={setSubAreaSlug} disabled={citySlug === ALL}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>الكل</SelectItem>
                      {subAreas.filter(sa => {
                        const city = cities.find(c => c.id === sa.cityId)
                        return city?.slug === citySlug
                      }).map(sa => (<SelectItem key={sa.slug} value={sa.slug}>{sa.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>التصنيف</Label>
                  <Select value={categorySlug} onValueChange={(v) => { setCategorySlug(v); setSubcategorySlug(ALL) }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>الكل</SelectItem>
                      {categories.map(cat => (<SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>التصنيف الفرعي</Label>
                  <Select value={subcategorySlug} onValueChange={setSubcategorySlug} disabled={categorySlug === ALL}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>الكل</SelectItem>
                      {subCategories.filter(sub => {
                        const category = categories.find(c => c.id === sub.categoryId)
                        return category?.slug === categorySlug
                      }).map(sub => (<SelectItem key={sub.slug} value={sub.slug}>{sub.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setPage(1); fetchExploreItems() }}>
                  <Search className="h-4 w-4 mr-2" />
                  استكشاف الروابط
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    // Reset all filters for comprehensive exploration
                    setCountryCode(ALL)
                    setCitySlug(ALL)
                    setSubAreaSlug(ALL)
                    setCategorySlug(ALL)
                    setSubcategorySlug(ALL)
                    setExploreSearch('')
                    setType('COMPANY')
                    setPage(1)
                    fetchExploreItems()
                  }}
                >
                  استكشاف شامل
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Explore results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  الروابط المكتشفة ({exploreItems.length})
                  {exploreSearch && (
                    <span className="text-sm font-normal text-blue-600 mr-2">
                      - البحث: "{exploreSearch}"
                    </span>
                  )}
                </span>
                {exploreItems.length > 0 && (
                  <div className="flex gap-2 text-sm">
                    <Badge variant="secondary">
                      مخصص: {exploreItems.filter(item => item.hasOverride).length}
                    </Badge>
                    <Badge variant="outline">
                      افتراضي: {exploreItems.filter(item => !item.hasOverride).length}
                    </Badge>
                    <Badge variant="destructive">
                      noindex: {exploreItems.filter(item => item.noindex).length}
                    </Badge>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isExploreLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">جاري الاستكشاف...</span>
                    </div>
                  ) : (
                    <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المسار</TableHead>
                        <TableHead>العنوان</TableHead>
                        <TableHead>الوصف</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exploreItems.length === 0 && !isExploreLoading && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            لا توجد روابط مكتشفة. اضغط على &quot;استكشاف الروابط&quot; للبحث.
                          </TableCell>
                        </TableRow>
                      )}
                      {exploreItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded truncate">{item.path}</code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(item.path, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate font-medium text-sm  max-w-[100px]">
                              {item.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className=" truncate text-xs text-gray-500  max-w-[100px]">
                              {item.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.type}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(item)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Create a temporary item for editing
                                const tempItem: TargetItem = {
                                  type: 'CUSTOM_PATH',
                                  id: item.path,
                                  name: item.path,
                                  path: item.path,
                                  defaultTitle: item.title,
                                  defaultDescription: item.description,
                                  override: item.hasOverride ? { 
                                    title: item.title, 
                                    metaDescription: item.description, 
                                    noindex: item.noindex 
                                  } : undefined
                                }
                                openEdit(tempItem)
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <div className="mt-4">
                      <AdminPagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        totalItems={totalPages * limit}
                        itemsPerPage={limit}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      {editing && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setEditing(null)}></div>
          <div className="fixed top-0 right-0 w-full sm:w-[520px] h-full bg-white dark:bg-gray-900 z-50 shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">تعديل SEO: {editing.name}</h3>
              <Button variant="secondary" onClick={() => setEditing(null)}>إغلاق</Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>المسار</Label>
                <code className="block text-xs bg-gray-100 p-2 rounded">{editing.path}</code>
              </div>
              
              <div>
                <Label>العنوان الافتراضي</Label>
                <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  {editing.defaultTitle}
                </div>
              </div>
              
              <div>
                <Label>العنوان المخصص (اتركه فارغاً لاستخدام الافتراضي)</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="العنوان المخصص"
                />
                <div className="text-xs text-gray-500 mt-1">
                  الطول: {title.length}/60 حرف
                </div>
              </div>
              
              <div>
                <Label>الوصف الافتراضي</Label>
                <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded max-h-20 overflow-y-auto">
                  {editing.defaultDescription}
                </div>
                </div>

              <div>
                <Label>الوصف المخصص (اتركه فارغاً لاستخدام الافتراضي)</Label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="الوصف المخصص"
                  rows={3}
                />
                <div className="text-xs text-gray-500 mt-1">
                  الطول: {metaDescription.length}/160 حرف
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={noindex}
                  onCheckedChange={setNoindex}
                />
                <Label>منع الفهرسة (noindex)</Label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={saveChanges} disabled={isSaving}>
                  {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
                <Button variant="outline" onClick={() => setEditing(null)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        </>
          )}
    </div>
  )
}
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Star,
  MapPin,
  Users,
  MessageSquare,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { AdminPagination } from '@/components/admin/pagination'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'

interface Company {
  id: string
  name: string
  slug: string
  description?: string
  mainImage?: string
  logoImage?: string
  rating: number
  isActive: boolean
  createdAt: string
  city: { name: string }
  country: { name: string }
  category: { name: string }
  _count: {
    reviews: number
  }
  isVerified: boolean
  isFeatured: boolean
}

interface CompaniesResponse {
  companies: Company[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCompanies, setTotalCompanies] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('companiesRowsPerPage')
      return saved ? parseInt(saved) : 10
    }
    return 10
  })
  
  // Filters state
  const [filters, setFilters] = useState({
    category: 'all',
    city: 'all',
    country: 'all',
    isActive: 'all',
    isVerified: 'all',
    isFeatured: 'all',
    rating: 'all'
  })
  
  // Sorting state
  const [sort, setSort] = useState({
    field: 'createdAt',
    order: 'desc' as 'asc' | 'desc'
  })
  
  // Filter options (will be populated from API)
  const [filterOptions, setFilterOptions] = useState({
    categories: [] as {id: string, name: string}[],
    cities: [] as {id: string, name: string}[],
    countries: [] as {id: string, name: string}[]
  })
  
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

  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
        ...(search && { search }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.city !== 'all' && { city: filters.city }),
        ...(filters.country !== 'all' && { country: filters.country }),
        ...(filters.isActive !== 'all' && { isActive: filters.isActive }),
        ...(filters.isVerified !== 'all' && { isVerified: filters.isVerified }),
        ...(filters.isFeatured !== 'all' && { isFeatured: filters.isFeatured }),
        ...(filters.rating !== 'all' && { rating: filters.rating }),
        sortBy: sort.field,
        sortOrder: sort.order
      })

      console.log('🔄 Fetching companies - Page:', currentPage, 'Params:', Object.fromEntries(params))
      
      const response = await fetch(`/api/admin/companies?${params}`)
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Response error:', errorText)
        throw new Error('فشل في جلب الشركات')
      }

      const data: CompaniesResponse = await response.json()
      console.log('✅ Received data:', {
        companiesCount: data.companies?.length || 0,
        pagination: data.pagination
      })
      
      setCompanies(data.companies || [])
      setTotalPages(data.pagination?.pages || 1)
      setTotalCompanies(data.pagination?.total || 0)
      
      if (data.companies.length === 0 && data.pagination.total === 0) {
        toast.info('لا توجد شركات في قاعدة البيانات. سيتم إنشاء بيانات تجريبية تلقائياً.')
      }
    } catch (error) {
      console.error('❌ خطأ في جلب الشركات:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, search, filters, sort, rowsPerPage])

  useEffect(() => {
    if (session) {
      fetchCompanies()
    }
  }, [session, fetchCompanies])

  // Debounced search
  const debouncedSearch = useCallback((value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }, [])

  const handleSearch = (value: string) => {
    // Immediate UI update
    const target = value
    // Update immediately for responsive UI
    setSearch(target)
    
    // Reset to page 1 when searching
    setCurrentPage(1)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setCurrentPage(1)
  }

  const handleRowsPerPageChange = (value: string) => {
    const newRowsPerPage = parseInt(value)
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1) // إعادة تعيين للصفحة الأولى
    // حفظ الإعداد في localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('companiesRowsPerPage', value)
    }
  }

  const clearFilters = () => {
    setFilters({
      category: 'all',
      city: 'all',
      country: 'all',
      isActive: 'all',
      isVerified: 'all',
      isFeatured: 'all',
      rating: 'all'
    })
    setCurrentPage(1)
  }

  const handleSort = (field: string) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getSortIcon = (field: string) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sort.order === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />
  }

  const handleDeleteCompany = async (companyId: string) => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCompanies(prev => prev.filter(company => company.id !== companyId))
      }
    } catch (error) {
      console.error('خطأ في حذف الشركة:', error)
    }
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
            إدارة الشركات
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            عرض وإدارة جميع الشركات المسجلة في المنصة
          </p>
          {totalCompanies > 0 && (
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>إجمالي الشركات: {totalCompanies}</span>
              <span>الصفحة الحالية: {companies.length}</span>
              {Object.values(filters).some(value => value !== 'all') && (
                <span className="text-blue-600 font-medium">• مفلتر: {companies.length} من {totalCompanies}</span>
              )}
            </div>
          )}
        </div>
        <Button asChild>
          <Link href="/admin/companies/add">
            <Plus className="h-4 w-4 ml-2" />
            إضافة شركة جديدة
          </Link>
        </Button>
      </div>

      {/* إحصائيات سريعة */}
      {totalCompanies > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{totalCompanies}</div>
              <p className="text-xs text-gray-500">إجمالي الشركات</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{companies.length}</div>
              <p className="text-xs text-gray-500">في الصفحة الحالية ({rowsPerPage}/صفحة)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{currentPage}</div>
              <p className="text-xs text-gray-500">الصفحة الحالية</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{totalPages}</div>
              <p className="text-xs text-gray-500">إجمالي الصفحات</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* البحث والفلاتر */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* البحث */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث عن الشركات..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* الفلاتر */}
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-medium">الحالة</Label>
                <Select value={filters.isActive} onValueChange={(value) => handleFilterChange('isActive', value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="true">نشطة</SelectItem>
                    <SelectItem value="false">غير نشطة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-medium">التوثيق</Label>
                <Select value={filters.isVerified} onValueChange={(value) => handleFilterChange('isVerified', value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="جميع الأنواع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="true">موثقة</SelectItem>
                    <SelectItem value="false">غير موثقة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-medium">مميزة</Label>
                <Select value={filters.isFeatured} onValueChange={(value) => handleFilterChange('isFeatured', value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="جميع الأنواع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="true">مميزة</SelectItem>
                    <SelectItem value="false">عادية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-medium">التقييم</Label>
                <Select value={filters.rating} onValueChange={(value) => handleFilterChange('rating', value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="جميع التقييمات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التقييمات</SelectItem>
                    <SelectItem value="5">5 نجوم</SelectItem>
                    <SelectItem value="4">4+ نجوم</SelectItem>
                    <SelectItem value="3">3+ نجوم</SelectItem>
                    <SelectItem value="2">2+ نجوم</SelectItem>
                    <SelectItem value="1">1+ نجوم</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* مؤشر الفلاتر النشطة */}
              {Object.values(filters).some(value => value !== 'all') && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 ml-1" />
                    مسح الفلاتر
                  </Button>
                </div>
              )}
            </div>

            {/* فلاتر سريعة */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-gray-500 self-center">فلاتر سريعة:</span>
              <Button 
                variant={filters.isVerified === 'true' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleFilterChange('isVerified', filters.isVerified === 'true' ? 'all' : 'true')}
              >
                الشركات الموثقة
              </Button>
              <Button 
                variant={filters.isFeatured === 'true' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleFilterChange('isFeatured', filters.isFeatured === 'true' ? 'all' : 'true')}
              >
                الشركات المميزة
              </Button>
              <Button 
                variant={filters.rating === '4' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleFilterChange('rating', filters.rating === '4' ? 'all' : '4')}
              >
                تقييم عالي (4+)
              </Button>
              <Button 
                variant={filters.isActive === 'true' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleFilterChange('isActive', filters.isActive === 'true' ? 'all' : 'true')}
              >
                الشركات النشطة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول الشركات */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>قائمة الشركات</CardTitle>
              <CardDescription>
                {totalCompanies > 0 ? (
                  <div className="space-y-1">
                    <div>
                      عرض {Math.min((currentPage - 1) * rowsPerPage + 1, totalCompanies)} - {Math.min(currentPage * rowsPerPage, totalCompanies)} من إجمالي {totalCompanies} شركة
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>
                        الصفحة {currentPage} من {totalPages}
                      </span>
                      {Object.values(filters).some(value => value !== 'all') && (
                        <span className="text-blue-600">• فلاتر نشطة</span>
                      )}
                      {sort.field !== 'createdAt' && (
                        <span className="text-green-600">
                          • مرتب حسب {sort.field === 'name' ? 'الاسم' : sort.field === 'rating' ? 'التقييم' : sort.field}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  'لا توجد شركات'
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-600 whitespace-nowrap">عرض:</Label>
                <Select value={rowsPerPage.toString()} onValueChange={handleRowsPerPageChange}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    {totalCompanies <= 500 && (
                      <SelectItem value={totalCompanies.toString()}>الكل ({totalCompanies})</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600 whitespace-nowrap">صف/صفحة</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {companies.length} / {totalCompanies}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  صفحة {currentPage}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">جاري تحميل الشركات...</span>
                </div>
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : companies.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('name')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        الشركة
                        {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead>الموقع</TableHead>
                    <TableHead>الفئات</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('rating')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        التقييم
                        {getSortIcon('rating')}
                      </Button>
                    </TableHead>
                    <TableHead>المراجعات</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={company.logoImage || company.mainImage} />
                            <AvatarFallback>
                              <Building2 className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {company.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">
                              {company.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {company.city.name}, {company.country.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {company.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{company.rating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          <span>{company._count.reviews}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <Badge 
                            variant={company.isActive ? 'default' : 'secondary'}
                            className={company.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                          >
                            {company.isActive ? 'نشطة' : 'غير نشطة'}
                          </Badge>
                          <div className="flex space-x-1 space-x-reverse">
                            {company.isVerified && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                موثقة
                              </Badge>
                            )}
                            {company.isFeatured && (
                              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                                مميزة
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/companies/${company.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/companies/${company.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف الشركة</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف شركة "{company.name}"؟ 
                                  سيتم إلغاء تفعيل الشركة وإخفاؤها من المنصة.
                                  جميع المراجعات والبيانات ستبقى محفوظة.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCompany(company.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  حذف الشركة
                                </AlertDialogAction>
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
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد شركات
              </h3>
              <p className="text-gray-500 mb-4">
                لم يتم العثور على أي شركات تطابق معايير البحث
              </p>
              <Button asChild>
                <Link href="/admin/companies/add">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة أول شركة
                </Link>
              </Button>
            </div>
          )}

          {/* التنقل بين الصفحات */}
          {totalPages > 1 && (
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                console.log('📄 Page change requested:', currentPage, '→', page)
                setCurrentPage(page)
              }}
              totalItems={totalCompanies}
              itemsPerPage={rowsPerPage}
              className="mt-6 pt-6 border-t"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Shield,
  Crown,
  Building2,
  MessageSquare,
  Mail,
  Calendar,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  Download,
  UserPlus,
  Activity,
  TrendingUp,
  Lock
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminPagination } from '@/components/admin/pagination'
import { Label } from '@/components/ui/label'
import { AddUserModal } from '@/components/admin/add-user-modal'
import { EditUserModal } from '@/components/admin/edit-user-modal'
import { ExportUsersModal } from '@/components/admin/export-users-modal'
import { ViewUserModal } from '@/components/admin/view-user-modal'
import { LinkUserToCompanyModal } from '@/components/admin/link-user-to-company-modal'
import { ChangePasswordModal } from '@/components/admin/change-password-modal'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'USER' | 'COMPANY_OWNER' | 'ADMIN' | 'SUPER_ADMIN'
  isActive: boolean
  isVerified: boolean
  lastLoginAt?: string
  createdAt: string
  ownedCompanies: Array<{
    id: string
    role: string
    company: {
      name: string
      slug: string
    }
  }>
  _count: {
    reviews: number
  }
}

interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [linkCompanyOpen, setLinkCompanyOpen] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('usersRowsPerPage')
      return saved ? parseInt(saved) : 10
    }
    return 10
  })
  
  // فلاتر متقدمة
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    isVerified: 'all',
    hasCompanies: 'all',
    dateFrom: '',
    dateTo: ''
  })
  
  // ترتيب
  const [sort, setSort] = useState({
    field: 'createdAt',
    order: 'desc' as 'asc' | 'desc'
  })
  
  // إحصائيات سريعة
  const [stats, setStats] = useState({
    totalActive: 0,
    totalInactive: 0,
    totalVerified: 0,
    totalWithCompanies: 0,
    newThisMonth: 0
  })
  
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // معالجة معاملات URL للفلترة التلقائية
  useEffect(() => {
    const roleParam = searchParams.get('role')
    const hasCompaniesParam = searchParams.get('hasCompanies')
    
    if (roleParam || hasCompaniesParam) {
      setFilters(prev => ({
        ...prev,
        ...(roleParam && { 
          role: roleParam.includes(',') ? 'ADMIN,SUPER_ADMIN' : roleParam 
        }),
        ...(hasCompaniesParam && { hasCompanies: hasCompaniesParam })
      }))
    }
  }, [searchParams])

  // تحديد عنوان الصفحة بناءً على الفلتر المطبق
  const getPageTitle = () => {
    const roleParam = searchParams.get('role')
    const hasCompaniesParam = searchParams.get('hasCompanies')
    
    if (roleParam === 'COMPANY_OWNER' || hasCompaniesParam === 'true') {
      return 'مالكي الشركات'
    } else if (roleParam && (roleParam.includes('ADMIN') || roleParam.includes('SUPER_ADMIN'))) {
      return 'المديرين'
    }
    return 'إدارة المستخدمين'
  }

  const getPageDescription = () => {
    const roleParam = searchParams.get('role')
    const hasCompaniesParam = searchParams.get('hasCompanies')
    
    if (roleParam === 'COMPANY_OWNER' || hasCompaniesParam === 'true') {
      return 'عرض وإدارة المستخدمين الذين يملكون شركات على المنصة'
    } else if (roleParam && (roleParam.includes('ADMIN') || roleParam.includes('SUPER_ADMIN'))) {
      return 'عرض وإدارة المديرين والمديرين العامين'
    }
    return 'عرض وإدارة جميع المستخدمين المسجلين في المنصة'
  }

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

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
        ...(search && { search }),
        ...(filters.role !== 'all' && { role: filters.role }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.isVerified !== 'all' && { isVerified: filters.isVerified }),
        ...(filters.hasCompanies !== 'all' && { hasCompanies: filters.hasCompanies }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        sortBy: sort.field,
        sortOrder: sort.order
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) {
        throw new Error('فشل في جلب المستخدمين')
      }

      const data: UsersResponse = await response.json()
      setUsers(data.users)
      setTotalPages(data.pagination.pages)
      setTotalUsers(data.pagination.total)
      
      // حساب الإحصائيات السريعة
      const activeCount = data.users.filter(u => u.isActive).length
      const verifiedCount = data.users.filter(u => u.isVerified).length
      const withCompaniesCount = data.users.filter(u => u.ownedCompanies.length > 0).length
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const newThisMonthCount = data.users.filter(u => new Date(u.createdAt) >= thisMonth).length
      
      setStats({
        totalActive: activeCount,
        totalInactive: data.users.length - activeCount,
        totalVerified: verifiedCount,
        totalWithCompanies: withCompaniesCount,
        newThisMonth: newThisMonthCount
      })
      
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchUsers()
    }
  }, [session, currentPage, search, filters, sort, rowsPerPage])

  const handleSearch = (value: string) => {
    setSearch(value)
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
    setCurrentPage(1)
    if (typeof window !== 'undefined') {
      localStorage.setItem('usersRowsPerPage', value)
    }
  }

  const clearFilters = () => {
    setFilters({
      role: 'all',
      status: 'all',
      isVerified: 'all',
      hasCompanies: 'all',
      dateFrom: '',
      dateTo: ''
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

  const handleDeactivateUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false }),
      })

      if (response.ok) {
        setUsers(prev => 
          prev.map(user => 
            user.id === userId 
              ? { ...user, isActive: false }
              : user
          )
        )
      }
    } catch (error) {
      console.error('خطأ في إلغاء تفعيل المستخدم:', error)
    }
  }

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        setUsers(prev => 
          prev.map(user => 
            user.id === userId 
              ? { ...user, role: newRole as any }
              : user
          )
        )
      }
    } catch (error) {
      console.error('خطأ في تغيير دور المستخدم:', error)
    }
  }

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId)
    setViewModalOpen(true)
  }

  const handleEditUser = (userId: string) => {
    setSelectedUserId(userId)
    setEditModalOpen(true)
  }

  const handleChangePassword = (userId: string) => {
    setSelectedUserId(userId)
    setPasswordModalOpen(true)
  }

  const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-blue-500" />
      case 'COMPANY_OWNER':
        return <Building2 className="h-4 w-4 text-green-500" />
      default:
        return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'مدير عام'
      case 'ADMIN':
        return 'مدير'
      case 'COMPANY_OWNER':
        return 'مالك شركة'
      default:
        return 'مستخدم'
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
            {getPageTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {getPageDescription()}
          </p>
          {totalUsers > 0 && (
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>إجمالي المستخدمين: {totalUsers}</span>
              <span>الصفحة الحالية: {users.length}</span>
              {Object.values(filters).some(value => value !== 'all' && value !== '') && (
                <span className="text-blue-600 font-medium">• مفلتر: {users.length} من {totalUsers}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <ExportUsersModal />
          <AddUserModal onUserAdded={fetchUsers} />
        </div>
      </div>

      {/* إحصائيات سريعة */}
      {totalUsers > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Activity className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.totalActive}</div>
                  <p className="text-xs text-gray-500">مستخدمين نشطين</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalVerified}</div>
                  <p className="text-xs text-gray-500">موثقين</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Building2 className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.totalWithCompanies}</div>
                  <p className="text-xs text-gray-500">لديهم شركات</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stats.newThisMonth}</div>
                  <p className="text-xs text-gray-500">جدد هذا الشهر</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Users className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-600">{totalUsers}</div>
                  <p className="text-xs text-gray-500">إجمالي المستخدمين</p>
                </div>
              </div>
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
                placeholder="البحث عن المستخدمين (الاسم، البريد الإلكتروني، أو اسم الشركة)..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* الفلاتر */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-medium">الدور</Label>
                <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الأدوار" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأدوار</SelectItem>
                    <SelectItem value="USER">مستخدم</SelectItem>
                    <SelectItem value="COMPANY_OWNER">مالك شركة</SelectItem>
                    <SelectItem value="ADMIN">مدير</SelectItem>
                    <SelectItem value="SUPER_ADMIN">مدير عام</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-medium">الحالة</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-medium">التوثيق</Label>
                <Select value={filters.isVerified} onValueChange={(value) => handleFilterChange('isVerified', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الأنواع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="true">موثق</SelectItem>
                    <SelectItem value="false">غير موثق</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-medium">الشركات</Label>
                <Select value={filters.hasCompanies} onValueChange={(value) => handleFilterChange('hasCompanies', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الأنواع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="true">لديه شركات</SelectItem>
                    <SelectItem value="false">بدون شركات</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-medium">من تاريخ</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-medium">إلى تاريخ</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>

            {/* مؤشر الفلاتر النشطة وفلاتر سريعة */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500 self-center">فلاتر سريعة:</span>
                
                {/* مؤشر الفلتر المطبق من الشريط الجانبي */}
                {(searchParams.get('role')?.includes('ADMIN') || searchParams.get('hasCompanies') === 'true') && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      <span>فلتر مطبق من الشريط الجانبي:</span>
                      <span className="font-medium">
                        {searchParams.get('hasCompanies') === 'true' ? 'مالكي الشركات' : 'المديرين'}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/admin/users')}
                      className="text-xs"
                    >
                      عرض جميع المستخدمين
                    </Button>
                  </div>
                )}
                <Button 
                  variant={filters.isVerified === 'true' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleFilterChange('isVerified', filters.isVerified === 'true' ? 'all' : 'true')}
                >
                  المستخدمين الموثقين
                </Button>
                <Button 
                  variant={filters.hasCompanies === 'true' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleFilterChange('hasCompanies', filters.hasCompanies === 'true' ? 'all' : 'true')}
                >
                  أصحاب الشركات
                </Button>
                <Button 
                  variant={filters.role === 'ADMIN' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleFilterChange('role', filters.role === 'ADMIN' ? 'all' : 'ADMIN')}
                >
                  المديرين
                </Button>
                <Button 
                  variant={filters.status === 'active' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleFilterChange('status', filters.status === 'active' ? 'all' : 'active')}
                >
                  النشطين فقط
                </Button>
              </div>

              {/* مسح الفلاتر */}
              {Object.values(filters).some(value => value !== 'all' && value !== '') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 ml-1" />
                  مسح الفلاتر
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول المستخدمين */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>قائمة المستخدمين</CardTitle>
              <CardDescription>
                {totalUsers > 0 ? (
                  <div className="space-y-1">
                    <div>
                      عرض {Math.min((currentPage - 1) * rowsPerPage + 1, totalUsers)} - {Math.min(currentPage * rowsPerPage, totalUsers)} من إجمالي {totalUsers} مستخدم
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>
                        الصفحة {currentPage} من {totalPages}
                      </span>
                      {Object.values(filters).some(value => value !== 'all' && value !== '') && (
                        <span className="text-blue-600">• فلاتر نشطة</span>
                      )}
                      {sort.field !== 'createdAt' && (
                        <span className="text-green-600">
                          • مرتب حسب {sort.field === 'name' ? 'الاسم' : sort.field === 'lastLogin' ? 'آخر دخول' : sort.field}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  'لا توجد مستخدمين'
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
                    {totalUsers <= 500 && (
                      <SelectItem value={totalUsers.toString()}>الكل ({totalUsers})</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600 whitespace-nowrap">صف/صفحة</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {users.length} / {totalUsers}
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
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : users.length > 0 ? (
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
                        المستخدم
                        {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('companiesCount')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        الشركات المملوكة
                        {getSortIcon('companiesCount')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('reviewsCount')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        المراجعات
                        {getSortIcon('reviewsCount')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('lastLoginAt')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        آخر دخول
                        {getSortIcon('lastLoginAt')}
                      </Button>
                    </TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </p>
                              {user.isVerified && (
                                <Badge variant="secondary" className="text-xs">
                                  موثق
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          {getRoleIcon(user.role)}
                          <span className="text-sm font-medium">
                            {getRoleText(user.role)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.ownedCompanies.length > 0 ? (
                          <div className="space-y-1">
                            {user.ownedCompanies.slice(0, 2).map((ownership) => (
                              <div key={ownership.id} className="flex items-center space-x-1 space-x-reverse">
                                <Building2 className="h-3 w-3 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {ownership.company.name}
                                </span>
                              </div>
                            ))}
                            {user.ownedCompanies.length > 2 && (
                              <p className="text-xs text-gray-400">
                                +{user.ownedCompanies.length - 2} أخرى
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">لا توجد</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          <span>{user._count.reviews}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {user.lastLoginAt 
                            ? new Date(user.lastLoginAt).toLocaleDateString( )
                            : 'لم يسجل دخول'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.isActive ? 'default' : 'secondary'}
                          className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {user.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleViewUser(user.id)}
                            >
                              <Eye className="h-4 w-4 ml-2" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleEditUser(user.id)}
                            >
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل المستخدم
                            </DropdownMenuItem>
                            {/* {user.id !== session?.user.id && ( */}
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => handleChangePassword(user.id)}
                              >
                                <Lock className="h-4 w-4 ml-2" />
                                تغيير كلمة المرور
                              </DropdownMenuItem>
                            {/* )} */}
                            {/* <DropdownMenuItem>
                              <Mail className="h-4 w-4 ml-2" />
                              إرسال رسالة
                            </DropdownMenuItem> */}
                            
                            {session?.user.role === 'SUPER_ADMIN' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleChangeRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                >
                                  <Shield className="h-4 w-4 ml-2" />
                                  {user.role === 'ADMIN' ? 'إزالة صلاحية المدير' : 'جعله مدير'}
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  {user.isActive ? 'إلغاء التفعيل' : 'تفعيل المستخدم'}
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {user.isActive ? 'إلغاء تفعيل المستخدم' : 'تفعيل المستخدم'}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {user.isActive 
                                      ? `هل أنت متأكد من إلغاء تفعيل المستخدم "${user.name}"؟ سيفقد المستخدم إمكانية الوصول إلى حسابه.`
                                      : `هل أنت متأكد من تفعيل المستخدم "${user.name}"؟ سيتمكن المستخدم من الوصول إلى حسابه مرة أخرى.`
                                    }
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeactivateUser(user.id)}
                                    className={user.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                                  >
                                    {user.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد مستخدمين
              </h3>
              <p className="text-gray-500 mb-4">
                لم يتم العثور على مستخدمين يطابقون معايير البحث
              </p>
            </div>
          )}

          {/* التنقل بين الصفحات */}
          {totalPages > 1 && (
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalUsers}
              itemsPerPage={rowsPerPage}
              className="mt-6 pt-6 border-t"
            />
          )}
        </CardContent>
      </Card>

      {/* مودالات منفصلة */}
      {selectedUser && (
        <>
          <ViewUserModal 
            user={selectedUser}
            open={viewModalOpen}
            onOpenChange={setViewModalOpen}
            onLinkCompany={() => setLinkCompanyOpen(true)}
            onOwnershipChanged={() => fetchUsers()}
          />
          <EditUserModal 
            user={selectedUser}
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onUserUpdated={() => {
              fetchUsers()
              setEditModalOpen(false)
            }}
            canEditRole={session?.user.role === 'SUPER_ADMIN' || (session?.user.role === 'ADMIN' && selectedUser.role !== 'ADMIN' && selectedUser.role !== 'SUPER_ADMIN')}
          />
          <ChangePasswordModal 
            user={selectedUser}
            open={passwordModalOpen}
            onOpenChange={setPasswordModalOpen}
          />
          <LinkUserToCompanyModal
            userId={selectedUser.id}
            open={linkCompanyOpen}
            onOpenChange={setLinkCompanyOpen}
            onLinked={() => {
              fetchUsers()
              setLinkCompanyOpen(false)
            }}
          />
        </>
      )}
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  User
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CompanyRequest {
  id: string
  companyName: string
  description: string
  category: string
  country: string
  city: string
  address?: string
  phone: string
  email: string
  website?: string
  foundedYear?: number
  companySize?: string
  services: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  socialMedia?: any
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_INFO'
  adminNotes?: string
  createdAt: string
}

interface RequestsResponse {
  requests: CompanyRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AdminCompanyRequestsPage() {
  const [requests, setRequests] = useState<CompanyRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRequests, setTotalRequests] = useState(0)
  const [selectedRequest, setSelectedRequest] = useState<CompanyRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
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

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter })
      })

      const response = await fetch(`/api/admin/company-requests?${params}`)
      if (!response.ok) {
        throw new Error('فشل في جلب طلبات الشركات')
      }

      const data: RequestsResponse = await response.json()
      setRequests(data.requests)
      setTotalPages(data.pagination.pages)
      setTotalRequests(data.pagination.total)
    } catch (error) {
      console.error('خطأ في جلب طلبات الشركات:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchRequests()
    }
  }, [session, currentPage, search, statusFilter])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject' | 'needs_info') => {
    try {
      setIsProcessing(true)
      const response = await fetch(`/api/admin/company-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action,
          adminNotes: adminNotes.trim() || undefined
        }),
      })

      if (response.ok) {
        setRequests(prev => 
          prev.map(request => 
            request.id === requestId 
              ? { 
                  ...request, 
                  status: action === 'approve' ? 'APPROVED' : 
                          action === 'reject' ? 'REJECTED' : 'NEEDS_INFO',
                  adminNotes: adminNotes.trim() || request.adminNotes
                }
              : request
          )
        )
        setSelectedRequest(null)
        setAdminNotes('')
      }
    } catch (error) {
      console.error('خطأ في معالجة الطلب:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">معلق</Badge>
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-100 text-green-800">موافق عليه</Badge>
      case 'REJECTED':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">مرفوض</Badge>
      case 'NEEDS_INFO':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">يحتاج معلومات</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          طلبات الشركات
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          مراجعة والموافقة على طلبات انضمام الشركات الجديدة ({totalRequests} طلب)
        </p>
      </div>

      {/* البحث والفلاتر */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في طلبات الشركات..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="PENDING">معلق</SelectItem>
                <SelectItem value="APPROVED">موافق عليه</SelectItem>
                <SelectItem value="REJECTED">مرفوض</SelectItem>
                <SelectItem value="NEEDS_INFO">يحتاج معلومات</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* جدول الطلبات */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات</CardTitle>
          <CardDescription>
            عرض {requests.length} من إجمالي {totalRequests} طلب
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : requests.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الشركة</TableHead>
                    <TableHead>المسؤول</TableHead>
                    <TableHead>الموقع</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>تاريخ الطلب</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {request.companyName}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2 max-w-[200px]">
                            {request.description}
                          </p>
                          <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-400">
                            {request.website && (
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Globe className="h-3 w-3" />
                                <span>موقع</span>
                              </div>
                            )}
                            {request.foundedYear && (
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Calendar className="h-3 w-3" />
                                <span>{request.foundedYear}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {request.ownerName}
                          </p>
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1 space-x-reverse text-sm text-gray-500">
                              <Mail className="h-3 w-3" />
                              <span>{request.ownerEmail}</span>
                            </div>
                            <div className="flex items-center space-x-1 space-x-reverse text-sm text-gray-500">
                              <Phone className="h-3 w-3" />
                              <span>{request.ownerPhone}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div className="text-sm text-gray-600">
                            <div>{request.city}</div>
                            <div className="text-xs text-gray-400">{request.country}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{request.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(request.createdAt).toLocaleDateString( )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setAdminNotes(request.adminNotes || '')
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>تفاصيل طلب الشركة</DialogTitle>
                                <DialogDescription>
                                  مراجعة تفاصيل طلب انضمام {request.companyName}
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedRequest && (
                                <div className="space-y-6">
                                  {/* معلومات الشركة */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <h3 className="font-semibold text-gray-900 dark:text-white">معلومات الشركة</h3>
                                      <div className="space-y-3">
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">اسم الشركة</label>
                                          <p className="text-gray-900 dark:text-white">{selectedRequest.companyName}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الوصف</label>
                                          <p className="text-gray-900 dark:text-white text-sm">{selectedRequest.description}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الفئة</label>
                                          <p className="text-gray-900 dark:text-white">{selectedRequest.category}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الخدمات</label>
                                          <p className="text-gray-900 dark:text-white text-sm">{selectedRequest.services}</p>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <h3 className="font-semibold text-gray-900 dark:text-white">معلومات الاتصال</h3>
                                      <div className="space-y-3">
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الموقع</label>
                                          <p className="text-gray-900 dark:text-white">{selectedRequest.city}, {selectedRequest.country}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">العنوان</label>
                                          <p className="text-gray-900 dark:text-white">{selectedRequest.address || 'غير محدد'}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الهاتف</label>
                                          <p className="text-gray-900 dark:text-white">{selectedRequest.phone}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">البريد الإلكتروني</label>
                                          <p className="text-gray-900 dark:text-white">{selectedRequest.email}</p>
                                        </div>
                                        {selectedRequest.website && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الموقع الإلكتروني</label>
                                            <p className="text-gray-900 dark:text-white">{selectedRequest.website}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* معلومات المسؤول */}
                                  <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">معلومات المسؤول</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الاسم</label>
                                        <p className="text-gray-900 dark:text-white">{selectedRequest.ownerName}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">البريد الإلكتروني</label>
                                        <p className="text-gray-900 dark:text-white">{selectedRequest.ownerEmail}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الهاتف</label>
                                        <p className="text-gray-900 dark:text-white">{selectedRequest.ownerPhone}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* ملاحظات المدير */}
                                  <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                      ملاحظات المدير
                                    </label>
                                    <Textarea
                                      placeholder="أضف ملاحظات حول هذا الطلب..."
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      rows={3}
                                    />
                                  </div>
                                </div>
                              )}

                              <DialogFooter className="flex justify-between">
                                <div className="flex space-x-2 space-x-reverse">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        className="text-red-600 hover:text-red-700"
                                        disabled={isProcessing}
                                      >
                                        <XCircle className="h-4 w-4 ml-2" />
                                        رفض
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>رفض طلب الشركة</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          هل أنت متأكد من رفض طلب انضمام "{selectedRequest?.companyName}"؟ 
                                          سيتم إشعار المتقدم برفض الطلب.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => selectedRequest && handleRequestAction(selectedRequest.id, 'reject')}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          رفض الطلب
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <Button 
                                    variant="outline"
                                    onClick={() => selectedRequest && handleRequestAction(selectedRequest.id, 'needs_info')}
                                    disabled={isProcessing}
                                  >
                                    <Clock className="h-4 w-4 ml-2" />
                                    يحتاج معلومات
                                  </Button>
                                </div>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      className="bg-green-600 hover:bg-green-700"
                                      disabled={isProcessing}
                                    >
                                      <CheckCircle className="h-4 w-4 ml-2" />
                                      موافقة
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>الموافقة على طلب الشركة</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        هل أنت متأكد من الموافقة على طلب انضمام "{selectedRequest?.companyName}"؟ 
                                        سيتم إنشاء الشركة وإشعار المتقدم بالموافقة.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => selectedRequest && handleRequestAction(selectedRequest.id, 'approve')}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        الموافقة على الطلب
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {request.status === 'PENDING' && (
                            <>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>الموافقة على الطلب</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من الموافقة على طلب "{request.companyName}"؟
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRequestAction(request.id, 'approve')}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      موافقة
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>رفض الطلب</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من رفض طلب "{request.companyName}"؟
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRequestAction(request.id, 'reject')}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      رفض
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد طلبات
              </h3>
              <p className="text-gray-500 mb-4">
                لم يتم العثور على طلبات تطابق معايير البحث
              </p>
            </div>
          )}

          {/* التنقل بين الصفحات */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-gray-500">
                صفحة {currentPage} من {totalPages} • إجمالي {totalRequests} طلب
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                </Button>
                
                {/* أرقام الصفحات */}
                <div className="flex items-center space-x-1 space-x-reverse">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    if (pageNum > totalPages) return null
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
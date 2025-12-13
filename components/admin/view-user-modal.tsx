'use client'

import { useState, useEffect } from 'react'
import { Eye, User, Mail, Shield, Building2, Calendar, Activity, MessageSquare, MapPin, Phone, Crown, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

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
      isActive?: boolean
      isVerified?: boolean
      rating?: number
    }
  }>
  _count: {
    reviews: number
  }
}

interface ViewUserModalProps {
  user: User
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onLinkCompany?: (userId: string) => void
  onOwnershipChanged?: () => void
}

export function ViewUserModal({ user, open, onOpenChange, onLinkCompany, onOwnershipChanged }: ViewUserModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const modalOpen = isControlled ? open : internalOpen
  const setModalOpen = isControlled ? onOpenChange! : setInternalOpen
  const [isLoading, setIsLoading] = useState(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [unlinkingCompanyId, setUnlinkingCompanyId] = useState<string | null>(null)

  useEffect(() => {
    if (modalOpen && !userDetails) {
      fetchUserDetails()
    }
  }, [modalOpen])

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/users/${user.id}/details`)
      if (response.ok) {
        const data = await response.json()
        setUserDetails(data.user)
      }
    } catch (error) {
      console.error('خطأ في جلب تفاصيل المستخدم:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnlink = async (companyId: string) => {
    try {
      if (typeof window !== 'undefined') {
        const confirmed = window.confirm('هل تريد بالتأكيد إلغاء ربط هذا المستخدم بالشركة؟')
        if (!confirmed) return
      }
      setUnlinkingCompanyId(companyId)
      const res = await fetch(`/api/admin/users/${user.id}/companies?companyId=${companyId}`, { method: 'DELETE' })
      if (res.ok) {
        // تحديث العرض الحالي دون إعادة التحميل
        setUserDetails((prev: any) => {
          if (!prev) return prev
          return {
            ...prev,
            ownedCompanies: (prev.ownedCompanies || []).filter((oc: any) => oc.companyId !== companyId && oc.company?.id !== companyId)
          }
        })
        onOwnershipChanged?.()
      }
    } catch (e) {
      console.error('خطأ في إلغاء الربط:', e)
    } finally {
      setUnlinkingCompanyId(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-blue-500" />
      case 'COMPANY_OWNER':
        return <Building2 className="h-4 w-4 text-green-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
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
        return 'مستخدم عادي'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString({
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-auto"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span>{user.name}</span>
                {user.isVerified && (
                  <Badge variant="secondary" className="text-xs">
                    <Award className="h-3 w-3 ml-1" />
                    موثق
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {getRoleIcon(user.role)}
                {getRoleText(user.role)}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            معرف المستخدم: {user.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* المعلومات الأساسية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">البريد الإلكتروني</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">الحالة</div>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">تاريخ التسجيل</div>
                    <div className="font-medium">{formatDate(user.createdAt)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">آخر دخول</div>
                    <div className="font-medium">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'لم يسجل دخول بعد'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الإحصائيات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                الإحصائيات والنشاط
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{user._count.reviews}</div>
                  <div className="text-sm text-blue-600">مراجعة</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{user.ownedCompanies.length}</div>
                  <div className="text-sm text-green-600">شركة مملوكة</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {user.ownedCompanies.filter(c => c.company.isVerified).length}
                  </div>
                  <div className="text-sm text-purple-600">شركة موثقة</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {user.ownedCompanies.filter(c => c.company.isActive).length}
                  </div>
                  <div className="text-sm text-orange-600">شركة نشطة</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الشركات المملوكة */}
          {user.ownedCompanies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  الشركات المملوكة ({user.ownedCompanies.length})
                </CardTitle>
                <CardDescription>
                  قائمة بالشركات التي يملكها هذا المستخدم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(userDetails?.ownedCompanies || user.ownedCompanies).map((ownership: any) => (
                    <div key={ownership.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-gray-400" />
                        <div>
                          <div className="font-medium">{ownership.company?.name}</div>
                          <div className="text-sm text-gray-500">/{ownership.company?.slug}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {ownership.company?.rating && (
                          <Badge variant="outline" className="text-xs">
                            ⭐ {ownership.company?.rating}
                          </Badge>
                        )}
                        
                        {ownership.company?.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            <Award className="h-3 w-3 ml-1" />
                            موثقة
                          </Badge>
                        )}
                        
                        <Badge variant={ownership.company?.isActive ? 'default' : 'secondary'} className="text-xs">
                          {ownership.company?.isActive ? 'نشطة' : 'غير نشطة'}
                        </Badge>

                        <Button 
                          variant="outline" 
                          className="text-red-600 border-red-200"
                          disabled={unlinkingCompanyId === (ownership.companyId || ownership.company?.id)}
                          onClick={() => handleUnlink(ownership.companyId || ownership.company?.id)}
                        >
                          {unlinkingCompanyId === (ownership.companyId || ownership.company?.id) ? 'جارٍ الإزالة...' : 'إلغاء الربط'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* معلومات إضافية للمديرين */}
          {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" />
                  معلومات إدارية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">مستوى الصلاحية</span>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span className="font-medium">{getRoleText(user.role)}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-sm text-gray-600">
                    {user.role === 'SUPER_ADMIN' && (
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <Crown className="h-4 w-4" />
                          <span className="font-medium">مدير عام</span>
                        </div>
                        <div className="text-sm mt-1">
                          يمتلك صلاحيات كاملة في النظام بما في ذلك إدارة المديرين الآخرين
                        </div>
                      </div>
                    )}
                    
                    {user.role === 'ADMIN' && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800">
                          <Shield className="h-4 w-4" />
                          <span className="font-medium">مدير</span>
                        </div>
                        <div className="text-sm mt-1">
                          يمكنه إدارة المحتوى والمستخدمين والشركات (ما عدا المديرين الآخرين)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModalOpen(false)}>إغلاق</Button>
          {onLinkCompany && (
            <Button onClick={() => onLinkCompany(user.id)}>ربط بشركة</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

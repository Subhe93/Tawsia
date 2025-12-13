'use client'

import { useState, useEffect } from 'react'
import { Edit, User, Mail, Shield, Building2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  isVerified: boolean
}

interface EditUserModalProps {
  user: User
  onUserUpdated: () => void
  canEditRole?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EditUserModal({ user, onUserUpdated, canEditRole = true, open, onOpenChange }: EditUserModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const modalOpen = isControlled ? open : internalOpen
  const setModalOpen = isControlled ? onOpenChange! : setInternalOpen
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    isActive: true,
    isVerified: false
  })

  // تحديث البيانات عند فتح المودال
  useEffect(() => {
    if (modalOpen) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified
      })
    }
  }, [modalOpen, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      toast.error('الاسم والبريد الإلكتروني مطلوبان')
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في تحديث المستخدم')
      }

      const data = await response.json()
      toast.success('تم تحديث المستخدم بنجاح')
      
      setModalOpen(false)
      onUserUpdated()
      
    } catch (error: any) {
      console.error('خطأ في تحديث المستخدم:', error)
      toast.error(error.message || 'حدث خطأ في تحديث المستخدم')
    } finally {
      setIsLoading(false)
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
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            تعديل المستخدم
          </DialogTitle>
          <DialogDescription>
            تعديل معلومات المستخدم "{user.name}". يمكنك تغيير الاسم والبريد الإلكتروني والإعدادات.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* الاسم */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              الاسم الكامل *
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="أدخل الاسم الكامل"
              required
            />
          </div>

          {/* البريد الإلكتروني */}
          <div className="space-y-2">
            <Label htmlFor="edit-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              البريد الإلكتروني *
            </Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="أدخل البريد الإلكتروني"
              required
            />
          </div>

          {/* الدور */}
          {canEditRole && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                دور المستخدم
              </Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">مستخدم عادي</SelectItem>
                  <SelectItem value="COMPANY_OWNER">مالك شركة</SelectItem>
                  <SelectItem value="ADMIN">مدير</SelectItem>
                  <SelectItem value="SUPER_ADMIN">مدير عام</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!canEditRole && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                الدور الحالي
              </Label>
              <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                {getRoleText(formData.role)}
              </div>
            </div>
          )}

          {/* الحالة والتوثيق */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="edit-isActive" className="text-sm">
                نشط
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="edit-isVerified"
                checked={formData.isVerified}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVerified: checked }))}
              />
              <Label htmlFor="edit-isVerified" className="text-sm">
                موثق
              </Label>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">معلومات إضافية</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">معرف المستخدم:</span>
                <br />
                <span className="text-xs font-mono">{user.id}</span>
              </div>
              <div>
                <span className="font-medium">الدور الحالي:</span>
                <br />
                {getRoleText(user.role)}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Save className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

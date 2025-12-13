'use client'

import { useState } from 'react'
import { Plus, User, Mail, Shield, Building2, Save, Eye, EyeOff } from 'lucide-react'
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

interface AddUserModalProps {
  onUserAdded: () => void
}

export function AddUserModal({ onUserAdded }: AddUserModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    isActive: true,
    isVerified: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('جميع الحقول المطلوبة يجب ملؤها')
      return
    }

    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون على الأقل 6 أحرف')
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في إنشاء المستخدم')
      }

      const data = await response.json()
      toast.success('تم إنشاء المستخدم بنجاح')
      
      // إعادة تعيين النموذج
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'USER',
        isActive: true,
        isVerified: false
      })
      
      setOpen(false)
      onUserAdded()
      
    } catch (error: any) {
      console.error('خطأ في إنشاء المستخدم:', error)
      toast.error(error.message || 'حدث خطأ في إنشاء المستخدم')
    } finally {
      setIsLoading(false)
    }
  }

  const generatePassword = () => {
    const length = 10
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setFormData(prev => ({ ...prev, password }))
    toast.success('تم إنشاء كلمة مرور قوية')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          إضافة مستخدم جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            إضافة مستخدم جديد
          </DialogTitle>
          <DialogDescription>
            إنشاء حساب مستخدم جديد في النظام. يمكنك تحديد دور المستخدم والإعدادات الأولية.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* الاسم */}
          <div className="space-y-2">
            <Label htmlFor="add-name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              الاسم الكامل *
            </Label>
            <Input
              id="add-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="أدخل الاسم الكامل"
              required
            />
          </div>

          {/* البريد الإلكتروني */}
          <div className="space-y-2">
            <Label htmlFor="add-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              البريد الإلكتروني *
            </Label>
            <Input
              id="add-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="أدخل البريد الإلكتروني"
              required
            />
          </div>

          {/* كلمة المرور */}
          <div className="space-y-2">
            <Label htmlFor="add-password" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              كلمة المرور *
            </Label>
            <div className="relative">
              <Input
                id="add-password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="أدخل كلمة المرور (على الأقل 6 أحرف)"
                className="pl-10"
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generatePassword}
              className="w-full"
            >
              إنشاء كلمة مرور قوية
            </Button>
          </div>

          {/* الدور */}
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

          {/* الحالة والتوثيق */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="add-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="add-isActive" className="text-sm">
                نشط
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="add-isVerified"
                checked={formData.isVerified}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVerified: checked }))}
              />
              <Label htmlFor="add-isVerified" className="text-sm">
                موثق
              </Label>
            </div>
          </div>

          {/* معاينة الدور */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">معاينة الدور المحدد</h4>
            <div className="text-sm text-gray-600">
              {formData.role === 'USER' && 'المستخدم العادي يمكنه تقييم الشركات وكتابة المراجعات'}
              {formData.role === 'COMPANY_OWNER' && 'مالك الشركة يمكنه إدارة شركة واحدة أو أكثر'}
              {formData.role === 'ADMIN' && 'المدير يمكنه إدارة المحتوى والمستخدمين والشركات'}
              {formData.role === 'SUPER_ADMIN' && 'المدير العام لديه صلاحيات كاملة في النظام'}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Save className="h-4 w-4 ml-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  إنشاء المستخدم
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
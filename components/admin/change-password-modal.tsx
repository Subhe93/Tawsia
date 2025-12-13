'use client'

import { useState } from 'react'
import { Lock, Key, Eye, EyeOff, Save, RefreshCw } from 'lucide-react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface ChangePasswordModalProps {
  user: User
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ChangePasswordModal({ user, open, onOpenChange }: ChangePasswordModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const modalOpen = isControlled ? open : internalOpen
  const setModalOpen = isControlled ? onOpenChange! : setInternalOpen

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون على الأقل 6 أحرف'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generatePassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    
    // ضمان وجود حرف كبير وصغير ورقم ورمز
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]
    password += "0123456789"[Math.floor(Math.random() * 10)]
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)]
    
    // إكمال باقي الأحرف
    for (let i = 4; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    
    // خلط كلمة المرور
    password = password.split('').sort(() => Math.random() - 0.5).join('')
    
    setFormData({
      newPassword: password,
      confirmPassword: password
    })
    
    setErrors({})
    toast.success('تم إنشاء كلمة مرور قوية')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formData.newPassword)
      toast.success('تم نسخ كلمة المرور إلى الحافظة')
    } catch (error) {
      toast.error('فشل في نسخ كلمة المرور')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/admin/users/${user.id}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: formData.newPassword
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في تغيير كلمة المرور')
      }

      toast.success('تم تغيير كلمة المرور بنجاح')
      
      // إعادة تعيين النموذج
      setFormData({
        newPassword: '',
        confirmPassword: ''
      })
      setErrors({})
      
      setModalOpen(false)
      
    } catch (error: any) {
      console.error('خطأ في تغيير كلمة المرور:', error)
      toast.error(error.message || 'حدث خطأ في تغيير كلمة المرور')
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    if (strength <= 2) return { level: 'ضعيف', color: 'red', width: '33%' }
    if (strength <= 3) return { level: 'متوسط', color: 'yellow', width: '66%' }
    return { level: 'قوي', color: 'green', width: '100%' }
  }

  const passwordStrength = formData.newPassword ? getPasswordStrength(formData.newPassword) : null

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="p-0 h-auto">
            <Lock className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            تغيير كلمة المرور
          </DialogTitle>
          <DialogDescription>
            تغيير كلمة المرور للمستخدم "{user.name}". سيتم إرسال كلمة المرور الجديدة للمستخدم عبر البريد الإلكتروني.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* معلومات المستخدم */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">اسم المستخدم:</span>
                <br />
                {user.name}
              </div>
              <div>
                <span className="font-medium">البريد الإلكتروني:</span>
                <br />
                {user.email}
              </div>
            </div>
          </div>

          {/* كلمة المرور الجديدة */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              كلمة المرور الجديدة *
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, newPassword: e.target.value }))
                  setErrors(prev => ({ ...prev, newPassword: '' }))
                }}
                placeholder="أدخل كلمة المرور الجديدة"
                className={`pl-20 ${errors.newPassword ? 'border-red-500' : ''}`}
                minLength={6}
              />
              <div className="absolute left-0 top-0 h-full flex">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-full px-3 rounded-l-md rounded-r-none border-l"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                {formData.newPassword && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-full px-3 rounded-none"
                    onClick={copyToClipboard}
                    title="نسخ كلمة المرور"
                  >
                    📋
                  </Button>
                )}
              </div>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600">{errors.newPassword}</p>
            )}
            
            {/* مؤشر قوة كلمة المرور */}
            {passwordStrength && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>قوة كلمة المرور:</span>
                  <span style={{ color: passwordStrength.color }}>
                    {passwordStrength.level}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: passwordStrength.width,
                      backgroundColor: passwordStrength.color
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* تأكيد كلمة المرور */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              تأكيد كلمة المرور *
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))
                setErrors(prev => ({ ...prev, confirmPassword: '' }))
              }}
              placeholder="أعد إدخال كلمة المرور"
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* زر إنشاء كلمة مرور قوية */}
          <Button
            type="button"
            variant="outline"
            onClick={generatePassword}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            إنشاء كلمة مرور قوية تلقائياً
          </Button>

          {/* تحذير أمان */}
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              <strong>ملاحظة أمنية:</strong> سيتم تشفير كلمة المرور الجديدة وحفظها بشكل آمن. 
              يُنصح بإرسال كلمة المرور للمستخدم عبر قناة اتصال آمنة منفصلة.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading || !formData.newPassword || !formData.confirmPassword}>
              {isLoading ? (
                <>
                  <Save className="h-4 w-4 ml-2 animate-spin" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  تغيير كلمة المرور
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

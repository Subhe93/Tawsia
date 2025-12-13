'use client'

import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, Users, Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export function ExportUsersModal() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    dateFrom: '',
    dateTo: '',
    includeInactive: false,
    roles: [] as string[],
    fields: {
      basicInfo: true,
      contactInfo: true,
      roleInfo: true,
      dateInfo: true,
      statsInfo: true
    }
  })

  const handleRoleChange = (role: string, checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, role]
        : prev.roles.filter(r => r !== role)
    }))
  }

  const handleFieldChange = (field: string, checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [field]: checked
      }
    }))
  }

  const handleExport = async () => {
    try {
      setIsLoading(true)

      // بناء معاملات الاستعلام
      const params = new URLSearchParams({
        format: exportOptions.format,
        ...(exportOptions.dateFrom && { dateFrom: exportOptions.dateFrom }),
        ...(exportOptions.dateTo && { dateTo: exportOptions.dateTo }),
        includeInactive: exportOptions.includeInactive.toString(),
        roles: exportOptions.roles.join(','),
        fields: Object.entries(exportOptions.fields)
          .filter(([_, value]) => value)
          .map(([key, _]) => key)
          .join(',')
      })

      const response = await fetch(`/api/admin/users/export?${params}`)
      
      if (!response.ok) {
        throw new Error('فشل في تصدير البيانات')
      }

      // تحديد نوع الملف ونزوله
      const contentType = response.headers.get('content-type')
      const filename = `users-export-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`
      
      if (exportOptions.format === 'csv') {
        const csvContent = await response.text()
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        downloadFile(blob, filename)
      } else {
        const jsonContent = await response.json()
        const blob = new Blob([JSON.stringify(jsonContent, null, 2)], { type: 'application/json' })
        downloadFile(blob, filename)
      }

      toast.success(`تم تصدير البيانات بنجاح كملف ${exportOptions.format.toUpperCase()}`)
      setOpen(false)
      
    } catch (error: any) {
      console.error('خطأ في تصدير البيانات:', error)
      toast.error(error.message || 'حدث خطأ في تصدير البيانات')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const allFieldsSelected = Object.values(exportOptions.fields).every(value => value)
  const someFieldsSelected = Object.values(exportOptions.fields).some(value => value)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 ml-2" />
          تصدير البيانات
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            تصدير بيانات المستخدمين
          </DialogTitle>
          <DialogDescription>
            اختر تنسيق التصدير والمرشحات والحقول التي تريد تضمينها في الملف المُصدر.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* تنسيق التصدير */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              تنسيق الملف
            </Label>
            <Select value={exportOptions.format} onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (جدول بيانات)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    JSON (بيانات منظمة)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* فلاتر التاريخ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="export-dateFrom" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                من تاريخ
              </Label>
              <Input
                id="export-dateFrom"
                type="date"
                value={exportOptions.dateFrom}
                onChange={(e) => setExportOptions(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-dateTo">إلى تاريخ</Label>
              <Input
                id="export-dateTo"
                type="date"
                value={exportOptions.dateTo}
                onChange={(e) => setExportOptions(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>

          {/* خيارات إضافية */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              خيارات الفلترة
            </Label>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="export-includeInactive"
                checked={exportOptions.includeInactive}
                onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeInactive: checked }))}
              />
              <Label htmlFor="export-includeInactive" className="text-sm">
                تضمين المستخدمين غير النشطين
              </Label>
            </div>
          </div>

          {/* فلتر الأدوار */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              الأدوار المطلوبة (اختر واحد أو أكثر)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'USER', label: 'مستخدم عادي' },
                { value: 'COMPANY_OWNER', label: 'مالك شركة' },
                { value: 'ADMIN', label: 'مدير' },
                { value: 'SUPER_ADMIN', label: 'مدير عام' }
              ].map((role) => (
                <div key={role.value} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={`role-${role.value}`}
                    checked={exportOptions.roles.includes(role.value)}
                    onCheckedChange={(checked) => handleRoleChange(role.value, !!checked)}
                  />
                  <Label htmlFor={`role-${role.value}`} className="text-sm">
                    {role.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* الحقول المطلوبة */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>الحقول المطلوبة</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExportOptions(prev => ({
                    ...prev,
                    fields: Object.keys(prev.fields).reduce((acc, key) => ({ ...acc, [key]: true }), {} as any)
                  }))}
                >
                  تحديد الكل
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExportOptions(prev => ({
                    ...prev,
                    fields: Object.keys(prev.fields).reduce((acc, key) => ({ ...acc, [key]: false }), {} as any)
                  }))}
                >
                  إلغاء الكل
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { key: 'basicInfo', label: 'المعلومات الأساسية (الاسم، المعرف)' },
                { key: 'contactInfo', label: 'معلومات الاتصال (البريد الإلكتروني)' },
                { key: 'roleInfo', label: 'معلومات الدور والصلاحيات' },
                { key: 'dateInfo', label: 'التواريخ (الإنشاء، آخر دخول)' },
                { key: 'statsInfo', label: 'الإحصائيات (المراجعات، الشركات)' }
              ].map((field) => (
                <div key={field.key} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={`field-${field.key}`}
                    checked={exportOptions.fields[field.key as keyof typeof exportOptions.fields]}
                    onCheckedChange={(checked) => handleFieldChange(field.key, !!checked)}
                  />
                  <Label htmlFor={`field-${field.key}`} className="text-sm">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* معاينة عدد السجلات */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm mb-1">معاينة التصدير</h4>
            <div className="text-sm text-blue-600">
              <p>التنسيق: {exportOptions.format.toUpperCase()}</p>
              <p>الأدوار المحددة: {exportOptions.roles.length === 0 ? 'جميع الأدوار' : exportOptions.roles.join(', ')}</p>
              <p>الحقول: {Object.values(exportOptions.fields).filter(Boolean).length} من 5 حقول</p>
              {!someFieldsSelected && (
                <p className="text-red-600 font-medium">⚠️ يجب اختيار حقل واحد على الأقل</p>
              )}
            </div>
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
          <Button 
            onClick={handleExport} 
            disabled={isLoading || !someFieldsSelected}
          >
            {isLoading ? (
              <>
                <Download className="h-4 w-4 ml-2 animate-spin" />
                جاري التصدير...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 ml-2" />
                تصدير البيانات
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

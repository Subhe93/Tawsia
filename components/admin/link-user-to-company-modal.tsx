'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

type CompanyOption = {
  id: string
  name: string
  slug: string
  isActive: boolean
  isVerified: boolean
  rating: number
}

interface LinkUserToCompanyModalProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onLinked?: () => void
}

export function LinkUserToCompanyModal({ userId, open, onOpenChange, onLinked }: LinkUserToCompanyModalProps) {
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [search, setSearch] = useState('')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [role, setRole] = useState<'OWNER' | 'MANAGER' | 'EDITOR'>('OWNER')
  const [isPrimary, setIsPrimary] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    fetchCompanies()
  }, [open, search])

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: '1',
        limit: '20',
        ...(search && { search }),
        isActive: 'true'
      })
      const res = await fetch(`/api/admin/companies?${params.toString()}`)
      if (!res.ok) return
      const data = await res.json()
      const options: CompanyOption[] = (data.companies || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        isActive: c.isActive,
        isVerified: c.isVerified,
        rating: c.rating || 0
      }))
      setCompanies(options)
    } catch (e) {
      console.error('خطأ في جلب الشركات:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const submit = async () => {
    if (!selectedCompanyId) return
    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/admin/users/${userId}/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedCompanyId, role, isPrimary, permissions: [] })
      })
      if (res.ok) {
        onOpenChange(false)
        onLinked?.()
      }
    } catch (e) {
      console.error('خطأ في ربط المستخدم بالشركة:', e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>ربط المستخدم بشركة موجودة</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>ابحث عن شركة</Label>
            <Input placeholder="اسم الشركة أو البريد أو الهاتف" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>اختر الشركة</Label>
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? 'جاري التحميل...' : 'اختر شركة'} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <span>{c.name}</span>
                      {c.isVerified && <Badge variant="secondary" className="text-[10px]">موثقة</Badge>}
                      <Badge variant={c.isActive ? 'default' : 'secondary'} className="text-[10px]">
                        {c.isActive ? 'نشطة' : 'غير نشطة'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>دور المالك</Label>
              <Select value={role} onValueChange={(v) => setRole(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWNER">مالك</SelectItem>
                  <SelectItem value="MANAGER">مدير</SelectItem>
                  <SelectItem value="EDITOR">محرر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
                <input type="checkbox" className="h-4 w-4" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
                مالك رئيسي
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>إلغاء</Button>
            <Button onClick={submit} disabled={!selectedCompanyId || isSubmitting}>{isSubmitting ? 'جارٍ الحفظ...' : 'ربط'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}



'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Clock, Edit, Save, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { 
  WorkingHour, 
  getCurrentDayStatus 
} from '@/lib/types/working-hours'
import { WorkingHoursDisplay } from '@/components/working-hours-display'
import { WorkingHoursEditor, WorkingHourData } from '@/components/working-hours-editor'

export default function WorkingHoursPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'COMPANY_OWNER' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      router.push('/')
      return
    }

    fetchWorkingHours()
  }, [session, status, router])

  const fetchWorkingHours = async () => {
    try {
      setIsDataLoading(true)
      const response = await fetch('/api/company/working-hours')
      if (response.ok) {
        const data = await response.json()
        const fetchedHours = data.workingHours || []
        console.log('Fetched working hours:', fetchedHours) // للتأكد من البيانات المجلوبة
        setWorkingHours(fetchedHours)
      } else {
        toast.error('فشل في جلب ساعات العمل')
      }
    } catch (error) {
      toast.error('حدث خطأ في جلب البيانات')
    } finally {
      setIsDataLoading(false)
    }
  }

  const handleSave = async (updatedWorkingHours: WorkingHourData[]) => {
    try {
      setIsSaving(true)
      console.log('handleSave called with:', updatedWorkingHours) // للتأكد من البيانات

      const response = await fetch('/api/company/working-hours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workingHours: updatedWorkingHours })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في حفظ ساعات العمل')
      }

      const data = await response.json()
      console.log('API response:', data) // للتأكد من الاستجابة
      setWorkingHours(data.workingHours || [])
      setIsEditing(false)
      toast.success('تم حفظ ساعات العمل بنجاح')
    } catch (error) {
      console.error('خطأ في حفظ ساعات العمل:', error)
      toast.error('فشل في حفظ ساعات العمل')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  if (status === 'loading' || isDataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) return null

  const status_info = workingHours.length > 0 ? getCurrentDayStatus(workingHours) : { status: 'closed', message: 'لم يتم تحديد ساعات العمل' }

  return (
    <div className="space-y-6">
      {/* الرأس */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ساعات العمل
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة أوقات عمل شركتك وساعات الاستراحة
          </p>
        </div>
        
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            تعديل ساعات العمل
          </Button>
        )}
      </div>

      {/* الحالة الحالية */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">الحالة الحالية</p>
                <Badge 
                  variant={
                    status_info.status === 'open' ? 'default' : 'destructive'
                  }
                  className="text-sm"
                >
                  {status_info.message}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ساعات العمل */}
      {isEditing ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                تعديل ساعات العمل
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  إلغاء
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <WorkingHoursEditor
              initialHours={workingHours}
              onSave={handleSave}
              isLoading={isSaving}
            />
          </CardContent>
        </Card>
      ) : workingHours.length > 0 ? (
        <WorkingHoursDisplay
          hours={workingHours}
          showCurrentStatus={false}
        />
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لم يتم تحديد ساعات العمل
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              لم تقم بتحديد ساعات عمل شركتك بعد. انقر على زر التعديل لإضافتها.
            </p>
            <Button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Edit className="h-4 w-4" />
              إضافة ساعات العمل
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
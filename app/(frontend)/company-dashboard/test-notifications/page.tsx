'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Bell } from 'lucide-react'

export default function TestNotificationsPage() {
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchNotifications = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)
      const response = await fetch('/api/notifications')
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في جلب الإشعارات')
      }
      
      const data = await response.json()
      console.log('Notifications data:', data)
      setNotifications(data.notifications)
      setError(null)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchNotifications()
    }
  }, [session?.user?.id, status])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 mr-3">جاري التحميل...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            يجب تسجيل الدخول
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            يجب تسجيل الدخول لعرض الإشعارات
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">اختبار الإشعارات</h1>
      
      <div className="mb-4">
        <p><strong>المستخدم:</strong> {session.user.name} ({session.user.email})</p>
        <p><strong>حالة الجلسة:</strong> {status}</p>
      </div>

      <button 
        onClick={fetchNotifications}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'جاري التحميل...' : 'جلب الإشعارات'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>خطأ:</strong> {error}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">الإشعارات ({notifications.length})</h2>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-4 border rounded">
                <h3 className="font-medium">{notification.title}</h3>
                <p className="text-gray-600">{notification.message}</p>
                <p className="text-sm text-gray-500 mt-2">
                  النوع: {notification.type} | 
                  الحالة: {notification.isRead ? 'مقروء' : 'غير مقروء'} |
                  التاريخ: {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notifications.length === 0 && !loading && !error && (
        <div className="mt-6 text-center text-gray-500">
          لا توجد إشعارات
        </div>
      )}
    </div>
  )
}

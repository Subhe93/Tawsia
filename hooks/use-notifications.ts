import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface Notification {
  id: string
  type: 'review' | 'message' | 'system' | 'award'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: {
    reviewId?: string
    companyId?: string
    userId?: string
  }
}

export interface NotificationStats {
  unreadCount: number
  totalCount: number
  byType: {
    review: number
    message: number
    system: number
    award: number
  }
}

export function useNotifications() {
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    unreadCount: 0,
    totalCount: 0,
    byType: { review: 0, message: 0, system: 0, award: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id || status === 'loading') return;

    setLoading(true);
    try {
      const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
      const url = isAdmin ? '/api/admin/notifications' : '/api/notifications';
      const response = await fetch(url);
      if (!response.ok) throw new Error('فشل في جلب الإشعارات');
      
      const data = await response.json();
      
      if (isAdmin && data.success) {
        const adminNotifications = data.data.notifications || [];
        const unreadCount = adminNotifications.filter(n => !n.isRead).length;
        setNotifications(adminNotifications);
        setStats({
          unreadCount: unreadCount,
          totalCount: data.data.totalPages * 10, // This is an approximation
          byType: { review: 0, message: 0, system: 0, award: 0 } // Type data not available in admin API
        });
      } else if (!isAdmin) {
        setNotifications(data.notifications || []);
        setStats(data.stats || { unreadCount: 0, totalCount: 0, byType: { review: 0, message: 0, system: 0, award: 0 } });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  const markAsRead = async (notificationId: string) => {
    if (!session?.user?.id) return

    try {
      const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
      const url = isAdmin ? `/api/admin/notifications?id=${notificationId}` : `/api/notifications/${notificationId}/read`;
      const response = await fetch(url, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        )
        
        setStats(prev => ({
          ...prev,
          unreadCount: Math.max(0, prev.unreadCount - 1)
        }))
      }
    } catch (err) {
      console.error('خطأ في تحديث حالة الإشعار:', err)
    }
  }

  const markAllAsRead = async () => {
    if (!session?.user?.id) return

    try {
      const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
      const url = isAdmin ? '/api/admin/notifications/mark-all-as-read' : '/api/notifications/mark-all-read';
      const response = await fetch(url, {
        method: isAdmin ? 'POST' : 'PATCH'
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        )
        setStats(prev => ({ ...prev, unreadCount: 0 }))
      }
    } catch (err) {
      console.error('خطأ في تحديث جميع الإشعارات:', err)
    }
  }

  const refetch = useCallback(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session?.user?.id, fetchNotifications]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    } else if (status === 'unauthenticated') {
      setLoading(false);
      setNotifications([]);
      setStats({
        unreadCount: 0,
        totalCount: 0,
        byType: { review: 0, message: 0, system: 0, award: 0 }
      });
    }
  }, [status, fetchNotifications]);

  return {
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch
  }
}

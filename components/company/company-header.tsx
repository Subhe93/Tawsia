'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Search, Menu, User, LogOut, Settings, Home, Building2, Eye } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotifications } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'
import { QuickCacheClear } from '@/components/admin/cache-clear-button'

export function CompanyHeader() {
  const { data: session } = useSession()
  const { notifications, stats, loading, markAsRead, markAllAsRead } = useNotifications()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'review':
        return '⭐'
      case 'message':
        return '💬'
      case 'system':
        return '🔔'
      case 'award':
        return '🏆'
      default:
        return '📢'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'الآن'
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center space-x-4 space-x-reverse">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link href="/company-dashboard" className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">م</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">توصية</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">لوحة تحكم الشركة</p>
            </div>
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="بحث في المراجعات، الإحصائيات..."
              className="w-full pr-10 pl-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 space-x-reverse">
          {/* زر تفريغ كاش الشركة */}
          <QuickCacheClear type="company" />
          
          {/* الإشعارات */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" disabled={loading}>
                <Bell className="h-5 w-5" />
                {stats.unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {stats.unreadCount > 99 ? '99+' : stats.unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <DropdownMenuLabel className="text-base font-semibold">الإشعارات</DropdownMenuLabel>
                {stats.unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-6 px-2"
                  >
                    تحديد الكل كمقروء
                  </Button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    جاري التحميل...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    لا توجد إشعارات جديدة
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.slice(0, 8).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={cn(
                          "flex flex-col items-start p-3 cursor-pointer",
                          !notification.isRead && "bg-blue-50 dark:bg-blue-900/20"
                        )}
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsRead(notification.id)
                          }
                        }}
                      >
                        <div className="flex items-start w-full space-x-3 space-x-reverse">
                          <div className="text-lg mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-sm text-gray-900 dark:text-white">
                                {notification.title}
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              {formatTime(notification.createdAt)}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </div>
              
              {notifications.length > 8 && (
                <div className="p-3 border-t text-center">
                  <Button variant="ghost" size="sm" className="text-xs h-6" asChild>
                    <Link href="/company-dashboard/notifications">
                      عرض جميع الإشعارات
                    </Link>
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* زر عرض الصفحة */}
          {/* {session?.user?.companySlug && session?.user?.companyCity && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/sy/city/${session.user.companyCity}/company/${session.user.companySlug}`}
                className="hidden md:flex items-center"
              >
                <Eye className="h-4 w-4 ml-2" />
                عرض الصفحة
              </Link>
            </Button>
          )} */}

          {/* زر العودة للموقع */}
          <Button variant="outline" size="sm" asChild>
            <Link href="/" className="hidden md:flex items-center">
              <Home className="h-4 w-4 ml-2" />
              الموقع الرئيسي
            </Link>
          </Button>

          {/* قائمة المستخدم */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || 'المستخدم'} />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'م'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name || 'المستخدم'}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email || 'user@example.com'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem asChild>
                <Link href="/company-dashboard/profile">
                  <User className="ml-2 h-4 w-4" />
                  الملف الشخصي
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/company-dashboard/settings">
                  <Settings className="ml-2 h-4 w-4" />
                  إعدادات الحساب
                </Link>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 cursor-pointer"
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              >
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

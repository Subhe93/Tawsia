'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, 
  Building2, 
  MessageSquare, 
  Users, 
  FileText, 
  Settings, 
  BarChart3,
  Shield,
  Bell,
  Download,
  Plus,
  Eye,
  Home,
  Tag,
  MapPin,
  Award,
  Upload,
  RefreshCw,
  TrendingUp,
  Zap,
  Search as SearchIcon,
  Map
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const getNavigation = (stats: DashboardStats) => [
  {
    name: 'نظرة عامة',
    href: '/admin',
    icon: LayoutDashboard,
    current: false,
  },
  {
    name: 'أضف شركتك',
    href: '/add-company',
    icon: Home,
    current: false,
    external: true
  },
  {
    name: 'الشركات',
    href: '/admin/companies',
    icon: Building2,
    current: false,
    badge: stats.totalCompanies.toLocaleString(),
    children: [
      { name: 'جميع الشركات', href: '/admin/companies', icon: Eye },
      { name: 'إضافة شركة', href: '/admin/companies/add', icon: Plus },
      { name: 'استيراد من CSV', href: '/admin/companies/import', icon: Upload },
      { name: 'طلبات الانضمام', href: '/admin/company-requests', icon: FileText, badge: stats.pendingRequests.toString() },
    ]
  },
  {
    name: 'المراجعات',
    href: '/admin/reviews',
    icon: MessageSquare,
    current: false,
    children: [
      { name: 'جميع المراجعات', href: '/admin/reviews', icon: Eye },
      { name: 'في الانتظار', href: '/admin/reviews/pending', icon: FileText, badge: stats.pendingReviews.toString() },
      { name: 'البلاغات', href: '/admin/reports', icon: Shield, badge: stats.reportedReviews.toString() },
    ]
  },
  {
    name: 'صفحات التصنيف',
    href: '/admin/ranking-pages',
    icon: TrendingUp,
    current: false,
    badge: stats.rankingPages?.toString(),
    children: [
      { name: 'جميع الصفحات', href: '/admin/ranking-pages', icon: Eye },
      { name: 'إضافة صفحة', href: '/admin/ranking-pages/new', icon: Plus },
      { name: 'توليد تلقائي', href: '/admin/ranking-pages/generate', icon: Zap },
    ]
  },
  {
    name: 'تحسينات SEO',
    href: '/admin/seo',
    icon: FileText,
    current: false,
    children: [
      { name: 'إدارة العناوين والوصف', href: '/admin/seo', icon: Eye },
      // { name: 'استكشاف الروابط', href: '/admin/seo/explore', icon: SearchIcon },
    ]
  },
  {
    name: 'إدارة السايت ماب',
    href: '/admin/sitemap-manager',
    icon: Map,
    current: false,
  },
  {
    name: 'الجوائز والشهادات',
    href: '/admin/awards',
    icon: Award,
    current: false,
  },
  {
    name: 'المستخدمين',
    href: '/admin/users',
    icon: Users,
    current: false,
    badge: stats.totalUsers.toLocaleString(),
    children: [
      { name: 'جميع المستخدمين', href: '/admin/users', icon: Eye },
      { name: 'مالكي الشركات', href: '/admin/users?hasCompanies=true', icon: Building2 },
      { name: 'المديرين', href: '/admin/users?role=ADMIN,SUPER_ADMIN', icon: Shield },
    ]
  },
  {
    name: 'التقارير',
    href: '/admin/analytics',
    icon: BarChart3,
    current: false,
    children: [
      { name: 'إحصائيات عامة', href: '/admin/analytics', icon: BarChart3 },
      // { name: 'تقارير الأداء', href: '/admin/analytics/performance', icon: BarChart3 },
      // { name: 'تصدير البيانات', href: '/admin/analytics/export', icon: Download },
    ]
  },
  {
    name: 'الإشعارات',
    href: '/admin/notifications',
    icon: Bell,
    current: false,
    badge: stats.notifications.toString(),
  },
  {
    name: 'الإعدادات',
    href: '/admin/settings',
    icon: Settings,
    current: false,
    children: [
      { name: 'إعدادات عامة', href: '/admin/settings', icon: Settings },
      { name: 'البلدان والمدن', href: '/admin/settings/locations', icon: MapPin },
      { name: 'المناطق الفرعية', href: '/admin/settings/sub-areas', icon: MapPin },
      { name: 'الفئات', href: '/admin/settings/categories', icon: Tag },
      { name: 'التصنيفات الفرعية', href: '/admin/settings/subcategories', icon: Tag },
      { name: 'إدارة الكاش', href: '/admin/cache', icon: RefreshCw },
    ]
  },
]

interface DashboardStats {
  pendingReviews: number
  totalCompanies: number
  totalUsers: number
  pendingRequests: number
  reportedReviews: number
  notifications: number
  rankingPages?: number
}

export function AdminSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [stats, setStats] = useState<DashboardStats>({
    pendingReviews: 0,
    totalCompanies: 0,
    totalUsers: 0,
    pendingRequests: 0,
    reportedReviews: 0,
    notifications: 0,
    rankingPages: 0
  })
  const [memoryUsage, setMemoryUsage] = useState(0)

  // جلب الإحصائيات الحقيقية
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard-stats')
        if (response.ok) {
          const data = await response.json()
          if (data && typeof data === 'object') {
            setStats({
              pendingReviews: data.pendingReviews || 0,
              totalCompanies: data.totalCompanies || 0,
              totalUsers: data.totalUsers || 0,
              pendingRequests: data.pendingRequests || 0,
              reportedReviews: data.reportedReviews || 0,
              notifications: data.notifications || 0,
              rankingPages: data.rankingPages || 0
            })
          }
        } else {
          // fallback to zeros
          setStats({
            pendingReviews: 0,
            totalCompanies: 0,
            totalUsers: 0,
            pendingRequests: 0,
            reportedReviews: 0,
            notifications: 0,
            rankingPages: 0
          })
        }
      } catch (error) {
        console.error('خطأ في جلب الإحصائيات:', error)
        // Set to zero in case of error
        setStats({
          pendingReviews: 0,
          totalCompanies: 0,
          totalUsers: 0,
          pendingRequests: 0,
          reportedReviews: 0,
          notifications: 0,
          rankingPages: 0
        })
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // تحديث كل 30 ثانية
    
    return () => clearInterval(interval)
  }, [])

  // محاكاة استخدام الذاكرة
  useEffect(() => {
    const updateMemory = () => {
      const usage = Math.floor(Math.random() * 20) + 65 // بين 65-85%
      setMemoryUsage(usage)
    }
    
    updateMemory()
    const interval = setInterval(updateMemory, 5000) // تحديث كل 5 ثواني
    
    return () => clearInterval(interval)
  }, [])
  
  // دالة للتحقق من حالة النشاط للروابط مع معاملات
  const isActiveLink = (href: string, currentPath: string) => {
    if (href.includes('?')) {
      // إذا كان الرابط يحتوي على معاملات
      const [basePath, params] = href.split('?')
      if (currentPath === basePath) {
        // تحقق من معاملات URL الحالية
        const linkParams = new URLSearchParams(params)
        
        // تحقق من تطابق جميع المعاملات
        const entries = Array.from(linkParams.entries())
        for (const [key, value] of entries) {
          if (searchParams.get(key) !== value) {
            return false
          }
        }
        return true
      }
      return false
    }
    // للروابط العادية بدون معاملات
    return currentPath === href && searchParams.toString() === ''
  }

  // التحقق من حالة النشاط للقسم الرئيسي
  const isMainSectionActive = (item: any) => {
    if (pathname === item.href) return true
    if (item.children) {
      return item.children.some((child: any) => isActiveLink(child.href, pathname) || pathname.startsWith(child.href))
    }
    return false
  }

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:top-16 lg:right-0 lg:z-40">
      <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto shadow-lg">
        <div className="flex flex-col flex-grow">
          {/* Header Section */}
          <div className="flex items-center flex-shrink-0 px-3 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">م</span>
            </div>
            <div className="mr-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                لوحة التحكم
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">المدير</p>
            </div>
          </div>

          <nav className="flex-1 px-2 py-3 space-y-1">
            {(getNavigation(stats) || []).map((item, index) => {
              const isMainActive = isMainSectionActive(item)
              return (
                <div key={item.name} className="relative">
                  <Link
                    href={item.href}
                    target={(item as any).external ? '_blank' : undefined}
                    rel={(item as any).external ? 'noopener noreferrer' : undefined}
                    className={cn(
                      isMainActive
                        ? 'bg-blue-50 dark:bg-blue-900/50 border-r-4 border-blue-500 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200'
                    )}
                  >
                    <div className={cn(
                      isMainActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-gray-600',
                      'p-1.5 rounded-lg transition-colors duration-200'
                    )}>
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    
                    <span className="flex-1 mr-2">{item.name}</span>
                    
                    {item.badge && (
                      <Badge 
                        variant={isMainActive ? "default" : "secondary"}
                        className={cn(
                          "text-xs",
                          isMainActive 
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-800/50 dark:text-blue-300" 
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                  
                  {item.children && (
                    <div className="mr-4 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const isChildActive = isActiveLink(child.href, pathname) || pathname.startsWith(child.href)
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={cn(
                              isChildActive
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300',
                              'group flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-colors duration-200'
                            )}
                          >
                            <child.icon className={cn(
                              isChildActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500',
                              'ml-1.5 h-3.5 w-3.5'
                            )} />
                            <span className="flex-1">{child.name}</span>
                            {(child as any).badge && (
                              <Badge 
                                variant={parseInt((child as any).badge) > 0 ? "destructive" : "secondary"} 
                                className="text-xs"
                              >
                                {(child as any).badge}
                              </Badge>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Footer Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            {/* Quick Stats */}
            <div className="mb-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.pendingReviews}</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70">معلقة</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.totalCompanies}</p>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70">شركة</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">حالة النظام</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400 mr-1">نشط</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">الذاكرة</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">{memoryUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                  <div 
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-1000",
                      memoryUsage > 80 ? "bg-red-500" : memoryUsage > 60 ? "bg-yellow-500" : "bg-green-500"
                    )} 
                    style={{width: `${memoryUsage}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

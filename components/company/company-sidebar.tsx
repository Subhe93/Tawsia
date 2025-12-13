'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Building2, 
  MessageSquare, 
  Camera, 
  Clock,
  BarChart3,
  Settings,
  Star,
  Users,
  Award,
  Globe,
  Eye,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useCompanyData } from '@/hooks/use-company-data'
import { useNotifications } from '@/hooks/use-notifications'

// تعريف نوع البيانات للعناصر الفرعية
interface NavigationChild {
  name: string
  href: string
  icon: any
  badge?: string
}

// تعريف نوع البيانات للعناصر الرئيسية
interface NavigationItem {
  name: string
  href: string
  icon: any
  current: boolean
  badge?: string
  children?: NavigationChild[]
}

export function CompanySidebar() {
  const pathname = usePathname()
  const { companyData, loading } = useCompanyData()
  const { stats } = useNotifications()

  // تحديث البيانات الديناميكية للتنقل
  const dynamicNavigation: NavigationItem[] = [
    {
      name: 'نظرة عامة',
      href: '/company-dashboard',
      icon: LayoutDashboard,
      current: false,
    },
    {
      name: 'معلومات الشركة',
      href: '/company-dashboard/info',
      icon: Building2,
      current: false,
      children: [
        { name: 'المعلومات الأساسية', href: '/company-dashboard/info', icon: Eye },
        { name: 'ساعات العمل', href: '/company-dashboard/working-hours', icon: Clock },
        { name: 'معرض الصور', href: '/company-dashboard/gallery', icon: Camera },
        { name: 'وسائل التواصل', href: '/company-dashboard/social', icon: Globe },
      ]
    },
    {
      name: 'المراجعات',
      href: '/company-dashboard/reviews',
      icon: MessageSquare,
      current: false,
      badge: companyData?.totalReviews?.toString() || '0',
      children: [
        { name: 'جميع المراجعات', href: '/company-dashboard/reviews', icon: Eye },
        { 
          name: 'في الانتظار', 
          href: '/company-dashboard/reviews/pending', 
          icon: MessageSquare, 
          badge: companyData?.pendingReviews?.toString() || '0' 
        },
        { name: 'الرد على المراجعات', href: '/company-dashboard/reviews/responses', icon: MessageSquare },
      ]
    },
    {
      name: 'الجوائز والشهادات',
      href: '/company-dashboard/awards',
      icon: Award,
      current: false,
    },
    // {
    //   name: 'الإشعارات',
    //   href: '/company-dashboard/notifications',
    //   icon: Bell,
    //   current: false,
    //   badge: stats?.unreadCount?.toString() || '0',
    // },
    // {
    //   name: 'الإعدادات',
    //   href: '/company-dashboard/settings',
    //   icon: Settings,
    //   current: false,
    // },
  ]

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:top-16 lg:z-40">
      <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="flex flex-col flex-grow pt-5 pb-4">
          <div className="flex items-center flex-shrink-0 px-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              لوحة تحكم الشركة
            </h2>
          </div>
          
          {/* معلومات الشركة */}
          <div className="px-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {loading ? 'جاري التحميل...' : companyData?.name || 'شركتك'}
                  </p>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {loading ? '...' : `${companyData?.averageRating || 0} (${companyData?.reviewsCount || 0} تقييم)`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <nav className="mt-5 flex-1 px-2 space-y-1">
            {dynamicNavigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    pathname === item.href
                      ? 'bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200'
                  )}
                >
                  <item.icon
                    className={cn(
                      pathname === item.href
                        ? 'text-blue-500 dark:text-blue-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400',
                      'ml-3 flex-shrink-0 h-5 w-5'
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className="mr-auto text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
                
                {item.children && (
                  <div className="mt-1 mr-6 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          pathname === child.href
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                          'group flex items-center px-2 py-1.5 text-xs font-medium rounded-md transition-colors duration-200'
                        )}
                      >
                        <child.icon className="ml-2 h-4 w-4" />
                        <span className="flex-1">{child.name}</span>
                        {child.badge && (
                          <Badge variant="destructive" className="mr-auto text-xs">
                            {child.badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

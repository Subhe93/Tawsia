import { Metadata } from 'next'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'لوحة تحكم المدير | توصية',
  description: 'لوحة تحكم إدارة الموقع والشركات والمراجعات',
}

// منع الكاش في داشبورد الأدمن
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 lg:mr-64 p-6 mt-16">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
         <Toaster />
      </div>
     
    </div>
  )
}

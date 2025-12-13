import { Metadata } from 'next'
import { CompanySidebar } from '@/components/company/company-sidebar'
import { CompanyHeader } from '@/components/company/company-header'

export const metadata: Metadata = {
  title: 'لوحة تحكم الشركة | توصية',
  description: 'إدارة صفحة شركتك ومراجعاتها وإحصائياتها',
}

// منع الكاش في داشبورد الشركة
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CompanyHeader />
      <div className="flex">
        <CompanySidebar />
        <main className="flex-1 lg:mr-64 p-6">
          {/* إخفاء الفوتر عند تفعيل هذا الـ layout */}
          <style>{`
            footer {
              display: none !important;
            }
          `}</style>
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
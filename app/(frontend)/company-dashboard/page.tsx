import { Metadata } from 'next'
import { CompanyDashboard } from '@/components/company/company-dashboard-new'

export const metadata: Metadata = {
  title: 'الرئيسية | لوحة تحكم الشركة',
  description: 'نظرة عامة على إحصائيات شركتك ومراجعاتها',
}

export default function CompanyDashboardPage() {
  return <CompanyDashboard />
}

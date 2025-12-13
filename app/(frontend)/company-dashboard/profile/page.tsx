import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تحديث الملف الشخصي | لوحة تحكم الشركة',
  description: 'تحديث معلومات شركتك ومعلومات التواصل',
}

export default function CompanyProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">تحديث معلومات الشركة</h1>
      <p className="text-gray-600">هذه الصفحة قيد التطوير...</p>
    </div>
  )
}

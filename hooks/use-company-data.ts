import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface CompanySidebarData {
  id: string
  name: string
  rating: number
  reviewsCount: number
  category: {
    name: string
    slug: string
  }
  city: {
    name: string
    slug: string
  }
  pendingReviews: number
  totalReviews: number
  averageRating: number
}

export function useCompanyData() {
  const { data: session } = useSession()
  const [companyData, setCompanyData] = useState<CompanySidebarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCompanyData() {
      if (!session?.user?.id) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/company/dashboard-stats')
        if (!response.ok) {
          throw new Error('فشل في جلب بيانات الشركة')
        }
        
        const data = await response.json()
        setCompanyData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyData()
  }, [session?.user?.id])

  return { companyData, loading, error }
}

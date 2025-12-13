'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Star, Users, MapPin, TrendingUp, Award } from 'lucide-react'

interface SubAreaStatsProps {
  subArea: {
    id: string
    name: string
    _count: {
      companies: number
    }
    companies: Array<{
      rating: number
      reviewsCount: number
      isVerified: boolean
      isFeatured: boolean
    }>
  }
}

export function SubAreaStats({ subArea }: SubAreaStatsProps) {
  // حساب الإحصائيات
  const totalCompanies = subArea._count?.companies || 0
  const verifiedCompanies = subArea.companies?.filter(c => c.isVerified).length || 0
  const featuredCompanies = subArea.companies?.filter(c => c.isFeatured).length || 0
  const averageRating = subArea.companies?.length > 0 
    ? (subArea.companies.reduce((sum, c) => sum + c.rating, 0) / subArea.companies.length).toFixed(1)
    : 0
  const totalReviews = subArea.companies?.reduce((sum, c) => sum + c.reviewsCount, 0) || 0

  const stats = [
    {
      title: 'إجمالي الشركات',
      value: totalCompanies,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'الشركات الموثقة',
      value: verifiedCompanies,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'الشركات المميزة',
      value: featuredCompanies,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'متوسط التقييم',
      value: `${averageRating} ⭐`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'إجمالي المراجعات',
      value: totalReviews,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'نسبة التوثيق',
      value: totalCompanies > 0 ? `${Math.round((verifiedCompanies / totalCompanies) * 100)}%` : '0%',
      icon: MapPin,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ]

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            إحصائيات {subArea.name}
          </h2>
          <p className="text-lg text-gray-600">
            نظرة شاملة على الشركات والخدمات في المنطقة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
            <Building2 className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-600">
              آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

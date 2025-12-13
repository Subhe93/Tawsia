'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { Progress } from '@/components/ui/progress'
import { Star, Building2, MessageSquare } from 'lucide-react'

interface AdvancedStatsProps {
  categoryPerformance: Array<{
    id: string
    name: string
    companiesCount: number
    averageRating: number
    totalReviews: number
  }>
  countryPerformance: Array<{
    id: string
    name: string
    companiesCount: number
    averageRating: number
    totalReviews: number
  }>
}

export function AdvancedStats({ categoryPerformance, countryPerformance }: AdvancedStatsProps) {
  console.log("Rendering AdvancedStats");
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* أداء الفئات */}
      <Card>
        <CardHeader>
          <CardTitle>أداء الفئات</CardTitle>
          <CardDescription>تحليل أداء الفئات المختلفة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryPerformance.slice(0, 5).map((category, index) => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600">
                        {category.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <Building2 className="h-3 w-3" />
                    <span>{category.companiesCount} شركة</span>
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <MessageSquare className="h-3 w-3" />
                    <span>{category.totalReviews} مراجعة</span>
                  </div>
                  <div className="text-center">
                    {/* <Progress 
                      value={(category.averageRating / 5) * 100} 
                      className="h-1"
                    /> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* أداء البلدان */}
      <Card>
        <CardHeader>
          <CardTitle>أداء البلدان</CardTitle>
          <CardDescription>تحليل أداء البلدان المختلفة</CardDescription>.
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {countryPerformance.slice(0, 5).map((country, index) => (
              <div key={country.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-xs font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {country.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600">
                        {country.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <Building2 className="h-3 w-3" />
                    <span>{country.companiesCount} شركة</span>
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <MessageSquare className="h-3 w-3" />
                    <span>{country.totalReviews} مراجعة</span>
                  </div>
                  <div className="text-center">
                    {/* <Progress 
                      value={(country.averageRating / 5) * 100} 
                      className="h-1"
                    /> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

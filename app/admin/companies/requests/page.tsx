'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  User
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface CompanyRequest {
  id: string
  companyName: string
  description: string
  category: string
  country: string
  city: string
  phone: string
  email: string
  website?: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  status: string
  createdAt: string
}

export default function CompanyRequestsPage() {
  const [requests, setRequests] = useState<CompanyRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    // محاكاة البيانات
    const mockRequests: CompanyRequest[] = [
      {
        id: '1',
        companyName: 'شركة التقنيات المتطورة',
        description: 'شركة متخصصة في تطوير البرمجيات والحلول التقنية المبتكرة',
        category: 'technology',
        country: 'sy',
        city: 'damascus',
        phone: '+963-11-1234567',
        email: 'info@advanced-tech.com',
        website: 'https://advanced-tech.com',
        ownerName: 'أحمد محمد الأحمد',
        ownerEmail: 'ahmed@advanced-tech.com',
        ownerPhone: '+963-944-123456',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        companyName: 'مطعم الشام الأصيل',
        description: 'مطعم يقدم أشهى الأكلات الشامية التراثية بنكهة أصيلة',
        category: 'food',
        country: 'sy',
        city: 'aleppo',
        phone: '+963-21-7654321',
        email: 'info@alsham-restaurant.com',
        ownerName: 'فاطمة علي حسن',
        ownerEmail: 'fatima@alsham-restaurant.com',
        ownerPhone: '+963-955-987654',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      }
    ]

    setTimeout(() => {
      setRequests(mockRequests)
      setIsLoading(false)
    }, 1000)
  }, [session])

  const handleApprove = async (requestId: string) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: 'APPROVED' } : req
      )
    )
  }

  const handleReject = async (requestId: string) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: 'REJECTED' } : req
      )
    )
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          طلبات انضمام الشركات
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          مراجعة والموافقة على طلبات الشركات الجديدة
        </p>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-6">
          {requests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3 space-x-reverse">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <span>{request.companyName}</span>
                  </CardTitle>
                  <Badge 
                    variant={
                      request.status === 'PENDING' ? 'secondary' :
                      request.status === 'APPROVED' ? 'default' : 'destructive'
                    }
                  >
                    <Clock className="h-3 w-3 ml-1" />
                    {request.status === 'PENDING' ? 'معلق' :
                     request.status === 'APPROVED' ? 'موافق عليه' : 'مرفوض'}
                  </Badge>
                </div>
                <CardDescription>
                  تم الإرسال في {new Date(request.createdAt).toLocaleDateString( )}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* معلومات الشركة */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
                      <Building2 className="h-5 w-5" />
                      <span>معلومات الشركة</span>
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">الوصف:</p>
                        <p className="text-gray-600 dark:text-gray-400">{request.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">الفئة:</p>
                          <Badge variant="outline">{request.category}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">الموقع:</p>
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {request.city}, {request.country}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">{request.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">{request.email}</span>
                        </div>
                        {request.website && (
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <a 
                              href={request.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {request.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* معلومات المسؤول */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
                      <User className="h-5 w-5" />
                      <span>معلومات المسؤول</span>
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">الاسم:</p>
                        <p className="text-gray-600 dark:text-gray-400">{request.ownerName}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">{request.ownerEmail}</span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">{request.ownerPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                {request.status === 'PENDING' && (
                  <div className="flex items-center justify-end space-x-3 space-x-reverse mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => handleReject(request.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4 ml-2" />
                      رفض الطلب
                    </Button>
                    <Button
                      onClick={() => handleApprove(request.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 ml-2" />
                      الموافقة على الطلب
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لا توجد طلبات
            </h3>
            <p className="text-gray-500">
              لا توجد طلبات انضمام شركات جديدة في الوقت الحالي
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


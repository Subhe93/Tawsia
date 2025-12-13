import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // منع الكاش في داشبوردات الأدمن والشركات
  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/company-dashboard')) {
    
    // إضافة headers لمنع الكاش
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    
    // منع الكاش في المتصفح
    response.headers.set('X-Accel-Expires', '0')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive')
    
    // إضافة timestamp لضمان التحديث
    response.headers.set('X-Timestamp', new Date().getTime().toString())
  }
  
  // منع الكاش لـ API routes الخاصة بالداشبوردات
  if (request.nextUrl.pathname.startsWith('/api/admin') ||
      request.nextUrl.pathname.startsWith('/api/company')) {
    
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  return response
}

export const config = {
  matcher: [
    // تطبيق على جميع المسارات ما عدا الملفات الثابتة
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
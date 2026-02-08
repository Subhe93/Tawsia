import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { explicitRedirects, slugReplacements } from '@/lib/redirects-data.generated'

// خريطة استبدال الكلمات في المسار (تحميل مرة واحدة)
const slugMap = new Map(slugReplacements.map((r) => [r.from, r.to]))

function applySlugReplacements(pathname: string): string {
  return pathname
    .split('/')
    .map((segment) =>
      segment
        .split('-')
        .map((token) => slugMap.get(token) ?? token)
        .join('-')
    )
    .join('/')
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const search = request.nextUrl.search

  // 1) أولوية: توجيه صريح من 800.csv
  const explicitDest = explicitRedirects.get(pathname)
  if (explicitDest != null) {
    const url = new URL(explicitDest, request.url)
    url.search = search
    return NextResponse.redirect(url, 301)
  }

  // 2) استبدال كلمات من old-changed-slug.csv (إلا إذا الهدف مصدر في 800 → نتجاهل لتفادي حلقة)
  const transformedPath = applySlugReplacements(pathname)
  if (transformedPath !== pathname && !explicitRedirects.has(transformedPath)) {
    const url = new URL(transformedPath, request.url)
    url.search = search
    return NextResponse.redirect(url, 301)
  }

  const response = NextResponse.next()

  // منع الكاش في داشبوردات الأدمن والشركات
  if (pathname.startsWith('/admin') || pathname.startsWith('/company-dashboard')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    response.headers.set('X-Accel-Expires', '0')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive')
    response.headers.set('X-Timestamp', new Date().getTime().toString())
  }

  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/company')) {
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
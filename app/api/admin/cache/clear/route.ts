import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      )
    }

    const { paths, tags, type } = await request.json()

    let clearedItems: string[] = []

    // تفريغ مسارات محددة
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        try {
          revalidatePath(path)
          clearedItems.push(`Path: ${path}`)
        } catch (error) {
          console.error(`فشل في تفريغ المسار ${path}:`, error)
        }
      }
    }

    // تفريغ علامات محددة
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        try {
          revalidateTag(tag)
          clearedItems.push(`Tag: ${tag}`)
        } catch (error) {
          console.error(`فشل في تفريغ العلامة ${tag}:`, error)
        }
      }
    }

    // تفريغ شامل حسب النوع
    if (type === 'admin') {
      const adminPaths = [
        '/admin',
        '/admin/companies',
        '/admin/categories',
        '/admin/countries',
        '/admin/users',
        '/admin/reviews',
        '/admin/settings'
      ]
      
      for (const path of adminPaths) {
        try {
          revalidatePath(path, 'layout')
          revalidatePath(path, 'page')
          clearedItems.push(`Admin Path: ${path}`)
        } catch (error) {
          console.error(`فشل في تفريغ مسار الأدمن ${path}:`, error)
        }
      }

      // تفريغ علامات الأدمن
      const adminTags = ['admin-stats', 'companies', 'users', 'reviews']
      for (const tag of adminTags) {
        try {
          revalidateTag(tag)
          clearedItems.push(`Admin Tag: ${tag}`)
        } catch (error) {
          console.error(`فشل في تفريغ علامة الأدمن ${tag}:`, error)
        }
      }
    }

    if (type === 'company') {
      const companyPaths = [
        '/company-dashboard',
        '/company-dashboard/profile',
        '/company-dashboard/reviews',
        '/company-dashboard/analytics',
        '/company-dashboard/settings'
      ]
      
      for (const path of companyPaths) {
        try {
          revalidatePath(path, 'layout')
          revalidatePath(path, 'page')
          clearedItems.push(`Company Path: ${path}`)
        } catch (error) {
          console.error(`فشل في تفريغ مسار الشركة ${path}:`, error)
        }
      }

      // تفريغ علامات الشركات
      const companyTags = ['company-stats', 'company-reviews', 'company-profile']
      for (const tag of companyTags) {
        try {
          revalidateTag(tag)
          clearedItems.push(`Company Tag: ${tag}`)
        } catch (error) {
          console.error(`فشل في تفريغ علامة الشركة ${tag}:`, error)
        }
      }
    }

    if (type === 'all') {
      // تفريغ كامل للموقع
      try {
        revalidatePath('/', 'layout')
        clearedItems.push('Full site revalidation')
      } catch (error) {
        console.error('فشل في التفريغ الكامل:', error)
      }
    }

    console.log('تم تفريغ الكاش:', clearedItems)

    return NextResponse.json({
      success: true,
      message: 'تم تفريغ الكاش بنجاح',
      clearedItems,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('خطأ في تفريغ الكاش:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تفريغ الكاش' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      )
    }

    // معلومات حول الكاش
    return NextResponse.json({
      success: true,
      availableActions: {
        admin: 'تفريغ كاش داشبورد الأدمن',
        company: 'تفريغ كاش داشبورد الشركات',
        all: 'تفريغ كاش الموقع بالكامل',
        custom: 'تفريغ مسارات وعلامات محددة'
      },
      examples: {
        admin: { type: 'admin' },
        company: { type: 'company' },
        all: { type: 'all' },
        custom: {
          paths: ['/admin/companies', '/company-dashboard'],
          tags: ['companies', 'reviews']
        }
      }
    })

  } catch (error) {
    console.error('خطأ في جلب معلومات الكاش:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب معلومات الكاش' },
      { status: 500 }
    )
  }
}

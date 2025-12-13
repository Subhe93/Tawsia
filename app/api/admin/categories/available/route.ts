import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CategoryMappingService } from '@/lib/services/category-mapping-service-simple'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      )
    }

    const categoryMapper = new CategoryMappingService()
    const stats = await categoryMapper.getMatchingStats()

    return NextResponse.json({
      success: true,
      ...stats,
      message: `يمكنك استخدام أي من هذه الأسماء في عمود الفئة في ملف CSV`
    })

  } catch (error) {
    console.error('خطأ في جلب الفئات المتاحة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الفئات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      )
    }

    const { searchTerm } = await request.json()
    
    if (!searchTerm) {
      return NextResponse.json(
        { error: 'يجب توفير مصطلح البحث' },
        { status: 400 }
      )
    }

    const categoryMapper = new CategoryMappingService()
    const results = await categoryMapper.searchCategories(searchTerm)

    return NextResponse.json({
      success: true,
      searchTerm,
      results,
      count: results.length,
      message: results.length > 0 
        ? `تم العثور على ${results.length} فئة مطابقة` 
        : 'لم يتم العثور على فئات مطابقة'
    })

  } catch (error) {
    console.error('خطأ في البحث في الفئات:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في البحث' },
      { status: 500 }
    )
  }
}

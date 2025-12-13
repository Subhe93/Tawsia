import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { LocationMappingService } from '@/lib/services/location-mapping-service-simple'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      )
    }

    const locationMapper = new LocationMappingService()
    const countries = await locationMapper.getAllCountries()

    return NextResponse.json({
      success: true,
      countries,
      count: countries.length,
      message: `يمكنك استخدام أي من هذه الأسماء في عمود "الدولة" في ملف CSV`
    })

  } catch (error) {
    console.error('خطأ في جلب الدول:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الدول' },
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

    const locationMapper = new LocationMappingService()
    const results = await locationMapper.searchCountries(searchTerm)

    return NextResponse.json({
      success: true,
      searchTerm,
      results,
      count: results.length,
      message: results.length > 0 
        ? `تم العثور على ${results.length} دولة مطابقة` 
        : 'لم يتم العثور على دول مطابقة'
    })

  } catch (error) {
    console.error('خطأ في البحث في الدول:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في البحث' },
      { status: 500 }
    )
  }
}

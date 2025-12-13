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

    const { searchParams } = new URL(request.url)
    const countryId = searchParams.get('countryId')

    const locationMapper = new LocationMappingService()
    const cities = await locationMapper.getAllCities()

    // تصفية المدن حسب الدولة إذا تم توفير countryId
    const filteredCities = countryId 
      ? cities.filter(city => city.countryId === countryId)
      : cities

    return NextResponse.json({
      success: true,
      cities: filteredCities,
      count: filteredCities.length,
      message: `يمكنك استخدام أي من هذه الأسماء في عمود "المدينة" في ملف CSV`
    })

  } catch (error) {
    console.error('خطأ في جلب المدن:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المدن' },
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

    const { searchTerm, countryId } = await request.json()
    
    if (!searchTerm) {
      return NextResponse.json(
        { error: 'يجب توفير مصطلح البحث' },
        { status: 400 }
      )
    }

    const locationMapper = new LocationMappingService()
    const results = await locationMapper.searchCities(searchTerm, countryId)

    return NextResponse.json({
      success: true,
      searchTerm,
      countryId,
      results,
      count: results.length,
      message: results.length > 0 
        ? `تم العثور على ${results.length} مدينة مطابقة` 
        : 'لم يتم العثور على مدن مطابقة'
    })

  } catch (error) {
    console.error('خطأ في البحث في المدن:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في البحث' },
      { status: 500 }
    )
  }
}

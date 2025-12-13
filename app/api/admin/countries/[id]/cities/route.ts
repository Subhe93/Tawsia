import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const countryId = params.id
    
    if (!countryId) {
      return NextResponse.json({ error: 'معرف البلد مطلوب' }, { status: 400 })
    }

    // التحقق من وجود البلد وأنه نشط
    const country = await prisma.country.findUnique({
      where: { 
        id: countryId,
        isActive: true  // التأكد من أن البلد نشط
      }
    })

    if (!country) {
      return NextResponse.json({ error: 'البلد غير موجود أو غير نشط' }, { status: 404 })
    }

    // جلب المدن التابعة لهذا البلد
    const cities = await prisma.city.findMany({
      where: { 
        countryId,
        isActive: true  // فقط المدن النشطة
      },
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(cities)

  } catch (error) {
    console.error('خطأ في جلب مدن البلد:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
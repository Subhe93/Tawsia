import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { exportCompaniesData, createBackup } from '@/lib/database/admin-queries'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') as 'csv' | 'json' || 'csv'
    const type = searchParams.get('type') || 'companies'

    if (type === 'backup') {
      const backup = await createBackup()
      
      return new NextResponse(JSON.stringify(backup, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename=backup-${new Date().toISOString().split('T')[0]}.json`
        }
      })
    }

    const data = await exportCompaniesData(format)
    
    if (format === 'csv') {
      return new NextResponse(data, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename=companies-${new Date().toISOString().split('T')[0]}.csv`
        }
      })
    }

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename=companies-${new Date().toISOString().split('T')[0]}.json`
      }
    })

  } catch (error) {
    console.error('خطأ في تصدير البيانات:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

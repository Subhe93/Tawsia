import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم رفع أي ملف' },
        { status: 400 }
      )
    }

    // التحقق من نوع الملف
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'يجب أن يكون الملف من نوع CSV' },
        { status: 400 }
      )
    }

    // قراءة محتوى الملف
    const fileContent = await file.text()
    
    // تحليل CSV بسيط (بدون مكتبة خارجية مؤقتاً)
    const lines = fileContent.split('\n')
    const headers = lines[0]?.split(',').map(h => h.replace(/"/g, '').trim())
    
    if (!headers || headers.length === 0) {
      return NextResponse.json(
        { error: 'ملف فارغ أو تنسيق غير صحيح' },
        { status: 400 }
      )
    }

    // التحقق من وجود الأعمدة المطلوبة
    const requiredColumns = ['Nom', 'Catégorie', 'Adresse']
    const missingColumns = requiredColumns.filter(col => !headers.includes(col))
    
    if (missingColumns.length > 0) {
      return NextResponse.json(
        { 
          error: 'أعمدة مفقودة في الملف',
          missingColumns,
          availableColumns: headers
        },
        { status: 400 }
      )
    }

    // تحليل بسيط للبيانات
    const dataRows = lines.slice(1).filter(line => line.trim())
    const parsedData = dataRows.slice(0, 10).map((line, index) => {
      const values = line.split(',').map(v => v.replace(/"/g, '').trim())
      const row: any = {}
      headers.forEach((header, i) => {
        row[header] = values[i] || ''
      })
      return row
    })

    // إحصائيات أولية
    const stats = {
      totalRows: dataRows.length,
      validRows: parsedData.filter(row => row.Nom && row.Nom.trim()).length,
      rowsWithImages: parsedData.filter(row => row.Images && row.Images.trim()).length,
      rowsWithReviews: parsedData.filter(row => row.Reviews && row.Reviews.trim()).length
    }

    return NextResponse.json({
      success: true,
      totalRows: stats.totalRows,
      stats,
      preview: parsedData,
      columns: headers
    })

  } catch (error) {
    console.error('خطأ في رفع الملف:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في معالجة الملف' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 })
    }

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'نوع الملف غير مدعوم. يُسمح فقط بـ JPEG, PNG, WebP' 
      }, { status: 400 })
    }

    // التحقق من حجم الملف (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'حجم الملف كبير جداً. الحد الأقصى 5MB' 
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // إنشاء اسم ملف فريد
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `review-${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`

    // مسار حفظ الملف - مجلد خاص بصور التقييمات
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'reviews')
    const filePath = join(uploadDir, filename)

    // التأكد من وجود مجلد uploads/reviews
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // المجلد موجود بالفعل
    }

    await writeFile(filePath, buffer)

    // رابط الملف المرفوع
    const fileUrl = `/uploads/reviews/${filename}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('خطأ في رفع الملف:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في رفع الملف' },
      { status: 500 }
    )
  }
}


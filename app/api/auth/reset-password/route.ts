import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { sendEmailAndLog } from '@/lib/email'

const resetPasswordSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صحيح')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = resetPasswordSchema.parse(body)

    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'لم يتم العثور على حساب بهذا البريد الإلكتروني' 
      }, { status: 404 })
    }

    // إنشاء كلمة مرور مؤقتة جديدة
    const tempPassword = Math.random().toString(36).slice(-8)
    
    // تحديث المستخدم
    await prisma.user.update({
      where: { id: user.id },
      data: { tempPassword }
    })

    // إرسال كلمة المرور المؤقتة بالبريد وتسجيل السجل
    const html = `
      <div style="font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right">
        <h2>إعادة تعيين كلمة المرور</h2>
        <p>مرحباً ${user.name || ''},</p>
        <p>هذه هي كلمة المرور المؤقتة الخاصة بك:</p>
        <p style="font-size:18px;font-weight:bold;background:#f5f5f5;padding:10px;border-radius:6px;text-align:center">${tempPassword}</p>
        <p>استخدمها لتسجيل الدخول وسيُطلب منك تغييرها بعد الدخول.</p>
        <p style="color:#888">إن لم تطلب ذلك فتجاهل هذه الرسالة.</p>
      </div>
    `

    try {
      await sendEmailAndLog({
        to: user.email,
        subject: 'إعادة تعيين كلمة المرور - توصية',
        html,
        template: 'reset-password',
        payload: { userId: user.id }
      })
    } catch (e) {
      // لا نفشل الطلب الأساسي حتى لا نكشف التفاصيل للمهاجم؛ نعيد نجاحاً عاماً
    }

    return NextResponse.json({
      success: true,
      message: 'تم إرسال كلمة المرور المؤقتة إلى بريدك الإلكتروني',
      // في البيئة التطويرية، نرسل كلمة المرور في الاستجابة
      ...(process.env.NODE_ENV === 'development' && { tempPassword })
    })

  } catch (error) {
    console.error('خطأ في إعادة تعيين كلمة المرور:', error)
    
    if (error instanceof z.ZodError) {
      const formatted = error.issues ?? []
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: formatted },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

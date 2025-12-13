import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const userId = params.id
    const body = await request.json()
    const { newPassword } = body
    
    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 })
    }

    if (!newPassword) {
      return NextResponse.json({ error: 'كلمة المرور الجديدة مطلوبة' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون على الأقل 6 أحرف' }, { status: 400 })
    }

    // التحقق من وجود المستخدم
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true 
      }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // التحقق من الصلاحيات - لا يمكن تغيير كلمة مرور نفس المستخدم
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'لا يمكنك تغيير كلمة مرورك الخاصة من هنا' }, { status: 403 })
    }

    // التحقق من صلاحيات تعديل المستخدمين ذوي الصلاحيات العالية
    if (session.user.role === 'ADMIN' && (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'ADMIN')) {
      return NextResponse.json({ error: 'لا يمكنك تغيير كلمة مرور مستخدم بنفس صلاحياتك أو أعلى' }, { status: 403 })
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // تحديث كلمة المرور في قاعدة البيانات
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        // إضافة timestamp لتتبع آخر تغيير لكلمة المرور
        updatedAt: new Date()
      }
    })

    // تسجيل العملية في console للمراجعة
    console.log(`تم تغيير كلمة المرور للمستخدم ${targetUser.name} (${targetUser.email}) بواسطة ${session.user.name || session.user.email}`)

    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح',
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email
      }
    })

  } catch (error: any) {
    console.error('خطأ في تغيير كلمة المرور:', error)
    
    // التحقق من أخطاء قاعدة البيانات المحددة
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم أثناء تغيير كلمة المرور' },
      { status: 500 }
    )
  }
}

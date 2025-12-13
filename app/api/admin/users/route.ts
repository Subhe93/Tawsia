import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUsersForAdmin } from '@/lib/database/admin-queries'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || undefined
    const role = searchParams.get('role') || undefined
    const status = searchParams.get('status') as 'active' | 'inactive' | 'all' | undefined
    const isVerified = searchParams.get('isVerified') as 'true' | 'false' | 'all' | undefined
    const hasCompanies = searchParams.get('hasCompanies') as 'true' | 'false' | 'all' | undefined
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc'

    const result = await getUsersForAdmin({
      page,
      limit,
      search,
      role,
      status,
      isVerified,
      hasCompanies,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder
    })

    return NextResponse.json({
      users: result.data,
      pagination: result.pagination
    })

  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, role, isActive, isVerified } = body

    // التحقق من صحة البيانات
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'جميع الحقول المطلوبة يجب ملؤها' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون على الأقل 6 أحرف' }, { status: 400 })
    }

    // التحقق من أن البريد الإلكتروني غير موجود مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'البريد الإلكتروني موجود مسبقاً' }, { status: 400 })
    }

    // التحقق من صلاحيات إنشاء الأدوار
    if (session.user.role === 'ADMIN') {
      // المدير العادي لا يستطيع إنشاء مديرين أو مديرين عامين
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'لا تملك صلاحية إنشاء هذا النوع من المستخدمين' }, { status: 403 })
      }
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 12)

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'USER',
        isActive: isActive !== undefined ? isActive : true,
        isVerified: isVerified !== undefined ? isVerified : false
      },
      include: {
        ownedCompanies: {
          include: {
            company: {
              select: {
                name: true,
                slug: true,
                isActive: true,
                isVerified: true,
                rating: true
              }
            }
          }
        },
        _count: {
          select: {
            reviews: {
              where: { isApproved: true }
            },
            ownedCompanies: true
          }
        }
      }
    })

    // إزالة كلمة المرور من الاستجابة
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'تم إنشاء المستخدم بنجاح',
      user: userWithoutPassword
    }, { status: 201 })

  } catch (error: any) {
    console.error('خطأ في إنشاء المستخدم:', error)
    
    // التحقق من أخطاء قاعدة البيانات المحددة
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'البريد الإلكتروني موجود مسبقاً' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
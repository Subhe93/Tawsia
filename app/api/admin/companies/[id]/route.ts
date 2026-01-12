import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  updateCompanyStatus,
  deleteCompany,
  getCompanyForAdmin,
  updateCompany,
} from "@/lib/database/admin-queries";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")
    ) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const companyId = params.id;

    if (!companyId) {
      return NextResponse.json({ error: "معرف الشركة مطلوب" }, { status: 400 });
    }

    const company = await getCompanyForAdmin(companyId);

    if (!company) {
      return NextResponse.json({ error: "الشركة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error("خطأ في جلب تفاصيل الشركة:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")
    ) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const companyId = params.id;
    const data = await request.json();

    console.log("تحديث الشركة - معرف:", companyId);
    console.log("بيانات التحديث المستلمة:", data);

    if (!companyId) {
      return NextResponse.json({ error: "معرف الشركة مطلوب" }, { status: 400 });
    }

    // التحقق من وجود الشركة
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!existingCompany) {
      return NextResponse.json({ error: "الشركة غير موجودة" }, { status: 404 });
    }

    // التحقق من البيانات الأساسية
    if (data.name && !data.name.trim()) {
      return NextResponse.json({ error: "اسم الشركة مطلوب" }, { status: 400 });
    }

    if (data.slug && !data.slug.trim()) {
      return NextResponse.json(
        { error: "رابط الشركة (slug) مطلوب" },
        { status: 400 }
      );
    }

    // التحقق من صحة السلوغ (أحرف إنجليزية وأرقام وشرطات فقط)
    if (data.slug && !/^[a-z0-9\-]+$/.test(data.slug)) {
      return NextResponse.json(
        {
          error: "رابط الشركة يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط",
        },
        { status: 400 }
      );
    }

    if (data.categoryId && !data.categoryId.trim()) {
      return NextResponse.json({ error: "فئة الشركة مطلوبة" }, { status: 400 });
    }

    if (data.countryId && !data.countryId.trim()) {
      return NextResponse.json({ error: "بلد الشركة مطلوب" }, { status: 400 });
    }

    if (data.cityId && !data.cityId.trim()) {
      return NextResponse.json(
        { error: "مدينة الشركة مطلوبة" },
        { status: 400 }
      );
    }

    // إذا كان التحديث خاص بالحالة فقط
    if (
      Object.keys(data).length === 1 &&
      (data.hasOwnProperty("isVerified") ||
        data.hasOwnProperty("isFeatured") ||
        data.hasOwnProperty("isActive"))
    ) {
      console.log("تحديث حالة الشركة فقط");
      await updateCompanyStatus(companyId, data);
      const company = await getCompanyForAdmin(companyId);
      return NextResponse.json(company);
    }

    // تحديث كامل للشركة
    console.log("تحديث كامل للشركة");
    const company = await updateCompany(companyId, data);
    console.log("تم تحديث الشركة بنجاح:", company.id);

    return NextResponse.json(company);
  } catch (error) {
    console.error("خطأ في تحديث الشركة:", error);

    // معالجة أخطاء Prisma المحددة
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint failed")) {
        if (error.message.includes("slug")) {
          return NextResponse.json(
            { error: "هذا الرابط (slug) مستخدم بالفعل من قبل شركة أخرى" },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: "اسم الشركة أو الرابط موجود مسبقاً" },
          { status: 409 }
        );
      }

      if (error.message.includes("Foreign key constraint failed")) {
        return NextResponse.json(
          { error: "البيانات المرجعية غير صحيحة (البلد، المدينة، أو الفئة)" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `خطأ في قاعدة البيانات: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "حدث خطأ غير متوقع في الخادم" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")
    ) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const companyId = params.id;

    if (!companyId) {
      return NextResponse.json({ error: "معرف الشركة مطلوب" }, { status: 400 });
    }

    await deleteCompany(companyId);

    return NextResponse.json({
      message: "تم حذف الشركة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في حذف الشركة:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

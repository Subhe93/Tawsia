import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - جلب وسائل التواصل الاجتماعي
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    // العثور على الشركة
    const companyOwner = await prisma.companyOwner.findFirst({
      where: { userId: session.user.id },
      select: { companyId: true },
    });

    if (!companyOwner) {
      return NextResponse.json(
        { error: "لم يتم العثور على شركة مرتبطة بحسابك" },
        { status: 404 }
      );
    }

    // جلب وسائل التواصل
    const socialMedia = await prisma.socialMedia.findMany({
      where: { companyId: companyOwner.companyId },
      orderBy: { platform: "asc" },
    });

    return NextResponse.json({
      socialMedia,
    });
  } catch (error) {
    console.error("خطأ في جلب وسائل التواصل:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

// POST - إضافة وسيلة تواصل جديدة
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { platform, url, isActive = true } = body;

    if (!platform || !url) {
      return NextResponse.json(
        { error: "المنصة والرابط مطلوبان" },
        { status: 400 }
      );
    }

    // العثور على الشركة
    const companyOwner = await prisma.companyOwner.findFirst({
      where: { userId: session.user.id },
      select: { companyId: true },
    });

    if (!companyOwner) {
      return NextResponse.json(
        { error: "لم يتم العثور على شركة مرتبطة بحسابك" },
        { status: 404 }
      );
    }

    // التحقق من عدم وجود المنصة مسبقاً
    const existingSocialMedia = await prisma.socialMedia.findFirst({
      where: {
        companyId: companyOwner.companyId,
        platform: platform.toLowerCase(),
      },
    });

    if (existingSocialMedia) {
      return NextResponse.json(
        { error: "هذه المنصة موجودة مسبقاً" },
        { status: 400 }
      );
    }

    // إضافة وسيلة التواصل
    const newSocialMedia = await prisma.socialMedia.create({
      data: {
        companyId: companyOwner.companyId,
        platform: platform.toLowerCase(),
        url,
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إضافة وسيلة التواصل بنجاح",
      socialMedia: newSocialMedia,
    });
  } catch (error) {
    console.error("خطأ في إضافة وسيلة التواصل:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إضافة وسيلة التواصل" },
      { status: 500 }
    );
  }
}

// PUT - تحديث وسائل التواصل
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const socialMediaList = body;

    if (!Array.isArray(socialMediaList)) {
      return NextResponse.json(
        { error: "بيانات وسائل التواصل غير صحيحة" },
        { status: 400 }
      );
    }

    // العثور على الشركة
    const companyOwner = await prisma.companyOwner.findFirst({
      where: { userId: session.user.id },
      select: { companyId: true },
    });

    if (!companyOwner) {
      return NextResponse.json(
        { error: "لم يتم العثور على شركة مرتبطة بحسابك" },
        { status: 404 }
      );
    }

    // تحديث وسائل التواصل
    const updatePromises = socialMediaList.map(async (social: any) => {
      if (social.id) {
        // تحديث موجود
        return prisma.socialMedia.update({
          where: { id: social.id },
          data: {
            url: social.url,
            isActive: social.isActive,
          },
        });
      } else {
        // إضافة جديد
        return prisma.socialMedia.upsert({
          where: {
            companyId_platform: {
              companyId: companyOwner.companyId,
              platform: social.platform.toLowerCase(),
            },
          },
          update: {
            url: social.url,
            isActive: social.isActive,
          },
          create: {
            companyId: companyOwner.companyId,
            platform: social.platform.toLowerCase(),
            url: social.url,
            isActive: social.isActive,
          },
        });
      }
    });

    await Promise.all(updatePromises);

    // جلب البيانات المحدثة
    const updatedSocialMedia = await prisma.socialMedia.findMany({
      where: { companyId: companyOwner.companyId },
      orderBy: { platform: "asc" },
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث وسائل التواصل بنجاح",
      socialMedia: updatedSocialMedia,
    });
  } catch (error) {
    console.error("خطأ في تحديث وسائل التواصل:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تحديث وسائل التواصل" },
      { status: 500 }
    );
  }
}

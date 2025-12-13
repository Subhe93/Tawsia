import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteSeoOverride } from "@/lib/database/seo-queries";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 401 });
  }

  try {
    const { id } = params;
    const decodedId = decodeURIComponent(id);

    console.log("محاولة حذف SEO override:", decodedId);

    const success = await deleteSeoOverride(decodedId);

    if (!success) {
      return NextResponse.json(
        { error: "فشل في حذف التخصيص أو التخصيص غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("خطأ في حذف SEO override:", error);
    return NextResponse.json(
      {
        error: "حدث خطأ أثناء الحذف: " + (error as Error).message,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listSeoOverrides } from "@/lib/database/seo-queries";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const search = searchParams.get("search") || undefined;
  const targetType = (searchParams.get("targetType") as any) || undefined;

  try {
    const result = await listSeoOverrides({ page, limit, search, targetType });
    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Failed to list SEO overrides:", error);
    return NextResponse.json(
      { success: false, error: { message: "فشل في جلب البيانات" } },
      { status: 500 }
    );
  }
}

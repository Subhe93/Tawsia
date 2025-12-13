import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const includeInactive = searchParams.get("includeInactive") === "true";
    const roles = searchParams.get("roles")?.split(",").filter(Boolean) || [];
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const fields = searchParams.get("fields")?.split(",") || [
      "basicInfo",
      "contactInfo",
      "roleInfo",
      "dateInfo",
      "statsInfo",
    ];

    // بناء شروط الاستعلام
    const where: any = {
      ...(includeInactive ? {} : { isActive: true }),
      ...(roles.length > 0 && { role: { in: roles } }),
      ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
      ...(dateTo && {
        createdAt: {
          ...((dateFrom && { gte: new Date(dateFrom) }) || {}),
          lte: new Date(dateTo),
        },
      }),
    };

    // جلب المستخدمين حسب الشروط
    const users = await prisma.user.findMany({
      where,
      include: {
        ownedCompanies: {
          include: {
            company: {
              select: {
                name: true,
                slug: true,
                isActive: true,
                isVerified: true,
                rating: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: {
              where: { isApproved: true },
            },
            ownedCompanies: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (format === "json") {
      // إزالة كلمات المرور من الاستجابة
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);

      return NextResponse.json({
        users: usersWithoutPasswords,
        exportedAt: new Date().toISOString(),
        totalCount: users.length,
      });
    }

    // بناء الحقول بناءً على الاختيار
    const csvHeaders = [];
    const getRowData = (user: any) => {
      const rowData = [];

      if (fields.includes("basicInfo")) {
        csvHeaders.push("المعرف", "الاسم");
        rowData.push(`"${user.id}"`, `"${user.name}"`);
      }

      if (fields.includes("contactInfo")) {
        csvHeaders.push("البريد الإلكتروني");
        rowData.push(`"${user.email}"`);
      }

      if (fields.includes("roleInfo")) {
        csvHeaders.push("الدور", "الحالة", "موثق");
        rowData.push(
          `"${getRoleText(user.role)}"`,
          `"${user.isActive ? "نشط" : "غير نشط"}"`,
          `"${user.isVerified ? "موثق" : "غير موثق"}"`
        );
      }

      if (fields.includes("statsInfo")) {
        csvHeaders.push("عدد الشركات", "عدد المراجعات");
        rowData.push(user._count.ownedCompanies, user._count.reviews);
      }

      if (fields.includes("dateInfo")) {
        csvHeaders.push("آخر دخول", "تاريخ التسجيل");
        rowData.push(
          `"${
            user.lastLoginAt
              ? new Date(user.lastLoginAt).toLocaleDateString()
              : "لم يسجل دخول"
          }"`,
          `"${new Date(user.createdAt).toLocaleDateString()}"`
        );
      }

      return rowData;
    };

    // تجهيز العناوين من أول مستخدم
    if (users.length > 0) {
      getRowData(users[0]); // هذا سيملأ csvHeaders
    }

    const csvRows = users.map((user) => getRowData(user).join(","));

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");

    // إضافة BOM للدعم العربي في Excel
    const bom = "\uFEFF";
    const finalContent = bom + csvContent;

    return new Response(finalContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="users-export-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("خطأ في تصدير المستخدمين:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تصدير البيانات" },
      { status: 500 }
    );
  }
}

function getRoleText(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "مدير عام";
    case "ADMIN":
      return "مدير";
    case "COMPANY_OWNER":
      return "مالك شركة";
    default:
      return "مستخدم";
  }
}

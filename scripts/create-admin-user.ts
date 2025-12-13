import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // البحث عن مستخدم إداري موجود
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [{ role: "ADMIN" }, { role: "SUPER_ADMIN" }],
      },
    });

    if (existingAdmin) {
      console.log("✅ يوجد مستخدم إداري بالفعل:", existingAdmin.email);
      return;
    }

    // إنشاء مستخدم إداري جديد
    const hashedPassword = await hash("admin123", 10);

    const admin = await prisma.user.create({
      data: {
        email: "admin@tawsia.com",
        name: "مدير النظام",
        password: hashedPassword,
        role: "SUPER_ADMIN",
        isActive: true,
        isVerified: true,
      },
    });

    console.log("✅ تم إنشاء مستخدم إداري جديد:");
    console.log("البريد الإلكتروني: admin@tawsia.com");
    console.log("كلمة المرور: admin123");
    console.log("الدور: SUPER_ADMIN");
  } catch (error) {
    console.error("❌ خطأ في إنشاء المستخدم الإداري:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

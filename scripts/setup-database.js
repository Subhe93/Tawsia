#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 إعداد قاعدة البيانات...\n");

// التحقق من وجود ملف .env
const envPath = path.join(process.cwd(), ".env");
if (!fs.existsSync(envPath)) {
  console.log("📝 إنشاء ملف .env...");
  const envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/twsia_db?schema=public"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# App Settings
APP_NAME="توصية"
APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@twsia.com"
`;

  fs.writeFileSync(envPath, envContent);
  console.log("✅ تم إنشاء ملف .env");
  console.log("⚠️  يرجى تحديث DATABASE_URL في ملف .env\n");
}

try {
  // تشغيل Prisma generate
  console.log("🔧 إنشاء Prisma Client...");
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("✅ تم إنشاء Prisma Client بنجاح\n");

  // تشغيل Migration (إذا كانت قاعدة البيانات متاحة)
  console.log("📊 محاولة تطبيق المخطط على قاعدة البيانات...");
  try {
    execSync("npx prisma db push", { stdio: "inherit" });
    console.log("✅ تم تطبيق المخطط بنجاح\n");

    // تشغيل Seed
    console.log("🌱 ملء قاعدة البيانات بالبيانات التجريبية...");
    execSync("npx prisma db seed", { stdio: "inherit" });
    console.log("✅ تم ملء قاعدة البيانات بنجاح\n");
  } catch (error) {
    console.log("⚠️  لم يتم العثور على قاعدة بيانات متاحة");
    console.log("   يرجى إعداد PostgreSQL وتحديث DATABASE_URL في ملف .env");
    console.log("   ثم تشغيل: npx prisma db push && npx prisma db seed\n");
  }

  console.log("🎉 تم إعداد قاعدة البيانات بنجاح!");
  console.log("\n📋 الخطوات التالية:");
  console.log("   1. تحديث DATABASE_URL في ملف .env");
  console.log("   2. تشغيل: npm run dev");
  console.log("   3. زيارة: http://localhost:3000");
  console.log("   4. لوحة تحكم المدير: http://localhost:3000/admin");
  console.log(
    "   5. لوحة تحكم الشركة: http://localhost:3000/company-dashboard"
  );
} catch (error) {
  console.error("❌ خطأ في إعداد قاعدة البيانات:", error.message);
  process.exit(1);
}

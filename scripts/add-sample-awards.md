// إضافة جوائز تجريبية للشركات
// يمكن تشغيل هذا الكود في Prisma Studio أو في script منفصل

// مثال على إضافة جائزة لشركة
/_
await prisma.award.create({
data: {
companyId: "company_id_here", // استبدل بمعرف الشركة الفعلي
title: "جائزة التميز في الخدمة",
description: "تم منح هذه الجائزة تقديراً للخدمة المتميزة والجودة العالية",
year: 2024,
awardType: "GOLD",
issuer: "منصة توصية",
isActive: true
}
});
_/

// مثال على إضافة جائزة أخرى
/_
await prisma.award.create({
data: {
companyId: "company_id_here", // استبدل بمعرف الشركة الفعلي
title: "شهادة الجودة",
description: "شهادة معتمدة للجودة العالية في الخدمات المقدمة",
year: 2023,
awardType: "CERTIFICATE",
issuer: "منصة توصية",
isActive: true
}
});
_/

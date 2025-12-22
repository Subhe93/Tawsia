# 🔧 إصلاح API المعاينة

**تاريخ الإصلاح:** 21 ديسمبر 2025  
**المشكلة:** `{success: false, error: "فشل في معاينة الشركات"}`

---

## 🐛 **المشاكل التي تم إصلاحها:**

### 1️⃣ **مشكلة Prisma Query**
**المشكلة:**
```typescript
sitemapEntry: { is: null }  // ❌ غير صحيح في Prisma
```

**الحل:**
```typescript
// جلب IDs الشركات الموجودة أولاً
const existingCompanyIds = await prisma.sitemapEntry.findMany({
  where: { companyId: { not: null }, isActive: true },
  select: { companyId: true },
});

const existingIds = existingCompanyIds
  .map((e) => e.companyId)
  .filter((id): id is string => id !== null);

// ثم استخدام notIn
whereClause.id = { notIn: existingIds };
```

### 2️⃣ **مشكلة Raw Query للعشوائي**
**المشكلة:**
```typescript
// ❌ Raw query مع template literals غير صحيح
companies = await prisma.$queryRaw`...`
```

**الحل:**
```typescript
// ✅ استخدام findMany مع اختيار عشوائي
const allIds = await prisma.company.findMany({
  where: randomWhere,
  select: { id: true },
});

const shuffled = allIds.sort(() => 0.5 - Math.random());
const selectedIds = shuffled.slice(0, takeCount).map((c) => c.id);

companies = await prisma.company.findMany({
  where: { id: { in: selectedIds } },
  // ...
});
```

### 3️⃣ **مشكلة التوافق مع Dashboard**
**المشكلة:**
- Dashboard يرسل `limit` لكن API يتوقع `count`
- Dashboard يتوقع `data.data.total` لكن API يرجع `data.data.count`

**الحل:**
```typescript
// ✅ دعم كلا الحقلين
const { limit, count } = body;
const takeCount = limit || count || 100;

// ✅ إرجاع كلا الحقلين
return {
  total: companies.length,
  count: companies.length, // للتوافق
};
```

### 4️⃣ **مشكلة undefined في whereClause**
**المشكلة:**
```typescript
id: existingIds.length > 0 ? { notIn: existingIds } : undefined
// ❌ Prisma لا يحب undefined
```

**الحل:**
```typescript
// ✅ إضافة الشرط فقط إذا كان موجوداً
if (existingIds.length > 0) {
  whereClause.id = { notIn: existingIds };
}
```

### 5️⃣ **تحسين معالجة الأخطاء**
**المشكلة:**
- رسائل خطأ عامة
- لا توجد تفاصيل في Development

**الحل:**
```typescript
// ✅ رسائل خطأ مفصلة
catch (error: any) {
  console.error('❌ خطأ في المعاينة:', error);
  console.error('تفاصيل الخطأ:', {
    message: error?.message,
    stack: error?.stack,
    name: error?.name,
  });
  
  return NextResponse.json({
    success: false,
    error: error?.message || 'فشل في معاينة الشركات',
    details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
  });
}
```

### 6️⃣ **تحسين Dashboard**
**المشكلة:**
- Dashboard لا يتعامل مع حالات مختلفة للـ Response

**الحل:**
```typescript
// ✅ دعم جميع الحقول
const total = data.data.total || data.data.count || data.data.companies?.length || 0;
setPreviewData(data.data.companies || []);
```

---

## ✅ **الملفات المُحدّثة:**

1. **`app/api/admin/sitemap/preview/route.ts`**
   - ✅ إصلاح Prisma query
   - ✅ إصلاح Random query
   - ✅ دعم `limit` و `count`
   - ✅ تحسين معالجة الأخطاء
   - ✅ إزالة undefined من whereClause

2. **`app/admin/sitemap-manager/page.tsx`**
   - ✅ تحسين معالجة Response
   - ✅ دعم جميع الحقول

3. **`app/api/admin/sitemap/add-batch/route.ts`**
   - ✅ إضافة baseUrl من env
   - ✅ تحسين type casting

---

## 🧪 **الاختبار:**

### قبل الإصلاح:
```json
{
  "success": false,
  "error": "فشل في معاينة الشركات"
}
```

### بعد الإصلاح:
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "id": "...",
        "name": "شركة ABC",
        "slug": "company-abc",
        "rating": 4.8,
        "reviewsCount": 123
      }
    ],
    "total": 50,
    "count": 50
  }
}
```

---

## 🚀 **الاستخدام:**

### 1. افتح Dashboard:
```
/admin/sitemap-manager
```

### 2. اختر طريقة:
- ⭐ الأعلى تقييماً
- 🆕 الأحدث أولاً
- 🎲 عشوائي
- إلخ...

### 3. حدد العدد:
- مثلاً: 50 شركة

### 4. انقر "معاينة":
- ✅ يجب أن تعمل الآن!

---

## 📝 **ملاحظات:**

### ✅ ما يعمل الآن:
- ✅ جميع طرق الاختيار (6 طرق)
- ✅ الفلاتر (مدينة، فئة)
- ✅ المعاينة المباشرة
- ✅ معالجة الأخطاء المحسّنة
- ✅ رسائل واضحة

### ⚠️ ملاحظات:
- إذا لم توجد شركات متاحة، ستكون القائمة فارغة
- تأكد من وجود شركات غير مضافة في السايت ماب
- في حالة وجود خطأ، راجع Console في المتصفح

---

## 🔍 **استكشاف الأخطاء:**

### المشكلة: لا توجد شركات في المعاينة
**الحل:**
1. تحقق من وجود شركات في Database
2. تحقق من أن الشركات `isActive: true`
3. تحقق من أن الشركات غير موجودة في السايت ماب

### المشكلة: خطأ 500
**الحل:**
1. افتح Console في المتصفح
2. راجع Server logs
3. تحقق من Database connection
4. تحقق من Prisma Schema

### المشكلة: بطء في المعاينة
**الحل:**
- هذا طبيعي إذا كان عدد الشركات كبير
- يمكن تحسينه بإضافة Indexes على `companyId` في `sitemap_entries`

---

**✅ الإصلاح مكتمل! API المعاينة يعمل الآن بشكل صحيح.**

**📅 تاريخ الإصلاح:** 21 ديسمبر 2025  
**✅ الحالة:** جاهز للاستخدام


# ⚡ دليل البدء السريع - نظام السايت ماب

## 🚀 في 5 دقائق:

### 1️⃣ تحقق من الملفات المُنشأة
```bash
# انظر في public/
dir public\sitemap*.xml
```

يجب أن ترى:
- ✅ `sitemap-index.xml`
- ✅ `sitemap-static.xml`
- ✅ `sitemap-companies-1.xml`
- ✅ `sitemap-locations.xml`
- ✅ `sitemap-categories-simple.xml`
- ✅ `sitemap-categories-mixed.xml`

### 2️⃣ افتح Dashboard
**الطريقة الأسهل:** من القائمة الجانبية
1. افتح `/admin`
2. ابحث عن: **🗺️ إدارة السايت ماب**
3. انقر عليها

**أو استخدم الرابط المباشر:**
```
https://twsia.com/admin/sitemap-manager
```

### 3️⃣ شاهد الإحصائيات الحية
- إجمالي الصفحات: **819**
- الشركات: **701**
- المتاحة: **~4,299**

---

## 📝 إضافة شركات جديدة

### الطريقة 1: عبر Dashboard (قريباً)
1. اذهب إلى `/admin/sitemap-manager`
2. اختر "إضافة شركات"
3. حدد الطريقة (أعلى تقييماً، أحدث، إلخ)
4. حدد العدد (50-500)
5. انقر "إضافة"

### الطريقة 2: عبر API (متاح الآن)
```javascript
// مثال: إضافة أفضل 100 شركة
const response = await fetch('/api/admin/sitemap/add-batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    method: 'TOP_RATED',
    limit: 100
  })
});

const result = await response.json();
console.log(result); // { success: true, message: "تمت إضافة 100 شركة" }
```

### الطريقة 3: عبر Script (للمطورين)
```typescript
// في ملف جديد: scripts/add-companies-batch.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTopCompanies() {
  const companies = await prisma.company.findMany({
    where: { isActive: true },
    orderBy: { rating: 'desc' },
    take: 100,
    select: { id: true, slug: true }
  });

  for (const company of companies) {
    await prisma.sitemapEntry.create({
      data: {
        entryType: 'COMPANY',
        slug: company.slug,
        url: `https://twsia.com/${company.slug}`,
        companyId: company.id,
        priority: 0.9,
        sitemapFile: 'companies-1',
        addMethod: 'TOP_RATED'
      }
    });
  }

  console.log(`✅ تمت إضافة ${companies.length} شركة`);
}

addTopCompanies();
```

---

## 🔄 إعادة بناء السايت ماب

### يدوياً:
```bash
npm run sitemap:build
```

### عبر API:
```javascript
await fetch('/api/admin/sitemap/rebuild', { method: 'POST' });
```

### عبر Dashboard:
انقر زر "إعادة بناء السايت ماب" ✨

---

## 📊 الحصول على الإحصائيات

### عبر API:
```javascript
const stats = await fetch('/api/admin/sitemap/stats').then(r => r.json());
console.log(stats);
/*
{
  totalEntries: 819,
  companiesInSitemap: 701,
  availableCompanies: 4299,
  totalFiles: 5,
  breakdown: {
    STATIC: 8,
    COMPANY: 701,
    COUNTRY: 1,
    CITY: 10,
    ...
  }
}
*/
```

---

## 🛠️ Scripts المتاحة

```bash
# ترحيل البيانات الأولية (مرة واحدة فقط)
npm run sitemap:migrate

# إضافة الصفحات المفقودة (مرة واحدة فقط)
npm run sitemap:add-missing

# بناء جميع ملفات السايت ماب
npm run sitemap:build
```

---

## 🔍 التحقق من النتائج

### 1. حجم الملفات:
```bash
dir public\sitemap*.xml
```

### 2. عدد الروابط:
```bash
# يجب أن ترى:
# sitemap-index.xml: ~700 bytes
# sitemap-static.xml: ~1.5 KB
# sitemap-companies-1.xml: ~117 KB
# sitemap-locations.xml: ~8.5 KB
# sitemap-categories-*.xml: ~12 KB
```

### 3. التحقق من صحة XML:
افتح أي ملف في المتصفح - يجب أن يظهر بشكل صحيح

---

## 📈 الأداء المتوقع

### الحالة الحالية (819 صفحة):
- ⏱️ وقت البناء: **184ms**
- 💾 الحجم: **~140 KB**
- 📁 عدد الملفات: **5**

### مع 10,000 شركة:
- ⏱️ وقت البناء: **~500ms**
- 💾 الحجم: **~2 MB**
- 📁 عدد الملفات: **~6**

### مع 40,000 شركة:
- ⏱️ وقت البناء: **~1-2 ثانية**
- 💾 الحجم: **~8 MB**
- 📁 عدد الملفات: **~8**

---

## 🎯 السيناريوهات الشائعة

### إضافة 50 شركة أسبوعياً:
```javascript
// كل أسبوع
await fetch('/api/admin/sitemap/add-batch', {
  method: 'POST',
  body: JSON.stringify({ method: 'NEWEST_FIRST', limit: 50 })
});
```

### إضافة جميع شركات مدينة:
```javascript
await fetch('/api/admin/sitemap/add-batch', {
  method: 'POST',
  body: JSON.stringify({ method: 'BY_CITY', cityId: 'amman-id' })
});
```

### إضافة جميع شركات فئة:
```javascript
await fetch('/api/admin/sitemap/add-batch', {
  method: 'POST',
  body: JSON.stringify({ method: 'BY_CATEGORY', categoryId: 'restaurants-id' })
});
```

---

## 🐛 حل المشاكل

### المشكلة: "Unique constraint failed"
**الحل:** هذا طبيعي - يعني أن الصفحة موجودة بالفعل

### المشكلة: الملفات لا تُحدّث
**الحل:** 
```bash
npm run sitemap:build
```

### المشكلة: Dashboard لا يظهر البيانات
**الحل:** تحقق من:
1. Database متصل؟
2. APIs تعمل؟
3. افتح Console في المتصفح

---

## 📞 للمزيد من المعلومات

- 📖 **الدليل الشامل:** `SITEMAP_README.md`
- 📋 **الخطة الكاملة:** `SITEMAP_MANAGEMENT_PLAN.md`
- 💻 **الكود:** `lib/sitemap/*` و `app/api/admin/sitemap/*`

---

**✅ النظام جاهز للاستخدام الآن!**

**الخطوة التالية:** افتح `/admin/sitemap-manager` وابدأ الإضافة 🚀


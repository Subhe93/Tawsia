# خطة منع الكلمات المحظورة في روابط الشركات (Slug)

## الهدف
ضمان عدم استخدام أي من "الكلمات القديمة" (عمود `form` في الملف `old-changed-slug.csv`) داخل روابط الشركات (slug)، سواء بالإدخال اليدوي أو التوليد التلقائي. في حال وجودها، يتم استبدالها تلقائياً بالكلمة البديلة (عمود `to`) أو إجبار المستخدم على التعديل.

---

## أماكن إنشاء أو تعديل رابط الشركة (Slug) في المشروع

| # | المصدر | الملف / المسار | الوصف |
|---|--------|----------------|-------|
| 1 | **الداشبورد – إضافة شركة** | `app/admin/companies/add/page.tsx` → `POST /api/admin/companies` → `createCompany()` في `lib/database/admin-queries.ts` | المستخدم يدخل الـ slug يدوياً، أو يُولَّد من الاسم عبر `createUniqueEnglishSlug("company", data.name)` |
| 2 | **الداشبورد – تعديل شركة** | `app/admin/companies/[id]/edit/page.tsx` → `PATCH /api/admin/companies/[id]` → `updateCompany()` في `lib/database/admin-queries.ts` | المستخدم يعدّل الـ slug؛ يُنظَّف بـ `createEnglishSlug(data.slug)` أو يُولَّد من الاسم |
| 3 | **الدوال المشتركة لبناء الـ slug** | `lib/utils/database-helpers.ts` | `createEnglishSlug()` و `createUniqueEnglishSlug()` – تستخدم من admin-queries عند إنشاء/تحديث الشركة |
| 4 | **الفرونت – طلب إضافة شركة** | `app/(frontend)/add-company/page.tsx` → `POST /api/company-requests` (يحفظ الطلب فقط). عند **الموافقة** على الطلب: `app/api/admin/company-requests/[id]/route.ts` (PATCH) | عند الموافقة يُنشأ slug من `companyRequest.companyName` بمعادلة بسيطة (بدون استخدام `createEnglishSlug`) |
| 5 | **استيراد الشركات من CSV** | `lib/services/company-import-service.ts` → `createCompany()` الخاصة بالاستيراد | يوجد دالة داخلية `generateSlugFromName(data.name)` تُنشئ الـ slug من اسم الشركة |

ملخص: الـ slug يُنشأ أو يُعدَّل في **5 نقاط** (مع اعتبار الدوال المشتركة مركزاً واحداً للمنطق).

---

## منطق المعالجة المقترح

- الملف `old-changed-slug.csv` يحتوي على أعمدة: `form` (الكلمة القديمة المحظورة) و `to` (البديل).
- المطلوب: عدم السماح بأن يظهر أي من قيم `form` **كجزء مستقل في الـ slug** (مثلاً بين شرطتين أو في بداية/نهاية الـ slug).
- المعالجة المقترحة: **استبدال تلقائي** لأي جزء في الـ slug يطابق تماماً إحدى كلمات `form` بالكلمة المقابلة من `to` (مثلاً `kar` → `car`). بهذا لا نحتاج إلى رفض الطلب، بل نصحح الـ slug في كل المسارات.

---

## الخطوات المقترحة (للموافقة خطوة بخطوة)

### الخطوة 1: مصدر بيانات الكلمات المحظورة ودالة التنظيف
- **إنشاء ملف** (مثلاً `lib/utils/banned-slug-words.ts`):
  - تحميل قائمة الاستبدال من `old-changed-slug.csv` (أو نسخها كـ mapping ثابت في الملف لتجنب قراءة ملف في وقت التشغيل).
  - تصدير دالة واحدة للمعالجة، مثلاً:  
    `sanitizeSlug(slug: string): string`  
    تقوم بتقسيم الـ slug على `-` ثم استبدال أي جزء يطابق تماماً إحدى كيم `form` بالقيمة `to` المقابلة، ثم إعادة تجميع الـ slug.
- (اختياري) تصدير دالة للتحقق فقط:  
  `slugContainsBannedWord(slug: string): boolean`  
  لاستخدامها في واجهة المستخدم أو رسائل الخطأ.

**النتيجة:** مكان واحد لتعريف الكلمات المحظورة ومنطق الاستبدال، جاهز للاستخدام من باقي الخطوات.

---

### الخطوة 2: استخدام التنظيف في الدوال المشتركة لبناء الـ slug
- في `lib/utils/database-helpers.ts`:
  - بعد الحصول على الـ slug النهائي في `createEnglishSlug()` استدعاء `sanitizeSlug(slug)` قبل الإرجاع.
  - بما أن `createUniqueEnglishSlug()` تعتمد على `createEnglishSlug()`، فإن أي slug يُنشأ من الاسم في الداشبورد (إضافة/تعديل) سيكون منظفاً تلقائياً.
- التأكد من أن الـ slug بعد التنظيف لا يصبح فارغاً؛ إن أصبح فارغاً استخدام قيمة افتراضية مناسبة (مثلاً `"company"` كما هو حالياً).

**النتيجة:** كل المسارات التي تعتمد على `createEnglishSlug` أو `createUniqueEnglishSlug` تصبح تلقائياً خالية من الكلمات المحظورة.

---

### الخطوة 3: الداشبورد – إضافة وتعديل الشركة (API + واجهة)
- **في الـ API:**
  - في `POST /api/admin/companies`: بعد استلام `data.slug` وقبل استدعاء `createCompany()`، تشغيل `sanitizeSlug(data.slug)` واستخدام الناتج (أو إن لم يُمرَّر slug، الاعتماد على `createUniqueEnglishSlug` التي ستُنظَّف في الخطوة 2).
  - في `PATCH /api/admin/companies/[id]`: نفس الشيء عند وجود `data.slug` – استدعاء `sanitizeSlug(data.slug)` قبل التحديث.
- **في الواجهة (اختياري):**
  - في صفحتي إضافة وتعديل الشركة، يمكن إما:
    - عرض تحذير عند اكتشاف كلمة محظورة (باستخدام `slugContainsBannedWord`) واقتراح الـ slug بعد التنظيف، أو
    - تطبيق التنظيف في الـ API فقط دون تغيير الواجهة (الأبسط).

**النتيجة:** الـ slug المدخل من الداشبورد يُنظَّف دائماً قبل الحفظ.

---

### الخطوة 4: الموافقة على طلب إضافة شركة من الفرونت
- في `app/api/admin/company-requests/[id]/route.ts` (عند `action === 'approve'`):
  - بدلاً من بناء الـ slug يدوياً من `companyRequest.companyName`، استخدام نفس المنطق الموحّد:
    - استدعاء `createEnglishSlug(companyRequest.companyName)` ثم `sanitizeSlug()` (أو الاعتماد على أن `createEnglishSlug` أصبحت تنظف في الخطوة 2).
    - التحقق من عدم تكرار الـ slug (مثلاً عبر `createUniqueSlug` أو حلقة مشابهة لما في `createCompany`).
  - إنشاء الشركة بالـ slug الناتج.

**النتيجة:** روابط الشركات المنشأة من طلبات الفرونت خالية من الكلمات المحظورة ومتوافقة مع باقي النظام.

---

### الخطوة 5: استيراد الشركات من CSV
- في `lib/services/company-import-service.ts` داخل `createCompany()`:
  - بعد حساب `baseSlug = generateSlugFromName(data.name)` استدعاء `sanitizeSlug(baseSlug)` واستخدام الناتج كـ `baseSlug` قبل حلقة التأكد من التفرد (`while (await prisma.company.findUnique(...))`).
  - أو (للتوحيد الأفضل): استبدال `generateSlugFromName` باستخدام `createEnglishSlug(data.name)` من `database-helpers` ثم `sanitizeSlug()`؛ بهذا يصبح الاستيراد يستخدم نفس المنطق والتنظيف.

**النتيجة:** الـ slug الناتج عن استيراد CSV يُنظَّف من الكلمات المحظورة.

---

### الخطوة 6 (اختيارية): التحقق في واجهة الداشبورد
- في صفحات إضافة/تعديل الشركة:
  - عند تغيير حقل الـ slug، تشغيل `slugContainsBannedWord(value)` وعرض رسالة مثل: "رابط الشركة يحتوي على كلمة تم استبدالها في الروابط (مثل kar). سيتم استبدالها تلقائياً عند الحفظ بـ car."
  - أو عرض الـ slug بعد `sanitizeSlug(value)` كاقتراح "الرابط بعد التنظيف: ...".

**النتيجة:** شفافية للمستخدم دون منع الحفظ (لأن التنظيف يتم في الخادم).

---

## ملخص التدفق بعد التنفيذ

1. **مصدر واحد للقائمة:** `lib/utils/banned-slug-words.ts` (من `old-changed-slug.csv`).
2. **تنظيف مركزي:** `createEnglishSlug()` تُنظِّف الـ slug بعد البناء، فكل من يستخدمها (داشبورد – إضافة/تعديل، وموافقة الطلبات إذا استخدمناها هناك) يحصل على slug منظف.
3. **استيراد CSV:** يستخدم نفس الدالة (أو `createEnglishSlug` + `sanitizeSlug`) قبل الحفظ.
4. **الـ API:** يطبّق `sanitizeSlug` على أي slug يُرسل من الداشبورد قبل استدعاء `createCompany` / `updateCompany`.

بهذا لا يمكن أن يدخل أي من كلمات العمود `form` في روابط الشركات من أي مصدر (داشبورد، فرونت، استيراد CSV) وسيتم استبدالها تلقائياً بالقيم من عمود `to`.

---

## الموافقة على الخطوات
يمكنك الموافقة على الخطوات بالترتيب (1 → 2 → 3 → 4 → 5 → 6)، أو طلب تعديل أي خطوة قبل التنفيذ.

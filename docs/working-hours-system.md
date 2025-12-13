# نظام إدارة ساعات العمل الموحد

## نظرة عامة

تم إنشاء نظام موحد لإدارة ساعات العمل في جميع أنحاء التطبيق لضمان اتساق البيانات وتوحيد آلية العمل بين:

1. **داشبورد المدير** - إدارة ساعات العمل للشركات
2. **داشبورد الشركة** - إدارة ساعات العمل الخاصة بالشركة
3. **صفحة الشركة في الفرونت** - عرض ساعات العمل للزوار

## المكونات الرئيسية

### 1. الخدمة الموحدة (`WorkingHoursService`)

```typescript
// lib/services/working-hours.service.ts
export class WorkingHoursService {
  static async getWorkingHours(companyId: string): Promise<WorkingHour[]>
  static async updateWorkingHours(companyId: string, workingHours: WorkingHour[]): Promise<WorkingHour[]>
  static async createDefaultWorkingHours(companyId: string): Promise<WorkingHour[]>
  static async deleteWorkingHours(companyId: string): Promise<void>
  static async copyWorkingHours(fromCompanyId: string, toCompanyId: string): Promise<WorkingHour[]>
  static async hasWorkingHours(companyId: string): Promise<boolean>
  static async getMultipleCompaniesWorkingHours(companyIds: string[]): Promise<Record<string, WorkingHour[]>>
}
```

### 2. المكون الموحد (`WorkingHoursDisplay`)

```typescript
// components/working-hours-display.tsx
interface WorkingHoursDisplayProps {
  workingHours: WorkingHour[]
  companyId: string
  isEditable?: boolean
  onSave?: (workingHours: WorkingHour[]) => Promise<void>
  className?: string
}
```

### 3. الأنواع المحسنة (`working-hours.ts`)

```typescript
// lib/types/working-hours.ts
export interface WorkingHour {
  id?: string | null
  dayOfWeek: string
  openTime: string | null
  closeTime: string | null
  isClosed: boolean
  companyId?: string
}

export function validateWorkingHours(workingHours: WorkingHour[]): { isValid: boolean; errors: string[] }
export function normalizeWorkingHours(workingHours: any[]): WorkingHour[]
export function ensureCompleteWorkingHours(workingHours: WorkingHour[], companyId?: string): WorkingHour[]
```

## API Endpoints

### 1. داشبورد الشركة
- `GET /api/company/working-hours` - جلب ساعات العمل
- `PUT /api/company/working-hours` - تحديث ساعات العمل

### 2. داشبورد المدير
- `GET /api/admin/companies/[id]/working-hours` - جلب ساعات العمل لشركة معينة
- `PUT /api/admin/companies/[id]/working-hours` - تحديث ساعات العمل لشركة معينة
- `POST /api/admin/companies/[id]/working-hours` - إنشاء ساعات العمل الافتراضية

## الميزات الرئيسية

### 1. التحقق من صحة البيانات
- التأكد من وجود جميع أيام الأسبوع
- التحقق من صحة أوقات الفتح والإغلاق
- منع أوقات الفتح بعد أوقات الإغلاق

### 2. ضمان اكتمال البيانات
- إنشاء ساعات عمل افتراضية للشركات الجديدة
- ملء الأيام المفقودة تلقائياً
- تطبيع البيانات من قاعدة البيانات

### 3. واجهة مستخدم موحدة
- مكون قابل لإعادة الاستخدام
- دعم الوضع القابل للتعديل والوضع للقراءة فقط
- رسائل خطأ واضحة ومفيدة

### 4. معالجة الأخطاء
- رسائل خطأ مفصلة باللغة العربية
- معالجة أخطاء قاعدة البيانات
- fallback للبيانات في حالة الخطأ

## الاستخدام

### في داشبورد الشركة
```typescript
import { WorkingHoursDisplay } from '@/components/working-hours-display'

<WorkingHoursDisplay
  workingHours={workingHours}
  companyId={company.id}
  isEditable={true}
  onSave={handleSave}
/>
```

### في داشبورد المدير
```typescript
import { WorkingHoursDisplay } from '@/components/working-hours-display'

<WorkingHoursDisplay
  workingHours={workingHours}
  companyId={company.id}
  isEditable={true}
  onSave={handleWorkingHoursSave}
/>
```

### في صفحة الشركة (للقراءة فقط)
```typescript
import { WorkingHours } from '@/components/working-hours'

<WorkingHours hours={workingHoursFormatted} />
```

## الفوائد

1. **اتساق البيانات**: استخدام نفس الخدمة في جميع أنحاء التطبيق
2. **سهولة الصيانة**: تغيير واحد يؤثر على جميع الأماكن
3. **تجربة مستخدم موحدة**: نفس الواجهة في جميع الأماكن
4. **أمان البيانات**: التحقق من صحة البيانات قبل الحفظ
5. **أداء محسن**: استخدام transactions لضمان اتساق قاعدة البيانات

## التطوير المستقبلي

1. إضافة دعم للاستراحات خلال اليوم
2. دعم ساعات العمل الموسمية
3. إضافة إشعارات عند تغيير ساعات العمل
4. دعم ساعات العمل المتعددة للمواقع المختلفة
5. إضافة تقارير وإحصائيات لساعات العمل

import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { applySeoOverride } = await import('@/lib/seo/overrides');
  
  const overridden = await applySeoOverride({
    title: 'سياسة الخصوصية | توصية',
    description: 'سياسة الخصوصية وحماية البيانات الشخصية في موقع توصية - دليل الشركات والخدمات'
  }, '/privacy', { targetType: 'CUSTOM_PATH', targetId: '/privacy' });

  return {
    title: overridden.title,
    description: overridden.description,
  };
}

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8">سياسة الخصوصية</h1>
      
      <div className="prose prose-lg max-w-none" dir="rtl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-blue-800 font-medium">
            آخر تحديث: {new Date().toLocaleDateString( )}
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. مقدمة</h2>
          <p className="mb-4 leading-relaxed">
            نحن في توصية نقدر خصوصيتك ونلتزم بحماية المعلومات الشخصية التي تشاركها معنا. 
            تصف هذه السياسة كيفية جمعنا واستخدامنا وحماية معلوماتك الشخصية عند استخدام موقعنا الإلكتروني وخدماتنا.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. المعلومات التي نجمعها</h2>
          
          <h3 className="text-xl font-semibold mb-3">2.1 المعلومات الشخصية</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>الاسم الكامل</li>
            <li>عنوان البريد الإلكتروني</li>
            <li>رقم الهاتف</li>
            <li>عنوان الشركة أو العمل</li>
            <li>المعلومات المتعلقة بشركتك أو خدماتك</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">2.2 المعلومات التقنية</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>عنوان IP الخاص بك</li>
            <li>نوع المتصفح ونظام التشغيل</li>
            <li>صفحات الموقع التي تزورها</li>
            <li>وقت وتاريخ الزيارة</li>
            <li>المصدر الذي أحالك إلى موقعنا</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. كيفية استخدام معلوماتك</h2>
          <p className="mb-4">نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>تقديم خدماتنا وصيانة موقعنا الإلكتروني</li>
            <li>إنشاء وإدارة ملفات الشركات في دليلنا</li>
            <li>التواصل معك بخصوص خدماتنا</li>
            <li>تحسين موقعنا وخدماتنا</li>
            <li>إرسال التحديثات والإشعارات المهمة</li>
            <li>منع الاحتيال وضمان أمان الموقع</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. مشاركة المعلومات</h2>
          <p className="mb-4">
            نحن لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة، باستثناء الحالات التالية:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>عند الحصول على موافقتك الصريحة</li>
            <li>مع مقدمي الخدمات الذين يساعدوننا في تشغيل موقعنا</li>
            <li>عندما يتطلب القانون ذلك</li>
            <li>لحماية حقوقنا القانونية أو سلامة المستخدمين</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. حماية المعلومات</h2>
          <p className="mb-4">
            نتخذ تدابير أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو الكشف أو التغيير أو التدمير. 
            تشمل هذه التدابير:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>تشفير البيانات الحساسة</li>
            <li>استخدام اتصالات آمنة (SSL)</li>
            <li>مراقبة النظام بانتظام للكشف عن الثغرات الأمنية</li>
            <li>تدريب الموظفين على أفضل ممارسات الأمان</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. ملفات تعريف الارتباط (Cookies)</h2>
          <p className="mb-4">
            نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا. يمكنك التحكم في إعدادات ملفات تعريف الارتباط 
            من خلال متصفحك، ولكن قد يؤثر ذلك على وظائف الموقع.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. حقوقك</h2>
          <p className="mb-4">لديك الحق في:</p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>الوصول إلى معلوماتك الشخصية</li>
            <li>تصحيح المعلومات غير الصحيحة</li>
            <li>حذف معلوماتك الشخصية</li>
            <li>الاعتراض على معالجة معلوماتك</li>
            <li>نقل معلوماتك إلى خدمة أخرى</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. التغييرات على سياسة الخصوصية</h2>
          <p className="mb-4">
            قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات مهمة عبر البريد الإلكتروني 
            أو من خلال إشعار على موقعنا.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">9. التواصل معنا</h2>
          <p className="mb-4">
            إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <ul className="space-y-2">
              <li><strong>البريد الإلكتروني:</strong> privacy@twsia.com</li>
              <li><strong>الهاتف:</strong> +963 11 1234567</li>
              <li><strong>العنوان:</strong> دمشق، سوريا</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}


import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { applySeoOverride } = await import('@/lib/seo/overrides');
  
  const overridden = await applySeoOverride({
    title: 'الشروط والأحكام | توصية',
    description: 'الشروط والأحكام الخاصة باستخدام موقع توصية - دليل الشركات والخدمات'
  }, '/terms', { targetType: 'CUSTOM_PATH', targetId: '/terms' });

  return {
    title: overridden.title,
    description: overridden.description,
  };
}

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8">الشروط والأحكام</h1>
      
      <div className="prose prose-lg max-w-none" dir="rtl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-blue-800 font-medium">
            آخر تحديث: {new Date().toLocaleDateString( )}
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. قبول الشروط</h2>
          <p className="mb-4 leading-relaxed">
            مرحباً بك في توصية. باستخدامك لموقعنا الإلكتروني وخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. 
            إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام موقعنا.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. وصف الخدمة</h2>
          <p className="mb-4">
            توصية هو دليل إلكتروني شامل للشركات والخدمات في العالم العربي. نوفر منصة تتيح للمستخدمين:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>البحث عن الشركات والخدمات</li>
            <li>عرض معلومات الشركات وتفاصيل الخدمات</li>
            <li>قراءة وكتابة المراجعات</li>
            <li>إضافة شركاتهم إلى الدليل</li>
            <li>التواصل مع الشركات المدرجة</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. التسجيل واستخدام الحساب</h2>
          
          <h3 className="text-xl font-semibold mb-3">3.1 شروط التسجيل</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>يجب أن تكون فوق سن 18 عاماً أو لديك إذن من ولي أمرك</li>
            <li>تقديم معلومات دقيقة وصحيحة</li>
            <li>المحافظة على سرية بيانات حسابك</li>
            <li>إخطارنا فوراً في حالة اختراق حسابك</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">3.2 مسؤولية الحساب</h3>
          <p className="mb-4">
            أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك. نحن غير مسؤولين عن أي خسائر ناتجة عن 
            الاستخدام غير المصرح به لحسابك.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. إرشادات المحتوى</h2>
          <p className="mb-4">عند إضافة محتوى إلى موقعنا، يجب الالتزام بما يلي:</p>
          
          <h3 className="text-xl font-semibold mb-3">4.1 المحتوى المسموح</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>معلومات دقيقة وصحيحة عن الشركات</li>
            <li>مراجعات صادقة ومفيدة</li>
            <li>صور وملفات ذات جودة مناسبة</li>
            <li>احترام حقوق الملكية الفكرية</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">4.2 المحتوى المحظور</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>المحتوى المسيء أو المهين</li>
            <li>المعلومات الكاذبة أو المضللة</li>
            <li>المحتوى الذي ينتهك حقوق الآخرين</li>
            <li>الإعلانات غير المناسبة أو المزعجة</li>
            <li>المحتوى الذي يروج للعنف أو الكراهية</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. حقوق الملكية الفكرية</h2>
          <p className="mb-4">
            جميع المحتويات الموجودة على موقع توصية، بما في ذلك النصوص والصور والشعارات والتصميمات، 
            محمية بحقوق الطبع والنشر وحقوق الملكية الفكرية. لا يجوز استخدامها دون إذن كتابي مسبق.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. إدارة الشركات المدرجة</h2>
          
          <h3 className="text-xl font-semibold mb-3">6.1 معايير القبول</h3>
          <p className="mb-4">نحتفظ بالحق في:</p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>مراجعة جميع طلبات إضافة الشركات</li>
            <li>رفض أو حذف أي شركة لا تلبي معاييرنا</li>
            <li>طلب وثائق إضافية للتحقق من الشركة</li>
            <li>تعديل أو تحديث معلومات الشركات</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">6.2 صحة المعلومات</h3>
          <p className="mb-4">
            أصحاب الشركات مسؤولون عن ضمان دقة وحداثة المعلومات المقدمة. يجب تحديث المعلومات 
            فور حدوث أي تغييرات.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. المراجعات والتقييمات</h2>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>المراجعات يجب أن تكون مبنية على تجربة حقيقية</li>
            <li>لا يجوز كتابة مراجعات كاذبة أو مضللة</li>
            <li>نحتفظ بالحق في حذف أي مراجعة تنتهك شروطنا</li>
            <li>المراجعات تعبر عن رأي كاتبها وليس بالضرورة رأي توصية</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. إخلاء المسؤولية</h2>
          <p className="mb-4">
            الخدمات مقدمة "كما هي" دون ضمانات من أي نوع. نحن لا نضمن:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>دقة المعلومات المقدمة من الشركات</li>
            <li>جودة الخدمات المقدمة من الشركات المدرجة</li>
            <li>استمرارية الخدمة دون انقطاع</li>
            <li>أمان البيانات بنسبة 100%</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">9. تحديد المسؤولية</h2>
          <p className="mb-4">
            في جميع الأحوال، لن تتجاوز مسؤوليتنا القانونية المبلغ المدفوع لنا (إن وجد) خلال 
            الاثني عشر شهراً السابقة للحادثة المسببة للضرر.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">10. إنهاء الخدمة</h2>
          <p className="mb-4">يحق لنا إنهاء أو تعليق حسابك في الحالات التالية:</p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>انتهاك هذه الشروط والأحكام</li>
            <li>استخدام الخدمة لأغراض غير قانونية</li>
            <li>الإضرار بسمعة الموقع أو المستخدمين الآخرين</li>
            <li>عدم النشاط لفترة طويلة</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">11. القانون المطبق</h2>
          <p className="mb-4">
            تخضع هذه الشروط والأحكام للقوانين السورية، وأي نزاع ينشأ عنها يخضع لاختصاص 
            المحاكم السورية.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">12. التواصل معنا</h2>
          <p className="mb-4">
            لأي استفسارات حول الشروط والأحكام، يرجى التواصل معنا:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <ul className="space-y-2">
              <li><strong>البريد الإلكتروني:</strong> legal@twsia.com</li>
              <li><strong>الهاتف:</strong> +963 11 1234567</li>
              <li><strong>العنوان:</strong> دمشق، سوريا</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}


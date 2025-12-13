import { Metadata } from 'next';
import { applySeoOverride } from '@/lib/seo/overrides';

export async function generateMetadata(): Promise<Metadata> {
  const overridden = await applySeoOverride({
    title: 'من نحن | توصية',
    description: 'تعرف على توصية ورسالتنا في تقديم دليل شامل للشركات العربية والعالمية'
  }, '/about', { targetType: 'CUSTOM_PATH', targetId: '/about' });

  return {
    title: overridden.title,
    description: overridden.description,
  };
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            من نحن
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            تعرف على قصة توصية ورسالتنا في خدمة المجتمع العربي
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              رسالتنا
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              توصية هو دليل شامل للشركات والخدمات في العالم العربي. نهدف إلى ربط العملاء بأفضل الشركات والخدمات في منطقتهم، وتسهيل عملية البحث والاختيار من خلال منصة موثوقة وسهلة الاستخدام.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              رؤيتنا
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              نسعى لأن نكون المنصة الأولى والأكثر موثوقية للبحث عن الشركات والخدمات في العالم العربي، مع توفير معلومات دقيقة وتقييمات حقيقية من العملاء.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ما نقدمه
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  دليل شامل
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  آلاف الشركات والخدمات في مختلف المجالات والمدن العربية
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  تقييمات حقيقية
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  آراء وتقييمات العملاء الحقيقيين لمساعدتك في اتخاذ القرار الصحيح
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  بحث متقدم
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  أدوات بحث متطورة للعثور على ما تحتاجه بسرعة ودقة
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  معلومات محدثة
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  معلومات الاتصال وساعات العمل والخدمات محدثة باستمرار
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-brand-green to-brand-yellow rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">
              انضم إلى مجتمع توصية
            </h2>
            <p className="text-white/90 mb-6">
              ساعدنا في بناء أكبر دليل للشركات العربية من خلال إضافة تقييماتك وآرائك
            </p>
            <button className="bg-white text-brand-green px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              ابدأ الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
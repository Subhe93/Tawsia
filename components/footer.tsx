import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">حول توصية</h3>
            <p className="text-gray-300 mb-4">
              دليل شامل للشركات العربية والعالمية. نساعدك في العثور على أفضل الخدمات والشركات في منطقتك.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">الرئيسية</Link></li>
              <li><Link href="/country/sy" className="text-gray-300 hover:text-white transition-colors">سوريا</Link></li>
              <li><Link href="/country/lb" className="text-gray-300 hover:text-white transition-colors">لبنان</Link></li>
              <li><Link href="/country/jo" className="text-gray-300 hover:text-white transition-colors">الأردن</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">من نحن</Link></li>
              <li><Link href="/add-company" className="text-gray-300 hover:text-white transition-colors">أضف شركتك</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-4">الفئات</h3>
            <ul className="space-y-2">
              <li><Link href="/country/sy/category/technology" className="text-gray-300 hover:text-white transition-colors">التكنولوجيا</Link></li>
              <li><Link href="/country/sy/category/healthcare" className="text-gray-300 hover:text-white transition-colors">الرعاية الصحية</Link></li>
              <li><Link href="/country/sy/category/education" className="text-gray-300 hover:text-white transition-colors">التعليم</Link></li>
              <li><Link href="/country/sy/category/finance" className="text-gray-300 hover:text-white transition-colors">المالية</Link></li>
              <li><Link href="/country/sy/category/food" className="text-gray-300 hover:text-white transition-colors">الأغذية</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">اتصل بنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 space-x-reverse">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">دمشق، سوريا</span>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">+963 11 1234567</span>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">info@companies-guide.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              &copy; 2024 توصية. جميع الحقوق محفوظة.
            </p>
            <div className="flex space-x-6 space-x-reverse">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                الشروط والأحكام
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
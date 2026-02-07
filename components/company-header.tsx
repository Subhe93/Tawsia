import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Phone, Globe, Mail, Clock, Users, CheckCircle, Facebook, Twitter, Instagram, Linkedin, Share2, Navigation, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/lib/data';
import { ShareButton } from './share-button';
import { QRButton } from './qr-button';

interface CompanyHeaderProps {
  company: Company;
}

// Helper function to render stars
const renderStars = (rating: number, size: string = "h-4 w-4") => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.3 && rating % 1 < 0.7;
  const hasQuarterStar = rating % 1 >= 0.1 && rating % 1 < 0.3;
  const hasThreeQuarterStar = rating % 1 >= 0.7 && rating % 1 < 0.9;
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={i} className={`${size} text-yellow-500 fill-current`} />
    );
  }
  
  // Partial star (half, quarter, or three-quarter)
  if (hasHalfStar || hasQuarterStar || hasThreeQuarterStar) {
    let clipPath = 'inset(0 50% 0 0)'; // half star by default
    if (hasQuarterStar) {
      clipPath = 'inset(0 75% 0 0)'; // quarter star
    } else if (hasThreeQuarterStar) {
      clipPath = 'inset(0 25% 0 0)'; // three-quarter star
    }
    
    stars.push(
      <div key="partial" className={`${size} relative`}>
        <Star className={`${size} text-gray-300 fill-current absolute`} />
        <Star className={`${size} text-yellow-500 fill-current`} style={{ clipPath }} />
      </div>
    );
  }
  
  // Empty stars
  const remainingStars = 5 - Math.ceil(rating);
  for (let i = 0; i < remainingStars; i++) {
    stars.push(
      <Star key={`empty-${i}`} className={`${size} text-gray-300 fill-current`} />
    );
  }
  
  return stars;
};

// Helper function to get country flag
const getCountryFlag = (countryCode: string) => {
  const flags: { [key: string]: string } = {
    'sy': '🇸🇾',
    'lb': '🇱🇧', 
    'jo': '🇯🇴',
    'eg': '🇪🇬'
  };
  return flags[countryCode] || '🏳️';
};

export function CompanyHeader({ company }: CompanyHeaderProps) {
  const address = company.address || `${company.name}, ${company.city}, ${company.country}`;
  // Debug: Check if rating matches actual reviews
  const hasRatingDiscrepancy = company.rating > 0 && company.reviewsCount === 0;
  
  return (
    <>
      {/* Debug Warning */}
      {/* {hasRatingDiscrepancy && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded mb-4">
          <strong>تنبيه:</strong> هناك تناقض في التقييمات. التقييم: {company.rating}، عدد المراجعات: {company.reviewsCount}
        </div>
      )} */}

      {/* هيكل واحد: عنوان الصفحة H1 واحد فقط (متجاوب) لتحسين SEO والـ accessibility */}
      <div className="relative mb-6 md:mb-8">
        {/* صورة الشركة - نفس العنصر بتصميم متجاوب */}
        <div className="relative h-48 md:h-96 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
          <Image
            src={company.image}
            alt={company.name}
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
          <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
          <div className="absolute inset-0 bg-black/30 md:hidden" />

          {/* شارة الحالة - موبايل */}
          <div className="absolute top-3 right-3 md:hidden">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              متاح الآن
            </div>
          </div>

          {/* لوغو - موبايل (صغير) */}
          <div className="absolute bottom-3 left-3 md:hidden">
            <div className="bg-white/95 backdrop-blur-md rounded-full p-2 shadow-lg border border-white/50">
              <div className="w-12 h-12 relative rounded-full overflow-hidden">
                <Image
                  src={company.logoImage || company.image}
                  alt={`${company.name} لوغو`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* لوغو - ديسكتوب (أسفل يسار) */}
          <div className="absolute bottom-6 left-6 hidden md:block">
            <div className="bg-white/95 backdrop-blur-md rounded-full p-3 shadow-lg border border-white/50">
              <div className="w-16 h-16 relative rounded-full overflow-hidden">
                <Image
                  src={company.logoImage || company.image}
                  alt={`${company.name} لوغو`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* صناديق التقييم - ديسكتوب فقط */}
          <div className="absolute top-6 left-6 hidden md:flex flex-col gap-3">
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{company.rating}</div>
                <div className="text-xs text-gray-600">تقييم ممتاز</div>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/50">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{company.reviewsCount}</div>
                <div className="text-xs text-gray-600">مراجعة</div>
              </div>
            </div>
          </div>
        </div>

        {/* منطقة المحتوى: عنوان واحد H1 + نفس المحتوى بتصميم متجاوب */}
        <div className="mt-4 md:mt-0 md:absolute md:inset-0 md:flex md:items-end md:pointer-events-none">
          <div className="w-full p-5 md:p-10 md:pointer-events-auto max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg md:bg-transparent md:dark:bg-transparent md:rounded-none md:shadow-none">
            <div className="flex items-start justify-between mb-3 md:block">
              <div className="flex-1 md:mb-6">
                <div className="flex items-center space-x-2 space-x-reverse mb-2 md:mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight md:text-4xl md:text-white md:drop-shadow-lg">
                    {company.name}
                  </h1>
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-blue-500 fill-current md:drop-shadow-sm" />
                      <div className="absolute inset-0 bg-white rounded-full transform scale-75"></div>
                      <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-blue-500 fill-current absolute inset-0" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse mb-2 md:hidden">
                  <span className="text-lg">{getCountryFlag(company.country)}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{company.city}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3 md:text-xl md:text-white/90 md:leading-relaxed md:max-w-3xl md:drop-shadow-md md:line-clamp-none md:mb-0">
                  {company.description}
                </p>
              </div>
              {/* تقييم داخل البطاقة - موبايل فقط */}
              <div className="text-center md:hidden">
                <div className="flex items-center justify-center mb-1 space-x-1 space-x-reverse">
                  {renderStars(company.rating, "h-4 w-4")}
                </div>
                <div className="text-xs text-gray-900 dark:text-white font-medium mb-1">{company.rating}</div>
                <div className="text-xs text-gray-500">({company.reviewsCount} تقييم)</div>
              </div>
            </div>

            {/* صف التقييم والموقع - ديسكتوب */}
            <div className="hidden md:flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center space-x-2 space-x-reverse bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/30">
                <div className="flex items-center space-x-1 space-x-reverse">
                  {renderStars(company.rating, "h-4 w-4")}
                </div>
                <span className="font-bold text-base text-white">{company.rating}</span>
                <span className="text-white/80 text-sm">({company.reviewsCount})</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/30">
                <span className="text-2xl">{getCountryFlag(company.country)}</span>
                <span className="text-white font-medium text-base">{company.city}</span>
              </div>
              <div className="bg-green-500/80 backdrop-blur-md rounded-xl px-4 py-2 border border-green-400/50">
                <span className="text-white font-semibold text-base">متاح الآن</span>
              </div>
            </div>

            {/* Tags - موبايل */}
            <div className="flex flex-wrap gap-2 mb-4 md:hidden">
              {company.tags.slice(0, 3).map((tag) => (
                <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`}>
                  <Badge variant="secondary" className="text-xs px-2 py-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Tags - ديسكتوب */}
            <div className="hidden md:flex flex-wrap gap-3 mb-8">
              {company.tags.slice(0, 4).map((tag) => (
                <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`}>
                  <Badge
                    className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 backdrop-blur-sm px-3 py-1 text-sm font-medium cursor-pointer transition-all duration-300 hover:scale-105"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* أزرار - ديسكتوب */}
            <div className="hidden md:flex flex-wrap gap-4">
              {company.phone && (
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3">
                  <a href={`tel:${company.phone}`}>
                    <Phone className="h-5 w-5 ml-2" />
                    اتصل الآن
                  </a>
                </Button>
              )}
              <Button asChild variant="outline" size="lg" className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-white/40 hover:border-white/60 shadow-lg transition-all duration-300 px-6 py-3">
                <a href={`https://www.google.com/maps/place/${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer nofollow">
                  <Navigation className="h-5 w-5 ml-2" />
                  الاتجاهات
                </a>
              </Button>
              {company.website && (
                <Button asChild variant="outline" size="lg" className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-white/40 hover:border-white/60 shadow-lg transition-all duration-300 px-6 py-3">
                  <a href={company.website} target="_blank" rel="noopener noreferrer nofollow">
                    <Globe className="h-5 w-5 ml-2" />
                    زيارة الموقع
                  </a>
                </Button>
              )}
              <ShareButton companyName={company.name} companyDescription={company.description} />
              <QRButton companyName={company.name} companySlug={company.slug} />
            </div>
          </div>
        </div>

        {/* Quick Stats - موبايل فقط */}
        <div className="grid grid-cols-3 gap-3 mb-4 md:hidden" style={{ paddingTop: '15px' }}>
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 text-center">
            <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">{company.reviewsCount}</div>
            <div className="text-xs text-blue-600 dark:text-blue-300">عميل</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-3 text-center">
            <Star className="h-5 w-5 text-green-600 mx-auto mb-1 fill-current" />
            <div className="text-sm font-semibold text-green-900 dark:text-green-100">{company.rating}</div>
            <div className="text-xs text-green-600 dark:text-green-300">تقييم</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/30 rounded-xl p-3 text-center">
            <Clock className="h-5 w-5 text-orange-600 mx-auto mb-1" />
            <div className="text-sm font-semibold text-orange-900 dark:text-orange-100">24/7</div>
            <div className="text-xs text-orange-600 dark:text-orange-300">خدمة</div>
          </div>
        </div>

        {/* أزرار الإجراء - موبايل فقط */}
        <div className="space-y-3 md:hidden">
          {company.phone && (
            <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl shadow-lg">
              <a href={`tel:${company.phone}`}>
                <Phone className="h-5 w-5 ml-2" />
                اتصل الآن
              </a>
            </Button>
          )}
          <div className="grid grid-cols-2 gap-3">
            {company.website && (
              <Button asChild variant="outline" className="py-3 rounded-xl">
                <a href={company.website} target="_blank" rel="noopener noreferrer nofollow">
                  <Globe className="h-4 w-4 ml-2" />
                  الموقع
                </a>
              </Button>
            )}
            {company.email && (
              <Button asChild variant="outline" className="py-3 rounded-xl">
                <a href={`mailto:${company.email}`}>
                  <Mail className="h-4 w-4 ml-2" />
                  راسلنا
                </a>
              </Button>
            )}
          </div>
          <div className="mt-3">
            <QRButton companyName={company.name} companySlug={company.slug} variant="mobile" />
          </div>
        </div>
      </div>
    </>
  );
}

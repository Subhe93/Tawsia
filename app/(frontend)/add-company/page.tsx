'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Phone, Mail, Globe, Users, Star, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Note: In a real app, metadata would be in a separate file since this is a client component
const metadata: Metadata = {
  title: 'أضف شركتك | توصية',
  description: 'أضف شركتك إلى دليل توصية واصل إلى آلاف العملاء المحتملين في العالم العربي',
};

// الواجهات للبيانات
interface Country {
  id: string;
  code: string;
  name: string;
  flag?: string;
  companiesCount: number;
}

interface City {
  id: string;
  slug: string;
  name: string;
  companiesCount: number;
  country: {
    id: string;
    name: string;
    code: string;
  };
}

interface Category {
  id: string;
  slug: string;
  name: string;
  icon?: string;
  description?: string;
  companiesCount: number;
}

const companySizes = [
  { value: '1-10', label: '1-10 موظفين' },
  { value: '11-50', label: '11-50 موظف' },
  { value: '51-200', label: '51-200 موظف' },
  { value: '201-500', label: '201-500 موظف' },
  { value: '500+', label: 'أكثر من 500 موظف' },
];

export default function AddCompany() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    companyName: '',
    description: '',
    categoryId: '',
    countryId: '',
    cityId: '',
    address: '',
    
    // Contact Information
    phone: '',
    email: '',
    website: '',
    
    // Company Details
    foundedYear: '',
    companySize: '',
    services: '',
    
    // Additional Information
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    socialMediaLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
    },
  });

  // حالة أخطاء التحقق
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // حالات التحميل والبيانات
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // جلب البلدان والفئات عند تحميل الصفحة
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingCountries(true);
        setLoadingCategories(true);

        const [countriesRes, categoriesRes] = await Promise.all([
          fetch('/api/countries?activeOnly=true'),
          fetch('/api/categories?activeOnly=true')
        ]);

        if (countriesRes.ok) {
          const countriesData = await countriesRes.json();
          setCountries(countriesData.countries || []);
        } else {
          console.error('فشل في تحميل البلدان');
          alert('تعذر تحميل قائمة البلدان. يرجى إعادة تحميل الصفحة.');
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
        } else {
          console.error('فشل في تحميل الفئات');
          alert('تعذر تحميل قائمة الفئات. يرجى إعادة تحميل الصفحة.');
        }
      } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
      } finally {
        setLoadingCountries(false);
        setLoadingCategories(false);
      }
    };

    fetchInitialData();
  }, []);

  // جلب المدن عند تغيير البلد
  useEffect(() => {
    const fetchCities = async () => {
      if (formData.countryId) {
        try {
          setLoadingCities(true);
          const response = await fetch(`/api/cities?countryId=${formData.countryId}&activeOnly=true`);
          
          if (response.ok) {
            const citiesData = await response.json();
            setCities(citiesData.cities || []);
          } else {
            console.error('فشل في تحميل المدن');
            setCities([]);
          }
        } catch (error) {
          console.error('خطأ في جلب المدن:', error);
          setCities([]);
        } finally {
          setLoadingCities(false);
        }
      } else {
        setCities([]);
        setFormData(prev => ({ ...prev, cityId: '' }));
      }
    };

    fetchCities();
  }, [formData.countryId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // مسح خطأ الحقل عند تغييره
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMediaLinks: {
        ...prev.socialMediaLinks,
        [platform]: value
      }
    }));
    setErrors(prev => ({ ...prev, [platform]: '' }));
  };

  // أدوات التحقق
  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim());

  const isValidPhone = (value: string) =>
    /^\+?[0-9\s\-()]{7,}$/.test(value.trim());

  const isValidUrl = (value: string) => {
    if (!value) return true;
    try {
      const url = new URL(value.trim());
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  };

  const isValidYear = (value: string) => {
    if (!value) return true;
    const year = Number(value);
    const currentYear = new Date().getFullYear();
    return Number.isInteger(year) && year >= 1900 && year <= currentYear;
  };

  // التحقق بحسب الخطوة
  const validateStep = (step: number) => {
    const stepErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.companyName.trim()) stepErrors.companyName = 'اسم الشركة مطلوب';
      if (!formData.description.trim()) stepErrors.description = 'وصف الشركة مطلوب';
      else if (formData.description.trim().length < 10) stepErrors.description = 'يجب أن يكون الوصف 10 أحرف على الأقل';
      if (!formData.categoryId) stepErrors.categoryId = 'يرجى اختيار الفئة';
      if (!formData.countryId) stepErrors.countryId = 'يرجى اختيار البلد';
      if (!formData.cityId) stepErrors.cityId = 'يرجى اختيار المدينة';
    }
    if (step === 2) {
      if (!formData.phone.trim()) stepErrors.phone = 'رقم الهاتف مطلوب';
      else if (!isValidPhone(formData.phone)) stepErrors.phone = 'رقم الهاتف غير صالح';
      if (!formData.email.trim()) stepErrors.email = 'البريد الإلكتروني مطلوب';
      else if (!isValidEmail(formData.email)) stepErrors.email = 'البريد الإلكتروني غير صالح';
      if (formData.website && !isValidUrl(formData.website)) stepErrors.website = 'الرابط غير صالح';
      const { facebook, instagram, linkedin } = formData.socialMediaLinks;
      if (facebook && !isValidUrl(facebook)) stepErrors.facebook = 'رابط فيسبوك غير صالح';
      if (instagram && !isValidUrl(instagram)) stepErrors.instagram = 'رابط إنستغرام غير صالح';
      if (linkedin && !isValidUrl(linkedin)) stepErrors.linkedin = 'رابط لينكدإن غير صالح';
    }
    if (step === 3) {
      if (!formData.services.trim()) stepErrors.services = 'الخدمات والمنتجات مطلوبة';
      else if (formData.services.trim().length < 10) stepErrors.services = 'يجب أن يكون وصف الخدمات 10 أحرف على الأقل';
      if (!isValidYear(formData.foundedYear)) stepErrors.foundedYear = 'أدخل سنة صحيحة بين 1900 والآن';
    }
    if (step === 4) {
      if (!formData.ownerName.trim()) stepErrors.ownerName = 'اسم المسؤول مطلوب';
      if (!formData.ownerEmail.trim()) stepErrors.ownerEmail = 'بريد المسؤول مطلوب';
      else if (!isValidEmail(formData.ownerEmail)) stepErrors.ownerEmail = 'بريد غير صالح';
      if (!formData.ownerPhone.trim()) stepErrors.ownerPhone = 'هاتف المسؤول مطلوب';
      else if (!isValidPhone(formData.ownerPhone)) stepErrors.ownerPhone = 'رقم هاتف غير صالح';
    }
    setErrors(prev => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep < 4) {
      const ok = validateStep(currentStep);
      if (!ok) return;
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // تحقق نهائي لكل الخطوات قبل الإرسال
      const allValid = [1, 2, 3, 4].every(validateStep);
      if (!allValid) {
        setIsSubmitting(false);
        return;
      }
      const response = await fetch('/api/company-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: formData.companyName,
          description: formData.description,
          categoryId: formData.categoryId,
          countryId: formData.countryId,
          cityId: formData.cityId,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          website: formData.website || undefined,
          foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
          companySize: formData.companySize,
          services: formData.services,
          ownerName: formData.ownerName,
          ownerEmail: formData.ownerEmail,
          ownerPhone: formData.ownerPhone,
          socialMediaLinks: formData.socialMediaLinks
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'حدث خطأ أثناء إرسال الطلب');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('خطأ في إرسال الطلب:', error);
      
      let errorMessage = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // تحسين رسائل الخطأ
      if (errorMessage.includes('البلد المحدد غير موجود')) {
        errorMessage = 'البلد المحدد غير صحيح. يرجى اختيار بلد من القائمة.';
      } else if (errorMessage.includes('المدينة المحددة غير موجودة')) {
        errorMessage = 'المدينة المحددة غير صحيحة. يرجى اختيار مدينة من القائمة.';
      } else if (errorMessage.includes('الفئة المحددة غير موجودة')) {
        errorMessage = 'الفئة المحددة غير صحيحة. يرجى اختيار فئة من القائمة.';
      } else if (errorMessage.includes('يوجد طلب مماثل مسبقاً')) {
        errorMessage = 'يوجد طلب سابق لنفس الشركة أو البريد الإلكتروني. يرجى مراجعة الطلبات السابقة.';
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="text-center">
          <CardContent className="pt-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">تم إرسال طلبك بنجاح!</h2>
            <p className="text-gray-600 mb-6">
              شكراً لك على إضافة شركتك إلى دليل توصية. سيقوم فريقنا بمراجعة المعلومات 
              والتواصل معك خلال 2-3 أيام عمل.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">الخطوات التالية:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• مراجعة المعلومات المقدمة</li>
                <li>• التحقق من صحة البيانات</li>
                <li>• إنشاء صفحة الشركة</li>
                <li>• إرسال تأكيد النشر</li>
              </ul>
            </div>
            <Button onClick={() => window.location.href = '/'}>
              العودة إلى الصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4 space-x-reverse">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`w-8 md:w-16 h-1 mx-2 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          المعلومات الأساسية
        </CardTitle>
        <CardDescription>
          أدخل المعلومات الأساسية عن شركتك
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="companyName">اسم الشركة *</Label>
          <Input
            id="companyName"
            className={errors.companyName ? 'border-red-500 focus-visible:ring-red-500' : ''}
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            placeholder="أدخل اسم شركتك"
            required
          />
          {errors.companyName && (
            <p className="text-sm text-red-600 mt-1">{errors.companyName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">وصف الشركة *</Label>
          <Textarea
            id="description"
            className={errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="اكتب وصفاً موجزاً عن شركتك وأنشطتها..."
            rows={4}
            required
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <Label htmlFor="category">فئة الشركة *</Label>
          <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
            <SelectTrigger>
              <SelectValue placeholder={loadingCategories ? "جاري تحميل الفئات..." : "اختر فئة شركتك"} />
            </SelectTrigger>
            <SelectContent>
              {loadingCategories ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  <span className="text-sm">جاري التحميل...</span>
                </div>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {category.icon && <span>{category.icon}</span>}
                      <span>{category.name}</span>
                      <span className="text-xs text-gray-500">({category.companiesCount})</span>
                    </div>
                </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500">لا توجد فئات متاحة</div>
              )}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-sm text-red-600 mt-1">{errors.categoryId}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">البلد *</Label>
            <Select value={formData.countryId} onValueChange={(value) => handleInputChange('countryId', value)}>
              <SelectTrigger>
                <SelectValue placeholder={loadingCountries ? "جاري تحميل البلدان..." : "اختر البلد"} />
              </SelectTrigger>
              <SelectContent>
                {loadingCountries ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    <span className="text-sm">جاري التحميل...</span>
                  </div>
                ) : countries.length > 0 ? (
                  countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      <div className="flex items-center gap-2">
                        {country.flag && <span>{country.flag}</span>}
                        <span>{country.name}</span>
                        <span className="text-xs text-gray-500">({country.companiesCount})</span>
                      </div>
                  </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">لا توجد بلدان متاحة</div>
                )}
              </SelectContent>
            </Select>
            {errors.countryId && (
              <p className="text-sm text-red-600 mt-1">{errors.countryId}</p>
            )}
          </div>

          <div>
            <Label htmlFor="city">المدينة *</Label>
            <Select 
              value={formData.cityId} 
              onValueChange={(value) => handleInputChange('cityId', value)}
              disabled={!formData.countryId}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !formData.countryId 
                    ? "اختر البلد أولاً" 
                    : loadingCities 
                      ? "جاري تحميل المدن..." 
                      : "اختر المدينة"
                } />
              </SelectTrigger>
              <SelectContent>
                {!formData.countryId ? (
                  <div className="p-2 text-sm text-gray-500">اختر البلد أولاً</div>
                ) : loadingCities ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    <span className="text-sm">جاري التحميل...</span>
                  </div>
                ) : cities.length > 0 ? (
                  cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      <div className="flex items-center gap-2">
                        <span>{city.name}</span>
                        <span className="text-xs text-gray-500">({city.companiesCount})</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">لا توجد مدن متاحة لهذا البلد</div>
                )}
              </SelectContent>
            </Select>
            {errors.cityId && (
              <p className="text-sm text-red-600 mt-1">{errors.cityId}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="address">العنوان التفصيلي</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="الشارع، رقم البناء، المنطقة..."
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          معلومات التواصل
        </CardTitle>
        <CardDescription>
          أضف معلومات التواصل مع شركتك
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="phone">رقم الهاتف *</Label>
          <Input
            id="phone"
            type="tel"
            className={errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+963 11 1234567"
            required
          />
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">البريد الإلكتروني *</Label>
          <Input
            id="email"
            type="email"
            className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="info@company.com"
            required
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="website">الموقع الإلكتروني</Label>
          <Input
            id="website"
            type="url"
            className={errors.website ? 'border-red-500 focus-visible:ring-red-500' : ''}
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://www.company.com"
          />
          {errors.website && (
            <p className="text-sm text-red-600 mt-1">{errors.website}</p>
          )}
        </div>

        <div className="space-y-4">
          <Label>وسائل التواصل الاجتماعي (اختيارية)</Label>
          
          <div>
            <Label htmlFor="facebook" className="text-sm">Facebook</Label>
            <Input
              id="facebook"
              className={errors.facebook ? 'border-red-500 focus-visible:ring-red-500' : ''}
              value={formData.socialMediaLinks.facebook}
              onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
              placeholder="https://facebook.com/yourcompany"
            />
            {errors.facebook && (
              <p className="text-sm text-red-600 mt-1">{errors.facebook}</p>
            )}
          </div>

          <div>
            <Label htmlFor="instagram" className="text-sm">Instagram</Label>
            <Input
              id="instagram"
              className={errors.instagram ? 'border-red-500 focus-visible:ring-red-500' : ''}
              value={formData.socialMediaLinks.instagram}
              onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
              placeholder="https://instagram.com/yourcompany"
            />
            {errors.instagram && (
              <p className="text-sm text-red-600 mt-1">{errors.instagram}</p>
            )}
          </div>

          <div>
            <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
            <Input
              id="linkedin"
              className={errors.linkedin ? 'border-red-500 focus-visible:ring-red-500' : ''}
              value={formData.socialMediaLinks.linkedin}
              onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany"
            />
            {errors.linkedin && (
              <p className="text-sm text-red-600 mt-1">{errors.linkedin}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          تفاصيل الشركة
        </CardTitle>
        <CardDescription>
          معلومات إضافية عن شركتك
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="foundedYear">سنة التأسيس</Label>
            <Input
              id="foundedYear"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              className={errors.foundedYear ? 'border-red-500 focus-visible:ring-red-500' : ''}
              value={formData.foundedYear}
              onChange={(e) => handleInputChange('foundedYear', e.target.value)}
              placeholder="2020"
            />
            {errors.foundedYear && (
              <p className="text-sm text-red-600 mt-1">{errors.foundedYear}</p>
            )}
          </div>

          <div>
            <Label htmlFor="companySize">حجم الشركة</Label>
            <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر حجم شركتك" />
              </SelectTrigger>
              <SelectContent>
                {companySizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="services">الخدمات والمنتجات *</Label>
          <Textarea
            id="services"
            className={errors.services ? 'border-red-500 focus-visible:ring-red-500' : ''}
            value={formData.services}
            onChange={(e) => handleInputChange('services', e.target.value)}
            placeholder="اكتب تفصيلاً عن الخدمات والمنتجات التي تقدمها شركتك..."
            rows={5}
            required
          />
          {errors.services && (
            <p className="text-sm text-red-600 mt-1">{errors.services}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            صف بالتفصيل ما تقدمه شركتك من خدمات أو منتجات. هذه المعلومات ستساعد العملاء في العثور عليك.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          معلومات المسؤول
        </CardTitle>
        <CardDescription>
          معلومات الشخص المسؤول عن الشركة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="ownerName">اسم المسؤول *</Label>
          <Input
            id="ownerName"
            className={errors.ownerName ? 'border-red-500 focus-visible:ring-red-500' : ''}
            value={formData.ownerName}
            onChange={(e) => handleInputChange('ownerName', e.target.value)}
            placeholder="الاسم الكامل للمسؤول"
            required
          />
          {errors.ownerName && (
            <p className="text-sm text-red-600 mt-1">{errors.ownerName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="ownerEmail">البريد الإلكتروني للمسؤول *</Label>
          <Input
            id="ownerEmail"
            type="email"
            className={errors.ownerEmail ? 'border-red-500 focus-visible:ring-red-500' : ''}
            value={formData.ownerEmail}
            onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
            placeholder="manager@company.com"
            required
          />
          {errors.ownerEmail && (
            <p className="text-sm text-red-600 mt-1">{errors.ownerEmail}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            سنستخدم هذا البريد للتواصل معك بخصوص حساب شركتك
          </p>
        </div>

        <div>
          <Label htmlFor="ownerPhone">رقم هاتف المسؤول *</Label>
          <Input
            id="ownerPhone"
            type="tel"
            className={errors.ownerPhone ? 'border-red-500 focus-visible:ring-red-500' : ''}
            value={formData.ownerPhone}
            onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
            placeholder="+963 999 123456"
            required
          />
          {errors.ownerPhone && (
            <p className="text-sm text-red-600 mt-1">{errors.ownerPhone}</p>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">ملاحظة مهمة</h4>
              <p className="text-sm text-yellow-700">
                سيقوم فريقنا بمراجعة المعلومات المقدمة والتحقق من صحتها قبل نشر الشركة في الدليل. 
                قد نطلب وثائق إضافية للتأكد من شرعية النشاط التجاري.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">الفوائد التي ستحصل عليها:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• ظهور شركتك في نتائج البحث</li>
            <li>• إمكانية استقبال المراجعات والتقييمات</li>
            <li>• إحصائيات مفصلة عن زوار صفحة شركتك</li>
            <li>• إمكانية التواصل المباشر مع العملاء</li>
            <li>• تحديث معلومات الشركة في أي وقت</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">أضف شركتك إلى توصية</h1>
        <p className="text-xl text-gray-600 mb-2">
          انضم إلى آلاف الشركات واصل إلى عملاء جدد في العالم العربي
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary">مجاني تماماً</Badge>
          <Badge variant="secondary">سهل الاستخدام</Badge>
          <Badge variant="secondary">نتائج سريعة</Badge>
        </div>
        
        {/* معلومات إضافية */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            متاح: <span className="font-semibold text-blue-600">{countries.length}</span> بلد • 
            <span className="font-semibold text-green-600 mx-1">{categories.length}</span> فئة • 
            <span className="font-semibold text-purple-600">مراجعة سريعة</span>
          </p>
        </div>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            السابق
          </Button>

          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && (
                    !formData.companyName || !formData.description || formData.description.trim().length < 10 ||
                    !formData.categoryId || !formData.countryId || !formData.cityId
                  )) ||
                  (currentStep === 2 && (!formData.phone || !formData.email)) ||
                  (currentStep === 3 && (!formData.services || formData.services.trim().length < 10))
                }
              >
                التالي
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={
                  !formData.ownerName || !formData.ownerEmail || !formData.ownerPhone || isSubmitting
                }
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}


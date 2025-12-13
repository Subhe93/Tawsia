'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface City {
  id: string;
  name: string;
  slug: string;
  countryId: string;
  country: {
    name: string;
    code: string;
  };
}

interface SubArea {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  cityId: string;
  countryId: string;
}

interface SubAreaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  subArea?: SubArea | null;
  cities: City[];
}

export function SubAreaForm({ isOpen, onClose, onSubmit, subArea, cities }: SubAreaFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    cityId: '',
    countryId: '',
  });
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (subArea) {
      setFormData({
        name: subArea.name,
        slug: subArea.slug,
        description: subArea.description || '',
        image: subArea.image || '',
        cityId: subArea.cityId,
        countryId: subArea.countryId,
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: '',
        cityId: '',
        countryId: '',
      });
    }
  }, [subArea]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const handleCityChange = (cityId: string) => {
    const selectedCity = cities.find(city => city.id === cityId);
    setFormData(prev => ({
      ...prev,
      cityId,
      countryId: selectedCity?.countryId || '',
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('نوع الملف غير مدعوم. الأنواع المدعومة: JPG, PNG, WebP, GIF');
      return;
    }

    // التحقق من حجم الملف (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('حجم الملف كبير جداً. الحد الأقصى 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, image: data.url }));
        toast.success('تم رفع الصورة بنجاح');
      } else {
        const error = await response.json();
        toast.error(error.error || 'خطأ في رفع الصورة');
      }
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      toast.error('خطأ في رفع الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug || !formData.cityId) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const url = subArea ? `/api/admin/sub-areas/${subArea.id}` : '/api/admin/sub-areas';
      const method = subArea ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(subArea ? 'تم تحديث المنطقة الفرعية بنجاح' : 'تم إنشاء المنطقة الفرعية بنجاح');
        onSubmit();
      } else {
        const error = await response.json();
        toast.error(error.error || 'حدث خطأ أثناء الحفظ');
      }
    } catch (error) {
      console.error('خطأ في حفظ المنطقة الفرعية:', error);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {subArea ? 'تعديل المنطقة الفرعية' : 'إضافة منطقة فرعية جديدة'}
          </DialogTitle>
          <DialogDescription>
            {subArea ? 'قم بتعديل بيانات المنطقة الفرعية' : 'أضف منطقة فرعية جديدة للمدينة'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">اسم المنطقة الفرعية *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="مثال: وسط البلد"
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">معرف المنطقة الفرعية *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="مثال: downtown"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">المدينة *</Label>
              <Select value={formData.cityId} onValueChange={handleCityChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name} - {city.country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="image">صورة المنطقة الفرعية</Label>
              <div className="space-y-2">
                {formData.image ? (
                  <div className="relative">
                    <img
                      src={formData.image}
                      alt="صورة المنطقة الفرعية"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 left-2"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">اسحب وأفلت الصورة هنا أو</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Upload className="w-4 h-4 ml-2 animate-spin" />
                          جاري الرفع...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 ml-2" />
                          اختر صورة
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="أو أدخل رابط الصورة مباشرة"
                  type="text"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="وصف مختصر عن المنطقة الفرعية..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري الحفظ...' : (subArea ? 'تحديث' : 'إضافة')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState } from 'react';
import { Award, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Company {
  id: string;
  name: string;
}

interface AdminAddAwardFormProps {
  companies: Company[];
  onUpdate?: () => void;
}

export function AdminAddAwardForm({ companies, onUpdate }: AdminAddAwardFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    companyId: '',
    title: '',
    description: '',
    year: '',
    awardType: 'CERTIFICATE' as 'GOLD' | 'SILVER' | 'BRONZE' | 'CERTIFICATE',
    issuer: '',
    imageUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/awards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          year: formData.year ? parseInt(formData.year) : null
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'تم إضافة الجائزة بنجاح',
          description: 'تم إضافة الجائزة إلى الشركة المحددة',
        });
        setOpen(false);
        setFormData({
          companyId: '',
          title: '',
          description: '',
          year: '',
          awardType: 'CERTIFICATE',
          issuer: '',
          imageUrl: ''
        });
        // Refresh the page to show new award
        if (onUpdate) {
          onUpdate();
        } else {
          window.location.reload();
        }
      } else {
        toast({
          title: 'خطأ في إضافة الجائزة',
          description: result.error?.message || 'حدث خطأ أثناء إضافة الجائزة',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('خطأ في إضافة الجائزة:', error);
      toast({
        title: 'خطأ في إضافة الجائزة',
        description: 'حدث خطأ أثناء إضافة الجائزة',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 ml-2" />
          إضافة جائزة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Award className="h-5 w-5 ml-2" />
            إضافة جائزة أو شهادة جديدة
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyId">الشركة *</Label>
            <Select
              value={formData.companyId}
              onValueChange={(value) => handleInputChange('companyId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الشركة" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الجائزة *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="مثال: أفضل شركة تقنية"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="awardType">نوع الجائزة *</Label>
              <Select
                value={formData.awardType}
                onValueChange={(value) => handleInputChange('awardType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOLD">جائزة ذهبية</SelectItem>
                  <SelectItem value="SILVER">جائزة فضية</SelectItem>
                  <SelectItem value="BRONZE">جائزة برونزية</SelectItem>
                  <SelectItem value="CERTIFICATE">شهادة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف الجائزة</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="وصف مختصر عن الجائزة والشروط التي تم الحصول عليها..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issuer">الجهة المانحة</Label>
              <Input
                id="issuer"
                value={formData.issuer}
                onChange={(e) => handleInputChange('issuer', e.target.value)}
                placeholder="مثال: وزارة التجارة"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">سنة الجائزة</Label>
              <Input
                id="year"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                placeholder="2024"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">رابط صورة الجائزة</Label>
            <div className="flex space-x-2 space-x-reverse">
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder="https://example.com/award-image.jpg"
              />
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading || !formData.companyId}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  جاري الإضافة...
                </div>
              ) : (
                <>
                  <Award className="h-4 w-4 ml-2" />
                  إضافة الجائزة
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

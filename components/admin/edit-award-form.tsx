'use client';

import { useState } from 'react';
import { Award, Edit, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Award {
  id: string;
  title: string;
  description?: string | null;
  year?: number | null;
  awardType: 'GOLD' | 'SILVER' | 'BRONZE' | 'CERTIFICATE';
  issuer?: string | null;
  imageUrl?: string | null;
  company: {
    id: string;
    name: string;
  };
}

interface EditAwardFormProps {
  award: Award;
  onUpdate: () => void;
}

export function EditAwardForm({ award, onUpdate }: EditAwardFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: award.title,
    description: award.description || '',
    year: award.year?.toString() || '',
    awardType: award.awardType,
    issuer: award.issuer || '',
    imageUrl: award.imageUrl || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/awards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: award.id,
          ...formData,
          year: formData.year ? parseInt(formData.year) : null
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'تم تحديث الجائزة بنجاح',
          description: 'تم تحديث الجائزة بنجاح',
        });
        setOpen(false);
        onUpdate();
      } else {
        toast({
          title: 'خطأ في تحديث الجائزة',
          description: result.error?.message || 'حدث خطأ أثناء تحديث الجائزة',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('خطأ في تحديث الجائزة:', error);
      toast({
        title: 'خطأ في تحديث الجائزة',
        description: 'حدث خطأ أثناء تحديث الجائزة',
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
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Award className="h-5 w-5 ml-2" />
            تعديل الجائزة
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
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
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  جاري التحديث...
                </div>
              ) : (
                <>
                  <Award className="h-4 w-4 ml-2" />
                  تحديث الجائزة
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

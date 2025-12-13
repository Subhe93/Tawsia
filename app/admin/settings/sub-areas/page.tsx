'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { SubAreaForm } from '@/components/admin/sub-area-form';

interface SubArea {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  companiesCount: number;
  cityId: string;
  countryId: string;
  city: {
    id: string;
    name: string;
    slug: string;
  };
  country: {
    id: string;
    name: string;
    code: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface City {
  id: string;
  name: string;
  slug: string;
  country: {
    name: string;
    code: string;
  };
}

export default function SubAreasPage() {
  const [subAreas, setSubAreas] = useState<SubArea[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubArea, setEditingSubArea] = useState<SubArea | null>(null);

  useEffect(() => {
    fetchSubAreas();
    fetchCities();
  }, []);

  // Debug: Log cities when they change
  useEffect(() => {
    console.log('Cities updated:', cities);
  }, [cities]);

  const fetchSubAreas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCity && selectedCity !== 'all') params.append('cityId', selectedCity);

      const response = await fetch(`/api/admin/sub-areas?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubAreas(data.data || []);
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error('غير مصرح لك بالوصول. يرجى تسجيل الدخول كمدير');
        } else {
          toast.error(errorData.error || 'خطأ في جلب المناطق الفرعية');
        }
      }
    } catch (error) {
      console.error('خطأ في جلب المناطق الفرعية:', error);
      toast.error('خطأ في جلب المناطق الفرعية');
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      console.log('Fetching cities...');
      const response = await fetch('/api/admin/cities', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Cities response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Cities data:', data);
        setCities(data.cities || []);
      } else {
        const errorData = await response.json();
        console.error('خطأ في جلب المدن:', response.status, errorData);
        if (response.status === 401) {
          toast.error('غير مصرح لك بالوصول. يرجى تسجيل الدخول كمدير');
        } else {
          toast.error(errorData.error || 'خطأ في جلب المدن');
        }
      }
    } catch (error) {
      console.error('خطأ في جلب المدن:', error);
      toast.error('خطأ في جلب المدن');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المنطقة الفرعية؟')) return;

    try {
      const response = await fetch(`/api/admin/sub-areas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('تم حذف المنطقة الفرعية بنجاح');
        fetchSubAreas();
      } else {
        const error = await response.json();
        toast.error(error.error || 'خطأ في حذف المنطقة الفرعية');
      }
    } catch (error) {
      console.error('خطأ في حذف المنطقة الفرعية:', error);
      toast.error('خطأ في حذف المنطقة الفرعية');
    }
  };

  const handleEdit = (subArea: SubArea) => {
    setEditingSubArea(subArea);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSubArea(null);
  };

  const handleFormSubmit = () => {
    fetchSubAreas();
    handleFormClose();
  };

  useEffect(() => {
    fetchSubAreas();
  }, [searchTerm, selectedCity]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة المناطق الفرعية</h1>
          <p className="text-gray-600">إدارة المناطق الفرعية في المدن</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          إضافة منطقة فرعية
        </Button>
      </div>

      {/* فلاتر البحث */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="البحث في المناطق الفرعية..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-64">
              <Label htmlFor="city">المدينة</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder={cities.length > 0 ? "اختر المدينة" : "جاري تحميل المدن..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المدن</SelectItem>
                  {cities.length > 0 ? (
                    cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name} - {city.country.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      جاري تحميل المدن...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول المناطق الفرعية */}
      <Card>
        <CardHeader>
          <CardTitle>المناطق الفرعية</CardTitle>
          <CardDescription>
            إجمالي المناطق الفرعية: {subAreas.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : subAreas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد مناطق فرعية
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>المدينة</TableHead>
                  <TableHead>البلد</TableHead>
                  <TableHead>عدد الشركات</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subAreas.map((subArea) => (
                  <TableRow key={subArea.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{subArea.name}</div>
                          <div className="text-sm text-gray-500">{subArea.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{subArea.city.name}</TableCell>
                    <TableCell>{subArea.country.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {subArea.companiesCount} شركة
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subArea.isActive ? 'default' : 'destructive'}>
                        {subArea.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(subArea)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(subArea.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* نموذج إضافة/تعديل المنطقة الفرعية */}
      <SubAreaForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        subArea={editingSubArea ? {
          id: editingSubArea.id,
          name: editingSubArea.name,
          slug: editingSubArea.slug,
          description: editingSubArea.description,
          image: editingSubArea.image,
          cityId: editingSubArea.cityId,
          countryId: editingSubArea.countryId,
        } : null}
        cities={cities}
      />
    </div>
  );
}

/**
 * صفحة إدارة السايت ماب
 * /admin/sitemap-manager
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Plus, FileText, TrendingUp, Database, Star, Calendar, MapPin, Tag, Shuffle, Eye, Search, Zap, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// أنواع البيانات
interface Stats {
  totalCompanies: number;
  companiesInSitemap: number;
  companiesRemaining: number;
  totalUrls: number;
  totalFiles: number;
  filesDetails: any[];
  distribution: any;
  lastBatch: any;
}

interface AddBatchForm {
  method: string;
  limit: number;
  cityId?: string;
  categoryId?: string;
}

interface PreviewCompany {
  id: string;
  name: string;
  slug: string;
  rating: number;
  reviewsCount: number;
}

export default function SitemapManagerPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);
  const [addingBatch, setAddingBatch] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewCompany[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  const [form, setForm] = useState<AddBatchForm>({
    method: 'TOP_RATED',
    limit: 50,
  });

  // جلب الإحصائيات
  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/sitemap/stats');
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
      } else {
        toast.error('فشل في جلب الإحصائيات');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  // جلب سجل الدفعات
  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/admin/sitemap/batches');
      const data = await res.json();

      if (data.success) {
        setBatches(data.data.batches);
      }
    } catch (error) {
      console.error('خطأ في جلب الدفعات:', error);
    }
  };

  // معاينة الشركات
  const handlePreview = async () => {
    if (form.limit < 1 || form.limit > 500) {
      toast.error('الحد يجب أن يكون بين 1 و 500');
      return;
    }

    try {
      setPreviewing(true);
      const res = await fetch('/api/admin/sitemap/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setPreviewData(data.data.companies || []);
        const total = data.data.total || data.data.count || data.data.companies?.length || 0;
        toast.success(`تم العثور على ${total} شركة`);
      } else {
        toast.error(data.error || 'فشل في المعاينة');
        console.error('خطأ في المعاينة:', data);
      }
    } catch (error) {
      toast.error('خطأ في المعاينة');
    } finally {
      setPreviewing(false);
    }
  };

  // إضافة دفعة
  const handleAddBatch = async () => {
    if (form.limit < 1 || form.limit > 500) {
      toast.error('الحد يجب أن يكون بين 1 و 500');
      return;
    }

    if (!previewData.length) {
      toast.error('قم بالمعاينة أولاً');
      return;
    }

    try {
      setAddingBatch(true);
      const res = await fetch('/api/admin/sitemap/add-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          companyIds: previewData.map(c => c.id),
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.data.message);
        setPreviewData([]);
        fetchStats();
        fetchBatches();
      } else {
        toast.error(data.error || 'فشل في الإضافة');
      }
    } catch (error) {
      toast.error('خطأ في الإضافة');
    } finally {
      setAddingBatch(false);
    }
  };

  // إعادة بناء السايت ماب
  const handleRebuild = async (mode: 'all' | 'modified' = 'modified') => {
    try {
      setRebuilding(true);
      const res = await fetch('/api/admin/sitemap/rebuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.data.message);
        fetchStats();
      } else {
        toast.error('فشل في إعادة البناء');
      }
    } catch (error) {
      toast.error('خطأ في إعادة البناء');
    } finally {
      setRebuilding(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchBatches();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 إدارة السايت ماب</h1>
          <p className="text-gray-500 mt-1">إضافة وإدارة الشركات في السايت ماب</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchStats()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
          <Button
            onClick={() => handleRebuild('modified')}
            variant="default"
            disabled={rebuilding}
          >
            {rebuilding ? (
              <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 ml-2" />
            )}
            إعادة بناء
          </Button>
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>إجمالي الشركات</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalCompanies?.toLocaleString() || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              <Database className="h-4 w-4 inline ml-1" />
              في Database
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>في السايت ماب</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {stats?.companiesInSitemap?.toLocaleString() || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="success">✓ مؤرشفة</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>المتبقية</CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {stats?.companiesRemaining?.toLocaleString() || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">⏳ غير مؤرشفة</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>إجمالي الروابط</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalUrls?.toLocaleString() || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              {stats?.totalFiles || 0} ملفات
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="add" className="w-full">
        <TabsList>
          <TabsTrigger value="add">
            <Plus className="h-4 w-4 ml-2" />
            إضافة شركات
          </TabsTrigger>
          <TabsTrigger value="generator">
            <Zap className="h-4 w-4 ml-2 text-yellow-500" />
            توليد تفرعات
          </TabsTrigger>
          {/* <TabsTrigger value="browser">
            <Search className="h-4 w-4 ml-2 text-blue-500" />
            تصفح المحتوى
          </TabsTrigger> */}
          <TabsTrigger value="files">
            <FileText className="h-4 w-4 ml-2" />
            الملفات
          </TabsTrigger>
          <TabsTrigger value="history">
            <TrendingUp className="h-4 w-4 ml-2" />
            السجل
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إضافة شركات جديدة</CardTitle>
              <CardDescription>
                اختر طريقة الإضافة وعدد الشركات المطلوب
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* طريقة الإضافة */}
              <div className="space-y-2">
                <Label>طريقة الاختيار</Label>
                <Select
                  value={form.method}
                  onValueChange={(value) => setForm({ ...form, method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طريقة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TOP_RATED">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 ml-2 text-yellow-500" />
                        الأعلى تقييماً
                      </div>
                    </SelectItem>
                    <SelectItem value="NEWEST_FIRST">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 ml-2 text-blue-500" />
                        الأحدث أولاً
                      </div>
                    </SelectItem>
                    <SelectItem value="OLDEST_FIRST">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 ml-2 text-gray-500" />
                        الأقدم أولاً
                      </div>
                    </SelectItem>
                    <SelectItem value="RANDOM">
                      <div className="flex items-center">
                        <Shuffle className="h-4 w-4 ml-2 text-purple-500" />
                        عشوائي
                      </div>
                    </SelectItem>
                    <SelectItem value="BY_CITY">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 ml-2 text-green-500" />
                        حسب المدينة
                      </div>
                    </SelectItem>
                    <SelectItem value="BY_CATEGORY">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 ml-2 text-orange-500" />
                        حسب الفئة
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {form.method === 'TOP_RATED' && '✨ سيتم إضافة الشركات ذات التقييم الأعلى'}
                  {form.method === 'NEWEST_FIRST' && '🆕 سيتم إضافة أحدث الشركات المسجلة'}
                  {form.method === 'OLDEST_FIRST' && '📅 سيتم إضافة أقدم الشركات المسجلة'}
                  {form.method === 'RANDOM' && '🎲 سيتم اختيار الشركات عشوائياً'}
                  {form.method === 'BY_CITY' && '🏙️ إضافة جميع شركات مدينة معينة'}
                  {form.method === 'BY_CATEGORY' && '🏷️ إضافة جميع شركات فئة معينة'}
                </p>
              </div>

              {/* عدد الشركات */}
              <div className="space-y-2">
                <Label>عدد الشركات</Label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={form.limit}
                  onChange={(e) => setForm({ ...form, limit: parseInt(e.target.value) || 50 })}
                  placeholder="50"
                />
                <p className="text-xs text-gray-500">
                  الحد الأدنى: 1 | الحد الأقصى: 500 شركة
                </p>
              </div>

              {/* الفلاتر الإضافية */}
              {form.method === 'BY_CITY' && (
                <div className="space-y-2">
                  <Label>المدينة (اختياري)</Label>
                  <Input
                    placeholder="ID المدينة"
                    value={form.cityId || ''}
                    onChange={(e) => setForm({ ...form, cityId: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">
                    اترك فارغاً لإضافة جميع المدن
                  </p>
                </div>
              )}

              {form.method === 'BY_CATEGORY' && (
                <div className="space-y-2">
                  <Label>الفئة (اختياري)</Label>
                  <Input
                    placeholder="ID الفئة"
                    value={form.categoryId || ''}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">
                    اترك فارغاً لإضافة جميع الفئات
                  </p>
                </div>
              )}

              {/* الأزرار */}
              <div className="flex gap-3">
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  disabled={previewing || addingBatch}
                  className="flex-1"
                >
                  {previewing ? (
                    <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4 ml-2" />
                  )}
                  معاينة
                </Button>
                <Button
                  onClick={handleAddBatch}
                  disabled={addingBatch || !previewData.length}
                  className="flex-1"
                >
                  {addingBatch ? (
                    <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 ml-2" />
                  )}
                  إضافة للسايت ماب
                </Button>
              </div>

              {/* المعاينة */}
              {previewData.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">المعاينة ({previewData.length} شركة)</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewData([])}
                    >
                      مسح
                    </Button>
                  </div>
                  <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-3">
                    {previewData.slice(0, 10).map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{company.name}</p>
                          <p className="text-xs text-gray-500">/{company.slug}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 ml-1 text-yellow-500" />
                            {company.rating?.toFixed(1) || '0.0'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {company.reviewsCount || 0} مراجعة
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {previewData.length > 10 && (
                      <p className="text-center text-sm text-gray-500 py-2">
                        + {previewData.length - 10} شركة أخرى...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generator" className="space-y-4">
          <SitemapGenerator />
        </TabsContent>

        {/* <TabsContent value="browser" className="space-y-4">
          <SitemapBrowser />
        </TabsContent> */}

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>ملفات السايت ماب</CardTitle>
              <CardDescription>
                {stats?.totalFiles || 0} ملفات نشطة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.filesDetails?.map((file: any) => (
                  <div
                    key={file.fileName}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{file.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {file.urlsCount?.toLocaleString()} / {file.maxCapacity?.toLocaleString()} URLs
                      </p>
                    </div>
                    <div className="text-left">
                      <Badge variant={file.isFull ? 'destructive' : 'default'}>
                        {file.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>سجل الإضافات</CardTitle>
              <CardDescription>
                تاريخ جميع الدفعات المضافة ({batches.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {batches.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {batches.map((batch) => (
                    <div
                      key={batch.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              الدفعة #{batch.batchNumber}
                            </h3>
                            <Badge variant="secondary">
                              {batch.companiesCount} شركة
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            الطريقة: {getMethodLabel(batch.method)}
                          </p>
                          {batch.addedBy && (
                            <p className="text-xs text-gray-500">
                              بواسطة: {batch.addedBy}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(batch.addedAt).toLocaleString('ar-SA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {batch.affectedFiles && batch.affectedFiles.length > 0 && (
                          <div className="text-left">
                            <p className="text-xs text-gray-500 mb-1">الملفات المتأثرة:</p>
                            <div className="flex flex-col gap-1">
                              {batch.affectedFiles.map((file: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {file}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {batch.notes && (
                        <p className="text-sm text-gray-600 mt-2 p-2 bg-white rounded border">
                          📝 {batch.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>لا توجد دفعات بعد</p>
                  <p className="text-sm mt-2">ابدأ بإضافة أول دفعة من تبويب "إضافة شركات"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// مكون مولد التفرعات
function SitemapGenerator() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // جلب الفئات
  useEffect(() => {
    fetch('/api/admin/categories?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories);
      });
  }, []);

  const handleAnalyze = async () => {
    if (!selectedCategory) {
      toast.error('الرجاء اختيار فئة');
      return;
    }

    try {
      setAnalyzing(true);
      const res = await fetch('/api/admin/sitemap/branches/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CATEGORY', entityId: selectedCategory }),
      });
      const data = await res.json();

      if (data.success) {
        setAnalysisResult(data.data);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('خطأ في التحليل');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await fetch('/api/admin/sitemap/branches/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CATEGORY', entityId: selectedCategory }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.data.message);
        setAnalysisResult(null);
        setSelectedCategory('');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('خطأ في التوليد');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>مولد التفرعات الذكي</CardTitle>
        <CardDescription>
          توليد روابط عميقة (مثل الفئة + الدولة + المدينة) لتعزيز SEO
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label>الفئة المستهدفة</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="اختر فئة لتوليد تفرعاتها" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat.slug})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={analyzing || !selectedCategory}
            className="mb-[2px]"
          >
            {analyzing ? <RefreshCw className="h-4 w-4 animate-spin ml-2" /> : <Search className="h-4 w-4 ml-2" />}
            تحليل الفجوة
          </Button>
        </div>

        {analysisResult && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4 border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white rounded border">
                <p className="text-gray-500 text-xs">إجمالي الروابط المحتملة</p>
                <p className="text-xl font-bold">{analysisResult.total}</p>
              </div>
              <div className="p-3 bg-white rounded border">
                <p className="text-gray-500 text-xs text-green-600">روابط موجودة</p>
                <p className="text-xl font-bold text-green-600">{analysisResult.existing}</p>
              </div>
              <div className="p-3 bg-white rounded border">
                <p className="text-gray-500 text-xs text-blue-600">روابط جديدة ستضاف</p>
                <p className="text-xl font-bold text-blue-600">{analysisResult.new}</p>
              </div>
            </div>

            {analysisResult.new > 0 ? (
              <>
                <div>
                  <p className="text-sm font-semibold mb-2">عينة من الروابط الجديدة:</p>
                  <ul className="text-xs text-gray-600 space-y-1 bg-white p-3 rounded border font-mono dir-ltr text-left">
                    {analysisResult.sample.map((url: string) => (
                      <li key={url} className="truncate">{url}</li>
                    ))}
                    {analysisResult.new > 5 && <li>...</li>}
                  </ul>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {generating ? 'جاري التوليد...' : `توليد ${analysisResult.new} رابط جديد`}
                </Button>
              </>
            ) : (
              <div className="text-center py-4 text-green-600 font-medium">
                ✅ جميع الروابط لهذه الفئة موجودة بالفعل!
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// مكون متصفح المحتوى المطور
function SitemapBrowser() {
  const [entries, setEntries] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFile, setSelectedFile] = useState<string>('ALL'); // الملف المختار
  const [filters, setFilters] = useState({
    type: 'ALL',
    search: '',
  });

  // جلب الملفات
  useEffect(() => {
    fetch('/api/admin/sitemap/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) setFiles(data.data.filesDetails || []);
      });
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        type: filters.type,
        search: filters.search,
        sitemapFile: selectedFile, // إرسال الملف المختار
      });

      const res = await fetch(`/api/admin/sitemap/entries?${params}`);
      const data = await res.json();

      if (data.success) {
        setEntries(data.data.entries);
        setTotalPages(data.data.pagination.pages);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEntries();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, filters, selectedFile]);

  return (
    <div className="space-y-6">
      {/* 1. قسم معرض الملفات (Files Gallery) */}
      <Card className="bg-slate-50 border-none shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">📂 ملفات السايت ماب</CardTitle>
          <CardDescription>اختر ملفاً لعرض محتوياته</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent px-1">
            {/* بطاقة "كل الملفات" */}
            <div
              onClick={() => { setSelectedFile('ALL'); setPage(1); }}
              className={`min-w-[160px] p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedFile === 'ALL'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-white bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Database className={`h-5 w-5 ${selectedFile === 'ALL' ? 'text-blue-600' : 'text-gray-400'}`} />
                {selectedFile === 'ALL' && <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />}
              </div>
              <p className="font-semibold text-sm">كل الملفات</p>
              <p className="text-xs text-gray-500 mt-1">عرض شامل للروابط</p>
            </div>

            {/* بطاقات الملفات الفعلية */}
            {files.map((file) => {
              const isSelected = selectedFile === file.fileName.replace('sitemap-', '').replace('.xml', '');
              const percentage = file.percentage || 0;

              return (
                <div
                  key={file.fileName}
                  onClick={() => {
                    setSelectedFile(file.fileName.replace('sitemap-', '').replace('.xml', ''));
                    setPage(1);
                  }}
                  className={`min-w-[180px] p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-white bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    {/* أيقونة حسب النوع */}
                    {file.fileName.includes('companies') ? (
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Database className="h-4 w-4 text-purple-600" />
                      </div>
                    ) : file.fileName.includes('categories') ? (
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <Tag className="h-4 w-4 text-orange-600" />
                      </div>
                    ) : file.fileName.includes('locations') ? (
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-gray-100 rounded-lg">
                        <FileText className="h-4 w-4 text-gray-600" />
                      </div>
                    )}

                    <Badge variant={file.isFull ? 'destructive' : 'secondary'} className="text-[10px] h-5">
                      {file.isFull ? 'ممتلئ' : 'نشط'}
                    </Badge>
                  </div>

                  <p className="font-medium text-sm truncate dir-ltr text-right mb-1" title={file.fileName}>
                    {file.fileName}
                  </p>

                  <div className="flex items-end justify-between text-xs text-gray-500 mb-2">
                    <span>{file.urlsCount?.toLocaleString()} رابط</span>
                    <span>{percentage}%</span>
                  </div>

                  {/* شريط التقدم */}
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${file.isFull ? 'bg-red-500' : 'bg-green-500'
                        }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. الجدول والفلاتر */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>محتوى: {selectedFile === 'ALL' ? 'الكل' : selectedFile}</CardTitle>
              <CardDescription>
                عرض {filters.search ? 'نتائج البحث' : 'الروابط'} في {selectedFile === 'ALL' ? 'جميع الملفات' : 'الملف المحدد'}
              </CardDescription>
            </div>
            {selectedFile !== 'ALL' && (
              <Button variant="outline" size="sm" onClick={() => window.open(`https://twsia.com/sitemap-${selectedFile}.xml`, '_blank')}>
                <ExternalLink className="h-4 w-4 ml-2" />
                فتح الملف XML
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* الفلاتر */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="ابحث في الرابط..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="w-full"
              />
            </div>
            <Select
              value={filters.type}
              onValueChange={(val) => setFilters(prev => ({ ...prev, type: val, page: 1 }))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">الكل</SelectItem>
                <SelectItem value="STATIC">صفحات ثابتة</SelectItem>
                <SelectItem value="COMPANY">شركات</SelectItem>
                <SelectItem value="COUNTRY">دول</SelectItem>
                <SelectItem value="CITY">مدن</SelectItem>
                <SelectItem value="SUBAREA">مناطق</SelectItem>
                <SelectItem value="CATEGORY">فئات رئيسية</SelectItem>
                <SelectItem value="CATEGORY_SUB">فئات فرعية</SelectItem>
                <SelectItem value="COUNTRY_CATEGORY">دولة + فئة</SelectItem>
                <SelectItem value="COUNTRY_CATEGORY_SUB">دولة + فئة + فرعية</SelectItem>
                <SelectItem value="CITY_CATEGORY">مدينة + فئة</SelectItem>
                <SelectItem value="CITY_CATEGORY_SUB">مدينة + فئة + فرعية</SelectItem>
                <SelectItem value="SUBAREA_CATEGORY">منطقة + فئة</SelectItem>
                <SelectItem value="SUBAREA_CATEGORY_SUB">منطقة + فئة + فرعية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* الجدول */}
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm text-right">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 font-medium">الرابط</th>
                  <th className="p-3 font-medium">النوع</th>
                  <th className="p-3 font-medium">الأولوية</th>
                  <th className="p-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      جاري التحميل...
                    </td>
                  </tr>
                ) : entries.length > 0 ? (
                  entries.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs dir-ltr text-left max-w-[400px] truncate" title={entry.url}>
                        {entry.url.replace('https://twsia.com', '')}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{entry.entryType}</Badge>
                      </td>
                      <td className="p-3">{entry.priority}</td>
                      <td className="p-3">
                        <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      لا توجد نتائج
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* الترقيم */}
          <div className="flex items-center justify-between border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              السابق
            </Button>
            <span className="text-sm text-gray-500">
              صفحة {page} من {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              التالي
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// دالة مساعدة لترجمة أسماء الطرق
function getMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    'TOP_RATED': '⭐ الأعلى تقييماً',
    'NEWEST_FIRST': '🆕 الأحدث أولاً',
    'OLDEST_FIRST': '📅 الأقدم أولاً',
    'RANDOM': '🎲 عشوائي',
    'BY_CITY': '🏙️ حسب المدينة',
    'BY_CATEGORY': '🏷️ حسب الفئة',
    'BY_ID_RANGE': '🔢 حسب المدى',
    'MANUAL': '✋ يدوي',
    'AUTO_GENERATED': '🤖 تلقائي',
  };
  return labels[method] || method;
}

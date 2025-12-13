"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function NewRankingPagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // البيانات المرجعية
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [subAreas, setSubAreas] = useState<any[]>([]);

  // بيانات النموذج
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    description: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    countryId: "",
    cityId: "",
    subAreaId: "",
    categoryId: "",
    subCategoryId: "",
    limit: 10,
    sortBy: "rating",
    isActive: true,
  });

  // جلب البيانات المرجعية
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, categoriesRes] = await Promise.all([
          fetch("/api/countries"),
          fetch("/api/categories"),
        ]);

        const countriesData = await countriesRes.json();
        const categoriesData = await categoriesRes.json();

        setCountries(countriesData.countries || countriesData.data || []);
        setCategories(categoriesData.categories || categoriesData.data || []);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        alert("حدث خطأ في جلب البيانات الأساسية");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  // جلب المدن عند تغيير الدولة
  useEffect(() => {
    if (formData.countryId) {
      const country = countries.find((c) => c.id === formData.countryId);
      if (country) {
        fetch(`/api/cities?countryCode=${country.code}`)
          .then((res) => res.json())
          .then((data) => {
            const citiesList = data.cities || data.data || [];
            setCities(citiesList);
          })
          .catch((error) => {
            console.error("خطأ في جلب المدن:", error);
            setCities([]);
          });
      }
    } else {
      setCities([]);
    }
  }, [formData.countryId, countries]);

  // جلب المناطق الفرعية عند تغيير المدينة
  useEffect(() => {
    if (formData.cityId) {
      fetch(`/api/sub-areas?cityId=${formData.cityId}`)
        .then((res) => res.json())
        .then((data) => {
          const subAreasList = Array.isArray(data) ? data : (data.data || []);
          setSubAreas(subAreasList);
        })
        .catch((error) => {
          console.error("خطأ في جلب المناطق الفرعية:", error);
          setSubAreas([]);
        });
    } else {
      setSubAreas([]);
    }
  }, [formData.cityId]);

  // جلب الفئات الفرعية عند تغيير الفئة
  useEffect(() => {
    if (formData.categoryId) {
      fetch(`/api/subcategories?categoryId=${formData.categoryId}`)
        .then((res) => res.json())
        .then((data) => {
          const subCatsList = data.subCategories || data.data || [];
          setSubCategories(subCatsList);
        })
        .catch((error) => {
          console.error("خطأ في جلب الفئات الفرعية:", error);
          setSubCategories([]);
        });
    } else {
      setSubCategories([]);
    }
  }, [formData.categoryId]);

  // توليد slug تلقائي من العنوان
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };

  // حفظ الصفحة
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.slug || !formData.title) {
      alert("الرجاء إدخال الـ slug والعنوان");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/ranking-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          metaKeywords: formData.metaKeywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("تم إنشاء الصفحة بنجاح");
        router.push("/admin/ranking-pages");
      } else {
        alert("حدث خطأ: " + data.error.message);
      }
    } catch (error) {
      console.error("خطأ في حفظ الصفحة:", error);
      alert("حدث خطأ أثناء حفظ الصفحة");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/admin/ranking-pages"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            إضافة صفحة تصنيف جديدة
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            المعلومات الأساسية
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    title: e.target.value,
                    slug: generateSlug(e.target.value),
                  });
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="أفضل 10 مطاعم في دمشق"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary font-mono"
                placeholder="best-10-restaurants-damascus"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="وصف قصير للصفحة..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المحتوى
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="محتوى إضافي للصفحة (يدعم HTML)..."
            />
          </div>
        </div>

        {/* SEO Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            معلومات SEO
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={formData.metaTitle}
              onChange={(e) =>
                setFormData({ ...formData, metaTitle: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="سيتم استخدام العنوان إذا كان فارغاً"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) =>
                setFormData({ ...formData, metaDescription: e.target.value })
              }
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="سيتم استخدام الوصف إذا كان فارغاً"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الكلمات المفتاحية (مفصولة بفواصل)
            </label>
            <input
              type="text"
              value={formData.metaKeywords}
              onChange={(e) =>
                setFormData({ ...formData, metaKeywords: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="مطاعم, دمشق, سوريا, تقييمات"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">الفلاتر</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الدولة
              </label>
              <select
                value={formData.countryId}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    countryId: e.target.value,
                    cityId: "",
                    subAreaId: ""
                  });
                  setCities([]);
                  setSubAreas([]);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">الكل</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المدينة
              </label>
              <select
                value={formData.cityId}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    cityId: e.target.value,
                    subAreaId: ""
                  });
                  setSubAreas([]);
                }}
                disabled={!formData.countryId}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100"
              >
                <option value="">الكل</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المنطقة الفرعية
              </label>
              <select
                value={formData.subAreaId}
                onChange={(e) =>
                  setFormData({ ...formData, subAreaId: e.target.value })
                }
                disabled={!formData.cityId}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100"
              >
                <option value="">الكل</option>
                {subAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفئة
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    categoryId: e.target.value,
                    subCategoryId: ""
                  });
                  setSubCategories([]);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">الكل</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفئة الفرعية
              </label>
              <select
                value={formData.subCategoryId}
                onChange={(e) =>
                  setFormData({ ...formData, subCategoryId: e.target.value })
                }
                disabled={!formData.categoryId}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100"
              >
                <option value="">الكل</option>
                {subCategories.map((subCat) => (
                  <option key={subCat.id} value={subCat.id}>
                    {subCat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            إعدادات العرض
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد الشركات المعروضة
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    limit: parseInt(e.target.value) || 10,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الترتيب حسب
              </label>
              <select
                value={formData.sortBy}
                onChange={(e) =>
                  setFormData({ ...formData, sortBy: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="rating">التقييم</option>
                <option value="reviews">عدد المراجعات</option>
                <option value="newest">الأحدث</option>
                <option value="name">الاسم</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">نشطة</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/ranking-pages"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                حفظ الصفحة
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Zap, Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface Country {
  id: string;
  code: string;
  name: string;
}

interface City {
  id: string;
  slug: string;
  name: string;
}

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface SubCategory {
  id: string;
  slug: string;
  name: string;
}

interface SubArea {
  id: string;
  slug: string;
  name: string;
}

interface GenerationResult {
  total: number;
  created: number;
  skipped: number;
  errors: Array<{ combination: string; error: string }>;
  skippedReasons: Array<{ title: string; reason: string; details?: string }>;
  pages: Array<{ id: string; slug: string; title: string }>;
}

export default function GenerateRankingPagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  // البيانات
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [subAreas, setSubAreas] = useState<SubArea[]>([]);

  // الخيارات
  const [options, setOptions] = useState({
    countries: [] as string[],
    cities: [] as string[],
    categories: [] as string[],
    subCategories: [] as string[],
    subAreas: [] as string[],
    minCompanies: 5,
    skipExisting: true,
    includeSubCategories: true,
    includeSubAreas: true,
  });

  // جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب الدول
        const countriesRes = await fetch("/api/countries");
        const countriesData = await countriesRes.json();
        const countriesList = countriesData.countries || countriesData.data || [];
        setCountries(countriesList);

        // جلب الفئات
        const categoriesRes = await fetch("/api/categories");
        const categoriesData = await categoriesRes.json();
        const categoriesList = categoriesData.categories || categoriesData.data || [];
        setCategories(categoriesList);

        // جلب جميع المدن من جميع الدول
        const allCities: City[] = [];
        for (const country of countriesList) {
          try {
            const citiesRes = await fetch(`/api/cities?countryCode=${country.code}`);
            const citiesData = await citiesRes.json();
            const citiesList = citiesData.cities || citiesData.data || [];
            allCities.push(...citiesList);
          } catch (error) {
            console.error(`خطأ في جلب مدن ${country.name}:`, error);
          }
        }
        setCities(allCities);

        // جلب جميع المناطق الفرعية
        const subAreasRes = await fetch("/api/sub-areas");
        const subAreasData = await subAreasRes.json();
        // API يرجع البيانات مباشرة أو في data
        const subAreasList = Array.isArray(subAreasData) ? subAreasData : (subAreasData.data || []);
        setSubAreas(subAreasList);

        // جلب جميع الفئات الفرعية
        const allSubCategories: SubCategory[] = [];
        for (const category of categoriesList) {
          try {
            const subCatsRes = await fetch(`/api/subcategories?categoryId=${category.id}`);
            const subCatsData = await subCatsRes.json();
            const subCatsList = subCatsData.subCategories || subCatsData.data || [];
            allSubCategories.push(...subCatsList);
          } catch (error) {
            console.error(`خطأ في جلب الفئات الفرعية للفئة ${category.name}:`, error);
          }
        }
        setSubCategories(allSubCategories);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        alert("حدث خطأ في جلب البيانات. الرجاء المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // توليد الصفحات
  const handleGenerate = async () => {
    if (
      !confirm(
        "هل أنت متأكد من توليد الصفحات؟ قد تستغرق هذه العملية بعض الوقت."
      )
    ) {
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/ranking-pages/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        alert(
          `تم توليد ${data.data.created} صفحة بنجاح!\nتم تخطي ${data.data.skipped} صفحة.`
        );
      } else {
        alert("حدث خطأ أثناء توليد الصفحات: " + data.error.message);
      }
    } catch (error) {
      console.error("خطأ في توليد الصفحات:", error);
      alert("حدث خطأ أثناء توليد الصفحات");
    } finally {
      setGenerating(false);
    }
  };

  // تحديد/إلغاء تحديد الكل
  const toggleSelectAll = (
    type: "countries" | "cities" | "categories",
    allItems: any[]
  ) => {
    const key = type === "countries" ? "code" : "slug";
    const currentSelection = options[type];

    if (currentSelection.length === allItems.length) {
      setOptions({ ...options, [type]: [] });
    } else {
      setOptions({
        ...options,
        [type]: allItems.map((item) => item[key]),
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/admin/ranking-pages"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              توليد صفحات تلقائياً
            </h1>
          </div>
          <p className="text-gray-600">
            قم بتوليد صفحات تصنيف تلقائياً بناءً على البيانات الموجودة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Options Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Countries */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">الدول</h3>
              <button
                onClick={() => toggleSelectAll("countries", countries)}
                className="text-sm text-primary hover:text-primary-dark font-semibold"
              >
                {options.countries.length === countries.length
                  ? "إلغاء الكل"
                  : "تحديد الكل"}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {countries.map((country) => (
                <label
                  key={country.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={options.countries.includes(country.code)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setOptions({
                          ...options,
                          countries: [...options.countries, country.code],
                        });
                      } else {
                        setOptions({
                          ...options,
                          countries: options.countries.filter(
                            (c) => c !== country.code
                          ),
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">
                    {country.flag} {country.name}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {options.countries.length === 0
                ? "سيتم توليد صفحات لجميع الدول"
                : `تم تحديد ${options.countries.length} دولة`}
            </p>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">الفئات</h3>
              <button
                onClick={() => toggleSelectAll("categories", categories)}
                className="text-sm text-primary hover:text-primary-dark font-semibold"
              >
                {options.categories.length === categories.length
                  ? "إلغاء الكل"
                  : "تحديد الكل"}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={options.categories.includes(category.slug)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setOptions({
                          ...options,
                          categories: [...options.categories, category.slug],
                        });
                      } else {
                        setOptions({
                          ...options,
                          categories: options.categories.filter(
                            (c) => c !== category.slug
                          ),
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {options.categories.length === 0
                ? "سيتم توليد صفحات لجميع الفئات"
                : `تم تحديد ${options.categories.length} فئة`}
            </p>
          </div>

          {/* Cities */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">المدن</h3>
              <button
                onClick={() => toggleSelectAll("cities", cities)}
                className="text-sm text-primary hover:text-primary-dark font-semibold"
              >
                {options.cities.length === cities.length
                  ? "إلغاء الكل"
                  : "تحديد الكل"}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {cities.map((city) => (
                <label
                  key={city.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={options.cities.includes(city.slug)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setOptions({
                          ...options,
                          cities: [...options.cities, city.slug],
                        });
                      } else {
                        setOptions({
                          ...options,
                          cities: options.cities.filter((c) => c !== city.slug),
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">{city.name}</span>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {options.cities.length === 0
                ? "سيتم توليد صفحات لجميع المدن"
                : `تم تحديد ${options.cities.length} مدينة`}
            </p>
          </div>

          {/* Sub Categories */}
          {subCategories.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  الفئات الفرعية
                </h3>
                <button
                  onClick={() => {
                    if (options.subCategories.length === subCategories.length) {
                      setOptions({ ...options, subCategories: [] });
                    } else {
                      setOptions({
                        ...options,
                        subCategories: subCategories.map((sc) => sc.slug),
                      });
                    }
                  }}
                  className="text-sm text-primary hover:text-primary-dark font-semibold"
                >
                  {options.subCategories.length === subCategories.length
                    ? "إلغاء الكل"
                    : "تحديد الكل"}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {subCategories.map((subCat) => (
                  <label
                    key={subCat.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={options.subCategories.includes(subCat.slug)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setOptions({
                            ...options,
                            subCategories: [
                              ...options.subCategories,
                              subCat.slug,
                            ],
                          });
                        } else {
                          setOptions({
                            ...options,
                            subCategories: options.subCategories.filter(
                              (sc) => sc !== subCat.slug
                            ),
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{subCat.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {options.subCategories.length === 0
                  ? "سيتم توليد صفحات لجميع الفئات الفرعية (إذا كانت مفعلة)"
                  : `تم تحديد ${options.subCategories.length} فئة فرعية`}
              </p>
            </div>
          )}

          {/* Sub Areas */}
          {subAreas.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  المناطق الفرعية
                </h3>
                <button
                  onClick={() => {
                    if (options.subAreas.length === subAreas.length) {
                      setOptions({ ...options, subAreas: [] });
                    } else {
                      setOptions({
                        ...options,
                        subAreas: subAreas.map((sa) => sa.slug),
                      });
                    }
                  }}
                  className="text-sm text-primary hover:text-primary-dark font-semibold"
                >
                  {options.subAreas.length === subAreas.length
                    ? "إلغاء الكل"
                    : "تحديد الكل"}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {subAreas.map((subArea) => (
                  <label
                    key={subArea.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={options.subAreas.includes(subArea.slug)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setOptions({
                            ...options,
                            subAreas: [...options.subAreas, subArea.slug],
                          });
                        } else {
                          setOptions({
                            ...options,
                            subAreas: options.subAreas.filter(
                              (sa) => sa !== subArea.slug
                            ),
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      {subArea.name}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {options.subAreas.length === 0
                  ? "سيتم توليد صفحات لجميع المناطق الفرعية (إذا كانت مفعلة)"
                  : `تم تحديد ${options.subAreas.length} منطقة فرعية`}
              </p>
            </div>
          )}

          {/* Advanced Options */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              خيارات متقدمة
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحد الأدنى لعدد الشركات
              </label>
              <input
                type="number"
                min="1"
                value={options.minCompanies}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    minCompanies: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <p className="text-sm text-gray-500 mt-1">
                لن يتم إنشاء صفحات للتركيبات التي تحتوي على عدد شركات أقل من هذا
                الرقم
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.skipExisting}
                onChange={(e) =>
                  setOptions({ ...options, skipExisting: e.target.checked })
                }
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                تخطي الصفحات الموجودة مسبقاً
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeSubCategories}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    includeSubCategories: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                تضمين الفئات الفرعية
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeSubAreas}
                onChange={(e) =>
                  setOptions({ ...options, includeSubAreas: e.target.checked })
                }
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                تضمين المناطق الفرعية
              </span>
            </label>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-lg shadow-lg p-6 sticky top-6">
            <h3 className="text-xl font-bold mb-4">ملخص التوليد</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-white/20">
                <span>الدول</span>
                <span className="font-semibold">
                  {options.countries.length || "الكل"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/20">
                <span>المدن</span>
                <span className="font-semibold">
                  {options.cities.length || "الكل"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/20">
                <span>الفئات</span>
                <span className="font-semibold">
                  {options.categories.length || "الكل"}
                </span>
              </div>
              {options.includeSubCategories && (
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span>الفئات الفرعية</span>
                  <span className="font-semibold">
                    {options.subCategories.length || "الكل"}
                  </span>
                </div>
              )}
              {options.includeSubAreas && (
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span>المناطق الفرعية</span>
                  <span className="font-semibold">
                    {options.subAreas.length || "الكل"}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pb-3 border-b border-white/20">
                <span>الحد الأدنى للشركات</span>
                <span className="font-semibold">{options.minCompanies}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <p className="text-sm mb-2">⚠️ تنبيه:</p>
              <p className="text-sm opacity-90">
                قد تستغرق عملية التوليد عدة دقائق حسب عدد التركيبات المطلوبة.
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full mt-6 bg-white text-purple-700 hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500 py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري التوليد...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  بدء التوليد
                </>
              )}
            </button>
          </div>

          {/* Result Panel */}
          {result && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  نتيجة التوليد
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        تم الإنشاء
                      </p>
                      <p className="text-2xl font-bold text-blue-700">
                        {result.created}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                    <XCircle className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        تم التخطي
                      </p>
                      <p className="text-2xl font-bold text-amber-700">
                        {result.skipped}
                      </p>
                    </div>
                  </div>
                  {result.errors.length > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm font-semibold text-red-900">
                          أخطاء
                        </p>
                        <p className="text-2xl font-bold text-red-700">
                          {result.errors.length}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/admin/ranking-pages"
                  className="block w-full mt-6 bg-primary hover:bg-primary-dark text-white text-center py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  عرض جميع الصفحات
                </Link>
              </div>

              {/* Skipped Reasons */}
              {result.skippedReasons && result.skippedReasons.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    أسباب التخطي ({result.skippedReasons.length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {result.skippedReasons.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            <XCircle className="w-4 h-4 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              {item.title}
                            </p>
                            <p className="text-xs text-amber-700 font-medium mb-1">
                              {item.reason}
                            </p>
                            {item.details && (
                              <p className="text-xs text-gray-600">
                                {item.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


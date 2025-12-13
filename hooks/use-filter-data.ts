import { useState, useEffect, useCallback } from 'react';

interface Category {
  id: string;
  slug: string;
  name: string;
  icon?: string;
  description?: string;
  companiesCount: number;
}

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

interface SubArea {
  id: string;
  slug: string;
  name: string;
  cityId: string;
  companiesCount: number;
}

interface SubCategory {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  companiesCount: number;
}

interface FilterData {
  categories: Category[];
  countries: Country[];
  cities: City[];
  subAreas: SubArea[];
  subCategories: SubCategory[];
  loading: boolean;
  error: string | null;
}

export function useFilterData() {
  const [data, setData] = useState<FilterData>({
    categories: [],
    countries: [],
    cities: [],
    subAreas: [],
    subCategories: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // جلب جميع البيانات بشكل موازي
        const [categoriesResponse, countriesResponse, subAreasResponse, subCategoriesResponse] = await Promise.all([
          fetch('/api/categories?activeOnly=true'),
          fetch('/api/countries?activeOnly=true'),
          fetch('/api/sub-areas?activeOnly=true'),
          fetch('/api/sub-categories?activeOnly=true'),
        ]);

        const [categoriesData, countriesData, subAreasData, subCategoriesData] = await Promise.all([
          categoriesResponse.json(),
          countriesResponse.json(),
          subAreasResponse.json(),
          subCategoriesResponse.json(),
        ]);

        if (categoriesData.success && countriesData.success) {
          setData({
            categories: categoriesData.categories || [],
            countries: countriesData.countries || [],
            cities: [],
            subAreas: subAreasData.subAreas || [],
            subCategories: subCategoriesData.subCategories || [],
            loading: false,
            error: null
          });
        } else {
          throw new Error('فشل في جلب البيانات');
        }
      } catch (error) {
        console.error('خطأ في جلب بيانات الفلاتر:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'حدث خطأ في جلب البيانات'
        }));
      }
    };

    fetchData();
  }, []);

  const fetchCitiesByCountry = useCallback(async (countryCode: string) => {
    try {
      const response = await fetch(`/api/cities?countryCode=${countryCode}&activeOnly=true`);
      const data = await response.json();

      if (data.success) {
        setData(prev => ({
          ...prev,
          cities: data.cities || []
        }));
        return data.cities || [];
      } else {
        throw new Error('فشل في جلب المدن');
      }
    } catch (error) {
      console.error('خطأ في جلب المدن:', error);
      setData(prev => ({
        ...prev,
        cities: []
      }));
      return [];
    }
  }, []);

  return {
    ...data,
    fetchCitiesByCountry
  };
}

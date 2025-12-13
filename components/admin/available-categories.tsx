'use client'

import { useState, useEffect } from 'react'
import { Search, Tag, Copy, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  slug: string
}

interface AvailableCategoriesProps {
  onCategorySelect?: (category: Category) => void
}

export function AvailableCategories({ onCategorySelect }: AvailableCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [copiedCategory, setCopiedCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [searchTerm, categories])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/categories/available')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
        setFilteredCategories(data.categories || [])
      } else {
        throw new Error('فشل في جلب الفئات')
      }
    } catch (error) {
      console.error('خطأ في جلب الفئات:', error)
      toast.error('فشل في جلب الفئات المتاحة')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (categoryName: string) => {
    try {
      await navigator.clipboard.writeText(categoryName)
      setCopiedCategory(categoryName)
      toast.success('تم نسخ اسم الفئة', {
        description: `"${categoryName}" تم نسخه إلى الحافظة`,
        duration: 2000
      })
      
      // إزالة حالة النسخ بعد ثانيتين
      setTimeout(() => setCopiedCategory(null), 2000)
    } catch (error) {
      toast.error('فشل في نسخ النص')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            الفئات المتاحة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">جاري تحميل الفئات...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          الفئات المتاحة
          <Badge variant="secondary">{categories.length}</Badge>
        </CardTitle>
        <CardDescription>
          استخدم هذه الأسماء تماماً في عمود "الفئة" في ملف CSV للحصول على مطابقة دقيقة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* شريط البحث */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث في الفئات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* قائمة الفئات */}
        <ScrollArea className="h-64 w-full">
          <div className="space-y-2">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{category.name}</div>
                    <div className="text-xs text-gray-500">{category.slug}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(category.name)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedCategory === category.name ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    {onCategorySelect && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCategorySelect(category)}
                        className="text-xs px-2 py-1 h-6"
                      >
                        اختر
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'لا توجد فئات مطابقة للبحث' : 'لا توجد فئات متاحة'}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* نصائح */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <h4 className="font-medium text-sm mb-2">💡 نصائح للمطابقة:</h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• انسخ الاسم تماماً كما هو مكتوب</li>
            <li>• يمكن تجاهل حالة الأحرف (كبيرة/صغيرة)</li>
            <li>• في حالة عدم المطابقة، ستُنشأ فئة جديدة</li>
            <li>• استخدم البحث للعثور على الفئة المناسبة</li>
          </ul>
        </div>

        {/* إحصائيات */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>إجمالي الفئات: {categories.length}</span>
          <span>المعروضة: {filteredCategories.length}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// مكون مبسط لعرض الفئات في قائمة منسدلة
export function CategorySelector({ onSelect }: { onSelect: (categoryName: string) => void }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories/available')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('خطأ في جلب الفئات:', error)
      }
    }
    
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Tag className="h-4 w-4 mr-2" />
        اختر فئة
      </Button>
      
      {isOpen && (
        <div className="absolute top-full mt-1 w-64 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              className="w-full text-right px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
              onClick={() => {
                onSelect(category.name)
                setIsOpen(false)
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

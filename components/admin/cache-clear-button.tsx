'use client'

import { useState } from 'react'
import { RefreshCw, Trash2, Server, Building, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface CacheClearButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  showText?: boolean
}

export function CacheClearButton({ 
  variant = 'outline', 
  size = 'sm',
  showText = false 
}: CacheClearButtonProps) {
  const [isClearing, setIsClearing] = useState(false)

  const clearCache = async (type: 'admin' | 'company' | 'all') => {
    setIsClearing(true)
    
    try {
      const response = await fetch('/api/admin/cache/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type })
      })

      if (!response.ok) {
        throw new Error('فشل في تفريغ الكاش')
      }

      const data = await response.json()
      
      toast.success('تم تفريغ الكاش بنجاح', {
        description: `تم تفريغ ${data.clearedItems?.length || 0} عنصر من الكاش`,
        duration: 3000,
      })

      // إعادة تحميل الصفحة بعد ثانيتين
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (error) {
      console.error('خطأ في تفريغ الكاش:', error)
      toast.error('فشل في تفريغ الكاش', {
        description: 'حدث خطأ أثناء محاولة تفريغ الكاش. يرجى المحاولة مرة أخرى.',
        duration: 4000,
      })
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={isClearing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isClearing ? 'animate-spin' : ''}`} />
          {showText && (isClearing ? 'جاري التفريغ...' : 'تفريغ الكاش')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          تفريغ الكاش
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => clearCache('admin')}
          disabled={isClearing}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Server className="h-4 w-4" />
          <div>
            <div className="font-medium">داشبورد الأدمن</div>
            <div className="text-xs text-muted-foreground">
              تفريغ كاش لوحة تحكم المدير
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => clearCache('company')}
          disabled={isClearing}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Building className="h-4 w-4" />
          <div>
            <div className="font-medium">داشبورد الشركات</div>
            <div className="text-xs text-muted-foreground">
              تفريغ كاش لوحات تحكم الشركات
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={() => clearCache('all')}
          disabled={isClearing}
          className="flex items-center gap-2 cursor-pointer text-orange-600 dark:text-orange-400"
        >
          <Globe className="h-4 w-4" />
          <div>
            <div className="font-medium">الموقع بالكامل</div>
            <div className="text-xs text-muted-foreground">
              تفريغ كاش الموقع بالكامل (احذر!)
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// مكون مبسط للاستخدام السريع
export function QuickCacheClear({ type }: { type: 'admin' | 'company' }) {
  const [isClearing, setIsClearing] = useState(false)

  const clearCache = async () => {
    setIsClearing(true)
    
    try {
      const response = await fetch('/api/admin/cache/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type })
      })

      if (!response.ok) {
        throw new Error('فشل في تفريغ الكاش')
      }

      toast.success('تم تفريغ الكاش بنجاح')
      
      // إعادة تحميل الصفحة
      setTimeout(() => {
        window.location.reload()
      }, 1000)

    } catch (error) {
      toast.error('فشل في تفريغ الكاش')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <Button 
      onClick={clearCache}
      disabled={isClearing}
      variant="ghost"
      size="sm"
      className="text-xs"
    >
      <RefreshCw className={`h-3 w-3 mr-1 ${isClearing ? 'animate-spin' : ''}`} />
      {isClearing ? 'جاري...' : 'تحديث'}
    </Button>
  )
}

'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  accept?: string
  maxSize?: number // in MB
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  label = 'رفع صورة',
  accept = 'image/*',
  maxSize = 5,
  className = ''
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string>(value || '')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast.error('نوع الملف غير صحيح', {
        description: 'يرجى اختيار ملف صورة فقط (JPG, PNG, GIF, WebP)',
      })
      return
    }

    // التحقق من حجم الملف
    if (file.size > maxSize * 1024 * 1024) {
      toast.error('حجم الملف كبير جداً', {
        description: `حجم الملف يجب أن يكون أقل من ${maxSize} ميجابايت`,
      })
      return
    }

    try {
      setIsUploading(true)

      // إنشاء معاينة محلية
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // رفع الصورة إلى الخادم
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onChange(data.url)
        setPreview(data.url)
        toast.success('تم رفع الصورة بنجاح')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في رفع الصورة')
      }
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error)
      toast.error('فشل في رفع الصورة', {
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      })
      setPreview('')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleRemove = () => {
    setPreview('')
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Label>
      )}
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="معاينة الصورة"
              className="max-w-full max-h-48 mx-auto rounded-lg object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 left-2"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <ImageIcon className="w-full h-full" />
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={openFileDialog}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 ml-2" />
                {isUploading ? 'جاري الرفع...' : 'اختر صورة'}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                أو اسحب وأفلت الصورة هنا
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, GIF, WebP (الحد الأقصى {maxSize} ميجابايت)
              </p>
            </div>
          </div>
        )}

        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>
    </div>
  )
}

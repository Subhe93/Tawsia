import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export class ImageDownloadService {
  private uploadDir = 'public/uploads/companies'

  constructor() {
    this.ensureUploadDirExists()
  }

  private ensureUploadDirExists() {
    const fullPath = path.join(process.cwd(), this.uploadDir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      console.log(`تم إنشاء مجلد الصور: ${fullPath}`)
    }
  }

  async downloadAndSaveImage(imageUrl: string, companyId: string, index: number) {
    try {
      console.log(`بدء تحميل الصورة: ${imageUrl}`)

      // التحقق من صحة الرابط
      if (!imageUrl || !imageUrl.startsWith('http')) {
        throw new Error('رابط الصورة غير صحيح')
      }

      // تحميل الصورة
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000 // 30 ثانية timeout
      })

      if (!response.ok) {
        throw new Error(`فشل في تحميل الصورة: ${response.status} ${response.statusText}`)
      }

      // التحقق من نوع المحتوى
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error(`نوع الملف غير صحيح: ${contentType}`)
      }

      // التحقق من حجم الملف (حد أقصى 10MB)
      const contentLength = response.headers.get('content-length')
      if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
        throw new Error('حجم الصورة كبير جداً (أكثر من 10MB)')
      }

      // تحديد امتداد الملف
      const extension = this.getFileExtension(contentType, imageUrl)
      
      // إنشاء اسم ملف فريد
      const filename = `${companyId}_${index}_${uuidv4()}${extension}`
      const filePath = path.join(process.cwd(), this.uploadDir, filename)

      // تحميل وحفظ الصورة
      const buffer = await response.arrayBuffer()
      fs.writeFileSync(filePath, Buffer.from(buffer))

      // إنشاء الرابط المحلي
      const localUrl = `/uploads/companies/${filename}`

      console.log(`تم تحميل الصورة بنجاح: ${localUrl}`)

      return {
        success: true,
        localPath: localUrl,
        originalUrl: imageUrl,
        filename,
        size: buffer.byteLength
      }

    } catch (error) {
      console.error(`فشل في تحميل الصورة ${imageUrl}:`, error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف في تحميل الصورة',
        originalUrl: imageUrl
      }
    }
  }

  private getFileExtension(contentType: string, url: string): string {
    // محاولة استخراج الامتداد من content-type
    const typeExtensions: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'image/bmp': '.bmp',
      'image/tiff': '.tiff'
    }

    if (typeExtensions[contentType]) {
      return typeExtensions[contentType]
    }

    // محاولة استخراج الامتداد من الرابط
    const urlExtension = path.extname(new URL(url).pathname).toLowerCase()
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'].includes(urlExtension)) {
      return urlExtension
    }

    // افتراضي
    return '.jpg'
  }

  // حذف صورة محلية
  async deleteLocalImage(localPath: string): Promise<boolean> {
    try {
      const fullPath = path.join(process.cwd(), 'public', localPath)
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath)
        console.log(`تم حذف الصورة: ${localPath}`)
        return true
      }
      return false
    } catch (error) {
      console.error(`فشل في حذف الصورة ${localPath}:`, error)
      return false
    }
  }

  // تنظيف الصور القديمة
  async cleanupOldImages(olderThanDays: number = 30): Promise<number> {
    try {
      const uploadsPath = path.join(process.cwd(), this.uploadDir)
      const files = fs.readdirSync(uploadsPath)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

      let deletedCount = 0

      for (const file of files) {
        const filePath = path.join(uploadsPath, file)
        const stats = fs.statSync(filePath)
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath)
          deletedCount++
        }
      }

      console.log(`تم تنظيف ${deletedCount} صورة قديمة`)
      return deletedCount

    } catch (error) {
      console.error('فشل في تنظيف الصور القديمة:', error)
      return 0
    }
  }

  // الحصول على معلومات المساحة المستخدمة
  async getStorageInfo(): Promise<{ totalFiles: number, totalSize: number, totalSizeMB: number }> {
    try {
      const uploadsPath = path.join(process.cwd(), this.uploadDir)
      const files = fs.readdirSync(uploadsPath)
      
      let totalSize = 0
      for (const file of files) {
        const filePath = path.join(uploadsPath, file)
        const stats = fs.statSync(filePath)
        totalSize += stats.size
      }

      return {
        totalFiles: files.length,
        totalSize,
        totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
      }

    } catch (error) {
      console.error('فشل في جلب معلومات المساحة:', error)
      return { totalFiles: 0, totalSize: 0, totalSizeMB: 0 }
    }
  }
}
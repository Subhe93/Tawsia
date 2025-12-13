interface ValidationSettings {
  validateEmails: boolean
  validatePhones: boolean
}

interface ValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

export class DataValidationService {
  async validateCompanyData(data: any, settings: ValidationSettings): Promise<ValidationResult> {
    const warnings: string[] = []

    // التحقق من اسم الشركة
    if (!data.name || data.name.trim().length < 2) {
      return { isValid: false, error: 'اسم الشركة قصير جداً (أقل من حرفين)' }
    }

    if (data.name.length > 200) {
      return { isValid: false, error: 'اسم الشركة طويل جداً (أكثر من 200 حرف)' }
    }

    // التحقق من البريد الإلكتروني
    if (data.email && settings.validateEmails) {
      const emailValidation = this.validateEmail(data.email)
      if (!emailValidation.isValid) {
        return { isValid: false, error: emailValidation.error }
      }
    }

    // التحقق من رقم الهاتف
    if (data.phone && settings.validatePhones) {
      const phoneValidation = this.validatePhone(data.phone)
      if (!phoneValidation.isValid) {
        return { isValid: false, error: phoneValidation.error }
      }
    }

    // التحقق من الموقع الإلكتروني
    if (data.website) {
      const websiteValidation = this.validateWebsite(data.website)
      if (!websiteValidation.isValid) {
        warnings.push(websiteValidation.error || 'رابط الموقع غير صالح')
      }
    }

    // التحقق من التقييم
    if (data.rating && (data.rating < 0 || data.rating > 5)) {
      warnings.push('التقييم خارج النطاق المسموح (0-5)')
      data.rating = Math.max(0, Math.min(5, data.rating))
    }

    // التحقق من العنوان
    if (data.address && data.address.length > 500) {
      warnings.push('العنوان طويل جداً، سيتم اقتطاعه')
      data.address = data.address.substring(0, 500)
    }

    // التحقق من الوصف
    if (data.description && data.description.length > 1000) {
      warnings.push('الوصف طويل جداً، سيتم اقتطاعه')
      data.description = data.description.substring(0, 1000)
    }

    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  }

  private validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'تنسيق البريد الإلكتروني غير صحيح' }
    }

    if (email.length > 254) {
      return { isValid: false, error: 'البريد الإلكتروني طويل جداً' }
    }

    return { isValid: true }
  }

  private validatePhone(phone: string): ValidationResult {
    // إزالة المسافات والرموز
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    
    // التحقق من الأرقام السورية
    const syrianPhoneRegex = /^(\+963|963|0)?[0-9]{8,9}$/
    
    if (!syrianPhoneRegex.test(cleanPhone)) {
      // التحقق من الأرقام العربية الأخرى
      const arabPhoneRegex = /^(\+\d{1,4})?\d{7,12}$/
      
      if (!arabPhoneRegex.test(cleanPhone)) {
        return { isValid: false, error: 'تنسيق رقم الهاتف غير صحيح' }
      }
    }

    return { isValid: true }
  }

  private validateWebsite(website: string): ValidationResult {
    try {
      // إضافة http إذا لم يكن موجوداً
      let url = website
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }

      const urlObj = new URL(url)
      
      // التحقق من البروتوكول
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, error: 'بروتوكول غير مدعوم' }
      }

      // التحقق من اسم النطاق
      if (!urlObj.hostname || urlObj.hostname.length < 3) {
        return { isValid: false, error: 'اسم النطاق غير صالح' }
      }

      return { isValid: true }
    } catch {
      return { isValid: false, error: 'رابط الموقع غير صالح' }
    }
  }

  // التحقق من صحة الصور
  validateImageUrls(imageUrls: string[]): { validUrls: string[], invalidUrls: string[] } {
    const validUrls: string[] = []
    const invalidUrls: string[] = []

    for (const url of imageUrls) {
      if (this.isValidImageUrl(url)) {
        validUrls.push(url)
      } else {
        invalidUrls.push(url)
      }
    }

    return { validUrls, invalidUrls }
  }

  private isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      
      // التحقق من البروتوكول
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false
      }

      // التحقق من امتداد الملف
      const pathname = urlObj.pathname.toLowerCase()
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
      
      // إذا كان رابط Google، فهو صالح غالباً
      if (url.includes('googleusercontent.com')) {
        return true
      }

      // التحقق من الامتداد
      return imageExtensions.some(ext => pathname.includes(ext))
    } catch {
      return false
    }
  }

  // تنظيف وتطبيع البيانات
  sanitizeData(data: any): any {
    return {
      ...data,
      name: this.sanitizeText(data.name),
      description: this.sanitizeText(data.description),
      address: this.sanitizeText(data.address),
      phone: this.sanitizePhone(data.phone),
      email: this.sanitizeEmail(data.email),
      website: this.sanitizeWebsite(data.website)
    }
  }

  private sanitizeText(text: string): string {
    if (!text) return ''
    
    return text
      .trim()
      .replace(/\s+/g, ' ') // استبدال المسافات المتعددة بمسافة واحدة
      .replace(/[\r\n\t]/g, ' ') // استبدال أحرف السطر الجديد والتبويب
  }

  private sanitizePhone(phone: string): string {
    if (!phone) return ''
    
    return phone
      .trim()
      .replace(/[^\d\+\-\(\)\s]/g, '') // الاحتفاظ بالأرقام والرموز المسموحة فقط
  }

  private sanitizeEmail(email: string): string {
    if (!email) return ''
    
    return email.trim().toLowerCase()
  }

  private sanitizeWebsite(website: string): string {
    if (!website) return ''
    
    let url = website.trim()
    
    // إضافة https إذا لم يكن موجوداً
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    
    return url
  }
}

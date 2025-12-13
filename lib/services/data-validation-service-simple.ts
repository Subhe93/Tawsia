export class DataValidationService {
  async validateCompanyData(data: any, settings: any) {
    // التحقق من اسم الشركة
    if (!data.name || data.name.trim().length < 2) {
      return { isValid: false, error: 'اسم الشركة قصير جداً' }
    }

    if (data.name.length > 200) {
      return { isValid: false, error: 'اسم الشركة طويل جداً' }
    }

    // التحقق من البريد الإلكتروني
    if (data.email && settings.validateEmails) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        return { isValid: false, error: 'تنسيق البريد الإلكتروني غير صحيح' }
      }
    }

    // التحقق من رقم الهاتف
    if (data.phone && settings.validatePhones) {
      const isValidPhone = this.validatePhoneNumber(data.phone)
      if (!isValidPhone.isValid) {
        return { isValid: false, error: isValidPhone.error }
      }
    }

    return { isValid: true }
  }

  private validatePhoneNumber(phone: string): { isValid: boolean, error?: string } {
    if (!phone || phone.trim().length === 0) {
      return { isValid: true } // رقم فارغ مقبول
    }

    const cleanPhone = phone.replace(/[\s\-\(\)\.\[\]]/g, '')

    // التحقق من وجود أرقام فقط (مع +)
    if (!/^[\+\d]+$/.test(cleanPhone)) {
      return { isValid: false, error: 'رقم الهاتف يحتوي على رموز غير صحيحة' }
    }

    // التحقق من الأرقام الدولية
    if (cleanPhone.startsWith('+')) {
      // رقم دولي
      if (cleanPhone.length < 8 || cleanPhone.length > 17) {
        return { isValid: false, error: 'طول رقم الهاتف الدولي غير صحيح (8-17 رقم)' }
      }

      // التحقق من أرقام سوريا
      if (cleanPhone.startsWith('+963')) {
        if (cleanPhone.length !== 13) {
          return { isValid: false, error: 'رقم الهاتف السوري يجب أن يكون 13 رقم (+963xxxxxxxxx)' }
        }
      }
      
      return { isValid: true }
    }

    // أرقام محلية
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      return { isValid: false, error: 'طول رقم الهاتف غير صحيح (7-15 رقم)' }
    }

    return { isValid: true }
  }
}

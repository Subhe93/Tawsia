import { UserRole, OwnerRole } from '@prisma/client'

export type Permission = 
  | 'view_company'
  | 'edit_company'
  | 'delete_company'
  | 'manage_reviews'
  | 'manage_images'
  | 'view_analytics'
  | 'manage_users'
  | 'manage_settings'
  | 'approve_companies'
  | 'manage_awards'
  | 'view_admin_dashboard'
  | 'manage_categories'
  | 'manage_locations'
  | 'export_data'
  | 'manage_notifications'

// صلاحيات الأدوار
export const rolePermissions: Record<UserRole, Permission[]> = {
  USER: [
    'view_company'
  ],
  COMPANY_OWNER: [
    'view_company',
    'edit_company',
    'manage_reviews',
    'manage_images',
    'view_analytics',
    'manage_awards'
  ],
  ADMIN: [
    'view_company',
    'edit_company',
    'delete_company',
    'manage_reviews',
    'manage_images',
    'view_analytics',
    'manage_users',
    'approve_companies',
    'manage_awards',
    'view_admin_dashboard',
    'manage_categories',
    'manage_locations',
    'manage_notifications'
  ],
  SUPER_ADMIN: [
    'view_company',
    'edit_company',
    'delete_company',
    'manage_reviews',
    'manage_images',
    'view_analytics',
    'manage_users',
    'manage_settings',
    'approve_companies',
    'manage_awards',
    'view_admin_dashboard',
    'manage_categories',
    'manage_locations',
    'export_data',
    'manage_notifications'
  ]
}

// صلاحيات مالكي الشركات
export const ownerPermissions: Record<OwnerRole, Permission[]> = {
  OWNER: [
    'view_company',
    'edit_company',
    'manage_reviews',
    'manage_images',
    'view_analytics',
    'manage_awards'
  ],
  MANAGER: [
    'view_company',
    'edit_company',
    'manage_reviews',
    'view_analytics'
  ],
  EDITOR: [
    'view_company',
    'edit_company',
    'manage_images'
  ]
}

// التحقق من الصلاحية
export function hasPermission(
  userRole: UserRole,
  permission: Permission,
  ownerRole?: OwnerRole
): boolean {
  // التحقق من صلاحيات الدور العام
  if (rolePermissions[userRole]?.includes(permission)) {
    return true
  }

  // التحقق من صلاحيات مالك الشركة
  if (userRole === 'COMPANY_OWNER' && ownerRole) {
    return ownerPermissions[ownerRole]?.includes(permission) || false
  }

  return false
}

// التحقق من صلاحيات متعددة
export function hasAnyPermission(
  userRole: UserRole,
  permissions: Permission[],
  ownerRole?: OwnerRole
): boolean {
  return permissions.some(permission => 
    hasPermission(userRole, permission, ownerRole)
  )
}

// التحقق من جميع الصلاحيات
export function hasAllPermissions(
  userRole: UserRole,
  permissions: Permission[],
  ownerRole?: OwnerRole
): boolean {
  return permissions.every(permission => 
    hasPermission(userRole, permission, ownerRole)
  )
}

// الحصول على جميع صلاحيات المستخدم
export function getUserPermissions(
  userRole: UserRole,
  ownerRole?: OwnerRole
): Permission[] {
  const basePermissions = rolePermissions[userRole] || []
  
  if (userRole === 'COMPANY_OWNER' && ownerRole) {
    const ownerPerms = ownerPermissions[ownerRole] || []
    return [...new Set([...basePermissions, ...ownerPerms])]
  }

  return basePermissions
}

// تحديد ما إذا كان المستخدم مديراً
export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'
}

// تحديد ما إذا كان المستخدم مديراً عاماً
export function isSuperAdmin(userRole: UserRole): boolean {
  return userRole === 'SUPER_ADMIN'
}

// تحديد ما إذا كان المستخدم مالك شركة
export function isCompanyOwner(userRole: UserRole): boolean {
  return userRole === 'COMPANY_OWNER'
}

import { Prisma } from '@prisma/client'

// نوع الشركة مع جميع العلاقات
export type CompanyWithRelations = Prisma.CompanyGetPayload<{
  include: {
    country: true
    city: true
    subArea: true
    category: true
    subCategory: true
    images: true
    tags: true
    workingHours: true
    socialMedia: true
    reviews: {
      include: {
        images: true
        ratings: true
      }
    }
    awards: true
    owners: {
      include: {
        user: true
      }
    }
  }
}>

// نوع المراجعة مع العلاقات
export type ReviewWithRelations = Prisma.ReviewGetPayload<{
  include: {
    company: {
      select: {
        id: true
        name: true
        slug: true
        image: true
        city: {
          select: {
            name: true
            slug: true
          }
        }
        country: {
          select: {
            name: true
            code: true
          }
        }
      }
    }
    images: true
    ratings: true
    replies: {
      include: {
        user: {
          select: {
            id: true
            name: true
            avatar: true
          }
        }
      }
      orderBy: {
        createdAt: 'asc'
      }
    }
    user: {
      select: {
        id: true
        name: true
        avatar: true
      }
    }
  }
}>

// نوع المدينة مع العلاقات
export type CityWithRelations = Prisma.CityGetPayload<{
  include: {
    country: true
    companies: {
      select: {
        id: true
        name: true
        slug: true
        rating: true
        reviewsCount: true
        isVerified: true
        isFeatured: true
      }
    }
  }
}>

// نوع البلد مع العلاقات
export type CountryWithRelations = Prisma.CountryGetPayload<{
  include: {
    cities: {
      select: {
        id: true
        name: true
        slug: true
        companiesCount: true
      }
    }
    companies: {
      select: {
        id: true
        name: true
        slug: true
        rating: true
        reviewsCount: true
      }
    }
  }
}>

// أنواع البحث والفلترة
export interface SearchFilters {
  query?: string
  country?: string
  city?: string
  subArea?: string
  category?: string
  subcategory?: string
  subCategory?: string
  rating?: number
  verified?: boolean
  featured?: boolean
  hasWebsite?: boolean
  hasPhone?: boolean
  hasEmail?: boolean
  hasImages?: boolean
  hasWorkingHours?: boolean
  openNow?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'rating' | 'reviews' | 'newest' | 'oldest'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters?: {
    countries?: Array<{id: string, name: string, code: string, companiesCount: number}>
    cities?: Array<{id: string, name: string, slug: string, companiesCount: number}>
    categories?: Array<{id: string, name: string, slug: string, companiesCount: number}>
  }
}

// أنواع الإحصائيات
export interface DashboardStats {
  overview: {
    totalCompanies: number
    totalReviews: number
    totalUsers: number
    averageRating: number
    pendingRequests: number
    verifiedCompanies: number
    featuredCompanies: number
  }
  growth: {
    companiesGrowth: number // نسبة النمو الشهري
    reviewsGrowth: number
    usersGrowth: number
  }
  topCountries: Array<{
    code: string
    name: string
    companiesCount: number
    percentage: number
  }>
  topCategories: Array<{
    slug: string
    name: string
    companiesCount: number
    percentage: number
  }>
  recentActivity: Array<{
    type: 'company' | 'review' | 'user'
    title: string
    description: string
    date: string
  }>
}

// أنواع داشبورد الشركة
export interface CompanyDashboardStats {
  overview: {
    totalReviews: number
    averageRating: number
    totalViews: number
    monthlyViews: number
    responseRate: number
  }
  reviews: {
    pending: number
    approved: number
    byRating: Array<{
      rating: number
      count: number
    }>
  }
  traffic: {
    daily: Array<{
      date: string
      views: number
    }>
    sources: Array<{
      source: string
      views: number
      percentage: number
    }>
  }
  competitors: Array<{
    name: string
    rating: number
    reviewsCount: number
  }>
}

// أنواع الإشعارات
export interface Notification {
  id: string
  type: 'review' | 'company_request' | 'system' | 'award'
  title: string
  message: string
  isRead: boolean
  data?: Record<string, any>
  createdAt: string
}

// أنواع API Response
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

// أنواع النماذج
export interface CreateCompanyData {
  name: string
  description: string
  shortDescription?: string
  longDescription?: string
  categoryId: string
  cityId: string
  phone?: string
  email?: string
  website?: string
  address?: string
  latitude?: number
  longitude?: number
  services?: string[]
  specialties?: string[]
  workingHours?: Record<string, {
    openTime?: string
    closeTime?: string
    isClosed?: boolean
  }>
  socialMedia?: Record<string, string>
  tags?: string[]
}

export interface CreateReviewData {
  companyId: string
  userName: string
  userEmail?: string
  rating: number
  title: string
  comment: string
  images?: string[]
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  id: string
}

// أنواع الأذونات
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

export interface UserPermissions {
  userId: string
  companyId?: string
  permissions: Permission[]
}

// أنواع صفحات التصنيف (Ranking Pages)
export type RankingPageWithRelations = Prisma.RankingPageGetPayload<{
  include: {
    country: true
    city: true
    subArea: true
    category: true
    subCategory: true
  }
}>

export interface RankingPageFilters {
  country?: string
  city?: string
  subArea?: string
  category?: string
  subCategory?: string
  isActive?: boolean
  isAutoGenerated?: boolean
  page?: number
  limit?: number
  sortBy?: 'title' | 'views' | 'newest' | 'oldest'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateRankingPageData {
  slug: string
  title: string
  description?: string
  content?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  countryId?: string
  cityId?: string
  subAreaId?: string
  categoryId?: string
  subCategoryId?: string
  limit?: number
  sortBy?: string
  customCompanies?: string[]
  excludedCompanies?: string[]
  isActive?: boolean
  isAutoGenerated?: boolean
  publishedAt?: Date
}

export interface UpdateRankingPageData extends Partial<CreateRankingPageData> {
  id: string
}

export interface RankingPageGeneratorOptions {
  countries?: string[]
  cities?: string[]
  categories?: string[]
  subCategories?: string[]
  subAreas?: string[]
  minCompanies?: number
  skipExisting?: boolean
  includeSubCategories?: boolean
  includeSubAreas?: boolean
}

export interface RankingPageGeneratorResult {
  total: number
  created: number
  skipped: number
  errors: Array<{
    combination: string
    error: string
  }>
  skippedReasons: Array<{
    title: string
    reason: string
    details?: string
  }>
  pages: Array<{
    id: string
    slug: string
    title: string
  }>
}
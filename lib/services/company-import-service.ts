import { PrismaClient } from "@prisma/client";
import { ImageDownloadService } from "./image-download-service";
import { DataValidationService } from "./data-validation-service-simple";
import { CategoryMappingService } from "./category-mapping-service-simple";
import { LocationMappingService } from "./location-mapping-service-simple";
import {
  createEnglishSlug,
  createUniqueSlug,
} from "@/lib/utils/database-helpers";

const prisma = new PrismaClient();

interface ImportSettings {
  downloadImages: boolean;
  createMissingCategories: boolean;
  createMissingCities: boolean;
  skipDuplicates: boolean;
  validateEmails: boolean;
  validatePhones: boolean;
  batchSize: number;
}

interface ImportResult {
  success: boolean;
  skipped?: boolean;
  error?: string;
  companyId?: string;
  imagesDownloaded?: number;
  imagesFailed?: number;
}

export class CompanyImportService {
  private imageDownloader = new ImageDownloadService();
  private validator = new DataValidationService();
  private categoryMapper = new CategoryMappingService();
  private locationMapper = new LocationMappingService();

  async processCompanyRow(
    row: any,
    settings: ImportSettings,
    rowNumber: number
  ): Promise<ImportResult> {
    try {
      // تنظيف وتحضير البيانات
      const cleanData = this.cleanRowData(row);

      // التحقق من البيانات الأساسية
      if (!cleanData.name || !cleanData.name.trim()) {
        return {
          success: false,
          error: "اسم الشركة مطلوب - لا يمكن إنشاء شركة بدون اسم",
        };
      }

      // التحقق من الشركات المكررة
      if (settings.skipDuplicates) {
        const existingCompany = await this.checkDuplicateCompany(
          cleanData.name
        );
        if (existingCompany) {
          return {
            success: false,
            skipped: true,
            error: `الشركة موجودة مسبقاً - تم العثور على شركة بنفس الاسم أو رقم الهاتف في قاعدة البيانات`,
          };
        }
      }

      // التحقق من صحة البيانات
      const validationResult = await this.validateData(cleanData, settings);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: `فشل التحقق من البيانات - ${validationResult.error}`,
        };
      }

      // معالجة الفئة
      const category = await this.processCategory(
        cleanData.category,
        settings.createMissingCategories
      );
      if (!category) {
        return {
          success: false,
          error: `فئة غير صالحة أو غير موجودة - الفئة "${cleanData.category}" غير متوفرة في النظام`,
        };
      }

      // معالجة الفئة الفرعية (اختياري)
      let subCategory = null;
      if (cleanData.subCategory) {
        subCategory = await this.processSubCategory(
          cleanData.subCategory,
          category.id,
          settings.createMissingCategories
        );
        // الفئة الفرعية اختيارية، لذا لن نفشل العملية إذا لم نجدها
        if (!subCategory) {
          console.log(`تحذير: لم يتم العثور على الفئة الفرعية "${cleanData.subCategory}" - سيتم تخطيها`);
        }
      }

      // معالجة الموقع (البلد والمدينة)
      let location;
      if (cleanData.country && cleanData.city) {
        // استخدام أعمدة منفصلة للدولة والمدينة
        location = await this.processCountryAndCity(
          cleanData.country,
          cleanData.city,
          settings.createMissingCities
        );
      } else {
        // استخدام العنوان القديم كاحتياطي
        location = await this.processLocation(
          cleanData.address,
          settings.createMissingCities
        );
      }

      if (!location) {
        return {
          success: false,
          error: `لا يمكن تحديد الموقع - فشل في ربط العنوان "${cleanData.address}" أو الدولة/المدينة "${cleanData.country}/${cleanData.city}" مع قاعدة البيانات`,
        };
      }

      // معالجة المنطقة الفرعية (اختياري)
      let subArea = null;
      if (cleanData.subArea) {
        subArea = await this.processSubArea(
          cleanData.subArea,
          location.city.id,
          location.country.id,
          settings.createMissingCities
        );
        // المنطقة الفرعية اختيارية، لذا لن نفشل العملية إذا لم نجدها
        if (!subArea) {
          console.log(`تحذير: لم يتم العثور على المنطقة الفرعية "${cleanData.subArea}" - سيتم تخطيها`);
        }
      }

      // إنشاء الشركة
      const company = await this.createCompany({
        ...cleanData,
        categoryId: category.id,
        subCategoryId: subCategory?.id || null,
        cityId: location.city.id,
        countryId: location.country.id,
        subAreaId: subArea?.id || null,
      });

      let imagesDownloaded = 0;
      let imagesFailed = 0;

      // معالجة الصور
      if (settings.downloadImages) {
        // تنزيل صورة الهيرو إن وجدت وتعيينها كصورة رئيسية
        let heroDownloaded = false;
        if (cleanData.heroImage) {
          try {
            const heroResult = await this.imageDownloader.downloadAndSaveImage(
              cleanData.heroImage,
              company.id,
              0
            );
            if (heroResult.success && heroResult.localPath) {
              await prisma.company.update({
                where: { id: company.id },
                data: { mainImage: heroResult.localPath },
              });
              await prisma.companyImage.create({
                data: {
                  companyId: company.id,
                  imageUrl: heroResult.localPath,
                  sortOrder: 0,
                  altText: "الصورة الرئيسية",
                },
              });
              imagesDownloaded += 1;
              heroDownloaded = true;
            } else {
              imagesFailed += 1;
            }
          } catch (error) {
            console.error("فشل تنزيل صورة الهيرو:", error);
            imagesFailed += 1;
          }
        }

        // تنزيل باقي الصور مع تخطي تكرار صورة الهيرو
        const remainingImages = cleanData.images.filter(
          (url: string) => url && url !== cleanData.heroImage
        );
        if (remainingImages.length > 0) {
          const imageResults = await this.processImages(
            company.id,
            remainingImages,
            heroDownloaded ? 1 : 0
          );
          imagesDownloaded += imageResults.downloaded;
          imagesFailed += imageResults.failed;

          // تعيين الصورة الرئيسية من أول صورة محلية في حال فشل تحميل الهيرو
          if (!heroDownloaded && imageResults.firstLocalPath) {
            await prisma.company.update({
              where: { id: company.id },
              data: { mainImage: imageResults.firstLocalPath },
            });
          }
        }
      }

      // معالجة المراجعات
      if (cleanData.reviews.length > 0) {
        await this.processReviews(company.id, cleanData.reviews);
      }

      // معالجة العلامات
      if (cleanData.tags.length > 0) {
        await this.processTags(company.id, cleanData.tags);
      }

      return {
        success: true,
        companyId: company.id,
        imagesDownloaded,
        imagesFailed,
      };
    } catch (error) {
      console.error(`خطأ في معالجة الصف ${rowNumber}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "خطأ غير متوقع",
      };
    }
  }

  private cleanRowData(row: any) {
    // استخراج التقييم من النص
    const extractRating = (
      noteText: string
    ): { rating: number; reviewCount: number } => {
      if (!noteText) return { rating: 0, reviewCount: 0 };

      const ratingMatch = noteText.match(/(\d+\.?\d*)/);
      const countMatch = noteText.match(/\((\d+)\)/);

      return {
        rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
        reviewCount: countMatch ? parseInt(countMatch[1]) : 0,
      };
    };

    // استخراج الصور من النص
    const extractImages = (imagesText: string): string[] => {
      if (!imagesText) return [];

      return imagesText
        .split(/[;,]/)
        .map((url) => url.trim())
        .filter((url) => url.startsWith("http"))
        .slice(0, 10); // حد أقصى 10 صور
    };

    // استخراج المراجعات من JSON
    const extractReviews = (reviewsText: string): any[] => {
      if (!reviewsText || reviewsText === "[]") return [];

      try {
        const reviews = JSON.parse(reviewsText);
        if (Array.isArray(reviews)) {
          return reviews.map((review) => ({
            author: review.author || "مجهول",
            text: review.text || "",
            rating: parseInt(review.rating) || 5,
            date: review.date || new Date().toISOString(),
          }));
        }
        return [];
      } catch (error) {
        console.warn("فشل في تحليل المراجعات:", error);
        return [];
      }
    };

    // استخراج الموقع الجغرافي من العنوان
    const extractLocation = (
      address: string
    ): { lat?: number; lng?: number } => {
      if (!address) return {};

      // البحث عن إحداثيات في العنوان (مثل G76C+V7F)
      const coordMatch = address.match(/([A-Z]\d+[A-Z]\+[A-Z0-9]+)/);
      if (coordMatch) {
        // يمكن تحويل Plus Code إلى إحداثيات لاحقاً
        return {};
      }

      return {};
    };

    const ratingData = extractRating(row.Note);

    // استنتاج الوصف من الفئة إذا لم يكن متوفراً
    const generateDescription = (
      companyName: string,
      category: string
    ): string => {
      const categoryDescriptions: { [key: string]: string } = {
        "software company": "شركة متخصصة في تطوير البرمجيات والحلول التقنية",
        "website designer": "شركة متخصصة في تصميم وتطوير المواقع الإلكترونية",
        "corporate office": "مكتب شركة يقدم خدمات تجارية ومهنية",
        "it company": "شركة تقنية معلومات تقدم حلول تكنولوجية متطورة",
        restaurant: "مطعم يقدم أشهى الأطباق والوجبات",
        cafe: "مقهى يقدم المشروبات الساخنة والباردة",
        hospital: "مستشفى يقدم خدمات الرعاية الصحية الشاملة",
        clinic: "عيادة طبية متخصصة",
        pharmacy: "صيدلية تقدم الأدوية والمستلزمات الطبية",
      };

      const categoryKey = category.toLowerCase().trim();
      const baseDescription =
        categoryDescriptions[categoryKey] ||
        `${companyName} متخصصة في ${category}`;

      return `${companyName} - ${baseDescription}`;
    };

    // استنتاج الخدمات من الفئة
    const generateServices = (category: string): string[] => {
      const categoryServices: { [key: string]: string[] } = {
        "software company": [
          "تطوير البرمجيات",
          "تطبيقات الويب",
          "تطبيقات الهاتف",
          "استشارات تقنية",
        ],
        "website designer": [
          "تصميم المواقع",
          "تطوير المواقع",
          "تحسين محركات البحث",
          "استضافة المواقع",
        ],
        restaurant: [
          "تناول في المطعم",
          "خدمة التوصيل",
          "المناسبات والحفلات",
          "طعام طازج",
        ],
        hospital: ["طب عام", "طوارئ 24/7", "فحوصات طبية", "عمليات جراحية"],
        clinic: ["فحوصات طبية", "استشارات طبية", "علاج متخصص"],
      };

      return categoryServices[category.toLowerCase().trim()] || [];
    };

    const companyName = row.Nom?.trim() || "";
    const category = row.Catégorie?.trim() || "";

    // تنظيف وتحويل رقم الهاتف
    const formatPhoneNumber = (phone: string): string => {
      if (!phone) return "";

      // إزالة جميع الرموز غير الرقمية ما عدا +
      let cleanPhone = phone.replace(/[^\d+]/g, "");

      // إزالة المسافات والرموز الخاصة
      cleanPhone = cleanPhone.replace(/[\s\-\(\)\.\[\]]/g, "");

      // التعامل مع الأرقام السورية
      if (cleanPhone.startsWith("00963")) {
        // تحويل 00963 إلى +963
        cleanPhone = "+963" + cleanPhone.substring(5);
      } else if (cleanPhone.startsWith("0963")) {
        // تحويل 0963 إلى +963
        cleanPhone = "+963" + cleanPhone.substring(4);
      } else if (cleanPhone.startsWith("963")) {
        // إضافة + في البداية
        cleanPhone = "+" + cleanPhone;
      } else if (cleanPhone.startsWith("09") && cleanPhone.length === 10) {
        // رقم محلي سوري يبدأ بـ 09
        cleanPhone = "+963" + cleanPhone.substring(1);
      } else if (cleanPhone.startsWith("9") && cleanPhone.length === 9) {
        // رقم محلي سوري بدون الصفر
        cleanPhone = "+963" + cleanPhone;
      } else if (!cleanPhone.startsWith("+") && cleanPhone.length >= 7) {
        // تحديد البلد بناءً على طول الرقم وبدايته
        if (cleanPhone.startsWith("07") && cleanPhone.length === 10) {
          // أرقام أردنية
          cleanPhone = "+962" + cleanPhone.substring(1);
        } else if (cleanPhone.startsWith("05") && cleanPhone.length === 10) {
          // أرقام سعودية
          cleanPhone = "+966" + cleanPhone.substring(1);
        } else if (
          (cleanPhone.startsWith("50") ||
            cleanPhone.startsWith("52") ||
            cleanPhone.startsWith("54") ||
            cleanPhone.startsWith("55") ||
            cleanPhone.startsWith("56")) &&
          cleanPhone.length === 9
        ) {
          // أرقام إماراتية
          cleanPhone = "+971" + cleanPhone;
        } else {
          // افتراضي: أرقام سورية
          if (cleanPhone.length === 7 || cleanPhone.length === 8) {
            cleanPhone = "+96311" + cleanPhone; // دمشق
          } else if (cleanPhone.length === 9) {
            cleanPhone = "+963" + cleanPhone;
          } else if (cleanPhone.length === 10 && cleanPhone.startsWith("0")) {
            cleanPhone = "+963" + cleanPhone.substring(1);
          }
        }
      }

      // التحقق من صحة الرقم النهائي
      if (cleanPhone.length < 10 || !cleanPhone.startsWith("+")) {
        console.log(`فشل في تحويل رقم الهاتف: "${phone}" -> "${cleanPhone}"`);
        return phone; // إرجاع الرقم الأصلي إذا فشل التحويل
      }

      if (phone !== cleanPhone) {
        console.log(`تم تحويل رقم الهاتف: "${phone}" -> "${cleanPhone}"`);
      }

      return cleanPhone;
    };

    return {
      name: companyName,
      category: category,
      address: row.Adresse?.trim() || "",
      phone: formatPhoneNumber(row.Téléphone?.trim() || ""),
      website: row.SiteWeb?.trim() || "",
      description: generateDescription(companyName, category),
      rating: ratingData.rating,
      reviewCount: ratingData.reviewCount,
      images: extractImages(row.Images || row.Photos || ""),
      heroImage: row.HeroImage?.trim() || "",
      reviews: extractReviews(row.Reviews || "[]"),
      tags: [], // سيتم إضافتها لاحقاً
      location: extractLocation(row.Adresse || ""),
      email: "", // غير متوفر في البيانات الحالية
      services: generateServices(category),
      specialties: [], // يمكن إضافتها لاحقاً
      // إضافة دعم أعمدة منفصلة للدولة والمدينة
      country: row.Country?.trim() || row.country?.trim() || "",
      city: row.City?.trim() || row.city?.trim() || "",
      // إضافة دعم المنطقة الفرعية والفئة الفرعية
      subArea: row.SubArea?.trim() || row.subArea?.trim() || row['Sub Area']?.trim() || "",
      subCategory: row.SubCategory?.trim() || row.subCategory?.trim() || row['Sub Category']?.trim() || "",
    };
  }

  private async checkDuplicateCompany(name: string): Promise<boolean> {
    const whereConditions: any[] = [
      { name: { equals: name, mode: "insensitive" } },
    ];

    const existingCompany = await prisma.company.findFirst({
      where: {
        OR: whereConditions,
      },
    });

    return !!existingCompany;
  }

  private async validateData(data: any, settings: ImportSettings) {
    return this.validator.validateCompanyData(data, settings);
  }

  private async processCategory(categoryName: string, createMissing: boolean) {
    return this.categoryMapper.mapCategory(categoryName, createMissing);
  }

  private async processSubCategory(subCategoryName: string, categoryId: string, createMissing: boolean) {
    return this.categoryMapper.mapSubCategory(subCategoryName, categoryId, createMissing);
  }

  private async processLocation(address: string, createMissing: boolean) {
    return this.locationMapper.mapLocation(address, createMissing);
  }

  private async processCountryAndCity(
    countryName: string,
    cityName: string,
    createMissing: boolean
  ) {
    return this.locationMapper.mapCountryAndCity(
      countryName,
      cityName,
      createMissing
    );
  }

  private async processSubArea(subAreaName: string, cityId: string, countryId: string, createMissing: boolean) {
    return this.locationMapper.mapSubArea(subAreaName, cityId, countryId, createMissing);
  }

  private async createCompany(data: any) {
    // إنشاء slug فريد بالإنجليزية مع تنقية الكلمات المحظورة (نفس منطق الداشبورد)
    const baseSlug = createEnglishSlug(data.name) || "company";
    const slug = await createUniqueSlug("company", baseSlug);

    return prisma.company.create({
      data: {
        name: data.name,
        slug,
        description:
          data.description || `${data.name} اختصاص في ${data.category}`,
        shortDescription: data.description
          ? data.description.substring(0, 150)
          : undefined,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId || null,
        cityId: data.cityId,
        subAreaId: data.subAreaId || null,
        countryId: data.countryId,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        address: data.address || null,
        rating: data.rating || 0,
        reviewsCount: data.reviewCount || 0,
        latitude: data.location.lat || null,
        longitude: data.location.lng || null,
        // تعيين لاحق للصورة الرئيسية بعد التنزيل المحلي
        mainImage: null,
        services: data.services,
        specialties: data.specialties,
        isActive: true,
        isVerified: false,
        isFeatured: false,
      },
    });
  }

  private async processImages(
    companyId: string,
    imageUrls: string[],
    startIndex: number = 0
  ) {
    let downloaded = 0;
    let failed = 0;
    let firstLocalPath: string | null = null;

    for (let index = 0; index < imageUrls.length; index++) {
      const url = imageUrls[index];
      try {
        const result = await this.imageDownloader.downloadAndSaveImage(
          url,
          companyId,
          startIndex + index
        );
        if (result.success) {
          await prisma.companyImage.create({
            data: {
              companyId,
              imageUrl: result.localPath!,
              sortOrder: startIndex + index,
              altText: `صورة ${index + 1}`,
            },
          });
          if (!firstLocalPath && result.localPath) {
            firstLocalPath = result.localPath;
          }
          downloaded++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`فشل في تحميل الصورة ${url}:`, error);
        failed++;
      }
    }

    return { downloaded, failed, firstLocalPath };
  }

  private async processReviews(companyId: string, reviews: any[]) {
    for (const review of reviews.slice(0, 10)) {
      // حد أقصى 10 مراجعات
      try {
        // تحويل التاريخ من النص إلى تاريخ صحيح
        let reviewDate = new Date();
        if (review.date) {
          // معالجة تواريخ مختلفة مثل "2 years ago", "8 years ago"
          const dateText = review.date.toLowerCase();
          if (dateText.includes("year")) {
            const years = parseInt(dateText.match(/\d+/)?.[0] || "0");
            reviewDate = new Date();
            reviewDate.setFullYear(reviewDate.getFullYear() - years);
          } else if (dateText.includes("month")) {
            const months = parseInt(dateText.match(/\d+/)?.[0] || "0");
            reviewDate = new Date();
            reviewDate.setMonth(reviewDate.getMonth() - months);
          } else if (dateText.includes("day")) {
            const days = parseInt(dateText.match(/\d+/)?.[0] || "0");
            reviewDate = new Date();
            reviewDate.setDate(reviewDate.getDate() - days);
          } else {
            // محاولة تحويل التاريخ مباشرة
            const parsedDate = new Date(review.date);
            if (!isNaN(parsedDate.getTime())) {
              reviewDate = parsedDate;
            }
          }
        }

        // التأكد من صحة التقييم
        let rating = 5;
        if (
          review.rating &&
          typeof review.rating === "number" &&
          review.rating >= 1 &&
          review.rating <= 5
        ) {
          rating = Math.round(review.rating);
        }

        // إنشاء عنوان من النص إذا لم يكن موجوداً
        const title =
          review.title ||
          (review.text ? review.text.substring(0, 50) + "..." : "مراجعة عامة");

        await prisma.review.create({
          data: {
            companyId,
            userName: review.author || "مجهول",
            rating,
            title,
            comment: review.text || "",
            isApproved: true,
            isVerified: false,
            createdAt: reviewDate,
          },
        });
      } catch (error) {
        console.error("فشل في إضافة المراجعة:", error);
      }
    }

    // تحديث متوسط التقييم وعدد المراجعات للشركة
    const reviewsStats = await prisma.review.aggregate({
      where: { companyId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.company.update({
      where: { id: companyId },
      data: {
        rating: reviewsStats._avg.rating || 0,
        reviewsCount: reviewsStats._count.id || 0,
      },
    });
  }

  private async processTags(companyId: string, tags: string[]) {
    for (const tag of tags.slice(0, 10)) {
      // حد أقصى 10 علامات
      try {
        await prisma.companyTag.create({
          data: {
            companyId,
            tagName: tag.trim(),
          },
        });
      } catch (error) {
        console.error("فشل في إضافة العلامة:", error);
      }
    }
  }
}

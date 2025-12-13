/**
 * Test examples for different company types and their expected schema.org types
 * This file demonstrates how the schema generator works with various business categories
 */

import {
  generateCompanySchema,
  getSchemaType,
  getPriceRange,
} from "./schema-generator";
import type { CompanyWithRelations } from "@/lib/types/database";

// Mock company data for testing different business types
export const mockCompanies: Partial<CompanyWithRelations>[] = [
  // Restaurant example
  {
    id: "1",
    name: "مطعم الأصالة",
    slug: "asala-restaurant",
    description: "مطعم يقدم أشهى المأكولات الشامية الأصيلة",
    shortDescription: "المأكولات الشامية الأصيلة",
    phone: "+963 11 3456789",
    email: "info@asala-restaurant.sy",
    website: "https://asala-restaurant.sy",
    address: "البلدة القديمة، دمشق، سوريا",
    mainImage: "/images/asala-restaurant.jpg",
    rating: 4.7,
    reviewsCount: 125,
    latitude: 33.5138,
    longitude: 36.2765,
    services: ["طعام شامي", "خدمة توصيل", "مناسبات"],
    specialties: ["كبة", "فتوش", "حمص"],
    category: {
      id: "1",
      slug: "food",
      name: "الأغذية والمطاعم",
      icon: "Utensils",
    },
    city: {
      id: "1",
      slug: "damascus",
      name: "دمشق",
    },
    country: {
      id: "1",
      code: "sy",
      name: "سوريا",
    },
    workingHours: [
      {
        dayOfWeek: "الأحد",
        openTime: "10:00",
        closeTime: "23:00",
        isClosed: false,
      },
      {
        dayOfWeek: "الاثنين",
        openTime: "10:00",
        closeTime: "23:00",
        isClosed: false,
      },
      { dayOfWeek: "الجمعة", isClosed: true },
    ],
    socialMedia: [
      { platform: "facebook", url: "https://facebook.com/asala-restaurant" },
      { platform: "instagram", url: "https://instagram.com/asala_restaurant" },
    ],
  },

  // Construction company example
  {
    id: "2",
    name: "شركة البناء المتقدم",
    slug: "advanced-construction",
    description: "شركة رائدة في مجال البناء والإنشاءات والمقاولات العامة",
    shortDescription: "البناء والإنشاءات والمقاولات",
    phone: "+963 11 4567890",
    email: "info@advanced-construction.sy",
    website: "https://advanced-construction.sy",
    address: "منطقة المزة، دمشق، سوريا",
    mainImage: "/images/construction-company.jpg",
    rating: 4.5,
    reviewsCount: 89,
    services: [
      "بناء المنازل",
      "المقاولات العامة",
      "التصميم المعماري",
      "الصيانة",
    ],
    specialties: ["البناء السكني", "المشاريع التجارية", "الديكور الداخلي"],
    category: {
      id: "2",
      slug: "construction",
      name: "البناء والإنشاء",
      icon: "HardHat",
    },
    city: {
      id: "1",
      slug: "damascus",
      name: "دمشق",
    },
    country: {
      id: "1",
      code: "sy",
      name: "سوريا",
    },
    workingHours: [
      {
        dayOfWeek: "الأحد",
        openTime: "08:00",
        closeTime: "17:00",
        isClosed: false,
      },
      {
        dayOfWeek: "الخميس",
        openTime: "08:00",
        closeTime: "17:00",
        isClosed: false,
      },
      { dayOfWeek: "الجمعة", isClosed: true },
      { dayOfWeek: "السبت", isClosed: true },
    ],
  },

  // Healthcare/Medical clinic example
  {
    id: "3",
    name: "عيادة الشام الطبية",
    slug: "sham-medical-clinic",
    description: "عيادة طبية متخصصة في الطب العام وطب الأسرة",
    shortDescription: "عيادة طبية - طب عام وأسرة",
    phone: "+963 11 5678901",
    email: "info@sham-clinic.sy",
    address: "شارع بغداد، دمشق، سوريا",
    mainImage: "/images/medical-clinic.jpg",
    rating: 4.8,
    reviewsCount: 156,
    services: ["طب عام", "طب أسرة", "فحوصات دورية", "تطعيمات"],
    specialties: ["أمراض باطنية", "طب الأطفال", "الطب الوقائي"],
    category: {
      id: "3",
      slug: "healthcare",
      name: "الرعاية الصحية",
      icon: "Heart",
    },
    city: {
      id: "1",
      slug: "damascus",
      name: "دمشق",
    },
    country: {
      id: "1",
      code: "sy",
      name: "سوريا",
    },
    workingHours: [
      {
        dayOfWeek: "الأحد",
        openTime: "09:00",
        closeTime: "18:00",
        isClosed: false,
      },
      {
        dayOfWeek: "الخميس",
        openTime: "09:00",
        closeTime: "18:00",
        isClosed: false,
      },
      {
        dayOfWeek: "الجمعة",
        openTime: "14:00",
        closeTime: "18:00",
        isClosed: false,
      },
    ],
  },

  // Beauty salon example
  {
    id: "4",
    name: "صالون الجمال الراقي",
    slug: "elegant-beauty-salon",
    description: "صالون تجميل نسائي متخصص في العناية بالشعر والبشرة",
    shortDescription: "صالون تجميل نسائي - شعر وبشرة",
    phone: "+963 11 6789012",
    email: "info@elegant-salon.sy",
    address: "شارع الحمرا، دمشق، سوريا",
    mainImage: "/images/beauty-salon.jpg",
    rating: 4.6,
    reviewsCount: 78,
    services: ["قص وتصفيف الشعر", "صبغ الشعر", "العناية بالبشرة", "المكياج"],
    specialties: ["تسريحات الأعراس", "العلاج بالكيراتين", "تنظيف البشرة"],
    category: {
      id: "4",
      slug: "beauty",
      name: "الجمال والعناية",
      icon: "Scissors",
    },
    city: {
      id: "1",
      slug: "damascus",
      name: "دمشق",
    },
    country: {
      id: "1",
      code: "sy",
      name: "سوريا",
    },
    workingHours: [
      {
        dayOfWeek: "الأحد",
        openTime: "10:00",
        closeTime: "20:00",
        isClosed: false,
      },
      {
        dayOfWeek: "الخميس",
        openTime: "10:00",
        closeTime: "20:00",
        isClosed: false,
      },
      { dayOfWeek: "الجمعة", isClosed: true },
    ],
  },

  // Technology company example
  {
    id: "5",
    name: "شركة التقنية المتقدمة",
    slug: "advanced-tech-syria",
    description: "شركة رائدة في مجال تطوير البرمجيات والتطبيقات",
    shortDescription: "تطوير البرمجيات والتطبيقات المحمولة",
    phone: "+963 11 7890123",
    email: "info@advancedtech.sy",
    website: "https://advancedtech.sy",
    address: "شارع بغداد، دمشق، سوريا",
    mainImage: "/images/tech-company.jpg",
    rating: 4.9,
    reviewsCount: 67,
    services: [
      "تطوير المواقع",
      "التطبيقات المحمولة",
      "الاستشارات التقنية",
      "التسويق الرقمي",
    ],
    specialties: ["React", "Node.js", "Mobile Apps", "AI Solutions"],
    category: {
      id: "5",
      slug: "technology",
      name: "التكنولوجيا والبرمجة",
      icon: "Laptop",
    },
    city: {
      id: "1",
      slug: "damascus",
      name: "دمشق",
    },
    country: {
      id: "1",
      code: "sy",
      name: "سوريا",
    },
    workingHours: [
      {
        dayOfWeek: "الأحد",
        openTime: "09:00",
        closeTime: "17:00",
        isClosed: false,
      },
      {
        dayOfWeek: "الخميس",
        openTime: "09:00",
        closeTime: "17:00",
        isClosed: false,
      },
      { dayOfWeek: "الجمعة", isClosed: true },
      { dayOfWeek: "السبت", isClosed: true },
    ],
    socialMedia: [
      {
        platform: "linkedin",
        url: "https://linkedin.com/company/advanced-tech",
      },
      { platform: "twitter", url: "https://twitter.com/advancedtech_sy" },
    ],
  },
];

/**
 * Test function to demonstrate schema generation for different business types
 */
export function testSchemaGeneration() {
  const baseUrl = "https://murabaat.com";

  console.log("=== Schema Generation Test Results ===\n");

  mockCompanies.forEach((company, index) => {
    if (!company.category || !company.city || !company.country) return;

    const schemaType = getSchemaType(
      company.category.slug,
      company.category.name
    );
    const priceRange = getPriceRange(schemaType);
    const schema = generateCompanySchema(
      company as CompanyWithRelations,
      baseUrl
    );

    console.log(`${index + 1}. ${company.name}`);
    console.log(
      `   Category: ${company.category.name} (${company.category.slug})`
    );
    console.log(`   Schema Type: ${schemaType}`);
    console.log(`   Price Range: ${priceRange}`);
    console.log(`   Has Opening Hours: ${schema.openingHours ? "Yes" : "No"}`);
    console.log(`   Has Rating: ${schema.aggregateRating ? "Yes" : "No"}`);
    console.log(`   Special Properties: ${getSpecialProperties(schema)}`);
    console.log("   ---");
  });
}

/**
 * Helper function to identify special properties in schema
 */
function getSpecialProperties(schema: any): string {
  const specialProps = [];

  if (schema.servesCuisine) specialProps.push("servesCuisine");
  if (schema.hasDeliveryMethod) specialProps.push("hasDeliveryMethod");
  if (schema.medicalSpecialty) specialProps.push("medicalSpecialty");
  if (schema.paymentAccepted) specialProps.push("paymentAccepted");
  if (schema.areaServed) specialProps.push("areaServed");
  if (schema.hasCredential) specialProps.push("hasCredential");
  if (schema.sameAs) specialProps.push("sameAs");
  if (schema.keywords) specialProps.push("keywords");

  return specialProps.length > 0 ? specialProps.join(", ") : "None";
}

/**
 * Get expected schema types for testing
 */
export const expectedSchemaTypes = {
  food: "Restaurant",
  construction: "GeneralContractor",
  healthcare: "MedicalOrganization",
  beauty: "BeautySalon",
  technology: "Organization",
  legal: "LegalService",
  education: "EducationalOrganization",
  finance: "FinancialService",
  retail: "Store",
  transportation: "Organization",
};

/**
 * Validate that schema generation works correctly
 */
export function validateSchemaGeneration(): boolean {
  let allTestsPassed = true;

  Object.entries(expectedSchemaTypes).forEach(
    ([categorySlug, expectedType]) => {
      const actualType = getSchemaType(categorySlug, "");
      if (actualType !== expectedType) {
        console.error(
          `❌ Test failed for category '${categorySlug}': expected '${expectedType}', got '${actualType}'`
        );
        allTestsPassed = false;
      } else {
        console.log(
          `✅ Test passed for category '${categorySlug}': ${actualType}`
        );
      }
    }
  );

  return allTestsPassed;
}

// Export for use in development/testing
if (typeof window === "undefined") {
  // Only run in Node.js environment (not in browser)
  export { testSchemaGeneration, validateSchemaGeneration };
}

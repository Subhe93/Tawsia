import type { CompanyWithRelations } from "@/lib/types/database";

// Mapping of company categories to schema.org types
const CATEGORY_SCHEMA_MAPPING = {
  // Food & Restaurants
  food: "Restaurant",
  restaurant: "Restaurant",
  cafe: "CafeOrCoffeeShop",
  bakery: "Bakery",
  bar: "BarOrPub",

  // Healthcare
  healthcare: "MedicalOrganization",
  hospital: "Hospital",
  clinic: "MedicalClinic",
  pharmacy: "Pharmacy",
  dentist: "DentistOffice",
  veterinary: "VeterinaryCare",

  // Retail & Shopping
  retail: "Store",
  shopping: "ShoppingCenter",
  clothing: "ClothingStore",
  electronics: "ElectronicsStore",
  grocery: "GroceryStore",
  "pharmacy-retail": "Pharmacy",
  jewelry: "JewelryStore",
  bookstore: "BookStore",

  // Beauty & Personal Care
  beauty: "BeautySalon",
  salon: "BeautySalon",
  spa: "DaySpa",
  barbershop: "BeautySalon",

  // Professional Services
  legal: "LegalService",
  lawyer: "Attorney",
  accounting: "AccountingService",
  consulting: "ProfessionalService",
  insurance: "InsuranceAgency",
  "real-estate": "RealEstateAgent",

  // Construction & Home Services
  construction: "GeneralContractor",
  contractor: "GeneralContractor",
  plumber: "PlumbingService",
  electrician: "ElectricalService",
  painter: "PaintingService",
  roofing: "RoofingContractor",
  hvac: "HVACBusiness",

  // Automotive
  automotive: "AutomotiveBusiness",
  "car-dealer": "AutoDealer",
  "car-repair": "AutoRepair",
  "gas-station": "GasStation",
  "car-rental": "AutoRental",

  // Lodging & Travel
  hotel: "LodgingBusiness",
  motel: "Motel",
  travel: "TravelAgency",
  resort: "Resort",

  // Entertainment & Recreation
  entertainment: "EntertainmentBusiness",
  gym: "ExerciseGym",
  fitness: "ExerciseGym",
  "movie-theater": "MovieTheater",
  bowling: "BowlingAlley",
  golf: "GolfCourse",

  // Technology & IT
  technology: "Organization",
  software: "Organization",
  "it-services": "Organization",

  // Education
  education: "EducationalOrganization",
  school: "School",
  university: "CollegeOrUniversity",
  training: "EducationalOrganization",

  // Finance & Banking
  finance: "FinancialService",
  bank: "BankOrCreditUnion",
  "credit-union": "BankOrCreditUnion",

  // Transportation
  transportation: "Organization",
  taxi: "TaxiService",
  moving: "MovingCompany",
  logistics: "Organization",

  // Energy & Utilities
  energy: "Organization",
  utilities: "Organization",

  // Default fallback
  default: "LocalBusiness",
};

// Price range mapping based on category
const PRICE_RANGE_MAPPING = {
  Restaurant: "$$",
  CafeOrCoffeeShop: "$",
  Bakery: "$",
  BarOrPub: "$$",
  MedicalOrganization: "$$$",
  Hospital: "$$$$",
  MedicalClinic: "$$$",
  Pharmacy: "$",
  DentistOffice: "$$$",
  VeterinaryCare: "$$",
  Store: "$$",
  ShoppingCenter: "$$",
  BeautySalon: "$$",
  DaySpa: "$$$",
  LegalService: "$$$$",
  Attorney: "$$$$",
  AccountingService: "$$$",
  ProfessionalService: "$$$",
  InsuranceAgency: "$$",
  RealEstateAgent: "$$$",
  GeneralContractor: "$$$",
  PlumbingService: "$$",
  ElectricalService: "$$",
  AutomotiveBusiness: "$$",
  AutoDealer: "$$$",
  AutoRepair: "$$",
  LodgingBusiness: "$$",
  TravelAgency: "$$",
  EntertainmentBusiness: "$$",
  ExerciseGym: "$$",
  EducationalOrganization: "$$$",
  FinancialService: "$$$",
  BankOrCreditUnion: "$$",
  Organization: "$$",
  LocalBusiness: "$$",
};

/**
 * Determines the appropriate schema.org type based on company category
 */
export function getSchemaType(
  categorySlug: string,
  categoryName: string
): string {
  // First try exact match with category slug
  if (CATEGORY_SCHEMA_MAPPING[categorySlug]) {
    return CATEGORY_SCHEMA_MAPPING[categorySlug];
  }

  // Try to match based on category name keywords
  const lowerCategoryName = categoryName.toLowerCase();

  // Restaurant keywords
  if (
    lowerCategoryName.includes("مطعم") ||
    lowerCategoryName.includes("طعام") ||
    lowerCategoryName.includes("restaurant") ||
    lowerCategoryName.includes("food")
  ) {
    return "Restaurant";
  }

  // Healthcare keywords
  if (
    lowerCategoryName.includes("صحة") ||
    lowerCategoryName.includes("طب") ||
    lowerCategoryName.includes("مستشفى") ||
    lowerCategoryName.includes("عيادة") ||
    lowerCategoryName.includes("health") ||
    lowerCategoryName.includes("medical")
  ) {
    return "MedicalOrganization";
  }

  // Construction keywords
  if (
    lowerCategoryName.includes("بناء") ||
    lowerCategoryName.includes("إنشاء") ||
    lowerCategoryName.includes("مقاول") ||
    lowerCategoryName.includes("هندسة") ||
    lowerCategoryName.includes("construction") ||
    lowerCategoryName.includes("contractor")
  ) {
    return "GeneralContractor";
  }

  // Beauty keywords
  if (
    lowerCategoryName.includes("جمال") ||
    lowerCategoryName.includes("تجميل") ||
    lowerCategoryName.includes("صالون") ||
    lowerCategoryName.includes("beauty") ||
    lowerCategoryName.includes("salon")
  ) {
    return "BeautySalon";
  }

  // Legal keywords
  if (
    lowerCategoryName.includes("قانون") ||
    lowerCategoryName.includes("محاماة") ||
    lowerCategoryName.includes("استشار") ||
    lowerCategoryName.includes("legal") ||
    lowerCategoryName.includes("law")
  ) {
    return "LegalService";
  }

  // Education keywords
  if (
    lowerCategoryName.includes("تعليم") ||
    lowerCategoryName.includes("تدريب") ||
    lowerCategoryName.includes("مدرسة") ||
    lowerCategoryName.includes("جامعة") ||
    lowerCategoryName.includes("education") ||
    lowerCategoryName.includes("school")
  ) {
    return "EducationalOrganization";
  }

  // Technology keywords
  if (
    lowerCategoryName.includes("تكنولوجيا") ||
    lowerCategoryName.includes("برمجة") ||
    lowerCategoryName.includes("تقنية") ||
    lowerCategoryName.includes("technology") ||
    lowerCategoryName.includes("software")
  ) {
    return "Organization";
  }

  // Finance keywords
  if (
    lowerCategoryName.includes("مالية") ||
    lowerCategoryName.includes("مصرف") ||
    lowerCategoryName.includes("بنك") ||
    lowerCategoryName.includes("finance") ||
    lowerCategoryName.includes("bank")
  ) {
    return "FinancialService";
  }

  // Retail keywords
  if (
    lowerCategoryName.includes("تجارة") ||
    lowerCategoryName.includes("بيع") ||
    lowerCategoryName.includes("متجر") ||
    lowerCategoryName.includes("retail") ||
    lowerCategoryName.includes("store")
  ) {
    return "Store";
  }

  // Default fallback
  return CATEGORY_SCHEMA_MAPPING.default;
}

/**
 * Gets the appropriate price range for a schema type
 */
export function getPriceRange(schemaType: string): string {
  return (
    PRICE_RANGE_MAPPING[schemaType] || PRICE_RANGE_MAPPING["LocalBusiness"]
  );
}

/**
 * Generates organization schema for the website
 */
export function generateOrganizationSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "توصية - دليل الشركات",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: "دليل شامل للشركات والخدمات في الشرق الأوسط",
    sameAs: [
      "https://www.facebook.com/tawsia",
      "https://twitter.com/tawsia",
      "https://instagram.com/tawsia/",
      "https://www.linkedin.com/company/tawsia",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "info@tawsia.com",
    },
  };
}

/**
 * Generates website schema
 */
export function generateWebsiteSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "توصية - دليل الشركات",
    url: baseUrl,
    description: "دليل شامل للشركات والخدمات في الشرق الأوسط",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      query: "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "توصية",
      url: baseUrl,
    },
  };
}

/**
 * Generates breadcrumb schema for company pages
 */
export function generateBreadcrumbSchema(
  company: CompanyWithRelations,
  baseUrl: string
) {
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      item: baseUrl,
      name: "الرئيسية",
    },
    {
      "@type": "ListItem",
      position: 2,
      item: `${baseUrl}/services`,
      name: "جميع التصنيفات",
    },
    {
      "@type": "ListItem",
      position: 3,
      item: `${baseUrl}/country/${company.country.code}`,
      name: company.country.name,
    },
    {
      "@type": "ListItem",
      position: 4,
      item: `${baseUrl}/country/${company.country.code}/city/${company.city.slug}`,
      name: company.city.name,
    },
  ];

  // Add sub-area if exists
  if (company.subArea) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 5,
      item: `${baseUrl}/country/${company.country.code}/city/${company.city.slug}/sub-area/${company.subArea.slug}`,
      name: company.subArea.name,
    });
  }

  // Add category
  const categoryPosition = company.subArea ? 6 : 5;
  const categoryUrl = company.subArea
    ? `${baseUrl}/country/${company.country.code}/city/${company.city.slug}/sub-area/${company.subArea.slug}/category/${company.category.slug}`
    : `${baseUrl}/country/${company.country.code}/city/${company.city.slug}/category/${company.category.slug}`;

  breadcrumbItems.push({
    "@type": "ListItem",
    position: categoryPosition,
    item: categoryUrl,
    name: company.category.name,
  });

  // Add subcategory if exists
  if (company.subCategory) {
    const subcategoryPosition = company.subArea ? 7 : 6;
    const subcategoryUrl = company.subArea
      ? `${baseUrl}/country/${company.country.code}/city/${company.city.slug}/sub-area/${company.subArea.slug}/category/${company.category.slug}/${company.subCategory.slug}`
      : `${baseUrl}/country/${company.country.code}/city/${company.city.slug}/category/${company.category.slug}/${company.subCategory.slug}`;

    breadcrumbItems.push({
      "@type": "ListItem",
      position: subcategoryPosition,
      item: subcategoryUrl,
      name: company.subCategory.name,
    });
  }

  // Add company as final item
  const companyPosition = company.subCategory
    ? company.subArea
      ? 8
      : 7
    : company.subArea
    ? 7
    : 6;

  breadcrumbItems.push({
    "@type": "ListItem",
    position: companyPosition,
    item: `${baseUrl}/${company.slug}`,
    name: company.name,
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };
}

/**
 * Generates company schema based on category type
 */
export function generateCompanySchema(
  company: CompanyWithRelations,
  baseUrl: string
) {
  const schemaType = getSchemaType(
    company.category.slug,
    company.category.name
  );
  const priceRange = getPriceRange(schemaType);

  // Base schema properties
  const baseSchema: any = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: company.name,
    description: company.description || company.shortDescription,
    url: company.website || `${baseUrl}/${company.slug}`,
    image: company.mainImage ? `${baseUrl}${company.mainImage}` : undefined,
    logo: company.logoImage ? `${baseUrl}${company.logoImage}` : undefined,
    telephone: company.phone,
    email: company.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address,
      addressLocality: company.city.name,
      addressRegion: company.city.name,
      addressCountry: company.country.name,
    },
  };

  // Add geographic coordinates if available
  if (company.latitude && company.longitude) {
    baseSchema.geo = {
      "@type": "GeoCoordinates",
      latitude: company.latitude,
      longitude: company.longitude,
    };
  }

  // Add aggregate rating if reviews exist
  if (company.reviewsCount > 0) {
    baseSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: company.rating,
      reviewCount: company.reviewsCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add opening hours if available
  if (company.workingHours && company.workingHours.length > 0) {
    const openingHours = company.workingHours
      .filter((wh) => !wh.isClosed && wh.openTime && wh.closeTime)
      .map((wh) => {
        // Map Arabic days to English abbreviations
        const dayMapping: { [key: string]: string } = {
          الأحد: "Su",
          الاثنين: "Mo",
          الثلاثاء: "Tu",
          الأربعاء: "We",
          الخميس: "Th",
          الجمعة: "Fr",
          السبت: "Sa",
        };

        const dayAbbr = dayMapping[wh.dayOfWeek] || wh.dayOfWeek;
        return `${dayAbbr} ${wh.openTime}-${wh.closeTime}`;
      });

    if (openingHours.length > 0) {
      baseSchema.openingHours = openingHours;
    }
  }

  // Add price range for applicable business types
  if (
    [
      "Restaurant",
      "Store",
      "BeautySalon",
      "LodgingBusiness",
      "EntertainmentBusiness",
    ].includes(schemaType)
  ) {
    baseSchema.priceRange = priceRange;
  }

  // Add specific properties based on schema type
  switch (schemaType) {
    case "Restaurant":
      baseSchema.servesCuisine = company.services || [];
      if (
        company.services?.includes("توصيل") ||
        company.services?.includes("delivery")
      ) {
        baseSchema.hasDeliveryMethod = {
          "@type": "DeliveryMethod",
          name: "Delivery",
        };
      }
      break;

    case "MedicalOrganization":
    case "Hospital":
    case "MedicalClinic":
      baseSchema.medicalSpecialty =
        company.specialties || company.services || [];
      break;

    case "Store":
      baseSchema.paymentAccepted = ["Cash", "Credit Card"];
      break;

    case "LegalService":
    case "Attorney":
      baseSchema.areaServed = company.city.name;
      break;

    case "EducationalOrganization":
    case "School":
      baseSchema.hasCredential = company.specialties || [];
      break;
  }

  // Add social media links if available
  if (company.socialMedia && company.socialMedia.length > 0) {
    baseSchema.sameAs = company.socialMedia.map((sm) => sm.url);
  }

  // Add services/specialties as keywords
  if (company.services && company.services.length > 0) {
    baseSchema.keywords = company.services.join(", ");
  }

  // Remove undefined properties
  Object.keys(baseSchema).forEach((key) => {
    if (baseSchema[key] === undefined) {
      delete baseSchema[key];
    }
  });

  return baseSchema;
}

/**
 * Generates ItemList schema for category/city pages with companies
 */
export function generateItemListSchema(
  companies: CompanyWithRelations[],
  baseUrl: string,
  listName: string,
  listDescription?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    description: listDescription,
    numberOfItems: companies.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: companies.map((company, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": getSchemaType(company.category.slug, company.category.name),
        name: company.name,
        description: company.shortDescription || company.description,
        url: `${baseUrl}/${company.slug}`,
        image: company.mainImage ? `${baseUrl}${company.mainImage}` : undefined,
        aggregateRating:
          company.reviewsCount > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: company.rating,
                reviewCount: company.reviewsCount,
              }
            : undefined,
        priceRange: getPriceRange(
          getSchemaType(company.category.slug, company.category.name)
        ),
        telephone: company.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: company.address,
          addressLocality: company.city.name,
          addressCountry: company.country.name,
        },
      },
    })),
  };
}

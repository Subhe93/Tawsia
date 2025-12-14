# Schema.org Implementation Guide

This document explains the comprehensive Schema.org structured data implementation for the twsia business directory platform.

## Overview

The schema system automatically generates appropriate Schema.org markup based on company categories, providing rich structured data for search engines like Google, Bing, and others. This improves SEO, enables rich snippets, and helps search engines understand the content better.

## Features

### 🎯 Dynamic Schema Type Detection

- Automatically maps company categories to appropriate Schema.org types
- Supports Arabic and English category names
- Falls back to `LocalBusiness` for unknown categories

### 🏢 Supported Business Types

| Category                   | Schema.org Type           | Example               |
| -------------------------- | ------------------------- | --------------------- |
| **Food & Restaurants**     | `Restaurant`              | مطاعم، كافيهات        |
| **Healthcare**             | `MedicalOrganization`     | مستشفيات، عيادات      |
| **Construction**           | `GeneralContractor`       | شركات البناء، مقاولات |
| **Beauty & Personal Care** | `BeautySalon`             | صالونات التجميل       |
| **Legal Services**         | `LegalService`            | مكاتب المحاماة        |
| **Education**              | `EducationalOrganization` | مدارس، مراكز تدريب    |
| **Technology**             | `Organization`            | شركات البرمجة         |
| **Finance**                | `FinancialService`        | بنوك، خدمات مالية     |
| **Retail**                 | `Store`                   | متاجر، مراكز تسوق     |
| **Automotive**             | `AutomotiveBusiness`      | معارض سيارات          |
| **Lodging**                | `LodgingBusiness`         | فنادق، منتجعات        |
| **Entertainment**          | `EntertainmentBusiness`   | مراكز ترفيه           |

### 📊 Schema Types Generated

1. **Company Schema** - Individual business pages
2. **Organization Schema** - Website organization info
3. **WebSite Schema** - Site-wide search functionality
4. **BreadcrumbList Schema** - Navigation breadcrumbs
5. **ItemList Schema** - Category and city listing pages

## Implementation

### File Structure

```
lib/seo/
├── schema-generator.ts          # Main schema generation logic
├── schema-test-examples.ts      # Test examples and validation
└── ...

docs/
└── SCHEMA_ORG_IMPLEMENTATION.md # This documentation
```

### Core Functions

#### `getSchemaType(categorySlug: string, categoryName: string): string`

Determines the appropriate Schema.org type based on category.

```typescript
// Example usage
const schemaType = getSchemaType("food", "الأغذية والمطاعم");
// Returns: 'Restaurant'
```

#### `generateCompanySchema(company: CompanyWithRelations, baseUrl: string)`

Generates complete schema for individual company pages.

```typescript
// Features included:
// - Dynamic @type based on business category
// - Contact information (phone, email, address)
// - Geographic coordinates (if available)
// - Aggregate ratings and reviews
// - Opening hours
// - Social media links
// - Services and specialties
// - Price range (category-appropriate)
```

#### `generateItemListSchema(companies: CompanyWithRelations[], baseUrl: string, listName: string, listDescription?: string)`

Generates ItemList schema for category and city pages.

```typescript
// Features:
// - Lists multiple businesses with appropriate types
// - Includes ratings and basic info for each
// - Proper positioning and ordering
// - Category-specific schema types for each item
```

### Category Mapping Logic

The system uses a multi-layered approach to determine schema types:

1. **Exact Match**: Direct category slug mapping
2. **Arabic Keywords**: Matches Arabic terms in category names
3. **English Keywords**: Matches English terms
4. **Fallback**: Uses `LocalBusiness` as default

```typescript
// Arabic keyword examples
'مطعم' → Restaurant
'بناء' → GeneralContractor
'طب' → MedicalOrganization
'جمال' → BeautySalon
'قانون' → LegalService
```

## Usage Examples

### Restaurant Schema Output

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "مطعم الأصالة",
  "description": "مطعم يقدم أشهى المأكولات الشامية الأصيلة",
  "servesCuisine": ["طعام شامي", "مناسبات"],
  "priceRange": "$$",
  "hasDeliveryMethod": {
    "@type": "DeliveryMethod",
    "name": "Delivery"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.7,
    "reviewCount": 125
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "البلدة القديمة، دمشق، سوريا",
    "addressLocality": "دمشق",
    "addressCountry": "سوريا"
  },
  "openingHours": ["Su 10:00-23:00", "Mo 10:00-23:00"],
  "telephone": "+963 11 3456789",
  "url": "https://asala-restaurant.sy"
}
```

### Medical Clinic Schema Output

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  "name": "عيادة الشام الطبية",
  "description": "عيادة طبية متخصصة في الطب العام وطب الأسرة",
  "medicalSpecialty": ["أمراض باطنية", "طب الأطفال", "الطب الوقائي"],
  "priceRange": "$$$",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.8,
    "reviewCount": 156
  }
}
```

## Integration Points

### Company Pages

- **File**: `app/(frontend)/[company]/page.tsx`
- **Schemas**: Company, Organization, Website, Breadcrumb

### Category Pages

- **File**: `app/(frontend)/country/[country]/category/[category]/page.tsx`
- **Schema**: ItemList with category-specific business types

### City Pages

- **File**: `app/(frontend)/country/[country]/city/[citySlug]/page.tsx`
- **Schema**: ItemList with mixed business types

## Testing

### Validation Script

Run the test script to validate schema generation:

```bash
node scripts/test-schema-generation.js
```

### Google Rich Results Test

Use Google's Rich Results Test tool:

1. Visit: https://search.google.com/test/rich-results
2. Enter your page URL
3. Verify schema markup is detected correctly

### Schema Markup Validator

Use Schema.org's validator:

1. Visit: https://validator.schema.org/
2. Paste your JSON-LD markup
3. Check for validation errors

## Best Practices

### 1. Category Mapping

- Add new categories to `CATEGORY_SCHEMA_MAPPING` in `schema-generator.ts`
- Include both Arabic and English keyword matching
- Test with real business data

### 2. Price Ranges

- Update `PRICE_RANGE_MAPPING` for new business types
- Use appropriate ranges: `$`, `$$`, `$$$`, `$$$$`
- Consider local market pricing

### 3. Special Properties

- Add business-type specific properties (e.g., `servesCuisine` for restaurants)
- Include relevant service information
- Maintain data accuracy

### 4. Performance

- Schema generation happens at build time (SSG)
- Minimal runtime overhead
- Cached for static pages

## Troubleshooting

### Common Issues

1. **Missing Schema Type**

   - Check category mapping in `getSchemaType()`
   - Add new category to mapping table
   - Verify Arabic keyword matching

2. **Invalid JSON-LD**

   - Use Schema.org validator
   - Check for undefined values
   - Ensure proper escaping

3. **Missing Properties**
   - Verify company data completeness
   - Check database field mapping
   - Add fallback values

### Debug Mode

Enable debug logging by adding to company page:

```typescript
console.log("Schema Debug:", {
  category: company.category.slug,
  schemaType: getSchemaType(company.category.slug, company.category.name),
  schema: generateCompanySchema(company, baseUrl),
});
```

## Future Enhancements

### Planned Features

- [ ] Event schema for business events
- [ ] Product schema for retail businesses
- [ ] FAQ schema for service pages
- [ ] Review schema for individual reviews
- [ ] Local business hours validation
- [ ] Multi-language schema support

### Extension Points

- Add new business categories
- Implement industry-specific schemas
- Enhanced geographic data
- Integration with Google My Business
- Structured data for mobile apps

## Resources

- [Schema.org Documentation](https://schema.org/)
- [Google Search Central - Structured Data](https://developers.google.com/search/docs/appearance/structured-data)
- [JSON-LD Specification](https://json-ld.org/)
- [Rich Results Test Tool](https://search.google.com/test/rich-results)

---

**Last Updated**: October 2024  
**Version**: 1.0  
**Maintainer**: Development Team

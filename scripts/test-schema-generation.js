/**
 * Simple test script to validate schema generation
 * Run with: node scripts/test-schema-generation.js
 */

// Since this is a .js file, we'll use require instead of import
const {
  getSchemaType,
  getPriceRange,
} = require("../lib/seo/schema-generator.ts");

// Test cases for different business categories
const testCases = [
  // Arabic category names (as they appear in the database)
  { category: "food", name: "الأغذية والمطاعم", expected: "Restaurant" },
  {
    category: "construction",
    name: "البناء والإنشاء",
    expected: "GeneralContractor",
  },
  {
    category: "healthcare",
    name: "الرعاية الصحية",
    expected: "MedicalOrganization",
  },
  { category: "beauty", name: "الجمال والعناية", expected: "BeautySalon" },
  {
    category: "technology",
    name: "التكنولوجيا والبرمجة",
    expected: "Organization",
  },
  {
    category: "legal",
    name: "القانونية والاستشارية",
    expected: "LegalService",
  },
  {
    category: "education",
    name: "التعليم والتدريب",
    expected: "EducationalOrganization",
  },
  {
    category: "finance",
    name: "المالية والمصرفية",
    expected: "FinancialService",
  },
  { category: "retail", name: "التجارة والبيع", expected: "Store" },

  // Test Arabic keyword matching
  {
    category: "unknown-restaurant",
    name: "مطاعم وكافيهات",
    expected: "Restaurant",
  },
  {
    category: "unknown-medical",
    name: "خدمات طبية",
    expected: "MedicalOrganization",
  },
  {
    category: "unknown-construction",
    name: "شركات البناء والمقاولات",
    expected: "GeneralContractor",
  },
  {
    category: "unknown-beauty",
    name: "صالونات التجميل",
    expected: "BeautySalon",
  },
  {
    category: "unknown-legal",
    name: "مكاتب المحاماة",
    expected: "LegalService",
  },
  {
    category: "unknown-education",
    name: "مراكز التدريب والتعليم",
    expected: "EducationalOrganization",
  },
  {
    category: "unknown-tech",
    name: "شركات التكنولوجيا والبرمجة",
    expected: "Organization",
  },
  {
    category: "unknown-finance",
    name: "البنوك والخدمات المالية",
    expected: "FinancialService",
  },
  {
    category: "unknown-retail",
    name: "متاجر ومراكز التسوق",
    expected: "Store",
  },

  // Default fallback test
  { category: "unknown", name: "خدمات متنوعة", expected: "LocalBusiness" },
];

console.log("🧪 Testing Schema.org Type Generation\n");
console.log("=".repeat(60));

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  try {
    const result = getSchemaType(testCase.category, testCase.name);
    const priceRange = getPriceRange(result);
    const passed = result === testCase.expected;

    if (passed) {
      passedTests++;
      console.log(`✅ Test ${index + 1}: PASSED`);
    } else {
      console.log(`❌ Test ${index + 1}: FAILED`);
    }

    console.log(`   Category: ${testCase.category}`);
    console.log(`   Name: ${testCase.name}`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   Got: ${result}`);
    console.log(`   Price Range: ${priceRange}`);
    console.log("");
  } catch (error) {
    console.log(`💥 Test ${index + 1}: ERROR - ${error.message}`);
    console.log(`   Category: ${testCase.category}`);
    console.log(`   Name: ${testCase.name}`);
    console.log("");
  }
});

console.log("=".repeat(60));
console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log("🎉 All tests passed! Schema generation is working correctly.");
  process.exit(0);
} else {
  console.log("⚠️  Some tests failed. Please check the implementation.");
  process.exit(1);
}

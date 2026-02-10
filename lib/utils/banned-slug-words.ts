/**
 * كلمات محظورة في روابط الشركات (slug) - من old-changed-slug.csv
 * أي جزء في الـ slug يطابق "form" يتم استبداله بـ "to"
 */
const BANNED_SLUG_REPLACEMENTS: Record<string, string> = {
  kafyh: "cafe",
  kar: "car",
  syarat: "cars",
  mrkz: "center",
  llalbsh: "clothing",
  azyaa: "clothing",
  mlbwsat: "clothing",
  shrkh: "company",
  hwasyb: "computers",
  kmbywtr: "computers",
  staer: "curtains",
  jmrky: "customs-clearance",
  asnan: "dental-clinic",
  qyadh: "driving-school",
  kazyh: "gas-station",
  mhrwqat: "gas-station",
  mhth: "gas-station",
  nady: "gym",
  mshfa: "hospital",
  mstshfa: "hospital",
  fndq: "hotel",
  shhn: "international-shipping",
  mjwhrat: "jewellery",
  mswghat: "jewellery",
  hdanh: "kindergarten",
  rwdh: "kindergarten",
  mktb: "office",
  atwr: "parfum",
  tswyr: "photography",
  aqarat: "real-estate",
  aqaryh: "real-estate",
  mdars: "school",
  mdrsh: "school",
  thanwyh: "school",
  hdhaa: "shoes",
  llahdhyh: "shoes",
  shwz: "shoes",
  mard: "showroom",
  shmsyh: "solar",
  taqh: "solar",
  sbwrat: "sporat",
  mlab: "stadium",
  mhl: "store",
  stwdyw: "studio",
  tksy: "taxi",
  tknwlwjy: "technology",
  jamah: "university",
  ayadh: "clinic",
  mswr: "photography",
  dktwr: "doctor",
  mfrwshat: "furniture",
};

const BANNED_WORDS_SET = new Set(
  Object.keys(BANNED_SLUG_REPLACEMENTS).map((k) => k.toLowerCase())
);

/**
 * ينظف الـ slug من الكلمات المحظورة: يستبدل أي جزء يطابق كلمة محظورة بالبديل.
 * التطابق يكون على الأجزاء بين الشرطات (مثلاً في "my-kar-company" يُستبدل "kar" بـ "car").
 */
export function sanitizeSlug(slug: string): string {
  if (!slug || typeof slug !== "string") return slug;
  const segments = slug.toLowerCase().trim().split("-").filter(Boolean);
  const replaced = segments.map((seg) => {
    const key = seg.toLowerCase();
    return BANNED_SLUG_REPLACEMENTS[key] ?? seg;
  });
  return replaced.join("-") || "company";
}

/**
 * يتحقق مما إذا كان الـ slug يحتوي على أي كلمة محظورة (قبل الاستبدال).
 */
export function slugContainsBannedWord(slug: string): boolean {
  if (!slug || typeof slug !== "string") return false;
  const segments = slug.toLowerCase().split("-").filter(Boolean);
  return segments.some((seg) => BANNED_WORDS_SET.has(seg));
}

/**
 * قائمة الكلمات المحظورة وبدائلها (للعرض أو الرسائل).
 */
export function getBannedSlugMapping(): Array<{ from: string; to: string }> {
  return Object.entries(BANNED_SLUG_REPLACEMENTS).map(([from, to]) => ({
    from,
    to,
  }));
}

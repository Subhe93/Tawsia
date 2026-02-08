/**
 * يولد ملف بيانات التوجيه من 800.csv و old-changed-slug.csv
 * للاستخدام في Middleware (Edge) بدون fs في وقت التشغيل.
 * تشغيل: node scripts/generate-redirects-data.js
 */

const fs = require("fs");
const path = require("path");

const REDIRACT_DIR = path.join(__dirname, "..", "rediract_doc");
const OUTPUT_FILE = path.join(__dirname, "..", "lib", "redirects-data.generated.ts");

function normalizeUrlToPath(url) {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (!trimmed) return "";
  try {
    const u = new URL(trimmed);
    return (u.pathname || "/") + (u.search || "");
  } catch {
    return trimmed.replace(/^https?:\/\/[^/]+/i, "") || "/";
  }
}

function escapeForTs(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

// قراءة 800.csv (أولوية 1)
const csv800Path = path.join(REDIRACT_DIR, "800.csv");
const explicitRedirects = [];
const seenSources = new Set();

if (fs.existsSync(csv800Path)) {
  const content = fs.readFileSync(csv800Path, "utf8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",").map((p) => p.trim());
    if (parts.length < 2) continue;
    const fromPath = normalizeUrlToPath(parts[0]);
    const toPath = normalizeUrlToPath(parts[1]);
    if (!fromPath || !toPath || fromPath === toPath) continue;
    if (seenSources.has(fromPath)) continue;
    seenSources.add(fromPath);
    explicitRedirects.push([fromPath, toPath]);
  }
}

// قراءة old-changed-slug.csv (أولوية 2 - استبدال كلمات)
const slugCsvPath = path.join(REDIRACT_DIR, "old-changed-slug.csv");
const slugReplacements = [];

if (fs.existsSync(slugCsvPath)) {
  const content = fs.readFileSync(slugCsvPath, "utf8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",").map((p) => p.trim());
    if (parts.length < 2 || !parts[0] || !parts[1]) continue;
    slugReplacements.push({ from: parts[0], to: parts[1] });
  }
}

// كتابة الملف المولّد (TypeScript صالح لـ Edge)
const lines = [
  "// ملف مُولَّد تلقائياً - لا تعديل يدوي. تشغيل: node scripts/generate-redirects-data.js",
  "",
  "export const explicitRedirects = new Map<string, string>([",
  ...explicitRedirects.map(
    ([from, to]) => `  ["${escapeForTs(from)}", "${escapeForTs(to)}"],`
  ),
  "]);",
  "",
  "export const slugReplacements: { from: string; to: string }[] = [",
  ...slugReplacements.map(
    (r) => `  { from: "${escapeForTs(r.from)}", to: "${escapeForTs(r.to)}" },`
  ),
  "];",
  "",
];

const dir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(OUTPUT_FILE, lines.join("\n"), "utf8");

console.log(
  `[generate-redirects-data] تم: ${explicitRedirects.length} توجيه صريح، ${slugReplacements.length} استبدال كلمة → ${OUTPUT_FILE}`
);

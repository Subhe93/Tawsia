const fs = require("fs");
const path = require("path");

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

function getRedirectsFromCsv() {
  const csvPath = path.join(__dirname, "800.csv");

  if (!fs.existsSync(csvPath)) {
    console.warn("[redirects-from-csv] CSV file not found:", csvPath);
    return [];
  }

  const content = fs.readFileSync(csvPath, "utf8");
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length <= 1) return [];

  const redirects = [];
  const seenSources = new Set();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    const parts = line.split(",");
    if (parts.length < 2) continue;

    const rawFrom = parts[0];
    const rawTo = parts[1];

    if (!rawFrom || !rawTo) continue;

    const fromPath = normalizeUrlToPath(rawFrom);
    const toPath = normalizeUrlToPath(rawTo);

    if (!fromPath || !toPath) continue;

    if (fromPath === toPath) continue;

    if (seenSources.has(fromPath)) continue;
    seenSources.add(fromPath);

    redirects.push({
      source: fromPath,
      destination: toPath,
      permanent: true,
    });
  }

  return redirects;
}

module.exports = {
  getRedirectsFromCsv,
};

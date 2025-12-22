/**
 * سكريبت بناء جميع ملفات السايت ماب
 * 
 * يقوم بقراءة البيانات من Database وبناء جميع ملفات XML
 * 
 * الاستخدام:
 * npm run sitemap:build
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const { gzip } = require('zlib');

const prisma = new PrismaClient();
const gzipAsync = promisify(gzip);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';

// تنظيف XML
function escapeXML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// تنسيق التاريخ
function formatDate(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

// توليد XML
function generateSitemapXML(urls) {
  const urlsXML = urls
    .map((item) => {
      const lastMod = item.lastModified ? formatDate(item.lastModified) : formatDate(new Date());
      const changeFreq = item.changeFrequency || 'monthly';
      const priority = item.priority !== undefined ? item.priority : 0.5;

      return `  <url>
    <loc>${escapeXML(item.url)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXML}
</urlset>`;
}

// توليد Index
function generateSitemapIndex(sitemaps) {
  const sitemapsXML = sitemaps
    .map((sitemap) => {
      const lastMod = sitemap.lastmod ? formatDate(sitemap.lastmod) : formatDate(new Date());
      return `  <sitemap>
    <loc>${escapeXML(sitemap.loc)}</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapsXML}
</sitemapindex>`;
}

// كتابة ملف
async function writeSitemapFile(fileName, content, compress = true) {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, fileName);

    await fs.writeFile(filePath, content, 'utf-8');
    const size = Buffer.byteLength(content, 'utf-8');

    if (compress) {
      const compressed = await gzipAsync(content);
      await fs.writeFile(`${filePath}.gz`, compressed);
    }

    return { success: true, size };
  } catch (error) {
    console.error(`❌ خطأ في كتابة ${fileName}:`, error.message);
    return { success: false, size: 0 };
  }
}

// تنسيق الحجم
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// بناء ملف محدد
async function buildSitemapFile(sitemapFileName) {
  const startTime = Date.now();

  try {
    console.log(`📄 بناء ${sitemapFileName}...`);

    const entries = await prisma.sitemapEntry.findMany({
      where: {
        sitemapFile: sitemapFileName.replace('sitemap-', '').replace('.xml', ''),
        isActive: true,
      },
      include: {
        company: { select: { updatedAt: true } },
      },
      orderBy: { positionInFile: 'asc' },
    });

    if (entries.length === 0) {
      console.log(`⚠️  لا توجد روابط في ${sitemapFileName}`);
      return { success: false, urlsCount: 0, size: '0 KB', generationTime: 0 };
    }

    const urls = entries.map((entry) => ({
      url: entry.url,
      lastModified: entry.company?.updatedAt || entry.lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    }));

    const xml = generateSitemapXML(urls);
    const result = await writeSitemapFile(sitemapFileName, xml, true);
    const generationTime = Date.now() - startTime;

    await prisma.sitemapFile.update({
      where: { fileName: sitemapFileName },
      data: {
        urlsCount: entries.length,
        fileSize: BigInt(result.size),
        lastGenerated: new Date(),
        needsRebuild: false,
        generationTime: generationTime,
      },
    });

    console.log(`✅ ${sitemapFileName}: ${entries.length} URLs - ${formatBytes(result.size)} (${generationTime}ms)`);

    return {
      success: result.success,
      urlsCount: entries.length,
      size: formatBytes(result.size),
      generationTime,
    };
  } catch (error) {
    console.error(`❌ خطأ في بناء ${sitemapFileName}:`, error.message);
    return { success: false, urlsCount: 0, size: '0 KB', generationTime: 0 };
  }
}

// بناء Index
async function buildSitemapIndex() {
  try {
    console.log('📄 بناء Sitemap Index...');

    const files = await prisma.sitemapFile.findMany({
      where: { isActive: true },
      orderBy: [{ fileType: 'asc' }, { fileIndex: 'asc' }],
    });

    const sitemaps = files.map((file) => ({
      loc: `${baseUrl}/${file.fileName}`,
      lastmod: file.lastGenerated,
    }));

    const xml = generateSitemapIndex(sitemaps);
    const result = await writeSitemapFile('sitemap.xml', xml, true);

    console.log(`✅ Index: ${files.length} ملفات - ${formatBytes(result.size)}`);

    return { success: result.success, filesCount: files.length };
  } catch (error) {
    console.error('❌ خطأ في بناء Index:', error.message);
    return { success: false, filesCount: 0 };
  }
}

// بناء الكل
async function buildAllSitemaps() {
  const startTime = Date.now();

  console.log('🚀 بدء بناء جميع ملفات السايت ماب...\n');

  try {
    const files = await prisma.sitemapFile.findMany({
      where: { isActive: true },
      orderBy: [{ fileType: 'asc' }, { fileIndex: 'asc' }],
    });

    let totalUrls = 0;
    let totalSize = 0;

    for (const file of files) {
      const result = await buildSitemapFile(file.fileName);
      totalUrls += result.urlsCount;
      const sizeNum = parseInt(result.size.replace(/[^0-9]/g, '')) || 0;
      totalSize += sizeNum;
    }

    await buildSitemapIndex();
    const totalTime = Date.now() - startTime;

    await prisma.sitemapConfig.updateMany({
      data: {
        totalUrls,
        totalFiles: files.length,
        lastFullRebuild: new Date(),
      },
    });

    console.log('\n' + '='.repeat(50));
    console.log('✅ اكتمل بناء السايت ماب!');
    console.log('='.repeat(50));
    console.log(`📊 الإحصائيات:`);
    console.log(`   - عدد الملفات: ${files.length}`);
    console.log(`   - إجمالي الروابط: ${totalUrls}`);
    console.log(`   - الحجم الإجمالي: ~${formatBytes(totalSize * 1024)}`);
    console.log(`   - الوقت الكلي: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log('='.repeat(50) + '\n');

    return { success: true, totalFiles: files.length, totalUrls, totalTime };
  } catch (error) {
    console.error('❌ خطأ في بناء السايت ماب:', error);
    return { success: false, totalFiles: 0, totalUrls: 0, totalTime: 0 };
  }
}

// الدالة الرئيسية
async function main() {
  try {
    const result = await buildAllSitemaps();

    if (result.success) {
      console.log('✅ تم بناء السايت ماب بنجاح!\n');
      process.exit(0);
    } else {
      console.error('❌ فشل في بناء السايت ماب\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ خطأ فادح:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


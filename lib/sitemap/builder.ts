/**
 * بناء ملفات السايت ماب من Database
 */

import prisma from '@/lib/prisma';
import { generateSitemapXML, generateSitemapIndex, type SitemapUrl, type SitemapIndexEntry } from './xml-generator';
import { writeSitemapFile, formatBytes } from './file-manager';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';

/**
 * بناء الملف الرئيسي (Sitemap Index)
 */
export async function buildSitemapIndex(): Promise<{
  success: boolean;
  filesCount: number;
  size: string;
}> {
  try {
    console.log('📄 بناء Sitemap Index...');

    // جلب جميع الملفات النشطة
    const files = await prisma.sitemapFile.findMany({
      where: { isActive: true },
      orderBy: [
        { fileType: 'asc' },
        { fileIndex: 'asc' },
      ],
    });

    // تحويل إلى Index Entries
    const sitemaps: SitemapIndexEntry[] = files.map((file) => ({
      loc: `${baseUrl}/${file.fileName}`,
      lastmod: file.lastGenerated,
    }));

    // توليد XML
    const xml = generateSitemapIndex(sitemaps);

    // كتابة الملف
    const result = await writeSitemapFile('sitemap.xml', xml, { compress: true });

    console.log(`✅ Index: ${files.length} ملفات - ${formatBytes(result.size)}`);

    return {
      success: result.success,
      filesCount: files.length,
      size: formatBytes(result.size),
    };
  } catch (error) {
    console.error('❌ خطأ في بناء Index:', error);
    return {
      success: false,
      filesCount: 0,
      size: '0 KB',
    };
  }
}

/**
 * بناء ملف السايت ماب حسب الفلتر
 */
export async function buildSitemapFile(
  sitemapFileName: string
): Promise<{
  success: boolean;
  urlsCount: number;
  size: string;
  generationTime: number;
}> {
  const startTime = Date.now();

  try {
    console.log(`📄 بناء ${sitemapFileName}...`);

    // جلب الروابط من Database
    const entries = await prisma.sitemapEntry.findMany({
      where: {
        sitemapFile: sitemapFileName.replace('sitemap-', '').replace('.xml', ''),
        isActive: true,
      },
      include: {
        company: {
          select: { updatedAt: true },
        },
      },
      orderBy: { positionInFile: 'asc' },
    });

    if (entries.length === 0) {
      console.log(`⚠️  لا توجد روابط في ${sitemapFileName}`);
      return {
        success: false,
        urlsCount: 0,
        size: '0 KB',
        generationTime: 0,
      };
    }

    // تحويل إلى SitemapUrl
    const urls: SitemapUrl[] = entries.map((entry) => ({
      url: entry.url,
      lastModified: entry.company?.updatedAt || entry.lastModified,
      changeFrequency: entry.changeFrequency as any,
      priority: entry.priority,
    }));

    // توليد XML
    const xml = generateSitemapXML(urls);

    // كتابة الملف
    const result = await writeSitemapFile(sitemapFileName, xml, { compress: true });

    const generationTime = Date.now() - startTime;

    // تحديث Database
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
    console.error(`❌ خطأ في بناء ${sitemapFileName}:`, error);
    return {
      success: false,
      urlsCount: 0,
      size: '0 KB',
      generationTime: Date.now() - startTime,
    };
  }
}

/**
 * بناء جميع ملفات السايت ماب
 */
export async function buildAllSitemaps(): Promise<{
  success: boolean;
  totalFiles: number;
  totalUrls: number;
  totalSize: string;
  totalTime: number;
}> {
  const startTime = Date.now();

  console.log('🚀 بدء بناء جميع ملفات السايت ماب...\n');

  try {
    // جلب جميع الملفات
    const files = await prisma.sitemapFile.findMany({
      where: { isActive: true },
      orderBy: [
        { fileType: 'asc' },
        { fileIndex: 'asc' },
      ],
    });

    let totalUrls = 0;
    let totalSize = 0;
    const results = [];

    // بناء كل ملف
    for (const file of files) {
      const result = await buildSitemapFile(file.fileName);
      totalUrls += result.urlsCount;
      totalSize += result.size ? parseInt(result.size.replace(/[^0-9]/g, '')) : 0;
      results.push(result);
    }

    // بناء الـ Index
    await buildSitemapIndex();

    const totalTime = Date.now() - startTime;

    // تحديث الإعدادات
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

    return {
      success: true,
      totalFiles: files.length,
      totalUrls,
      totalSize: formatBytes(totalSize * 1024),
      totalTime,
    };
  } catch (error) {
    console.error('❌ خطأ في بناء السايت ماب:', error);
    return {
      success: false,
      totalFiles: 0,
      totalUrls: 0,
      totalSize: '0 KB',
      totalTime: Date.now() - startTime,
    };
  }
}

/**
 * بناء الملفات التي تحتاج تحديث فقط
 */
export async function rebuildModifiedFiles(): Promise<{
  success: boolean;
  rebuiltFiles: number;
}> {
  try {
    console.log('🔄 بناء الملفات المعدلة فقط...\n');

    // جلب الملفات التي تحتاج تحديث
    const files = await prisma.sitemapFile.findMany({
      where: {
        needsRebuild: true,
        isActive: true,
      },
    });

    if (files.length === 0) {
      console.log('✅ لا توجد ملفات تحتاج تحديث');
      return {
        success: true,
        rebuiltFiles: 0,
      };
    }

    console.log(`📁 يوجد ${files.length} ملف يحتاج تحديث...\n`);

    // بناء كل ملف
    for (const file of files) {
      await buildSitemapFile(file.fileName);
    }

    // تحديث الـ Index
    await buildSitemapIndex();

    console.log(`\n✅ تم تحديث ${files.length} ملف بنجاح\n`);

    return {
      success: true,
      rebuiltFiles: files.length,
    };
  } catch (error) {
    console.error('❌ خطأ في إعادة البناء:', error);
    return {
      success: false,
      rebuiltFiles: 0,
    };
  }
}


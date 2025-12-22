/**
 * توزيع الشركات على ملفات السايت ماب
 */

import prisma from '@/lib/prisma';

export interface DistributionResult {
  distribution: Array<{
    fileId: string;
    fileName: string;
    fileIndex: number;
    count: number;
    currentCount: number;
    newCount: number;
    isFull: boolean;
  }>;
  totalCompanies: number;
  affectedFiles: string[];
}

/**
 * توزيع عدد من الشركات على الملفات
 */
export async function distributeCompanies(
  companiesCount: number
): Promise<DistributionResult> {
  const config = await prisma.sitemapConfig.findFirst();
  const perFile = config?.companiesPerFile || 10000;

  // البحث عن ملف غير ممتلئ
  let currentFile = await prisma.sitemapFile.findFirst({
    where: {
      fileType: 'COMPANIES',
      isFull: false,
      isActive: true,
    },
    orderBy: { fileIndex: 'asc' },
  });

  // إذا لم يوجد، أنشئ ملف جديد
  if (!currentFile) {
    const lastFile = await prisma.sitemapFile.findFirst({
      where: { fileType: 'COMPANIES' },
      orderBy: { fileIndex: 'desc' },
    });

    const newIndex = (lastFile?.fileIndex || 0) + 1;

    currentFile = await prisma.sitemapFile.create({
      data: {
        fileName: `sitemap-companies-${newIndex}.xml`,
        fileType: 'COMPANIES',
        fileIndex: newIndex,
        urlsCount: 0,
        maxCapacity: perFile,
        isFull: false,
        isActive: true,
      },
    });
  }

  const distribution: DistributionResult['distribution'] = [];
  const affectedFiles: string[] = [];
  let remaining = companiesCount;

  // حساب التوزيع
  while (remaining > 0) {
    const available = currentFile.maxCapacity - currentFile.urlsCount;

    if (available <= 0) {
      // الملف ممتلئ، أنشئ جديد
      const newIndex = currentFile.fileIndex + 1;
      currentFile = await prisma.sitemapFile.create({
        data: {
          fileName: `sitemap-companies-${newIndex}.xml`,
          fileType: 'COMPANIES',
          fileIndex: newIndex,
          urlsCount: 0,
          maxCapacity: perFile,
          isFull: false,
          isActive: true,
        },
      });
      continue;
    }

    const toAdd = Math.min(remaining, available);
    const newCount = currentFile.urlsCount + toAdd;

    distribution.push({
      fileId: currentFile.id,
      fileName: currentFile.fileName,
      fileIndex: currentFile.fileIndex,
      count: toAdd,
      currentCount: currentFile.urlsCount,
      newCount,
      isFull: newCount >= currentFile.maxCapacity,
    });

    affectedFiles.push(currentFile.fileName.replace('.xml', ''));
    remaining -= toAdd;

    // إذا كان هناك باقي، انتقل للملف التالي
    if (remaining > 0) {
      const newIndex = currentFile.fileIndex + 1;
      const existingNext = await prisma.sitemapFile.findFirst({
        where: {
          fileType: 'COMPANIES',
          fileIndex: newIndex,
        },
      });

      if (existingNext) {
        currentFile = existingNext;
      } else {
        currentFile = await prisma.sitemapFile.create({
          data: {
            fileName: `sitemap-companies-${newIndex}.xml`,
            fileType: 'COMPANIES',
            fileIndex: newIndex,
            urlsCount: 0,
            maxCapacity: perFile,
            isFull: false,
            isActive: true,
          },
        });
      }
    }
  }

  return {
    distribution,
    totalCompanies: companiesCount,
    affectedFiles,
  };
}

/**
 * الحصول على معلومات التوزيع الحالي
 */
export async function getCurrentDistribution(): Promise<{
  totalFiles: number;
  fullFiles: number;
  partialFiles: number;
  emptyFiles: number;
  totalUrls: number;
  availableSpace: number;
  nextFile: {
    fileName: string;
    fileIndex: number;
    currentCount: number;
    availableSpace: number;
  } | null;
}> {
  const files = await prisma.sitemapFile.findMany({
    where: {
      fileType: 'COMPANIES',
      isActive: true,
    },
    orderBy: { fileIndex: 'asc' },
  });

  const totalFiles = files.length;
  const fullFiles = files.filter((f) => f.isFull).length;
  const partialFiles = files.filter((f) => !f.isFull && f.urlsCount > 0).length;
  const emptyFiles = files.filter((f) => f.urlsCount === 0).length;
  const totalUrls = files.reduce((sum, f) => sum + f.urlsCount, 0);
  const availableSpace = files.reduce(
    (sum, f) => sum + (f.maxCapacity - f.urlsCount),
    0
  );

  // الملف التالي غير الممتلئ
  const nextFile = files.find((f) => !f.isFull);

  return {
    totalFiles,
    fullFiles,
    partialFiles,
    emptyFiles,
    totalUrls,
    availableSpace,
    nextFile: nextFile
      ? {
          fileName: nextFile.fileName,
          fileIndex: nextFile.fileIndex,
          currentCount: nextFile.urlsCount,
          availableSpace: nextFile.maxCapacity - nextFile.urlsCount,
        }
      : null,
  };
}

/**
 * تحديث حالة الملفات بعد الإضافة
 */
export async function updateFileStats(
  distribution: DistributionResult['distribution']
): Promise<void> {
  for (const file of distribution) {
    await prisma.sitemapFile.update({
      where: { id: file.fileId },
      data: {
        urlsCount: file.newCount,
        isFull: file.isFull,
        needsRebuild: true,
      },
    });
  }
}

/**
 * الحصول على معلومات ملف محدد
 */
export async function getFileInfo(fileName: string) {
  const file = await prisma.sitemapFile.findUnique({
    where: { fileName },
  });

  if (!file) {
    return null;
  }

  const percentage = (file.urlsCount / file.maxCapacity) * 100;
  const availableSpace = file.maxCapacity - file.urlsCount;

  return {
    ...file,
    percentage: percentage.toFixed(2),
    availableSpace,
  };
}


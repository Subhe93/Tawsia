/**
 * مدير ملفات السايت ماب
 * يتعامل مع القراءة والكتابة والضغط
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { promisify } from 'util';
import { gzip } from 'zlib';

const gzipAsync = promisify(gzip);

/**
 * كتابة ملف السايت ماب
 */
export async function writeSitemapFile(
  fileName: string,
  content: string,
  options: { compress?: boolean } = {}
): Promise<{ success: boolean; size: number; compressedSize?: number }> {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, fileName);

    // كتابة الملف العادي
    await fs.writeFile(filePath, content, 'utf-8');
    const size = Buffer.byteLength(content, 'utf-8');

    let compressedSize: number | undefined;

    // ضغط الملف إذا طُلب
    if (options.compress) {
      const compressed = await gzipAsync(content);
      await fs.writeFile(`${filePath}.gz`, compressed);
      compressedSize = compressed.length;
    }

    return {
      success: true,
      size,
      compressedSize,
    };
  } catch (error) {
    console.error(`خطأ في كتابة الملف ${fileName}:`, error);
    return {
      success: false,
      size: 0,
    };
  }
}

/**
 * قراءة ملف السايت ماب
 */
export async function readSitemapFile(fileName: string): Promise<string | null> {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, fileName);
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`خطأ في قراءة الملف ${fileName}:`, error);
    return null;
  }
}

/**
 * حذف ملف السايت ماب
 */
export async function deleteSitemapFile(fileName: string): Promise<boolean> {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, fileName);
    
    // حذف الملف العادي
    await fs.unlink(filePath);
    
    // حذف الملف المضغوط إن وُجد
    try {
      await fs.unlink(`${filePath}.gz`);
    } catch {
      // تجاهل إذا لم يوجد
    }
    
    return true;
  } catch (error) {
    console.error(`خطأ في حذف الملف ${fileName}:`, error);
    return false;
  }
}

/**
 * التحقق من وجود ملف
 */
export async function fileExists(fileName: string): Promise<boolean> {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, fileName);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * الحصول على حجم الملف
 */
export async function getFileSize(fileName: string): Promise<number> {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, fileName);
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/**
 * تنسيق الحجم للقراءة
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * الحصول على جميع ملفات السايت ماب في المجلد
 */
export async function listSitemapFiles(): Promise<string[]> {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const files = await fs.readdir(publicDir);
    return files.filter(file => 
      file.startsWith('sitemap') && 
      (file.endsWith('.xml') || file.endsWith('.xml.gz'))
    );
  } catch (error) {
    console.error('خطأ في قراءة الملفات:', error);
    return [];
  }
}

/**
 * نسخ احتياطي لملف السايت ماب
 */
export async function backupSitemapFile(fileName: string): Promise<boolean> {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, fileName);
    const backupPath = path.join(publicDir, `${fileName}.backup`);
    
    const content = await fs.readFile(filePath, 'utf-8');
    await fs.writeFile(backupPath, content, 'utf-8');
    
    return true;
  } catch (error) {
    console.error(`خطأ في عمل نسخة احتياطية ${fileName}:`, error);
    return false;
  }
}


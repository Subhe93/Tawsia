// مدير جلسات الاستيراد للحفاظ على الجلسات بين إعادة التشغيل
interface ImportSession {
  id: string;
  status: "running" | "paused" | "completed" | "failed" | "cancelled";
  data: any[];
  settings: any;
  stats: {
    totalRows: number;
    processedRows: number;
    successfulImports: number;
    failedImports: number;
    skippedRows: number;
    downloadedImages: number;
    failedImages: number;
  };
  errors: Array<{
    row: number;
    companyName: string;
    error: string;
    data?: any;
  }>;
  skippedCompanies: Array<{
    row: number;
    companyName: string;
    reason: string;
    data?: any;
  }>;
  startedAt: Date;
  currentIndex: number;
}

class ImportSessionManager {
  private sessions: Map<string, ImportSession>;

  constructor() {
    this.sessions = new Map();
  }

  createSession(session: ImportSession): void {
    this.sessions.set(session.id, session);
    console.log(`جلسة استيراد جديدة: ${session.id}`);
    console.log(`إجمالي الجلسات: ${this.sessions.size}`);
  }

  getSession(id: string): ImportSession | undefined {
    const session = this.sessions.get(id);
    console.log(`البحث عن جلسة: ${id}, موجودة: ${!!session}`);
    return session;
  }

  updateSession(id: string, updates: Partial<ImportSession>): void {
    const session = this.sessions.get(id);
    if (session) {
      Object.assign(session, updates);
      this.sessions.set(id, session);
    }
  }

  deleteSession(id: string): boolean {
    const deleted = this.sessions.delete(id);
    console.log(`حذف جلسة ${id}: ${deleted ? "نجح" : "فشل"}`);
    return deleted;
  }

  getAllSessions(): ImportSession[] {
    return Array.from(this.sessions.values());
  }

  getSessionIds(): string[] {
    return Array.from(this.sessions.keys());
  }

  getSessionCount(): number {
    return this.sessions.size;
  }

  // تنظيف الجلسات القديمة (أكثر من ساعة)
  cleanupOldSessions(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const toDelete: string[] = [];

    this.sessions.forEach((session, id) => {
      if (
        session.startedAt < oneHourAgo &&
        (session.status === "completed" ||
          session.status === "failed" ||
          session.status === "cancelled")
      ) {
        toDelete.push(id);
      }
    });

    toDelete.forEach((id) => this.deleteSession(id));

    if (toDelete.length > 0) {
      console.log(`تم تنظيف ${toDelete.length} جلسة قديمة`);
    }
  }
}

// إنشاء مدير جلسات واحد للتطبيق كله
declare global {
  var importSessionManager: ImportSessionManager | undefined;
}

const importSessionManager =
  globalThis.importSessionManager ?? new ImportSessionManager();
globalThis.importSessionManager = importSessionManager;

// تشغيل تنظيف دوري كل 30 دقيقة
if (typeof window === "undefined") {
  // فقط على الخادم
  setInterval(() => {
    importSessionManager.cleanupOldSessions();
  }, 30 * 60 * 1000); // 30 دقيقة
}

export default importSessionManager;
export type { ImportSession };

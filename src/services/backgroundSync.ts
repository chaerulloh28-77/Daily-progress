/**
 * Background Service & Offline Synchronization Engine
 * 
 * Mengelola fungsionalitas aplikasi di belakang layar (Background Mode):
 * 1. Service Worker & Workbox asset caching (PWA offline access)
 * 2. Background Sync Queue (antrean laporan saat offline, otomatis sinkron ke Cloud saat online kembali)
 * 3. Background Auto-Save (menyimpan draft formulir saat tab diminimalkan, layar mati, atau beralih aplikasi)
 * 4. Visibility & Connectivity Listeners (mendeteksi perubahan jaringan & status tab)
 * 5. Wake Lock API (menjaga layar tetap aktif saat pengisian lapangan bila diinginkan)
 */

import { registerSW } from 'virtual:pwa-register';
import { DailyReportFormData } from '../types';
import { saveDailyReportToCloud } from './firebase';

export interface QueuedBackgroundReport {
  id: string;
  report: DailyReportFormData;
  userEmail: string;
  userRole: string;
  queuedAt: string;
  retryCount: number;
  lastError?: string;
}

const STORAGE_QUEUE_KEY = 'GOV_BG_SYNC_QUEUE_V1';
const STORAGE_DRAFT_KEY = 'GOV_BG_ACTIVE_DRAFT_V1';

let isProcessingQueue = false;
let updateSWHandler: ((reloadPage?: boolean) => Promise<void>) | null = null;
let isSWRegistered = false;

// Event listeners registry
type SyncCallback = (status: {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: string | null;
}) => void;

const syncListeners: Set<SyncCallback> = new Set();
let lastSuccessfulSyncTime: string | null = null;

function notifyListeners(isSyncing = false) {
  const status = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: getPendingBackgroundQueue().length,
    isSyncing,
    lastSyncTime: lastSuccessfulSyncTime,
  };
  syncListeners.forEach((listener) => {
    try {
      listener(status);
    } catch (e) {
      console.error('[BackgroundSync] Listener callback error:', e);
    }
  });

  // Dispatch custom window event for other components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('gov-background-sync-update', { detail: status })
    );
  }
}

/**
 * 1. PWA Service Worker Registration
 */
export function initBackgroundServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    updateSWHandler = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[SW] New content available, ready to update in background.');
      },
      onOfflineReady() {
        console.log('[SW] App is ready to work offline & in background.');
        notifyListeners();
      },
      onRegistered(r) {
        console.log('[SW] Service Worker registered successfully in background:', r?.scope);
        isSWRegistered = true;

        // Register Background Sync if supported
        if (r && 'sync' in r) {
          try {
            (r as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync
              .register('gov-bg-sync-reports')
              .catch((err) => console.log('[SW] Background sync register notice:', err));
          } catch {
            // Background sync API not available or constrained
          }
        }
      },
      onRegisterError(error) {
        console.warn('[SW] Service Worker registration failed:', error);
      },
    });
  } catch (error) {
    console.warn('[SW] Could not initialize registerSW:', error);
  }

  // Setup Connectivity & Visibility listeners
  setupBackgroundListeners();
}

/**
 * 2. Background Sync Queue Management
 */
export function getPendingBackgroundQueue(): QueuedBackgroundReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('[BackgroundSync] Failed to read queue:', e);
    return [];
  }
}

export function saveBackgroundQueue(queue: QueuedBackgroundReport[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(queue));
    notifyListeners();
  } catch (e) {
    console.error('[BackgroundSync] Failed to save queue:', e);
  }
}

/**
 * Memasukkan laporan ke antrean latar belakang
 */
export function enqueueReportForBackgroundSync(
  report: DailyReportFormData,
  userEmail: string,
  userRole: string
): QueuedBackgroundReport {
  const queue = getPendingBackgroundQueue();
  const queueId = report.id || `QUEUE-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
  const queuedItem: QueuedBackgroundReport = {
    id: queueId,
    report: {
      ...report,
      id: queueId,
      authorEmail: report.authorEmail || userEmail,
      authorRole: report.authorRole || (userRole as any),
      lastEditedBy: userEmail,
      syncedToCloud: false,
    },
    userEmail,
    userRole,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
  };

  // Replace existing if same ID, or append
  const existingIdx = queue.findIndex((item) => item.id === queueId || (report.id && item.report.id === report.id));
  if (existingIdx >= 0) {
    queue[existingIdx] = queuedItem;
  } else {
    queue.push(queuedItem);
  }

  saveBackgroundQueue(queue);
  console.log(`[BackgroundSync] Laporan disimpan di latar belakang. Total antrean: ${queue.length}`);

  // Coba sinkronisasi langsung jika sedang online
  if (navigator.onLine) {
    processBackgroundSyncQueue().catch(() => {});
  }

  return queuedItem;
}

/**
 * Menghapus laporan dari antrean latar belakang
 */
export function removeQueuedReport(queueId: string): void {
  const queue = getPendingBackgroundQueue().filter((item) => item.id !== queueId);
  saveBackgroundQueue(queue);
}

/**
 * Memproses pengiriman antrean latar belakang ke Firebase Firestore
 */
export async function processBackgroundSyncQueue(): Promise<{
  synced: number;
  failed: number;
  total: number;
}> {
  if (isProcessingQueue) {
    return { synced: 0, failed: 0, total: getPendingBackgroundQueue().length };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { synced: 0, failed: 0, total: getPendingBackgroundQueue().length };
  }

  const queue = getPendingBackgroundQueue();
  if (queue.length === 0) {
    return { synced: 0, failed: 0, total: 0 };
  }

  isProcessingQueue = true;
  notifyListeners(true);
  console.log(`[BackgroundSync] Memproses ${queue.length} laporan di latar belakang...`);

  let synced = 0;
  let failed = 0;
  const remainingQueue: QueuedBackgroundReport[] = [];

  for (const item of queue) {
    try {
      const enrichedReport: DailyReportFormData = {
        ...item.report,
        syncedToCloud: true,
        cloudSyncAt: new Date().toISOString(),
      };

      await saveDailyReportToCloud(enrichedReport);
      synced++;
      lastSuccessfulSyncTime = new Date().toISOString();
      console.log(`[BackgroundSync] Laporan "${item.report.projectName}" (${item.id}) sukses terkirim ke Cloud!`);
    } catch (error) {
      failed++;
      console.warn(`[BackgroundSync] Gagal memproses item ${item.id}:`, error);
      remainingQueue.push({
        ...item,
        retryCount: item.retryCount + 1,
        lastError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  saveBackgroundQueue(remainingQueue);
  isProcessingQueue = false;
  notifyListeners(false);

  return {
    synced,
    failed,
    total: remainingQueue.length,
  };
}

/**
 * 3. Background Draft Management
 * Menyimpan formulir aktif secara instan saat tab disembunyikan/beralih
 */
export function saveActiveDraftInBackground(formData: DailyReportFormData): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      data: formData,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('[BackgroundSync] Error auto-saving draft in background:', e);
  }
}

export function loadActiveDraftFromBackground(): {
  data: DailyReportFormData;
  savedAt: string;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[BackgroundSync] Error loading background draft:', e);
    return null;
  }
}

export function clearActiveDraftFromBackground(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_DRAFT_KEY);
  } catch (e) {
    console.warn('[BackgroundSync] Error clearing background draft:', e);
  }
}

/**
 * 4. Background Listeners Setup
 */
let listenersInitialized = false;

function setupBackgroundListeners(): void {
  if (listenersInitialized || typeof window === 'undefined') return;
  listenersInitialized = true;

  // Jaringan kembali online
  window.addEventListener('online', () => {
    console.log('[BackgroundSync] Koneksi internet kembali aktif! Memulai sinkronisasi latar belakang...');
    notifyListeners();
    processBackgroundSyncQueue().catch(() => {});
  });

  // Jaringan terputus (offline)
  window.addEventListener('offline', () => {
    console.log('[BackgroundSync] Perangkat sedang offline. Mode simpan latar belakang aktif.');
    notifyListeners();
  });

  // Saat pengguna berpindah aplikasi / tab diminimalkan / layar terkunci
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // Background auto-save trigger event
      window.dispatchEvent(new CustomEvent('gov-bg-flush-draft'));
    } else if (document.visibilityState === 'visible') {
      // Pengguna kembali ke aplikasi
      notifyListeners();
      if (navigator.onLine) {
        processBackgroundSyncQueue().catch(() => {});
      }
    }
  });

  // Saat tab hendak ditutup / refresh
  window.addEventListener('beforeunload', () => {
    window.dispatchEvent(new CustomEvent('gov-bg-flush-draft'));
  });

  // Interval cek latar belakang berkala (setiap 30 detik)
  setInterval(() => {
    if (navigator.onLine && getPendingBackgroundQueue().length > 0) {
      processBackgroundSyncQueue().catch(() => {});
    }
  }, 30000);
}

/**
 * 5. Screen WakeLock Helper
 * Memungkinkan layar tetap menyala saat pengisian formulir di lapangan
 */
let wakeLockSentinel: any = null;

export async function requestScreenWakeLock(): Promise<boolean> {
  if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
    return false;
  }
  try {
    wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
    });
    return true;
  } catch (err) {
    console.warn('[WakeLock] Could not acquire screen wake lock:', err);
    return false;
  }
}

export async function releaseScreenWakeLock(): Promise<void> {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch {
      // Ignore release error
    }
    wakeLockSentinel = null;
  }
}

export function isScreenWakeLockActive(): boolean {
  return wakeLockSentinel !== null;
}

/**
 * 6. Subscription API untuk Komponen UI
 */
export function subscribeToBackgroundSync(callback: SyncCallback): () => void {
  syncListeners.add(callback);
  // Panggil langsung dengan status awal
  callback({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: getPendingBackgroundQueue().length,
    isSyncing: isProcessingQueue,
    lastSyncTime: lastSuccessfulSyncTime,
  });

  return () => {
    syncListeners.delete(callback);
  };
}

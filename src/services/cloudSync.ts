/**
 * Cloud Synchronization Service (Firebase Firestore & Cloud Storage Native)
 * 
 * Menghubungkan pelaporan lapangan secara terpusat:
 * - Data yang diinput dari HP langsung terkirim ke Firebase Firestore
 * - Data di laptop/PC otomatis sinkron secara Real-Time (onSnapshot listener) tanpa refresh
 * - Lampiran file (PDF & Foto) terunggah ke Cloud Storage
 */

import { DailyReportFormData, ProjectItem, CurrentUser, ReportAttachment } from '../types';
import { 
  saveDailyReportToCloud, 
  deleteDailyReportFromCloud, 
  subscribeToDailyReports,
  subscribeToProjects,
  saveProjectToCloud,
  deleteProjectFromCloud,
  uploadReportAttachment as uploadAttachmentToFirebase
} from './firebase';

export interface CloudSyncStatus {
  isOnline: boolean;
  activeProvider: string;
  databaseId: string;
  lastSyncTime: string;
  realtimeConnected: boolean;
}

/**
 * Menyimpan atau memperbarui laporan ke Firebase Firestore
 */
export async function syncReportToCloud(
  report: DailyReportFormData,
  user: CurrentUser
): Promise<{ success: boolean; cloudId: string; timestamp: string }> {
  try {
    const enrichedReport: DailyReportFormData = {
      ...report,
      authorEmail: report.authorEmail || user.email,
      authorRole: report.authorRole || user.role,
      authorName: report.authorName || user.name || (user.email ? user.email.split('@')[0] : 'User'),
      lastEditedBy: user.email,
      syncedToCloud: true,
      cloudSyncAt: new Date().toISOString()
    };

    const cloudId = await saveDailyReportToCloud(enrichedReport);

    return {
      success: true,
      cloudId,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[CloudSync] Error synchronizing report to Firestore:', error);
    return {
      success: false,
      cloudId: report.id || '',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Menghapus laporan dari Firebase Firestore
 */
export async function deleteReportFromCloud(
  reportId: string,
  user: CurrentUser
): Promise<{ success: boolean; message: string }> {
  try {
    await deleteDailyReportFromCloud(reportId);
    return { success: true, message: 'Laporan berhasil dihapus dari Cloud Firestore' };
  } catch (error) {
    console.error('[CloudSync] Error deleting report from Firestore:', error);
    return { success: false, message: 'Gagal menghapus laporan dari cloud' };
  }
}

/**
 * Mengunggah berkas lampiran (PDF / Gambar) ke Cloud Storage
 */
export async function uploadAttachmentFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ReportAttachment> {
  return await uploadAttachmentToFirebase(file, onProgress);
}

/**
 * Real-time listener laporan harian
 */
export { subscribeToDailyReports, subscribeToProjects, saveProjectToCloud, deleteProjectFromCloud };

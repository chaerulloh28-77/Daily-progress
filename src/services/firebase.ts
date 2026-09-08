import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  query,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { DailyReportFormData, ProjectItem, ReportAttachment } from '../types';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore with configured database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);

// SKILL.MD Specification: OperationType & Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// SKILL.MD Mandate: Validate Connection to Firestore on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline or connecting...');
    } else {
      console.warn('Firebase initial connection check notice:', error);
    }
    return false;
  }
}

// Run test connection
testConnection();

// ============================================================================
// DAILY REPORTS CLOUD SYNC (HP ⇋ Laptop)
// ============================================================================

export function subscribeToDailyReports(
  onReportsUpdated: (reports: DailyReportFormData[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const collectionPath = 'daily_reports';
  const q = query(collection(db, collectionPath));

  return onSnapshot(
    q,
    (snapshot) => {
      const reports: DailyReportFormData[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DailyReportFormData;
        reports.push({
          ...data,
          id: docSnap.id,
          syncedToCloud: true,
        });
      });

      // Sort by submittedAt / reportDate descending
      reports.sort((a, b) => {
        const timeA = new Date(a.submittedAt || a.reportDate || 0).getTime();
        const timeB = new Date(b.submittedAt || b.reportDate || 0).getTime();
        return timeB - timeA;
      });

      onReportsUpdated(reports);
    },
    (error) => {
      console.error('Real-time sync error on daily_reports:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

export async function saveDailyReportToCloud(report: DailyReportFormData): Promise<string> {
  const docId = report.id || `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const collectionPath = 'daily_reports';

  const payload: DailyReportFormData = {
    ...report,
    id: docId,
    syncedToCloud: true,
    cloudSyncAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submittedAt: report.submittedAt || new Date().toISOString(),
    attachments: report.attachments || []
  };

  try {
    await setDoc(doc(db, collectionPath, docId), payload);
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${docId}`);
  }
}

export async function deleteDailyReportFromCloud(reportId: string): Promise<void> {
  const collectionPath = 'daily_reports';
  try {
    await deleteDoc(doc(db, collectionPath, reportId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${reportId}`);
  }
}

// ============================================================================
// PROJECTS CLOUD SYNC
// ============================================================================

export function subscribeToProjects(
  onProjectsUpdated: (projects: ProjectItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const collectionPath = 'projects';
  const q = query(collection(db, collectionPath));

  return onSnapshot(
    q,
    (snapshot) => {
      const projects: ProjectItem[] = [];
      snapshot.forEach((docSnap) => {
        projects.push({ ...docSnap.data(), id: docSnap.id } as ProjectItem);
      });
      if (projects.length > 0) {
        onProjectsUpdated(projects);
      }
    },
    (error) => {
      console.warn('Notice on projects subscription:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveProjectToCloud(project: ProjectItem): Promise<void> {
  const collectionPath = 'projects';
  const docId = project.id || `proj_${Date.now()}`;
  try {
    await setDoc(doc(db, collectionPath, docId), { ...project, id: docId });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${docId}`);
  }
}

export async function deleteProjectFromCloud(projectId: string): Promise<void> {
  const collectionPath = 'projects';
  try {
    await deleteDoc(doc(db, collectionPath, projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${projectId}`);
  }
}

// ============================================================================
// CLOUD STORAGE FOR ATTACHMENTS (PDF & Images)
// ============================================================================

export async function uploadReportAttachment(file: File): Promise<ReportAttachment> {
  const fileId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const type: 'image' | 'pdf' | 'document' = isImage ? 'image' : isPdf ? 'pdf' : 'document';

  try {
    // Attempt upload to Firebase Storage Bucket
    const storageRef = ref(storage, `report_attachments/${fileId}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      id: fileId,
      name: file.name,
      size: file.size,
      type,
      url: downloadUrl,
      previewUrl: isImage ? downloadUrl : undefined,
      uploadedAt: new Date().toISOString(),
    };
  } catch (storageErr) {
    console.warn('Firebase Storage direct upload notice, using optimized client document storage:', storageErr);
    
    // Fallback to data URL for seamless offline & local preview
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve({
          id: fileId,
          name: file.name,
          size: file.size,
          type,
          url: result,
          previewUrl: isImage ? result : undefined,
          uploadedAt: new Date().toISOString(),
        });
      };
      reader.onerror = () => reject(new Error('Gagal membaca berkas lampiran.'));
      reader.readAsDataURL(file);
    });
  }
}

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

export async function loginWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    console.error('Login with Google error:', err);
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

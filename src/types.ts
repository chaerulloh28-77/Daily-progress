export type AreaOption = 'Jabo 1' | 'Jabo 2' | 'Jabo 3';

export type ProjectCategory = 'Relokasi Government' | 'Pengamanan';

export type JenisPengamanan =
  | 'Pembangunan Uditch'
  | 'Pembangunan Jembatan/JPO'
  | 'Pembangunan Bantalan Kali/Sungai'
  | 'Pelebaran Jalan'
  | 'Pembangunan Trotoar'
  | 'Perapihan Asset';

export type SubJenisPerapihanAsset =
  | 'Perapihan Kabel Areal/Underground'
  | 'Tanam/Geser/Cabut Tiang'
  | 'Perapihan HH';

export interface ProjectItem {
  id: string;
  name: string;
  category?: ProjectCategory;
  jenisPengamanan?: JenisPengamanan | string;
  subJenisPerapihanAsset?: SubJenisPerapihanAsset[] | string[];
  code?: string;
  location?: string;
  area?: string;
  startDate?: string;
  endDate?: string;
  durasiPekerjaan?: string;
  totalDurasi?: string;
  targetSipil?: string;
  targetKabel?: string;
  targetKabelCoax?: string;
  targetHH?: string;
  targetHB?: string;
  targetMH?: string;
  pic?: string;
  createdAt?: string;
}

// Backward compatibility alias
export type ProjectOption = ProjectItem;

export interface BoringProgress {
  boringAlur: string;
  boringCrossingJalan: string;
  boringAkses: string;
  boringCrossingJembatan: string;
  boringCrossingJalanTol?: string;
}

export interface PullingProgress {
  pulling288: string;
  pulling288GL: string;
  pulling144: string;
  pulling96: string;
  pulling96GL: string;
  pulling48: string;
  pulling24: string;
  pullingCoax?: string;
}

export interface HHProgress {
  hh60x60: string;
  hh80x80: string;
  hh100x100: string;
  hh110x110?: string;
  hh120x120: string;
}

export interface HBProgress {
  hb60x60: string;
  hb80x80: string;
  hb100x100: string;
  hb110x110?: string;
  hb120x120: string;
}

export interface MHProgress {
  mh80x80: string;
  mh100x100: string;
  mh110x110?: string;
  mh120x120: string;
}

export interface MBProgress {
  mb80x80: string;
  mb100x100: string;
  mb120x120: string;
}

export interface TiangGalvanisHDPEProgress {
  tiangBersama: string;
  galvanis2Inch: string;
  galvanis4Inch?: string;
  galvanisATB?: string;
  galvanisATBOption?: 'Galv 4"' | 'Galv 6"' | string;
  instalHDPE: string;
}

export interface DismantlingProgress {
  dismantleKabel: string;
  dismantleTiang: string;
}

export type UserRole = 'admin' | 'waspang';

export interface CurrentUser {
  email: string;
  role: UserRole;
  name?: string;
}

export interface ReportAttachment {
  id: string;
  name: string;
  size: number;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: string;
  type: 'image' | 'pdf' | 'document';
  url?: string;
  previewUrl?: string;
  uploadedAt: string;
  uploadProgress?: number;
  status?: 'compressing' | 'uploading' | 'completed' | 'error';
}

export interface DailyReportFormData {
  id?: string;
  projectName: string;
  projectId?: string;
  projectCategory?: ProjectCategory;
  jenisPengamanan?: JenisPengamanan | string;
  subJenisPerapihanAsset?: SubJenisPerapihanAsset[] | string[];
  keteranganPengamanan?: string;
  area?: string;
  waspangName?: string;
  dayNumber?: string;
  reportDate: string;
  weatherCondition: string;
  startDate: string;
  endDate?: string;
  durasiPekerjaan?: string;
  totalDurasi?: string;
  totalProgressSipil: string;
  totalProgressKabel: string;
  totalProgressKabelCoax?: string;
  totalProgressHH?: string;
  totalProgressHB?: string;
  totalProgressMH?: string;
  baseTargetSipil?: string;
  baseTargetKabel?: string;
  baseTargetKabelCoax?: string;
  baseTargetHH?: string;
  baseTargetHB?: string;
  baseTargetMH?: string;
  boring: BoringProgress;
  pulling: PullingProgress;
  instalasiHH: HHProgress;
  instalasiHB: HBProgress;
  instalasiMH: MHProgress;
  instalasiMB: MBProgress;
  tiangGalvanisHDPE: TiangGalvanisHDPEProgress;
  dismantling: DismantlingProgress;
  remarks?: string;
  kendalaLapangan: string;
  attachments?: ReportAttachment[];
  submittedAt?: string;
  updatedAt?: string;
  // RBAC & Data Ownership fields
  authorEmail?: string;
  authorRole?: UserRole;
  authorName?: string;
  lastEditedBy?: string;
  syncedToCloud?: boolean;
  cloudSyncAt?: string;
}

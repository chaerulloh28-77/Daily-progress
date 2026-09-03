export interface ProjectItem {
  id: string;
  name: string;
  code?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  targetSipil?: string;
  targetKabel?: string;
  pic?: string;
  createdAt?: string;
}

// Backward compatibility alias
export type ProjectOption = ProjectItem;

export interface BoringProgress {
  boringAlur: string;
  boringCrossingJalan: string;
  boringCrossingJalanTol: string;
  boringCrossingJembatan: string;
}

export interface PullingProgress {
  pulling288: string;
  pulling288GL: string;
  pulling144: string;
  pulling96: string;
  pulling96GL: string;
  pulling48: string;
  pulling24: string;
}

export interface HHProgress {
  hh60x60: string;
  hh80x80: string;
  hh100x100: string;
  hh120x120: string;
}

export interface HBProgress {
  hb60x60: string;
  hb80x80: string;
  hb100x100: string;
  hb120x120: string;
}

export interface MHProgress {
  mh80x80: string;
  mh100x100: string;
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
  galvanis4Inch: string;
  instalHDPE: string;
}

export interface DismantlingProgress {
  dismantleKabel: string;
  dismantleTiang: string;
}

export interface DailyReportFormData {
  id?: string;
  projectName: string;
  projectId?: string;
  waspangName?: string;
  dayNumber?: string;
  reportDate: string;
  weatherCondition: string;
  startDate: string;
  endDate: string;
  totalProgressSipil: string;
  totalProgressKabel: string;
  boring: BoringProgress;
  pulling: PullingProgress;
  instalasiHH: HHProgress;
  instalasiHB: HBProgress;
  instalasiMH: MHProgress;
  instalasiMB: MBProgress;
  tiangGalvanisHDPE: TiangGalvanisHDPEProgress;
  dismantling: DismantlingProgress;
  kendalaLapangan: string;
  submittedAt?: string;
  updatedAt?: string;
}

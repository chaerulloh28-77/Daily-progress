import { DailyReportFormData, ProjectItem, AreaOption, ProjectCategory, JenisPengamanan, SubJenisPerapihanAsset } from './types';

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  'Relokasi Government',
  'Pengamanan',
];

export const JENIS_PENGAMANAN_OPTIONS: {
  id: JenisPengamanan;
  label: string;
  desc: string;
}[] = [
  {
    id: 'Pembangunan Uditch',
    label: 'Pembangunan Uditch',
    desc: 'Saluran drainase & crossing u-ditch',
  },
  {
    id: 'Pembangunan Jembatan/JPO',
    label: 'Pembangunan Jembatan/JPO',
    desc: 'Jalur kabel jembatan & penyeberangan orang',
  },
  {
    id: 'Pembangunan Bantalan Kali/Sungai',
    label: 'Pembangunan Bantalan Kali/Sungai',
    desc: 'Proteksi tanggul tebing kali & crossing air',
  },
  {
    id: 'Pelebaran Jalan',
    label: 'Pelebaran Jalan',
    desc: 'Pengamanan jalur utilitas akibat pelebaran jalan',
  },
  {
    id: 'Pembangunan Trotoar',
    label: 'Pembangunan Trotoar',
    desc: 'Penataan jalur pedestrian & ducting trotoar',
  },
  {
    id: 'Perapihan Asset',
    label: 'Perapihan Asset',
    desc: 'Kabel areal/underground, tiang, dan handhole',
  },
];

export const SUB_JENIS_PERAPIHAN_ASSET_OPTIONS: {
  id: SubJenisPerapihanAsset;
  label: string;
}[] = [
  {
    id: 'Perapihan Kabel Areal/Underground',
    label: 'Perapihan Kabel Areal / Underground',
  },
  {
    id: 'Tanam/Geser/Cabut Tiang',
    label: 'Tanam / Geser / Cabut Tiang',
  },
  {
    id: 'Perapihan HH',
    label: 'Perapihan HH (Handhole)',
  },
];

// Master data project awal - Relokasi Government & Pengamanan
export const PROJECT_RELOKASI_GOVERNMENT: ProjectItem = {
  id: 'PRJ-RELOKASI-GOV',
  name: 'Relokasi Government',
  category: 'Relokasi Government',
  code: 'PRJ-REL-GOV',
  location: 'Jalur Relokasi Fasilitas Pemerintah (Jabodetabek)',
  area: 'Jabo 1',
  startDate: '2026-09-01',
  endDate: '2026-11-30',
  durasiPekerjaan: '90',
  totalDurasi: '90',
  targetSipil: '1000',
  targetKabel: '2000',
  targetKabelCoax: '0',
  targetHH: '10',
  targetHB: '10',
  targetMH: '5',
  pic: 'Waspang Relokasi Gov',
  createdAt: '2026-09-10',
};

export const PROJECT_PENGAMANAN: ProjectItem = {
  id: 'PRJ-PENGAMANAN',
  name: 'Pengamanan',
  category: 'Pengamanan',
  code: 'PRJ-PENGAMANAN',
  location: 'Jalur FO LinkNet (Jabodetabek)',
  area: 'Jabo 1',
  startDate: '2026-09-01',
  endDate: '2026-11-30',
  durasiPekerjaan: '90',
  totalDurasi: '90',
  targetSipil: '1000',
  targetKabel: '2000',
  targetKabelCoax: '0',
  targetHH: '10',
  targetHB: '10',
  targetMH: '5',
  pic: 'Waspang Pengamanan',
  createdAt: '2026-09-10',
};

export const ACTIVE_PROJECTS: ProjectItem[] = [
  PROJECT_RELOKASI_GOVERNMENT,
];

// Opsi nama project standar / template cepat
export const STANDARD_PROJECT_NAMES: string[] = [
  'Relokasi Government',
  'Relokasi Goverment FO',
  'Pengamanan Jaringan FO',
  'Pengamanan Jalur Utilitas',
  'Pengamanan LinkNet',
];

export const AREA_OPTIONS: AreaOption[] = [
  'Jabo 1',
  'Jabo 2',
  'Jabo 3',
];

export const WEATHER_OPTIONS = [
  '☀️ Cerah / Panas',
  '☁️ Berawan',
  '🌧️ Hujan Ringan',
  '⛈️ Hujan Lebat',
  '💨 Berangin Kencang',
];

export const INITIAL_REPORT_DATA: DailyReportFormData = {
  projectName: '',
  projectId: '',
  projectCategory: 'Relokasi Government',
  jenisPengamanan: '',
  subJenisPerapihanAsset: [],
  keteranganPengamanan: '',
  area: 'Jabo 1',
  waspangName: '',
  dayNumber: '1',
  reportDate: '2026-09-03',
  weatherCondition: '☀️ Cerah / Panas',
  startDate: '',
  endDate: '',
  durasiPekerjaan: '30',
  totalDurasi: '30',
  totalProgressSipil: '0',
  totalProgressKabel: '0',
  totalProgressKabelCoax: '0',
  totalProgressHH: '0',
  totalProgressHB: '0',
  totalProgressMH: '0',
  baseTargetSipil: '',
  baseTargetKabel: '',
  baseTargetKabelCoax: '',
  baseTargetHH: '',
  baseTargetHB: '',
  baseTargetMH: '',
  boring: {
    boringAlur: '',
    boringCrossingJalan: '',
    boringAkses: '',
    boringCrossingJalanTol: '',
    boringCrossingJembatan: '',
  },
  pulling: {
    pulling288: '',
    pulling288GL: '',
    pulling144: '',
    pulling96: '',
    pulling96GL: '',
    pulling48: '',
    pulling24: '',
    pullingCoax: '',
  },
  instalasiHH: {
    hh60x60: '',
    hh80x80: '',
    hh100x100: '',
    hh110x110: '',
    hh120x120: '',
  },
  instalasiHB: {
    hb60x60: '',
    hb80x80: '',
    hb100x100: '',
    hb110x110: '',
    hb120x120: '',
  },
  instalasiMH: {
    mh80x80: '',
    mh100x100: '',
    mh110x110: '',
    mh120x120: '',
  },
  instalasiMB: {
    mb80x80: '',
    mb100x100: '',
    mb120x120: '',
  },
  tiangGalvanisHDPE: {
    tiangBersama: '',
    galvanis2Inch: '',
    galvanis4Inch: '',
    galvanisATB: '',
    galvanisATBOption: 'Galv 4"',
    instalHDPE: '',
  },
  dismantling: {
    dismantleKabel: '',
    dismantleTiang: '',
  },
  remarks: '',
  kendalaLapangan: '',
  attachments: [],
};

// Empty initial reports as requested ("kosong seperti baru")
export const SAMPLE_SAVED_REPORTS: DailyReportFormData[] = [];

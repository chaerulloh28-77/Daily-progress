import { DailyReportFormData, ProjectItem } from './types';

// Empty initial projects as requested ("hapus semua data project dan kosong seperti baru")
export const ACTIVE_PROJECTS: ProjectItem[] = [];

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
  waspangName: '',
  dayNumber: '1',
  reportDate: '2026-09-03',
  weatherCondition: '☀️ Cerah / Panas',
  startDate: '',
  endDate: '',
  totalProgressSipil: '',
  totalProgressKabel: '',
  boring: {
    boringAlur: '',
    boringCrossingJalan: '',
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
  },
  instalasiHH: {
    hh60x60: '',
    hh80x80: '',
    hh100x100: '',
    hh120x120: '',
  },
  instalasiHB: {
    hb60x60: '',
    hb80x80: '',
    hb100x100: '',
    hb120x120: '',
  },
  instalasiMH: {
    mh80x80: '',
    mh100x100: '',
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
    instalHDPE: '',
  },
  dismantling: {
    dismantleKabel: '',
    dismantleTiang: '',
  },
  kendalaLapangan: '',
};

// Empty initial reports as requested ("kosong seperti baru")
export const SAMPLE_SAVED_REPORTS: DailyReportFormData[] = [];

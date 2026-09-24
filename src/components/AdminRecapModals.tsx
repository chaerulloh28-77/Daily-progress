import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  User,
  Layers,
  Cable,
  AlertTriangle,
  Calendar,
  MapPin,
  Search,
  ExternalLink,
  ShieldCheck,
  Shield,
  Check,
  ChevronRight,
  Sparkles,
  Award,
  Box,
  HardHat,
  Filter,
  CheckCircle2,
  Clock,
  CloudSun
} from 'lucide-react';
import { DailyReportFormData } from '../types';
import { WeeklyRecapData, isPengamananReport } from '../utils/whatsapp';

// Helper for physical itemized breakdown
export interface PhysicalBreakdown {
  sipil: {
    boringAlur: number;
    boringCrossingJalan: number;
    boringAkses: number;
    boringCrossingJembatan: number;
    boringCrossingJalanTol: number;
    totalSipil: number;
  };
  kabel: {
    pulling288: number;
    pulling288GL: number;
    pulling144: number;
    pulling144GL: number;
    pulling96: number;
    pulling96GL: number;
    pulling48: number;
    pulling24: number;
    pulling12: number;
    pullingCoax: number;
    totalFO: number;
    totalKabel: number;
  };
  pit: {
    hh: { hh60: number; hh80: number; hh100: number; hh110: number; hh120: number; total: number };
    hb: { hb60: number; hb80: number; hb100: number; hb110: number; hb120: number; total: number };
    mh: { mh60: number; mh80: number; mh100: number; mh110: number; mh120: number; total: number };
    grandTotalPit: number;
  };
  lainnya: {
    tiangBersama: number;
    galvanis2Inch: number;
    galvanis4Inch: number;
    galvanisATB: number;
    instalHDPE: number;
    dismantleKabel: number;
    dismantleTiang: number;
  };
}

export const computePhysicalBreakdown = (reports: DailyReportFormData[]): PhysicalBreakdown => {
  let boringAlur = 0;
  let boringCrossingJalan = 0;
  let boringAkses = 0;
  let boringCrossingJembatan = 0;
  let boringCrossingJalanTol = 0;

  let pulling288 = 0;
  let pulling288GL = 0;
  let pulling144 = 0;
  let pulling144GL = 0;
  let pulling96 = 0;
  let pulling96GL = 0;
  let pulling48 = 0;
  let pulling24 = 0;
  let pulling12 = 0;
  let pullingCoax = 0;

  let hh60 = 0, hh80 = 0, hh100 = 0, hh110 = 0, hh120 = 0, hhTotal = 0;
  let hb60 = 0, hb80 = 0, hb100 = 0, hb110 = 0, hb120 = 0, hbTotal = 0;
  let mh60 = 0, mh80 = 0, mh100 = 0, mh110 = 0, mh120 = 0, mhTotal = 0;

  let tiangBersama = 0;
  let galvanis2Inch = 0;
  let galvanis4Inch = 0;
  let galvanisATB = 0;
  let instalHDPE = 0;
  let dismantleKabel = 0;
  let dismantleTiang = 0;

  reports.forEach((r) => {
    boringAlur += parseFloat(r.boring?.boringAlur || '0') || 0;
    boringCrossingJalan += parseFloat(r.boring?.boringCrossingJalan || '0') || 0;
    boringAkses += parseFloat(r.boring?.boringAkses || '0') || 0;
    boringCrossingJembatan += parseFloat(r.boring?.boringCrossingJembatan || '0') || 0;
    boringCrossingJalanTol += parseFloat(r.boring?.boringCrossingJalanTol || '0') || 0;

    pulling288 += parseFloat(r.pulling?.pulling288 || '0') || 0;
    pulling288GL += parseFloat(r.pulling?.pulling288GL || '0') || 0;
    pulling144 += parseFloat(r.pulling?.pulling144 || '0') || 0;
    pulling144GL += parseFloat(r.pulling?.pulling144GL || '0') || 0;
    pulling96 += parseFloat(r.pulling?.pulling96 || '0') || 0;
    pulling96GL += parseFloat(r.pulling?.pulling96GL || '0') || 0;
    pulling48 += parseFloat(r.pulling?.pulling48 || '0') || 0;
    pulling24 += parseFloat(r.pulling?.pulling24 || '0') || 0;
    pulling12 += parseFloat(r.pulling?.pulling12 || '0') || 0;
    pullingCoax += parseFloat(r.pulling?.pullingCoax || r.totalProgressKabelCoax || '0') || 0;

    hh60 += parseFloat(r.instalasiHH?.hh60x60 || '0') || 0;
    hh80 += parseFloat(r.instalasiHH?.hh80x80 || '0') || 0;
    hh100 += parseFloat(r.instalasiHH?.hh100x100 || '0') || 0;
    hh110 += parseFloat(r.instalasiHH?.hh110x110 || '0') || 0;
    hh120 += parseFloat(r.instalasiHH?.hh120x120 || '0') || 0;
    hhTotal += parseFloat(r.totalProgressHH || '0') || 0;

    hb60 += parseFloat(r.instalasiHB?.hb60x60 || '0') || 0;
    hb80 += parseFloat(r.instalasiHB?.hb80x80 || '0') || 0;
    hb100 += parseFloat(r.instalasiHB?.hb100x100 || '0') || 0;
    hb110 += parseFloat(r.instalasiHB?.hb110x110 || '0') || 0;
    hb120 += parseFloat(r.instalasiHB?.hb120x120 || '0') || 0;
    hbTotal += parseFloat(r.totalProgressHB || '0') || 0;

    mh60 += parseFloat(r.instalasiMH?.mh60x60 || '0') || 0;
    mh80 += parseFloat(r.instalasiMH?.mh80x80 || '0') || 0;
    mh100 += parseFloat(r.instalasiMH?.mh100x100 || '0') || 0;
    mh110 += parseFloat(r.instalasiMH?.mh110x110 || '0') || 0;
    mh120 += parseFloat(r.instalasiMH?.mh120x120 || '0') || 0;
    mhTotal += parseFloat(r.totalProgressMH || '0') || 0;

    tiangBersama += parseFloat(r.tiangGalvanisHDPE?.tiangBersama || '0') || 0;
    galvanis2Inch += parseFloat(r.tiangGalvanisHDPE?.galvanis2Inch || '0') || 0;
    galvanis4Inch += parseFloat(r.tiangGalvanisHDPE?.galvanis4Inch || '0') || 0;
    galvanisATB += parseFloat(r.tiangGalvanisHDPE?.galvanisATB || '0') || 0;
    instalHDPE += parseFloat(r.tiangGalvanisHDPE?.instalHDPE || '0') || 0;

    dismantleKabel += parseFloat(r.dismantling?.dismantleKabel || '0') || 0;
    dismantleTiang += parseFloat(r.dismantling?.dismantleTiang || '0') || 0;
  });

  const totalSipil = boringAlur + boringCrossingJalan + boringAkses + boringCrossingJembatan + boringCrossingJalanTol;
  const totalFO = pulling288 + pulling288GL + pulling144 + pulling144GL + pulling96 + pulling96GL + pulling48 + pulling24 + pulling12;
  const totalKabel = totalFO + pullingCoax;

  const actualHHTotal = hhTotal || (hh60 + hh80 + hh100 + hh110 + hh120);
  const actualHBTotal = hbTotal || (hb60 + hb80 + hb100 + hb110 + hb120);
  const actualMHTotal = mhTotal || (mh60 + mh80 + mh100 + mh110 + mh120);

  return {
    sipil: {
      boringAlur: Math.round(boringAlur * 10) / 10,
      boringCrossingJalan: Math.round(boringCrossingJalan * 10) / 10,
      boringAkses: Math.round(boringAkses * 10) / 10,
      boringCrossingJembatan: Math.round(boringCrossingJembatan * 10) / 10,
      boringCrossingJalanTol: Math.round(boringCrossingJalanTol * 10) / 10,
      totalSipil: Math.round(totalSipil * 10) / 10,
    },
    kabel: {
      pulling288: Math.round(pulling288 * 10) / 10,
      pulling288GL: Math.round(pulling288GL * 10) / 10,
      pulling144: Math.round(pulling144 * 10) / 10,
      pulling144GL: Math.round(pulling144GL * 10) / 10,
      pulling96: Math.round(pulling96 * 10) / 10,
      pulling96GL: Math.round(pulling96GL * 10) / 10,
      pulling48: Math.round(pulling48 * 10) / 10,
      pulling24: Math.round(pulling24 * 10) / 10,
      pulling12: Math.round(pulling12 * 10) / 10,
      pullingCoax: Math.round(pullingCoax * 10) / 10,
      totalFO: Math.round(totalFO * 10) / 10,
      totalKabel: Math.round(totalKabel * 10) / 10,
    },
    pit: {
      hh: { hh60, hh80, hh100, hh110, hh120, total: actualHHTotal },
      hb: { hb60, hb80, hb100, hb110, hb120, total: actualHBTotal },
      mh: { mh60, mh80, mh100, mh110, mh120, total: actualMHTotal },
      grandTotalPit: actualHHTotal + actualHBTotal + actualMHTotal,
    },
    lainnya: {
      tiangBersama: Math.round(tiangBersama * 10) / 10,
      galvanis2Inch: Math.round(galvanis2Inch * 10) / 10,
      galvanis4Inch: Math.round(galvanis4Inch * 10) / 10,
      galvanisATB: Math.round(galvanisATB * 10) / 10,
      instalHDPE: Math.round(instalHDPE * 10) / 10,
      dismantleKabel: Math.round(dismantleKabel * 10) / 10,
      dismantleTiang: Math.round(dismantleTiang * 10) / 10,
    },
  };
};

export type KpiDetailType = 'reports' | 'waspangs' | 'sipil' | 'kabel' | 'kendala';

interface KpiDetailModalProps {
  type: KpiDetailType;
  recapData: WeeklyRecapData;
  filteredReports: DailyReportFormData[];
  periodLabel: string;
  defaultAreaFilter?: 'All' | 'Jabo 1' | 'Jabo 2' | 'Jabo 3';
  onClose: () => void;
  onSelectReport?: (report: DailyReportFormData) => void;
  onSelectWaspang?: (waspangName: string, areaName: string) => void;
}

export const KpiDetailModal: React.FC<KpiDetailModalProps> = ({
  type,
  recapData,
  filteredReports,
  periodLabel,
  defaultAreaFilter = 'All',
  onClose,
  onSelectReport,
  onSelectWaspang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<'All' | 'Jabo 1' | 'Jabo 2' | 'Jabo 3'>(defaultAreaFilter);
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Relokasi Goverment' | 'Pengamanan'>('All');

  // Filter reports specifically for this modal view
  const modalReports = useMemo(() => {
    return filteredReports.filter((rep) => {
      const repArea = rep.area || 'Jabo 1';
      if (areaFilter !== 'All' && repArea !== areaFilter) return false;

      const isPeng = isPengamananReport(rep);
      if (categoryFilter === 'Pengamanan' && !isPeng) return false;
      if (categoryFilter === 'Relokasi Goverment' && isPeng) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const wName = (rep.waspangName || rep.authorEmail || '').toLowerCase();
      const pName = (rep.projectName || '').toLowerCase();
      const rem = (rep.remarks || '').toLowerCase();
      const ken = (rep.kendalaLapangan || '').toLowerCase();
      return wName.includes(q) || pName.includes(q) || rem.includes(q) || ken.includes(q);
    });
  }, [filteredReports, areaFilter, categoryFilter, searchQuery]);

  // Compute breakdown for modal reports
  const breakdown = useMemo(() => computePhysicalBreakdown(modalReports), [modalReports]);

  // Titles and icons by type
  const meta = useMemo(() => {
    switch (type) {
      case 'reports':
        return {
          title: `Rincian Terperinci Seluruh Laporan (${modalReports.length} Laporan)`,
          subtitle: `Daftar lengkap seluruh laporan harian yang telah diinput pada periode ${periodLabel}`,
          icon: <FileText className="w-5 h-5 text-cyan-400" />,
          accent: 'cyan',
        };
      case 'waspangs':
        return {
          title: `Rincian Keaktifan & Performa Personil Waspang (${recapData.grandTotal.activeWaspangs} Personil)`,
          subtitle: `Tinjauan keaktifan hari, jumlah laporan harian, dan pencapaian fisik per Pengawas Lapangan`,
          icon: <User className="w-5 h-5 text-blue-400" />,
          accent: 'blue',
        };
      case 'sipil':
        return {
          title: `Rincian Terperinci Progres Fisik Sipil (${recapData.grandTotal.totalSipil.toLocaleString('id-ID')} m)`,
          subtitle: `Item pekerjaan Boring Manual, Boring Mesin, Galian Open Cut, dan Penanaman Pipa HDPE/Subduct`,
          icon: <Layers className="w-5 h-5 text-emerald-400" />,
          accent: 'emerald',
        };
      case 'kabel':
        return {
          title: `Rincian Terperinci Progres Penarikan Kabel (${recapData.grandTotal.totalKabel.toLocaleString('id-ID')} m)`,
          subtitle: `Rincian ukuran kabel Fiber Optik (288, 144, 96, 48, 24, 12 Core) serta Kabel Coaxial`,
          icon: <Cable className="w-5 h-5 text-amber-400" />,
          accent: 'amber',
        };
      case 'kendala':
        return {
          title: `Rincian Terperinci Kendala & Isu Lapangan (${recapData.grandTotal.totalKendala} Kendala)`,
          subtitle: `Daftar kendala teknis, hambatan perijinan/utilitas, dan status penanganan di lapangan`,
          icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
          accent: 'rose',
        };
    }
  }, [type, modalReports.length, recapData, periodLabel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#091426] border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-cyan-950/60 overflow-hidden text-slate-100">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-gradient-to-r from-[#0b1b36] via-[#09152b] to-[#0b1b36] border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shrink-0">
              {meta.icon}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-cyber font-bold text-white tracking-wide flex items-center gap-2">
                {meta.title}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono-cyber">
                {meta.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar Inside Modal */}
        <div className="p-3 sm:px-5 bg-[#070f1e] border-b border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Category & Area Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#050b14] border border-slate-800 rounded-lg p-0.5 text-xs font-mono-cyber">
              {(['All', 'Relokasi Goverment', 'Pengamanan'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer text-[10px] sm:text-[11px] ${
                    categoryFilter === cat
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'All' ? 'Semua Kategori' : cat === 'Relokasi Goverment' ? 'Relokasi Gov' : 'Pengamanan'}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-[#050b14] border border-slate-800 rounded-lg p-0.5 text-xs font-mono-cyber">
              {(['All', 'Jabo 1', 'Jabo 2', 'Jabo 3'] as const).map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setAreaFilter(area)}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer text-[10px] sm:text-[11px] ${
                    areaFilter === area
                      ? 'bg-blue-500 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {area === 'All' ? 'Semua Area' : area}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050b14] border border-slate-700 rounded-lg pl-8 pr-7 py-1 text-xs font-mono-cyber text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#070e1c]">

          {/* 1. VIEW FOR 'reports' (Semua Laporan) */}
          {type === 'reports' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono-cyber text-slate-400 pb-1">
                <span>Menampilkan <strong className="text-cyan-300">{modalReports.length} Laporan</strong></span>
                <span>Klik kartu laporan untuk melihat detail form resmi</span>
              </div>

              {modalReports.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono-cyber text-slate-400 bg-[#050b14] rounded-xl border border-slate-800">
                  Tidak ada laporan yang sesuai dengan filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {modalReports.map((rep, idx) => {
                    const isPeng = isPengamananReport(rep);
                    const sipilVal = parseFloat(rep.totalProgressSipil) || 0;
                    const kabelVal = (parseFloat(rep.totalProgressKabel) || 0) + (parseFloat(rep.totalProgressKabelCoax || '0') || 0);

                    return (
                      <div
                        key={rep.id || idx}
                        onClick={() => onSelectReport && onSelectReport(rep)}
                        className="bg-[#050b14] border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3.5 transition-all cursor-pointer group hover:bg-[#071324] space-y-2 shadow-sm"
                        title="Klik untuk membuka dokumen laporan lengkap"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white font-cyber text-sm group-hover:text-cyan-300 transition-colors">
                              {rep.projectName || 'Project Tanpa Judul'}
                            </span>
                            <span className={`text-[10px] font-mono-cyber px-2 py-0.5 rounded font-semibold ${
                              isPeng 
                                ? 'bg-amber-950/80 border border-amber-500/40 text-amber-300' 
                                : 'bg-blue-950/80 border border-blue-500/40 text-blue-300'
                            }`}>
                              {isPeng ? '🛡️ Pengamanan' : '🔵 Relokasi Gov'}
                            </span>
                            <span className="text-[10px] font-mono-cyber px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                              {rep.area || 'Jabo 1'}
                            </span>
                            {rep.dayNumber && (
                              <span className="text-[10px] font-mono-cyber text-cyan-400 font-bold">
                                [Hari ke-{rep.dayNumber}]
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs font-mono-cyber text-slate-400 shrink-0">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-cyan-400" />
                              {rep.reportDate || 'Hari ini'}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                          </div>
                        </div>

                        {/* Waspang & Quick Summary */}
                        <div className="flex flex-wrap items-center gap-3 text-xs font-mono-cyber text-slate-300">
                          <div className="flex items-center gap-1 text-slate-400">
                            <User className="w-3 h-3 text-blue-400" />
                            <span>Waspang: <strong className="text-white">{rep.waspangName || rep.authorEmail || '-'}</strong></span>
                          </div>
                          {rep.weatherCondition && (
                            <div className="flex items-center gap-1 text-slate-400">
                              <CloudSun className="w-3 h-3 text-amber-400" />
                              <span>{rep.weatherCondition}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                              Sipil: {sipilVal} m
                            </span>
                            <span className="text-[11px] text-amber-400 font-semibold bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                              Kabel: {kabelVal} m
                            </span>
                          </div>
                        </div>

                        {/* Kendala or Remarks snippet */}
                        {rep.kendalaLapangan && rep.kendalaLapangan.toLowerCase() !== 'tidak ada kendala' && rep.kendalaLapangan !== '-' && (
                          <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 p-2 rounded-lg flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                            <span><strong>Kendala:</strong> {rep.kendalaLapangan}</span>
                          </div>
                        )}
                        {rep.remarks && (
                          <p className="text-[11px] font-mono-cyber text-slate-400 line-clamp-1 italic">
                            Catatan: {rep.remarks}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. VIEW FOR 'waspangs' (Performa Seluruh Waspang) */}
          {type === 'waspangs' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recapData.areas.flatMap((area) =>
                  area.waspangs.map((w) => {
                    const days = w.totalDays || (w.reportDates ? w.reportDates.length : w.reportCount);
                    return (
                      <div
                        key={`${area.areaName}-${w.waspangName}`}
                        onClick={() => onSelectWaspang && onSelectWaspang(w.waspangName, area.areaName)}
                        className="bg-[#050b14] border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3.5 transition-all cursor-pointer group hover:bg-[#071324] space-y-2.5"
                        title="Klik untuk melihat rincian performa lengkap waspang ini"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold font-mono-cyber text-xs">
                              {w.waspangName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-white font-cyber text-sm group-hover:text-cyan-300 transition-colors">
                                {w.waspangName}
                              </h4>
                              <span className="text-[10px] font-mono-cyber text-slate-400">
                                {area.areaName}
                              </span>
                            </div>
                          </div>

                          <span className="text-xs font-mono-cyber text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold">
                            Rincian <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 text-xs font-mono-cyber pt-1">
                          <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Keaktifan</span>
                            <strong className="text-cyan-300">{days} Hari</strong>
                            <span className="text-[10px] text-slate-500 block">({w.reportCount} Lap)</span>
                          </div>
                          <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Sipil</span>
                            <strong className="text-emerald-300">{w.totalSipil.toLocaleString('id-ID')} m</strong>
                          </div>
                          <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Kabel</span>
                            <strong className="text-amber-300">{w.totalKabel.toLocaleString('id-ID')} m</strong>
                          </div>
                        </div>

                        {w.projects.length > 0 && (
                          <div className="text-[11px] font-mono-cyber text-slate-400 truncate">
                            <span className="text-slate-500">Project:</span> {w.projects.join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 3. VIEW FOR 'sipil' (Progres Fisik Sipil Terperinci) */}
          {type === 'sipil' && (
            <div className="space-y-4">
              {/* Grand Total Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-[#050b14] border border-emerald-500/40 rounded-xl p-3">
                  <span className="text-[10px] font-mono-cyber text-slate-400 uppercase font-bold">Boring Alur</span>
                  <div className="text-xl font-bold font-mono-cyber text-emerald-300 my-0.5">
                    {breakdown.sipil.boringAlur.toLocaleString('id-ID')} <span className="text-xs font-normal">m</span>
                  </div>
                  <span className="text-[10px] font-mono-cyber text-slate-500">Alur Utama</span>
                </div>
                <div className="bg-[#050b14] border border-emerald-500/40 rounded-xl p-3">
                  <span className="text-[10px] font-mono-cyber text-slate-400 uppercase font-bold">Crossing Jalan</span>
                  <div className="text-xl font-bold font-mono-cyber text-emerald-300 my-0.5">
                    {breakdown.sipil.boringCrossingJalan.toLocaleString('id-ID')} <span className="text-xs font-normal">m</span>
                  </div>
                  <span className="text-[10px] font-mono-cyber text-slate-500">Cross Jalan Raya</span>
                </div>
                <div className="bg-[#050b14] border border-emerald-500/40 rounded-xl p-3">
                  <span className="text-[10px] font-mono-cyber text-slate-400 uppercase font-bold">Boring Akses</span>
                  <div className="text-xl font-bold font-mono-cyber text-emerald-300 my-0.5">
                    {breakdown.sipil.boringAkses.toLocaleString('id-ID')} <span className="text-xs font-normal">m</span>
                  </div>
                  <span className="text-[10px] font-mono-cyber text-slate-500">Akses Pelanggan / Site</span>
                </div>
                <div className="bg-[#050b14] border border-cyan-500/40 rounded-xl p-3">
                  <span className="text-[10px] font-mono-cyber text-slate-400 uppercase font-bold">Crossing Jembatan</span>
                  <div className="text-xl font-bold font-mono-cyber text-cyan-300 my-0.5">
                    {breakdown.sipil.boringCrossingJembatan.toLocaleString('id-ID')} <span className="text-xs font-normal">m</span>
                  </div>
                  <span className="text-[10px] font-mono-cyber text-slate-500">Jembatan / Saluran</span>
                </div>
                <div className="bg-[#050b14] border border-cyan-500/40 rounded-xl p-3">
                  <span className="text-[10px] font-mono-cyber text-slate-400 uppercase font-bold">Crossing Jalan Tol</span>
                  <div className="text-xl font-bold font-mono-cyber text-cyan-300 my-0.5">
                    {breakdown.sipil.boringCrossingJalanTol.toLocaleString('id-ID')} <span className="text-xs font-normal">m</span>
                  </div>
                  <span className="text-[10px] font-mono-cyber text-slate-500">Ruas Tol</span>
                </div>
                <div className="bg-[#050b14] border border-emerald-400/50 rounded-xl p-3">
                  <span className="text-[10px] font-mono-cyber text-slate-400 uppercase font-bold">Total Pekerjaan Sipil</span>
                  <div className="text-xl font-bold font-mono-cyber text-emerald-300 my-0.5">
                    {breakdown.sipil.totalSipil.toLocaleString('id-ID')} <span className="text-xs font-normal">m</span>
                  </div>
                  <span className="text-[10px] font-mono-cyber text-emerald-400 font-semibold">Total Seluruh Boring</span>
                </div>
              </div>

              {/* Rincian per Area & Per Project */}
              <div className="bg-[#050b14] border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold font-mono-cyber uppercase text-white tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Rincian Pencapaian Sipil per Area ({periodLabel})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {recapData.areas.map((a) => (
                    <div key={a.areaName} className="p-3 rounded-lg bg-[#091426] border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs font-cyber">{a.areaName}</span>
                        <span className="text-[11px] text-emerald-300 font-bold font-mono-cyber">
                          {a.totalSipil.toLocaleString('id-ID')} m
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono-cyber">
                        {a.waspangs.length} Waspang • {a.totalReports} Laporan
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. VIEW FOR 'kabel' (Progres Fisik Kabel Terperinci) */}
          {type === 'kabel' && (
            <div className="space-y-4">
              {/* Itemized FO Cores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#050b14] border border-amber-500/40 rounded-xl p-3">
                  <span className="text-[10px] font-mono-cyber text-slate-400 uppercase font-bold">288 Core</span>
                  <div className="text-lg font-bold font-mono-cyber text-amber-300 my-0.5">
                    {breakdown.kabel.pulling288.toLocaleString('id-ID')} <span className="text-xs font-normal">m</span>
                  </div>
                  <span className="text-[10px] font-mono-cyber text-slate-500">GL: {breakdown.kabel.pulling288GL} m</span>
                </div>
                <div className="bg-[#050b14] border border-amber-500/40 rounded-xl p-3">
                  <span className="text-[10px] font-mono-cyber text-slate-400 uppercase font-bold">144 Core</span>
                  <div className="text-lg font-bold font-mono-cyber text-amber-300 my-0.5">
                    {breakdown.kabel.pulling144.toLocaleString('id-ID')} <span className="text-xs font-normal">m</span>
                  </div>
                  <span className="text-[10px] font-mono-cyber text-slate-500">GL: {breakdown.kabel.pulling144GL} m</span>
                </div>
                <div className="bg-[#050b14] border border-amber-500/40 rounded-xl p-3">
                  <span className="text-[10px] font-mono-cyber text-slate-400 uppercase font-bold">96 Core</span>
                  <div className="text-lg font-bold font-mono-cyber text-amber-300 my-0.5">
                    {breakdown.kabel.pulling96.toLocaleString('id-ID')} <span className="text-xs font-normal">m</span>
                  </div>
                  <span className="text-[10px] font-mono-cyber text-slate-500">GL: {breakdown.kabel.pulling96GL} m</span>
                </div>
                <div className="bg-[#050b14] border border-amber-500/40 rounded-xl p-3">
                  <span className="text-[10px] font-mono-cyber text-slate-400 uppercase font-bold">48 Core</span>
                  <div className="text-lg font-bold font-mono-cyber text-amber-300 my-0.5">
                    {breakdown.kabel.pulling48.toLocaleString('id-ID')} <span className="text-xs font-normal">m</span>
                  </div>
                  <span className="text-[10px] font-mono-cyber text-slate-500">Pulling FO 48C</span>
                </div>
                <div className="bg-[#050b14] border border-amber-500/40 rounded-xl p-3">
                  <span className="text-[10px] font-mono-cyber text-slate-400 uppercase font-bold">24 Core</span>
                  <div className="text-lg font-bold font-mono-cyber text-amber-300 my-0.5">
                    {breakdown.kabel.pulling24.toLocaleString('id-ID')} <span className="text-xs font-normal">m</span>
                  </div>
                  <span className="text-[10px] font-mono-cyber text-slate-500">Pulling FO 24C</span>
                </div>
                <div className="bg-[#050b14] border border-amber-500/40 rounded-xl p-3">
                  <span className="text-[10px] font-mono-cyber text-slate-400 uppercase font-bold">12 Core</span>
                  <div className="text-lg font-bold font-mono-cyber text-amber-300 my-0.5">
                    {breakdown.kabel.pulling12.toLocaleString('id-ID')} <span className="text-xs font-normal">m</span>
                  </div>
                  <span className="text-[10px] font-mono-cyber text-slate-500">Pulling FO 12C</span>
                </div>
                <div className="bg-[#050b14] border border-amber-500/40 rounded-xl p-3">
                  <span className="text-[10px] font-mono-cyber text-slate-400 uppercase font-bold">Kabel Coaxial</span>
                  <div className="text-lg font-bold font-mono-cyber text-amber-300 my-0.5">
                    {breakdown.kabel.pullingCoax.toLocaleString('id-ID')} <span className="text-xs font-normal">m</span>
                  </div>
                  <span className="text-[10px] font-mono-cyber text-slate-500">Kabel Coax Tarik</span>
                </div>
                <div className="bg-[#050b14] border border-emerald-500/40 rounded-xl p-3">
                  <span className="text-[10px] font-mono-cyber text-slate-400 uppercase font-bold">Total FO + Coax</span>
                  <div className="text-lg font-bold font-mono-cyber text-emerald-300 my-0.5">
                    {breakdown.kabel.totalKabel.toLocaleString('id-ID')} <span className="text-xs font-normal">m</span>
                  </div>
                  <span className="text-[10px] font-mono-cyber text-slate-500">Semua Penarikan</span>
                </div>
              </div>

              {/* Rincian per Area */}
              <div className="bg-[#050b14] border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold font-mono-cyber uppercase text-white tracking-wider flex items-center gap-1.5">
                  <Cable className="w-4 h-4 text-amber-400" />
                  Rincian Pencapaian Penarikan Kabel per Area ({periodLabel})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {recapData.areas.map((a) => (
                    <div key={a.areaName} className="p-3 rounded-lg bg-[#091426] border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs font-cyber">{a.areaName}</span>
                        <span className="text-[11px] text-amber-300 font-bold font-mono-cyber">
                          {a.totalKabel.toLocaleString('id-ID')} m
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono-cyber">
                        {a.waspangs.length} Waspang • {a.totalReports} Laporan
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. VIEW FOR 'kendala' (Semua Isu & Kendala Lapangan) */}
          {type === 'kendala' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono-cyber text-slate-400 pb-1">
                <span>Daftar Kendala Teknis Lapangan Terintegrasi</span>
                <span>Total: <strong className="text-rose-400">{recapData.allKendalaList?.length || 0} Isu</strong></span>
              </div>

              {(!recapData.allKendalaList || recapData.allKendalaList.length === 0) ? (
                <div className="p-8 text-center text-xs font-mono-cyber text-emerald-400 bg-emerald-950/20 rounded-xl border border-emerald-500/30">
                  ✅ Tidak ada kendala atau isu lapangan dilaporkan pada periode ini. Semua operasional berjalan lancar!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {modalReports
                    .filter((r) => {
                      const k = r.kendalaLapangan?.trim();
                      return k && k.toLowerCase() !== 'tidak ada kendala' && k !== '-';
                    })
                    .map((rep, idx) => (
                      <div
                        key={rep.id || idx}
                        onClick={() => onSelectReport && onSelectReport(rep)}
                        className="bg-[#050b14] border border-rose-500/40 hover:border-rose-400 rounded-xl p-3.5 space-y-2 cursor-pointer transition-all hover:bg-rose-950/20 group"
                        title="Klik untuk membuka laporan ini"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-rose-500/20 pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white font-cyber text-xs sm:text-sm group-hover:text-rose-300 transition-colors">
                              {rep.projectName || 'Project'}
                            </span>
                            <span className="text-[10px] font-mono-cyber px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                              {rep.area || 'Jabo 1'}
                            </span>
                            <span className="text-[10px] font-mono-cyber text-slate-400">
                              Waspang: <strong className="text-slate-200">{rep.waspangName || rep.authorEmail || '-'}</strong>
                            </span>
                          </div>
                          <span className="text-[11px] font-mono-cyber text-rose-300 flex items-center gap-1 shrink-0">
                            <Calendar className="w-3 h-3 text-rose-400" />
                            {rep.reportDate || 'Hari ini'}
                          </span>
                        </div>

                        <div className="text-xs text-rose-200 leading-relaxed bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-rose-300 font-mono-cyber block text-[11px] uppercase">
                              Catatan Hambatan / Isu:
                            </span>
                            <p className="mt-0.5">{rep.kendalaLapangan}</p>
                          </div>
                        </div>

                        {rep.remarks && (
                          <div className="text-[11px] font-mono-cyber text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-500">Tindak Lanjut / Remarks:</span> {rep.remarks}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-[#060c18] border-t border-slate-800 flex items-center justify-between text-xs font-mono-cyber text-slate-400">
          <span>Periode: <strong className="text-white">{periodLabel}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

// ==========================================
// 2. MODAL RINCIAN TERPERINCI WASPANG SPESIFIK
// ==========================================

interface WaspangDetailModalProps {
  waspangName: string;
  areaName: string;
  recapData: WeeklyRecapData;
  periodLabel: string;
  allReports: DailyReportFormData[];
  onClose: () => void;
  onSelectReport?: (report: DailyReportFormData) => void;
}

export const WaspangDetailModal: React.FC<WaspangDetailModalProps> = ({
  waspangName,
  areaName,
  recapData,
  periodLabel,
  allReports,
  onClose,
  onSelectReport,
}) => {
  const [activeTab, setActiveTab] = useState<'laporan' | 'fisik' | 'kendala'>('laporan');

  // Filter reports specifically for this Waspang
  const waspangReports = useMemo(() => {
    return allReports.filter((r) => {
      const w = (r.waspangName && r.waspangName.trim()) || (r.authorEmail ? r.authorEmail.split('@')[0] : '');
      const a = r.area || 'Jabo 1';
      return w.toLowerCase() === waspangName.toLowerCase() && a === areaName;
    });
  }, [allReports, waspangName, areaName]);

  // Compute breakdown
  const breakdown = useMemo(() => computePhysicalBreakdown(waspangReports), [waspangReports]);

  // Unique projects & dates
  const projects = useMemo(() => {
    const s = new Set<string>();
    waspangReports.forEach((r) => {
      if (r.projectName) s.add(r.projectName);
    });
    return Array.from(s);
  }, [waspangReports]);

  const uniqueDates = useMemo(() => {
    const s = new Set<string>();
    waspangReports.forEach((r) => {
      if (r.reportDate) s.add(r.reportDate);
    });
    return Array.from(s).sort();
  }, [waspangReports]);

  // Kendala list
  const kendalaList = useMemo(() => {
    return waspangReports
      .filter((r) => {
        const k = r.kendalaLapangan?.trim();
        return k && k.toLowerCase() !== 'tidak ada kendala' && k !== '-';
      })
      .map((r) => ({
        date: r.reportDate || 'Hari ini',
        project: r.projectName || 'Project',
        kendala: r.kendalaLapangan,
        remarks: r.remarks,
        report: r,
      }));
  }, [waspangReports]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#091426] border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-cyan-950/60 overflow-hidden text-slate-100">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-gradient-to-r from-[#0b1e3b] via-[#091730] to-[#0b1e3b] border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold font-mono-cyber text-sm shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-cyber font-bold text-white tracking-wide">
                  {waspangName}
                </h3>
                <span className="text-[10px] font-mono-cyber px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  {areaName}
                </span>
                <span className="text-[10px] font-mono-cyber px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  {waspangReports.length} Laporan • {uniqueDates.length} Hari Lapor
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono-cyber mt-0.5">
                Proyek: {projects.join(', ') || '-'} • Periode: {periodLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Quick Stat Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:px-5 bg-[#070f1e] border-b border-slate-800/90 text-xs font-mono-cyber">
          <div className="p-2.5 rounded-xl bg-[#050b14] border border-cyan-500/30 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Keaktifan:</span>
            <strong className="text-cyan-300 text-sm">{uniqueDates.length} Hari</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-[#050b14] border border-emerald-500/30 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Sipil:</span>
            <strong className="text-emerald-300 text-sm">{breakdown.sipil.totalSipil.toLocaleString('id-ID')} m</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-[#050b14] border border-amber-500/30 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Kabel:</span>
            <strong className="text-amber-300 text-sm">{breakdown.kabel.totalKabel.toLocaleString('id-ID')} m</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-[#050b14] border border-rose-500/30 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Isu/Kendala:</span>
            <strong className={`${kendalaList.length > 0 ? 'text-rose-300' : 'text-slate-400'} text-sm`}>
              {kendalaList.length} Isu
            </strong>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 sm:px-5 pt-3 border-b border-slate-800 bg-[#070e1c]">
          <button
            type="button"
            onClick={() => setActiveTab('laporan')}
            className={`pb-2.5 px-2 text-xs font-mono-cyber font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'laporan'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Riwayat Laporan Harian ({waspangReports.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fisik')}
            className={`pb-2.5 px-2 text-xs font-mono-cyber font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fisik'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Rincian Fisik Terperinci</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kendala')}
            className={`pb-2.5 px-2 text-xs font-mono-cyber font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'kendala'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Catatan Kendala ({kendalaList.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#070e1c]">

          {/* TAB 1: RIWAYAT LAPORAN HARIAN */}
          {activeTab === 'laporan' && (
            <div className="space-y-2.5">
              {waspangReports.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono-cyber text-slate-400 bg-[#050b14] rounded-xl border border-slate-800">
                  Belum ada laporan dari {waspangName} pada periode ini.
                </div>
              ) : (
                waspangReports.map((rep, idx) => {
                  const isPeng = isPengamananReport(rep);
                  const sipilVal = parseFloat(rep.totalProgressSipil) || 0;
                  const kabelVal = (parseFloat(rep.totalProgressKabel) || 0) + (parseFloat(rep.totalProgressKabelCoax || '0') || 0);

                  return (
                    <div
                      key={rep.id || idx}
                      className="bg-[#050b14] border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3.5 transition-all space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white font-cyber text-sm">
                            {rep.projectName || 'Project'}
                          </span>
                          <span className={`text-[10px] font-mono-cyber px-2 py-0.5 rounded font-semibold ${
                            isPeng 
                              ? 'bg-amber-950/80 border border-amber-500/40 text-amber-300' 
                              : 'bg-blue-950/80 border border-blue-500/40 text-blue-300'
                          }`}>
                            {isPeng ? '🛡️ Pengamanan' : '🔵 Relokasi Gov'}
                          </span>
                          {rep.dayNumber && (
                            <span className="text-[10px] font-mono-cyber text-cyan-400 font-bold">
                              [H-{rep.dayNumber}]
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono-cyber text-slate-300 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-cyan-400" />
                            {rep.reportDate || 'Hari ini'}
                          </span>
                          <button
                            type="button"
                            onClick={() => onSelectReport && onSelectReport(rep)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-[10px] font-mono-cyber text-cyan-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>Buka Laporan</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress summary for this day */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-cyber text-slate-300 pt-1">
                        <div className="bg-[#091426] p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Progres Sipil</span>
                          <strong className="text-emerald-300">{sipilVal} m</strong>
                        </div>
                        <div className="bg-[#091426] p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Progres Kabel</span>
                          <strong className="text-amber-300">{kabelVal} m</strong>
                        </div>
                        <div className="bg-[#091426] p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Cuaca</span>
                          <strong className="text-white">{rep.weatherCondition || '-'}</strong>
                        </div>
                        <div className="bg-[#091426] p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Durasi Kerja</span>
                          <strong className="text-white">{rep.durasiPekerjaan || '-'}</strong>
                        </div>
                      </div>

                      {/* Remarks & Kendala */}
                      {rep.kendalaLapangan && rep.kendalaLapangan.toLowerCase() !== 'tidak ada kendala' && rep.kendalaLapangan !== '-' && (
                        <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 p-2 rounded-lg flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                          <span><strong>Kendala:</strong> {rep.kendalaLapangan}</span>
                        </div>
                      )}
                      {rep.remarks && (
                        <p className="text-[11px] font-mono-cyber text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 line-clamp-2">
                          <span className="text-slate-500">Remarks:</span> {rep.remarks}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: RINCIAN FISIK TERPERINCI */}
          {activeTab === 'fisik' && (
            <div className="space-y-4">
              {/* Seksi Sipil */}
              <div className="bg-[#050b14] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold font-mono-cyber uppercase text-emerald-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    Pekerjaan Sipil / Boring (Total: {breakdown.sipil.totalSipil.toLocaleString('id-ID')} m)
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono-cyber">
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Boring Alur</span>
                    <strong className="text-white">{breakdown.sipil.boringAlur} m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Crossing Jalan</span>
                    <strong className="text-white">{breakdown.sipil.boringCrossingJalan} m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Boring Akses</span>
                    <strong className="text-white">{breakdown.sipil.boringAkses} m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Crossing Jembatan</span>
                    <strong className="text-cyan-300">{breakdown.sipil.boringCrossingJembatan} m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Crossing Tol</span>
                    <strong className="text-cyan-300">{breakdown.sipil.boringCrossingJalanTol} m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 block">Total Sipil</span>
                    <strong className="text-emerald-300">{breakdown.sipil.totalSipil} m</strong>
                  </div>
                </div>
              </div>

              {/* Seksi Kabel */}
              <div className="bg-[#050b14] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold font-mono-cyber uppercase text-amber-400 flex items-center gap-1.5">
                    <Cable className="w-4 h-4" />
                    Penarikan Kabel (Total: {breakdown.kabel.totalKabel} m)
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-cyber">
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">288 Core</span>
                    <strong className="text-white">{breakdown.kabel.pulling288} m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">144 Core</span>
                    <strong className="text-white">{breakdown.kabel.pulling144} m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">96 Core</span>
                    <strong className="text-white">{breakdown.kabel.pulling96} m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">48 Core</span>
                    <strong className="text-white">{breakdown.kabel.pulling48} m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">24 Core</span>
                    <strong className="text-white">{breakdown.kabel.pulling24} m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">12 Core</span>
                    <strong className="text-white">{breakdown.kabel.pulling12} m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Coaxial</span>
                    <strong className="text-white">{breakdown.kabel.pullingCoax} m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Total FO</span>
                    <strong className="text-amber-300">{breakdown.kabel.totalFO} m</strong>
                  </div>
                </div>
              </div>

              {/* Seksi Pit (HH / HB / MH) */}
              <div className="bg-[#050b14] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold font-mono-cyber uppercase text-cyan-400 flex items-center gap-1.5">
                    <Box className="w-4 h-4" />
                    Instalasi Pit / Manhole (Total: {breakdown.pit.grandTotalPit} Titik)
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono-cyber">
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Handhole (HH)</span>
                    <strong className="text-white">{breakdown.pit.hh.total} titik</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Handbox (HB)</span>
                    <strong className="text-white">{breakdown.pit.hb.total} titik</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Manhole (MH)</span>
                    <strong className="text-white">{breakdown.pit.mh.total} titik</strong>
                  </div>
                </div>
              </div>

              {/* Seksi Tiang, Proteksi & Dismantling */}
              <div className="bg-[#050b14] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold font-mono-cyber uppercase text-indigo-400 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Tiang, Proteksi &amp; Dismantling
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-cyber">
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Tiang Bersama</span>
                    <strong className="text-white">{breakdown.lainnya.tiangBersama} btg</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Galvanis 2"</span>
                    <strong className="text-white">{breakdown.lainnya.galvanis2Inch} btg</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Galvanis ATB</span>
                    <strong className="text-white">{breakdown.lainnya.galvanisATB} btg</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Instal HDPE</span>
                    <strong className="text-white">{breakdown.lainnya.instalHDPE} m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Dismantle Kabel</span>
                    <strong className="text-rose-300">{breakdown.lainnya.dismantleKabel} m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#091426] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Dismantle Tiang</span>
                    <strong className="text-rose-300">{breakdown.lainnya.dismantleTiang} btg</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATATAN KENDALA */}
          {activeTab === 'kendala' && (
            <div className="space-y-2.5">
              {kendalaList.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono-cyber text-emerald-400 bg-emerald-950/20 rounded-xl border border-emerald-500/30">
                  ✅ Tidak ada kendala lapangan yang dilaporkan oleh {waspangName} pada periode ini.
                </div>
              ) : (
                kendalaList.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#050b14] border border-rose-500/40 rounded-xl p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-cyber text-sm">
                          {item.project}
                        </span>
                        <span className="text-[10px] font-mono-cyber text-slate-400">
                          {item.date}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectReport && onSelectReport(item.report)}
                        className="text-[10px] font-mono-cyber text-rose-300 hover:text-white underline cursor-pointer"
                      >
                        Buka Laporan
                      </button>
                    </div>

                    <div className="text-xs text-rose-200 bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-rose-300 text-[11px] block uppercase">
                          Kendala:
                        </span>
                        <p className="mt-0.5">{item.kendala}</p>
                      </div>
                    </div>

                    {item.remarks && (
                      <p className="text-[11px] font-mono-cyber text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500">Remarks:</span> {item.remarks}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-[#060c18] border-t border-slate-800 flex items-center justify-between text-xs font-mono-cyber text-slate-400">
          <span>Pengawas Lapangan: <strong className="text-cyan-300">{waspangName}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

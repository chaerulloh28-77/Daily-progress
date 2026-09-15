import React, { useRef, useState } from 'react';
import { toBlob, toPng } from 'html-to-image';
import { Camera, Check, Download, Award, Sparkles, ClipboardCheck } from 'lucide-react';
import type { WeeklyRecapData } from '../utils/whatsapp';

interface WaspangPerformanceChartProps {
  recapData: WeeklyRecapData;
  periodLabel: string;
}

interface TableDataItem {
  rawName: string;
  area: string;
  daysReported: number;
  reports: number;
  score: number;
  projects: string[];
}

function calculateDaysInPeriod(startStr: string, endStr: string): number {
  if (!startStr || !endStr) return 7;
  const s = new Date(startStr);
  const e = new Date(endStr);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 7;
  const diffTime = Math.abs(e.getTime() - s.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(diffDays, 1);
}

function getScoreCategory(score: number): {
  label: string;
  icon: string;
  badgeClass: string;
  textClass: string;
  dotColor: string;
} {
  if (score >= 80) {
    return {
      label: 'Disiplin Baik',
      icon: '🟢',
      badgeClass: 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-950/40',
      textClass: 'text-emerald-400',
      dotColor: 'bg-emerald-400',
    };
  }
  if (score >= 60) {
    return {
      label: 'Cukup',
      icon: '🟡',
      badgeClass: 'bg-amber-950/90 border border-amber-500/50 text-amber-300 shadow-sm shadow-amber-950/40',
      textClass: 'text-amber-400',
      dotColor: 'bg-amber-400',
    };
  }
  return {
    label: 'Kurang Disiplin',
    icon: '🔴',
    badgeClass: 'bg-rose-950/90 border border-rose-500/50 text-rose-300 shadow-sm shadow-rose-950/40',
    textClass: 'text-rose-400',
    dotColor: 'bg-rose-400',
  };
}

export const WaspangPerformanceChart: React.FC<WaspangPerformanceChartProps> = ({
  recapData,
  periodLabel,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const daysInPeriod = React.useMemo(() => {
    return calculateDaysInPeriod(recapData.startDate, recapData.endDate);
  }, [recapData.startDate, recapData.endDate]);

  // Compute attendance/reporting KPI score for each waspang
  const tableData: TableDataItem[] = React.useMemo(() => {
    const items: TableDataItem[] = [];

    recapData.areas.forEach((area) => {
      area.waspangs.forEach((w) => {
        const days = w.totalDays || (w.reportDates ? w.reportDates.length : w.reportCount);
        const rawScore = (days / daysInPeriod) * 100;
        const score = Math.min(100, Math.round(rawScore));

        items.push({
          rawName: w.waspangName,
          area: area.areaName,
          daysReported: days,
          reports: w.reportCount,
          score,
          projects: w.projects || [],
        });
      });
    });

    // Sort descending by score, then by days reported
    return items.sort((a, b) => b.score - a.score || b.daysReported - a.daysReported);
  }, [recapData, daysInPeriod]);

  const avgScore = React.useMemo(() => {
    if (tableData.length === 0) return 0;
    const total = tableData.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(total / tableData.length);
  }, [tableData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const handleCopyTableForWhatsApp = async () => {
    if (!chartContainerRef.current) return;
    setIsCapturing(true);

    try {
      const blob = await toBlob(chartContainerRef.current, {
        backgroundColor: '#070f1e',
        pixelRatio: 2,
        cacheBust: true,
      });

      if (!blob) throw new Error('Gagal membuat gambar tabel');

      if (navigator.clipboard && typeof window.ClipboardItem !== 'undefined') {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopiedSuccess(true);
          setTimeout(() => setCopiedSuccess(false), 3000);
          showToast('✅ Gambar Tabel KPI berhasil disalin! Silakan buka WhatsApp lalu Paste (Tempel) di chat.');
          return;
        } catch (clipboardErr) {
          console.warn('Direct clipboard write failed, falling back to download:', clipboardErr);
        }
      }

      const dataUrl = await toPng(chartContainerRef.current, {
        backgroundColor: '#070f1e',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `TABEL_KPI_WASPANG_${recapData.periodLabel.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      showToast('✅ Gambar Tabel diunduh! Silakan lampirkan file gambar ini ke WhatsApp.');
    } catch (err) {
      console.error('Gagal menangkap gambar tabel:', err);
      showToast('⚠️ Gagal menyalin gambar tabel. Silakan coba kembali.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!chartContainerRef.current) return;
    setIsCapturing(true);
    try {
      const dataUrl = await toPng(chartContainerRef.current, {
        backgroundColor: '#070f1e',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `TABEL_KPI_WASPANG_${recapData.periodLabel.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      showToast('✅ File gambar PNG tabel berhasil diunduh!');
    } catch (err) {
      console.error('Download table image failed:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="relative space-y-2">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-bounce max-w-md bg-[#005c4b] border border-emerald-400 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-mono-cyber flex items-center gap-2">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-auto text-emerald-200 hover:text-white font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Solid Container for Capture & Table View */}
      <div
        ref={chartContainerRef}
        className="bg-[#070f1e] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-cyan-950/20 text-white space-y-3.5"
        style={{ backgroundColor: '#070f1e' }}
      >
        {/* Top Header of Table */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/90">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-cyber font-bold text-white tracking-wide uppercase">
                TABEL KPI KEAKTIFAN &amp; KEPATUHAN LAPOR WASPANG
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-[10px] text-cyan-300 font-mono-cyber">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Skor 0 - 100
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono-cyber">
              Target Periode: <span className="text-cyan-300 font-bold">{daysInPeriod} Hari</span> ({periodLabel}) • Target Penuh: <span className="text-white font-semibold">100 Poin</span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={isCapturing || tableData.length === 0}
              className="h-8 sm:h-9 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono-cyber border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              title="Unduh file gambar PNG tabel"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh PNG</span>
            </button>

            <button
              type="button"
              onClick={handleCopyTableForWhatsApp}
              disabled={isCapturing || tableData.length === 0}
              className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs font-mono-cyber transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
              title="Salin gambar tabel ke clipboard untuk di-paste langsung ke chat WhatsApp"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Tabel Tersalin!</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-slate-950" />
                  <span>📸 Salin Gambar Tabel untuk WA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Legend / Category Indicator Bar - Symmetrical & Balanced */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px] font-mono-cyber bg-[#050b14] px-3.5 py-2.5 rounded-xl border border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-slate-400 font-semibold text-[10px] sm:text-xs">Kategori:</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50" />
              <span className="text-emerald-300 font-semibold text-[10px] sm:text-[11px]">≥ 80 Baik</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-500/50" />
              <span className="text-amber-300 font-semibold text-[10px] sm:text-[11px]">60-79 Cukup</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-950/60 border border-rose-500/30">
              <span className="w-2 h-2 rounded-full bg-rose-400 shadow-sm shadow-rose-500/50" />
              <span className="text-rose-300 font-semibold text-[10px] sm:text-[11px]">&lt; 60 Kurang</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-300 text-[10px] sm:text-xs pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800">
            <span>Total: <strong className="text-white">{tableData.length} Waspang</strong></span>
            <span className="text-slate-600">•</span>
            <span>Rata-rata: <strong className="text-cyan-300">{avgScore} / 100</strong></span>
          </div>
        </div>

        {/* Elegant HTML Table Component - Strictly proportional, fixed layout, no overflow */}
        {tableData.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-mono-cyber text-xs bg-[#050b14] rounded-xl border border-slate-800/80">
            <p>Tidak ada data laporan waspang pada rentang periode ini.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800/90 bg-[#050c18] overflow-hidden shadow-md">
            <table className="w-full table-fixed border-collapse text-left font-mono-cyber">
              <colgroup>
                <col className="w-[6%] sm:w-[5%]" />
                <col className="w-[30%] sm:w-[32%]" />
                <col className="w-[13%] sm:w-[11%]" />
                <col className="w-[14%] sm:w-[14%]" />
                <col className="w-[15%] sm:w-[16%]" />
                <col className="w-[22%] sm:w-[22%]" />
              </colgroup>
              <thead>
                <tr className="bg-[#0b172a] border-b border-slate-800 text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                  <th scope="col" className="py-2.5 sm:py-3 px-1 sm:px-2 text-center text-slate-400">
                    No
                  </th>
                  <th scope="col" className="py-2.5 sm:py-3 px-2 sm:px-3 text-left">
                    Nama Waspang
                  </th>
                  <th scope="col" className="py-2.5 sm:py-3 px-1 sm:px-2 text-center">
                    Area
                  </th>
                  <th scope="col" className="py-2.5 sm:py-3 px-1 sm:px-2 text-center">
                    Lapor
                  </th>
                  <th scope="col" className="py-2.5 sm:py-3 px-1 sm:px-2 text-center">
                    Skor KPI
                  </th>
                  <th scope="col" className="py-2.5 sm:py-3 px-1 sm:px-2 text-center">
                    Predikat
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {tableData.map((item, index) => {
                  const cat = getScoreCategory(item.score);
                  const isEven = index % 2 === 0;

                  return (
                    <tr
                      key={`${item.area}-${item.rawName}`}
                      className={`transition-colors hover:bg-slate-800/40 ${
                        isEven ? 'bg-[#060e1c]' : 'bg-[#091426]'
                      }`}
                    >
                      {/* 1. No */}
                      <td className="py-2.5 px-1 sm:px-2 text-center font-bold text-slate-400 text-[11px]">
                        {index + 1}
                      </td>

                      {/* 2. Nama Waspang */}
                      <td className="py-2.5 px-2 sm:px-3 overflow-hidden">
                        <div className="font-cyber font-bold text-white text-xs sm:text-sm tracking-wide truncate" title={item.rawName}>
                          {item.rawName}
                        </div>
                        {item.projects.length > 0 && (
                          <div
                            className="text-[10px] text-slate-400 truncate mt-0.5"
                            title={item.projects.join(', ')}
                          >
                            {item.projects[0]}
                            {item.projects.length > 1 && ` +${item.projects.length - 1}`}
                          </div>
                        )}
                      </td>

                      {/* 3. Area */}
                      <td className="py-2.5 px-1 sm:px-2 text-center overflow-hidden">
                        <span
                          className={`inline-block px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold tracking-wide truncate ${
                            item.area === 'Jabo 1'
                              ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300'
                              : item.area === 'Jabo 2'
                              ? 'bg-blue-950/80 border border-blue-500/40 text-blue-300'
                              : 'bg-amber-950/80 border border-amber-500/40 text-amber-300'
                          }`}
                        >
                          {item.area}
                        </span>
                      </td>

                      {/* 4. Lapor (Hari) */}
                      <td className="py-2.5 px-1 sm:px-2 text-center overflow-hidden">
                        <div className="flex items-baseline justify-center gap-0.5">
                          <span className="font-bold text-white text-xs sm:text-sm">
                            {item.daysReported}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            /{daysInPeriod}
                          </span>
                          <span className="text-slate-500 text-[9px] hidden md:inline ml-0.5">
                            Hari
                          </span>
                        </div>
                        {item.reports > item.daysReported && (
                          <div className="text-[9px] text-slate-500 truncate">
                            ({item.reports} Lap)
                          </div>
                        )}
                      </td>

                      {/* 5. Skor KPI (0-100) */}
                      <td className="py-2.5 px-1 sm:px-2 text-center overflow-hidden">
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex items-baseline gap-0.5">
                            <span className={`font-bold font-mono-cyber text-xs sm:text-sm ${cat.textClass}`}>
                              {item.score}
                            </span>
                            <span className="text-[9px] text-slate-500">/100</span>
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="w-12 sm:w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1 border border-slate-700/50">
                            <div
                              className={`h-full rounded-full transition-all ${
                                item.score >= 80
                                  ? 'bg-emerald-400'
                                  : item.score >= 60
                                  ? 'bg-amber-400'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(8, item.score))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 6. Predikat */}
                      <td className="py-2.5 px-1 sm:px-2 text-center">
                        <span
                          className={`inline-flex items-center justify-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-sm ${cat.badgeClass}`}
                        >
                          <span className="text-[9px] sm:text-xs">{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-[#0b172a] border-t-2 border-slate-700 text-xs font-bold text-slate-300">
                  <td colSpan={3} className="py-2.5 sm:py-3 px-2 sm:px-3 text-left font-mono-cyber overflow-hidden">
                    <div className="flex items-center gap-1.5 truncate">
                      <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-[10px] sm:text-xs">Rata-rata ({tableData.length} Waspang)</span>
                    </div>
                  </td>
                  <td className="py-2.5 sm:py-3 px-1 sm:px-2 text-center font-mono-cyber text-white">
                    <span className="text-xs font-bold">
                      {Math.round(
                        (tableData.reduce((acc, curr) => acc + curr.daysReported, 0) /
                          (tableData.length || 1)) *
                          10
                      ) / 10}
                    </span>
                    <span className="text-slate-400 text-[10px] ml-0.5">H</span>
                  </td>
                  <td className="py-2.5 sm:py-3 px-1 sm:px-2 text-center font-mono-cyber">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        avgScore >= 80
                          ? 'text-emerald-400'
                          : avgScore >= 60
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {avgScore} / 100
                    </span>
                  </td>
                  <td className="py-2.5 sm:py-3 px-1 sm:px-2 text-center">
                    <span
                      className={`inline-flex items-center justify-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap ${
                        getScoreCategory(avgScore).badgeClass
                      }`}
                    >
                      <span>{getScoreCategory(avgScore).icon}</span>
                      <span>{getScoreCategory(avgScore).label}</span>
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Table Footer / Watermark for captured PNG */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono-cyber text-slate-400 gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-bold">GovMonitor Admin System • PT Link Net &amp; PMO MS CKT</span>
            <span>| {tableData.length} Personil</span>
          </div>
          <div className="text-slate-400">
            Formula: (Hari Lapor / {daysInPeriod} Hari Target) × 100 Poin
          </div>
        </div>
      </div>
    </div>
  );
};

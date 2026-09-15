import React, { useRef, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { toBlob, toPng } from 'html-to-image';
import { Camera, Check, Download, Award, Sparkles } from 'lucide-react';
import type { WeeklyRecapData } from '../utils/whatsapp';

interface WaspangPerformanceChartProps {
  recapData: WeeklyRecapData;
  periodLabel: string;
}

interface ChartDataItem {
  rawName: string;
  shortName: string;
  area: string;
  daysReported: number;
  reports: number;
  score: number;
}

function shortenName(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} ${parts[1][0]}.`;
  return `${parts[0]} ${parts[1][0]}. ${parts[2][0]}.`;
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

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981'; // Hijau (Disiplin Baik)
  if (score >= 60) return '#f59e0b'; // Kuning/Amber (Cukup)
  return '#ef4444'; // Merah (Kurang Disiplin)
}

function getScoreCategory(score: number): { label: string; colorClass: string } {
  if (score >= 80) return { label: 'Disiplin Baik', colorClass: 'text-emerald-400' };
  if (score >= 60) return { label: 'Cukup', colorClass: 'text-amber-400' };
  return { label: 'Kurang Disiplin', colorClass: 'text-rose-400' };
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
  const chartData: ChartDataItem[] = React.useMemo(() => {
    const items: ChartDataItem[] = [];

    recapData.areas.forEach((area) => {
      area.waspangs.forEach((w) => {
        // Unique days reported or report count
        const days = w.totalDays || (w.reportDates ? w.reportDates.length : w.reportCount);
        const rawScore = (days / daysInPeriod) * 100;
        const score = Math.min(100, Math.round(rawScore));

        items.push({
          rawName: w.waspangName,
          shortName: shortenName(w.waspangName),
          area: area.areaName,
          daysReported: days,
          reports: w.reportCount,
          score,
        });
      });
    });

    // Sort descending by score, then by days reported
    return items.sort((a, b) => b.score - a.score || b.daysReported - a.daysReported);
  }, [recapData, daysInPeriod]);

  const avgScore = React.useMemo(() => {
    if (chartData.length === 0) return 0;
    const total = chartData.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(total / chartData.length);
  }, [chartData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const handleCopyChartForWhatsApp = async () => {
    if (!chartContainerRef.current) return;
    setIsCapturing(true);

    try {
      // Capture element into high-res PNG Blob
      const blob = await toBlob(chartContainerRef.current, {
        backgroundColor: '#070f1e', // Deep solid background suitable for WhatsApp dark/light
        pixelRatio: 2,
        cacheBust: true,
      });

      if (!blob) throw new Error('Gagal membuat gambar grafik');

      // Direct clipboard copy
      if (navigator.clipboard && typeof window.ClipboardItem !== 'undefined') {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopiedSuccess(true);
          setTimeout(() => setCopiedSuccess(false), 3000);
          showToast('✅ Gambar Grafik berhasil disalin! Silakan buka WhatsApp lalu Paste (Tempel) di chat.');
          return;
        } catch (clipboardErr) {
          console.warn('Direct clipboard write failed, falling back to download:', clipboardErr);
        }
      }

      // Fallback: download PNG image directly
      const dataUrl = await toPng(chartContainerRef.current, {
        backgroundColor: '#070f1e',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `KPI_Keaktifan_Waspang_${recapData.periodLabel.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      showToast('✅ Gambar Grafik diunduh! Silakan lampirkan file gambar ini ke WhatsApp.');
    } catch (err) {
      console.error('Gagal menangkap gambar chart:', err);
      showToast('⚠️ Gagal menyalin gambar grafik. Silakan coba kembali.');
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
      link.download = `KPI_Keaktifan_Waspang_${recapData.periodLabel.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      showToast('✅ File gambar PNG grafik berhasil diunduh!');
    } catch (err) {
      console.error('Download chart failed:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Tooltip tailored exclusively for Kehadiran / Keaktifan Lapor
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ChartDataItem = payload[0].payload;
      const cat = getScoreCategory(data.score);
      return (
        <div className="bg-[#091528] border border-cyan-500/50 rounded-xl p-3.5 shadow-2xl text-xs font-mono-cyber z-50 text-white min-w-[210px]">
          <div className="font-cyber font-bold text-cyan-300 pb-1.5 mb-2 border-b border-slate-700/80 flex items-center justify-between">
            <span>{data.rawName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-600/30">
              {data.area}
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Skor Keaktifan:</span>
              <span className={`font-bold text-sm ${cat.colorClass}`}>
                {data.score} / 100
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>Jumlah Lapor:</span>
              <span className="font-semibold text-white">
                {data.daysReported} Hari
              </span>
            </div>
            <div className="pt-1.5 border-t border-slate-800 text-[10px] flex items-center justify-between">
              <span className="text-slate-400">Predikat:</span>
              <span className={`font-bold ${cat.colorClass}`}>{cat.label}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
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
            className="ml-auto text-emerald-200 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Solid Container designed for capture & presentation */}
      <div
        ref={chartContainerRef}
        className="bg-[#070f1e] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-cyan-950/20 text-white space-y-4"
        style={{ backgroundColor: '#070f1e' }}
      >
        {/* Top Header of the Chart Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-cyber font-bold text-white tracking-wide flex items-center gap-2">
                KPI Keaktifan &amp; Kepatuhan Lapor Waspang
              </h3>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono-cyber">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Skor 0 - 100
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono-cyber">
              Skor keaktifan dihitung dari perbandingan jumlah hari lapor terhadap total {daysInPeriod} hari pada periode ({periodLabel})
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={isCapturing || chartData.length === 0}
              className="h-9 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono-cyber border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              title="Unduh file gambar PNG grafik"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh PNG</span>
            </button>

            <button
              type="button"
              onClick={handleCopyChartForWhatsApp}
              disabled={isCapturing || chartData.length === 0}
              className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black font-bold text-xs font-mono-cyber transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50"
              title="Salin gambar grafik ke clipboard untuk di-paste langsung ke chat WhatsApp"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>Gambar Tersalin!</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-black" />
                  <span>📸 Salin Gambar Grafik untuk WA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Legend / Category Indicator Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-cyber bg-[#050b14] px-3.5 py-2 rounded-xl border border-slate-800/80">
          <div className="flex flex-wrap items-center gap-3.5">
            <span className="text-slate-400 font-semibold">Kategori Disiplin:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-400">≥ 80 (Disiplin Baik)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-amber-400">60 - 79 (Cukup)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-rose-400">&lt; 60 (Kurang Disiplin)</span>
            </div>
          </div>
          <div className="text-slate-400">
            Rata-rata Skor: <span className="font-bold text-white">{avgScore} / 100</span>
          </div>
        </div>

        {/* Chart Viewport */}
        {chartData.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-mono-cyber text-xs bg-[#050b14] rounded-xl border border-slate-800/80">
            <p>Tidak ada data laporan waspang pada rentang periode ini.</p>
          </div>
        ) : (
          <div className="w-full h-72 sm:h-80 md:h-96 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="shortName"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={45}
                  tick={{ fill: '#94a3b8', fontFamily: 'monospace' }}
                />
                <YAxis
                  stroke="#64748b"
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}`}
                  tick={{ fill: '#94a3b8', fontFamily: 'monospace' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="score"
                  name="Skor Keaktifan"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={48}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getScoreColor(entry.score)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart Footer / Watermark for captured PNG */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono-cyber text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-bold">PMO MS CKT • GovMonitor System</span>
            <span>| Total Personil: {chartData.length} Waspang</span>
          </div>
          <div className="text-slate-400">
            Target Kehadiran Penuh: {daysInPeriod} Hari = 100 Poin
          </div>
        </div>
      </div>
    </div>
  );
};

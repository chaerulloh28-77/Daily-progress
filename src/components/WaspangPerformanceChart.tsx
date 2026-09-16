import React, { useRef, useState } from 'react';
import { toBlob, toPng } from 'html-to-image';
import {
  Camera,
  Check,
  Download,
  Award,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PieChart as PieChartIcon,
} from 'lucide-react';
import type { WeeklyRecapData } from '../utils/whatsapp';

interface WaspangPerformanceChartProps {
  recapData: WeeklyRecapData;
  periodLabel: string;
  onSelectWaspang?: (waspangName: string, areaName: string) => void;
}

interface TableDataItem {
  rawName: string;
  area: string;
  daysReported: number;
  reports: number;
  score: number;
  projects: string[];
}

interface DonutSliceData {
  name: string;
  shortName: string;
  value: number;
  percentage: number;
  color: string;
  glowColor: string;
  waspangs: TableDataItem[];
  icon: string;
}

interface PieSliceData {
  name: string;
  value: number;
  waspangCount: number;
  percentage: number;
  avgScore: number;
  color: string;
  waspangs: TableDataItem[];
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

// Polar to Cartesian conversion for SVG arc paths
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// Generate SVG Path for a Donut slice
function describeDonutSlice(
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const diff = endAngle - startAngle;
  if (diff <= 0.001) return '';
  const effectiveEndAngle = diff >= 359.99 ? startAngle + 359.99 : endAngle;
  const startOuter = polarToCartesian(x, y, outerRadius, startAngle);
  const endOuter = polarToCartesian(x, y, outerRadius, effectiveEndAngle);
  const startInner = polarToCartesian(x, y, innerRadius, effectiveEndAngle);
  const endInner = polarToCartesian(x, y, innerRadius, startAngle);
  const largeArcFlag = diff > 180 ? 1 : 0;

  return [
    'M', startOuter.x, startOuter.y,
    'A', outerRadius, outerRadius, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
    'L', startInner.x, startInner.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 0, endInner.x, endInner.y,
    'Z',
  ].join(' ');
}

// Generate SVG Path for a Pie slice
function describePieSlice(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const diff = endAngle - startAngle;
  if (diff <= 0.001) return '';
  const effectiveEndAngle = diff >= 359.99 ? startAngle + 359.99 : endAngle;
  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, effectiveEndAngle);
  const largeArcFlag = diff > 180 ? 1 : 0;

  return [
    'M', x, y,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y,
    'Z',
  ].join(' ');
}

// Area color palette
const AREA_COLORS: Record<string, string> = {
  'Jabo 1': '#06b6d4', // Cyan
  'Jabo 2': '#3b82f6', // Blue
  'Jabo 3': '#8b5cf6', // Violet
  'Banten': '#10b981', // Emerald
  'Default': '#0ea5e9',
};

export const WaspangPerformanceChart: React.FC<WaspangPerformanceChartProps> = ({
  recapData,
  periodLabel,
  onSelectWaspang,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Hover states for interactive tooltips
  const [hoveredDonutIndex, setHoveredDonutIndex] = useState<number | null>(null);
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

  const daysInPeriod = React.useMemo(() => {
    return calculateDaysInPeriod(recapData.startDate, recapData.endDate);
  }, [recapData.startDate, recapData.endDate]);

  // Compute attendance/reporting KPI score for each waspang
  const tableData: TableDataItem[] = React.useMemo(() => {
    const items: TableDataItem[] = [];

    if (!recapData?.areas) return items;

    recapData.areas.forEach((area) => {
      if (!area?.waspangs) return;
      area.waspangs.forEach((w) => {
        const anyW = w as unknown as { dates?: unknown; reports?: unknown[] };
        let daysReported = 0;
        if (typeof w.totalDays === 'number') {
          daysReported = w.totalDays;
        } else if (anyW.dates instanceof Set) {
          daysReported = anyW.dates.size;
        } else if (Array.isArray(anyW.dates)) {
          daysReported = anyW.dates.length;
        } else if (Array.isArray(w.reportDates)) {
          daysReported = w.reportDates.length;
        } else if (typeof w.reportCount === 'number') {
          daysReported = w.reportCount;
        }

        const totalReports =
          typeof w.reportCount === 'number'
            ? w.reportCount
            : Array.isArray(anyW.reports)
            ? anyW.reports.length
            : daysReported;

        const rawScore = (daysReported / daysInPeriod) * 100;
        const cappedScore = Math.min(100, Math.round(rawScore));

        const projectNames: string[] = Array.isArray(w.projects)
          ? w.projects
          : Array.isArray((w as unknown as { reports?: { projectName?: string }[] }).reports)
          ? Array.from(
              new Set<string>(
                ((w as unknown as { reports?: { projectName?: string }[] }).reports || [])
                  .map((r) => r.projectName || 'Project Lapangan')
              )
            )
          : [];

        const rawName = w.waspangName || (w as unknown as { name?: string }).name || 'Waspang';

        items.push({
          rawName,
          area: area.areaName || 'Umum',
          daysReported,
          reports: totalReports,
          score: cappedScore,
          projects: projectNames,
        });
      });
    });

    return items.sort((a, b) => b.score - a.score || b.reports - a.reports || a.rawName.localeCompare(b.rawName));
  }, [recapData, daysInPeriod]);

  // Team average score
  const avgScore = React.useMemo(() => {
    if (tableData.length === 0) return 0;
    const total = tableData.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(total / tableData.length);
  }, [tableData]);

  // 1. DATA FOR DONUT CHART: KPI Compliance Distribution (Disiplin Baik, Cukup, Kurang)
  const donutComplianceData: DonutSliceData[] = React.useMemo(() => {
    const baikList: TableDataItem[] = [];
    const cukupList: TableDataItem[] = [];
    const kurangList: TableDataItem[] = [];

    tableData.forEach((w) => {
      if (w.score >= 80) baikList.push(w);
      else if (w.score >= 60) cukupList.push(w);
      else kurangList.push(w);
    });

    const total = tableData.length || 1;

    const list: DonutSliceData[] = [
      {
        name: 'Disiplin Baik (≥ 80)',
        shortName: 'Disiplin Baik',
        value: baikList.length,
        percentage: Math.round((baikList.length / total) * 100),
        color: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.4)',
        waspangs: baikList,
        icon: '🟢',
      },
      {
        name: 'Cukup (60 - 79)',
        shortName: 'Cukup',
        value: cukupList.length,
        percentage: Math.round((cukupList.length / total) * 100),
        color: '#f59e0b',
        glowColor: 'rgba(245, 158, 11, 0.4)',
        waspangs: cukupList,
        icon: '🟡',
      },
      {
        name: 'Kurang Disiplin (< 60)',
        shortName: 'Kurang Disiplin',
        value: kurangList.length,
        percentage: Math.round((kurangList.length / total) * 100),
        color: '#f43f5e',
        glowColor: 'rgba(244, 63, 94, 0.4)',
        waspangs: kurangList,
        icon: '🔴',
      },
    ];

    return list.filter((item) => item.value > 0);
  }, [tableData]);

  // 2. DATA FOR PIE CHART: Area Contribution / Activity Distribution
  const pieAreaData: PieSliceData[] = React.useMemo(() => {
    const areaMap: Record<
      string,
      {
        reports: number;
        waspangs: Set<string>;
        items: TableDataItem[];
      }
    > = {};

    tableData.forEach((w) => {
      if (!areaMap[w.area]) {
        areaMap[w.area] = { reports: 0, waspangs: new Set(), items: [] };
      }
      areaMap[w.area].reports += w.reports;
      areaMap[w.area].waspangs.add(w.rawName);
      areaMap[w.area].items.push(w);
    });

    const totalReports = tableData.reduce((acc, curr) => acc + curr.reports, 0) || 1;

    return Object.entries(areaMap).map(([areaName, info]) => {
      const color = AREA_COLORS[areaName] || AREA_COLORS['Default'];
      const percentage = Math.round((info.reports / totalReports) * 100);
      const avgAreaScore =
        info.items.length > 0
          ? Math.round(info.items.reduce((acc, curr) => acc + curr.score, 0) / info.items.length)
          : 0;

      return {
        name: areaName,
        value: info.reports,
        waspangCount: info.waspangs?.size || 0,
        percentage,
        avgScore: avgAreaScore,
        color,
        waspangs: info.items,
      };
    });
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

      if (!blob) throw new Error('Gagal membuat gambar diagram');

      if (navigator.clipboard && typeof window.ClipboardItem !== 'undefined') {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopiedSuccess(true);
          setTimeout(() => setCopiedSuccess(false), 3000);
          showToast('✅ Gambar Diagram KPI berhasil disalin! Silakan buka WhatsApp lalu Paste (Tempel) di chat.');
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
      link.download = `DIAGRAM_KPI_WASPANG_${recapData.periodLabel.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      showToast('✅ Gambar Diagram diunduh! Silakan lampirkan file gambar ini ke WhatsApp.');
    } catch (err) {
      console.error('Gagal menangkap gambar diagram:', err);
      showToast('⚠️ Gagal menyalin gambar diagram. Silakan coba kembali.');
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
      link.download = `DIAGRAM_KPI_WASPANG_${recapData.periodLabel.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      showToast('✅ File gambar PNG diagram berhasil diunduh!');
    } catch (err) {
      console.error('Download chart image failed:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Pre-calculate angle slices for Donut Chart
  const totalDonutValue = donutComplianceData.reduce((acc, curr) => acc + curr.value, 0) || 1;
  let accumulatedDonutAngle = 0;
  const donutSlicesWithAngles = donutComplianceData.map((item) => {
    const angleSpan = (item.value / totalDonutValue) * 360;
    const startAngle = accumulatedDonutAngle;
    const endAngle = accumulatedDonutAngle + angleSpan;
    accumulatedDonutAngle += angleSpan;
    return {
      ...item,
      startAngle,
      endAngle,
      midAngle: startAngle + angleSpan / 2,
    };
  });

  // Pre-calculate angle slices for Pie Chart
  const totalPieValue = pieAreaData.reduce((acc, curr) => acc + curr.value, 0) || 1;
  let accumulatedPieAngle = 0;
  const pieSlicesWithAngles = pieAreaData.map((item) => {
    const angleSpan = (item.value / totalPieValue) * 360;
    const startAngle = accumulatedPieAngle;
    const endAngle = accumulatedPieAngle + angleSpan;
    accumulatedPieAngle += angleSpan;
    return {
      ...item,
      startAngle,
      endAngle,
      midAngle: startAngle + angleSpan / 2,
    };
  });

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

      {/* Main Solid Container for Capture & Visual Display */}
      <div
        ref={chartContainerRef}
        className="bg-[#070f1e] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-cyan-950/20 text-white space-y-4"
        style={{ backgroundColor: '#070f1e' }}
      >
        {/* Top Header of Diagram */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/90">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-cyber font-bold text-white tracking-wide uppercase">
                DIAGRAM KPI KEAKTIFAN &amp; KEPATUHAN LAPOR WASPANG
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-[10px] text-cyan-300 font-mono-cyber">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Pie &amp; Donut View
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono-cyber">
              Target Periode: <span className="text-cyan-300 font-bold">{daysInPeriod} Hari</span> ({periodLabel}) • Skor Rata-rata:{' '}
              <span
                className={`font-bold ${
                  avgScore >= 80
                    ? 'text-emerald-300'
                    : avgScore >= 60
                    ? 'text-amber-300'
                    : 'text-rose-400'
                }`}
              >
                {avgScore} / 100 Poin
              </span>
              <span className="hidden sm:inline text-cyan-400/90 ml-2 font-medium">
                • 💡 Arahkan kursor / sentuh irisan diagram untuk rincian personil
              </span>
            </p>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0 self-start md:self-auto">
            {/* Download PNG */}
            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={isCapturing || tableData.length === 0}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono-cyber border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              title="Unduh file gambar PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh PNG</span>
            </button>

            {/* Copy Table/Chart for WhatsApp */}
            <button
              type="button"
              onClick={handleCopyTableForWhatsApp}
              disabled={isCapturing || tableData.length === 0}
              className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs font-mono-cyber transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
              title="Salin gambar ke clipboard untuk di-paste langsung ke chat WhatsApp"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-slate-950" />
                  <span>📸 Salin Gambar WA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick KPI Overview Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-xl bg-[#050b14] border border-slate-800/80 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-mono-cyber block uppercase truncate">Total Waspang</span>
              <strong className="text-sm sm:text-base font-cyber text-white">{tableData.length} Orang</strong>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#050b14] border border-emerald-500/30 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-emerald-400 font-mono-cyber block uppercase truncate">Disiplin Baik (≥80)</span>
              <strong className="text-sm sm:text-base font-cyber text-emerald-300">
                {tableData.filter((w) => w.score >= 80).length} Waspang
              </strong>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#050b14] border border-amber-500/30 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-amber-400 font-mono-cyber block uppercase truncate">Cukup (60-79)</span>
              <strong className="text-sm sm:text-base font-cyber text-amber-300">
                {tableData.filter((w) => w.score >= 60 && w.score < 80).length} Waspang
              </strong>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#050b14] border border-rose-500/30 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-rose-400 font-mono-cyber block uppercase truncate">Kurang (&lt;60)</span>
              <strong className="text-sm sm:text-base font-cyber text-rose-300">
                {tableData.filter((w) => w.score < 60).length} Waspang
              </strong>
            </div>
          </div>
        </div>

        {/* SECTION: PURE SVG PIE & DONUT DIAGRAMS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
          {/* 1. DONUT CHART: KPI KEPATUHAN & KEDISIPLINAN WASPANG */}
          <div className="bg-[#050c18] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-xs sm:text-sm font-cyber font-bold text-white uppercase tracking-wider">
                  DONUT CHART: KEPATUHAN LAPOR WASPANG
                </h4>
              </div>
              <span className="text-[10px] font-mono-cyber text-slate-400">
                Target: {daysInPeriod} Hari
              </span>
            </div>

            {/* Custom SVG Donut Diagram with Center Metric */}
            <div className="relative h-64 w-full flex items-center justify-center">
              {donutComplianceData.length === 0 ? (
                <div className="text-slate-500 text-xs font-mono-cyber">Tidak ada data untuk grafik</div>
              ) : (
                <>
                  <svg
                    viewBox="0 0 240 240"
                    className="w-full h-full max-h-60 overflow-visible select-none"
                  >
                    <defs>
                      <filter id="donut-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Donut Slices */}
                    {donutSlicesWithAngles.map((slice, index) => {
                      const isHovered = hoveredDonutIndex === index;
                      const outerRadius = isHovered ? 98 : 92;
                      const innerRadius = 62;
                      const pathD = describeDonutSlice(120, 120, innerRadius, outerRadius, slice.startAngle, slice.endAngle);

                      return (
                        <path
                          key={`donut-slice-${slice.name}`}
                          d={pathD}
                          fill={slice.color}
                          stroke="#070f1e"
                          strokeWidth={2.5}
                          className="transition-all duration-200 cursor-pointer"
                          style={{
                            filter: isHovered ? 'url(#donut-glow)' : 'none',
                            opacity: hoveredDonutIndex === null || isHovered ? 1 : 0.6,
                          }}
                          onMouseEnter={() => setHoveredDonutIndex(index)}
                          onMouseLeave={() => setHoveredDonutIndex(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Donut Center Overlay Badge */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-mono-cyber uppercase tracking-wider text-slate-400">
                      Rata-rata KPI
                    </span>
                    <span
                      className={`text-2xl sm:text-3xl font-cyber font-bold ${
                        avgScore >= 80
                          ? 'text-emerald-400'
                          : avgScore >= 60
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {avgScore}
                    </span>
                    <span className="text-[9px] font-mono-cyber text-slate-500">Poin / 100</span>
                  </div>

                  {/* Interactive Floating Tooltip for Donut */}
                  {hoveredDonutIndex !== null && donutSlicesWithAngles[hoveredDonutIndex] && (
                    <div
                      className="absolute z-20 pointer-events-auto bg-[#040914] border border-slate-700 p-3 rounded-xl shadow-2xl text-xs font-mono-cyber max-w-[260px] animate-fadeIn"
                      style={{
                        top: '10px',
                        right: '10px',
                      }}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-white border-b border-slate-800 pb-1.5 mb-1.5">
                        <span>{donutSlicesWithAngles[hoveredDonutIndex].icon}</span>
                        <span style={{ color: donutSlicesWithAngles[hoveredDonutIndex].color }}>
                          {donutSlicesWithAngles[hoveredDonutIndex].name}
                        </span>
                      </div>
                      <div className="space-y-1 text-slate-300 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Jumlah Personil:</span>
                          <strong className="text-white">
                            {donutSlicesWithAngles[hoveredDonutIndex].value} Waspang
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Proporsi Tim:</span>
                          <strong style={{ color: donutSlicesWithAngles[hoveredDonutIndex].color }}>
                            {donutSlicesWithAngles[hoveredDonutIndex].percentage}%
                          </strong>
                        </div>
                      </div>
                      {donutSlicesWithAngles[hoveredDonutIndex].waspangs.length > 0 && (
                        <div className="mt-2 pt-1.5 border-t border-slate-800/80">
                          <span className="text-[10px] text-slate-400 block mb-1">Daftar Personil:</span>
                          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                            {donutSlicesWithAngles[hoveredDonutIndex].waspangs.map((item) => (
                              <span
                                key={item.rawName}
                                onClick={() => onSelectWaspang?.(item.rawName, item.area)}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-cyan-900/60 hover:text-cyan-200 cursor-pointer text-slate-300 transition-colors"
                                title="Klik untuk lihat rincian waspang"
                              >
                                {item.rawName} ({item.score})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Donut Legend Cards */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
              {donutComplianceData.map((item, index) => (
                <div
                  key={item.name}
                  onMouseEnter={() => setHoveredDonutIndex(index)}
                  onMouseLeave={() => setHoveredDonutIndex(null)}
                  className={`p-2 rounded-xl bg-[#040914] border transition-all cursor-pointer flex flex-col justify-between ${
                    hoveredDonutIndex === index ? 'border-cyan-500/60 bg-cyan-950/20' : 'border-slate-800/90'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[10px] font-mono-cyber text-slate-300 font-semibold truncate">
                      {item.shortName}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs font-mono-cyber">
                    <strong className="text-white font-cyber text-sm">{item.value}</strong>
                    <span className="text-[10px] font-bold" style={{ color: item.color }}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. PIE CHART: SEBARAN KEAKTIFAN LAPORAN & PERSONIL PER AREA */}
          <div className="bg-[#050c18] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h4 className="text-xs sm:text-sm font-cyber font-bold text-white uppercase tracking-wider">
                  PIE CHART: SEBARAN AKTIF PER AREA
                </h4>
              </div>
              <span className="text-[10px] font-mono-cyber text-slate-400">
                Total {tableData.reduce((acc, curr) => acc + curr.reports, 0)} Laporan
              </span>
            </div>

            {/* Custom SVG Pie Diagram */}
            <div className="relative h-64 w-full flex items-center justify-center">
              {pieAreaData.length === 0 ? (
                <div className="text-slate-500 text-xs font-mono-cyber">Tidak ada data untuk grafik</div>
              ) : (
                <>
                  <svg
                    viewBox="0 0 240 240"
                    className="w-full h-full max-h-60 overflow-visible select-none"
                  >
                    <defs>
                      <filter id="pie-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Pie Slices */}
                    {pieSlicesWithAngles.map((slice, index) => {
                      const isHovered = hoveredPieIndex === index;
                      const radius = isHovered ? 98 : 92;
                      const pathD = describePieSlice(120, 120, radius, slice.startAngle, slice.endAngle);

                      // Calculate label position
                      const labelPos = polarToCartesian(120, 120, 62, slice.midAngle);

                      return (
                        <g key={`pie-slice-${slice.name}`}>
                          <path
                            d={pathD}
                            fill={slice.color}
                            stroke="#070f1e"
                            strokeWidth={2.5}
                            className="transition-all duration-200 cursor-pointer"
                            style={{
                              filter: isHovered ? 'url(#pie-glow)' : 'none',
                              opacity: hoveredPieIndex === null || isHovered ? 1 : 0.65,
                            }}
                            onMouseEnter={() => setHoveredPieIndex(index)}
                            onMouseLeave={() => setHoveredPieIndex(null)}
                          />

                          {/* Percentage label on slice if slice is large enough */}
                          {slice.percentage >= 10 && (
                            <text
                              x={labelPos.x}
                              y={labelPos.y}
                              fill="#ffffff"
                              fontSize="11"
                              fontWeight="bold"
                              fontFamily="monospace"
                              textAnchor="middle"
                              dominantBaseline="central"
                              className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                            >
                              {slice.percentage}%
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Interactive Floating Tooltip for Pie */}
                  {hoveredPieIndex !== null && pieSlicesWithAngles[hoveredPieIndex] && (
                    <div
                      className="absolute z-20 pointer-events-auto bg-[#040914] border border-slate-700 p-3 rounded-xl shadow-2xl text-xs font-mono-cyber max-w-[260px] animate-fadeIn"
                      style={{
                        top: '10px',
                        right: '10px',
                      }}
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                        <span
                          className="font-bold text-white"
                          style={{ color: pieSlicesWithAngles[hoveredPieIndex].color }}
                        >
                          Wilayah: {pieSlicesWithAngles[hoveredPieIndex].name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {pieSlicesWithAngles[hoveredPieIndex].waspangCount} Personil
                        </span>
                      </div>
                      <div className="space-y-1 text-slate-300 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Laporan:</span>
                          <strong className="text-white">
                            {pieSlicesWithAngles[hoveredPieIndex].value} Lap
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Porsi Aktivitas:</span>
                          <strong style={{ color: pieSlicesWithAngles[hoveredPieIndex].color }}>
                            {pieSlicesWithAngles[hoveredPieIndex].percentage}%
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rerata Skor KPI:</span>
                          <strong className="text-cyan-300">
                            {pieSlicesWithAngles[hoveredPieIndex].avgScore} / 100
                          </strong>
                        </div>
                      </div>
                      {pieSlicesWithAngles[hoveredPieIndex].waspangs.length > 0 && (
                        <div className="mt-2 pt-1.5 border-t border-slate-800/80">
                          <span className="text-[10px] text-slate-400 block mb-1">Personil Bertugas:</span>
                          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                            {pieSlicesWithAngles[hoveredPieIndex].waspangs.map((item) => (
                              <span
                                key={item.rawName}
                                onClick={() => onSelectWaspang?.(item.rawName, item.area)}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-cyan-900/60 hover:text-cyan-200 cursor-pointer text-slate-300 transition-colors"
                                title="Klik untuk lihat rincian waspang"
                              >
                                {item.rawName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Area Legend Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
              {pieAreaData.map((item, index) => (
                <div
                  key={item.name}
                  onMouseEnter={() => setHoveredPieIndex(index)}
                  onMouseLeave={() => setHoveredPieIndex(null)}
                  className={`p-2 rounded-xl bg-[#040914] border transition-all cursor-pointer flex flex-col justify-between ${
                    hoveredPieIndex === index ? 'border-cyan-500/60 bg-cyan-950/20' : 'border-slate-800/90'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[10px] font-mono-cyber text-slate-300 font-semibold truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs font-mono-cyber">
                    <span className="text-white font-cyber text-xs">
                      {item.value} <span className="text-[9px] text-slate-400 font-normal">Lap</span>
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: item.color }}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diagram Footer / Watermark for captured PNG */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono-cyber text-slate-400 gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-bold">GovMonitor Admin System • PT Link Net &amp; PMO MS CKT</span>
            <span>| {tableData.length} Personil Waspang</span>
          </div>
          <div className="text-slate-400">
            Formula KPI: (Hari Lapor / {daysInPeriod} Hari Target) × 100 Poin
          </div>
        </div>
      </div>
    </div>
  );
};

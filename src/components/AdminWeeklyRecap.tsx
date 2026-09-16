import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Share2, 
  Copy, 
  Check, 
  AlertTriangle, 
  TrendingUp, 
  User, 
  MapPin, 
  Layers, 
  Cable, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Eye, 
  Search, 
  X,
  Send,
  Sparkles,
  Phone,
  ShieldCheck,
  BarChart3,
  MessageSquare,
  CheckCheck,
  Smartphone
} from 'lucide-react';
import { DailyReportFormData, CurrentUser } from '../types';
import { 
  WeeklyRecapData, 
  AreaWeeklyStats, 
  WaspangWeeklyStats, 
  generateWeeklyAdminWhatsAppText, 
  shareWeeklyRecapToWhatsApp,
  buildCategorySummary,
  extractKendalaList,
  isPengamananReport
} from '../utils/whatsapp';
import { WaspangPerformanceChart } from './WaspangPerformanceChart';
import { KpiDetailModal, WaspangDetailModal, KpiDetailType } from './AdminRecapModals';

interface AdminWeeklyRecapProps {
  savedReports: DailyReportFormData[];
  currentUser: CurrentUser;
  onSelectReport?: (report: DailyReportFormData) => void;
  onBackToForm?: () => void;
}

type PeriodPreset = '7days' | 'thisWeek' | '14days' | '30days' | 'all' | 'custom';

// Format helper to YYYY-MM-DD
const formatDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const AdminWeeklyRecap: React.FC<AdminWeeklyRecapProps> = ({
  savedReports,
  currentUser,
  onSelectReport,
  onBackToForm,
}) => {
  // Hanya user admin@gov.com yang berhak melihat Admin Rekap
  const isSuperAdmin = currentUser.email?.trim().toLowerCase() === 'admin@gov.com';
  if (!isSuperAdmin) {
    return null;
  }

  // Preset filter state
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('7days');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<'All' | 'Jabo 1' | 'Jabo 2' | 'Jabo 3'>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'All' | 'Relokasi Goverment' | 'Pengamanan'>('All');
  const [expandedWaspang, setExpandedWaspang] = useState<Record<string, boolean>>({});
  const [copiedWA, setCopiedWA] = useState(false);
  const [targetPhoneWA, setTargetPhoneWA] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewMode, setPreviewMode] = useState<'chat' | 'raw'>('chat');

  // Interactive Detailed Modals state
  const [activeKpiModal, setActiveKpiModal] = useState<KpiDetailType | null>(null);
  const [selectedWaspangModal, setSelectedWaspangModal] = useState<{ waspangName: string; areaName: string } | null>(null);

  // Custom date range state (defaults to 7 days before today)
  const today = useMemo(() => new Date(), []);
  const defaultStartDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return formatDateString(d);
  }, []);
  const [customStart, setCustomStart] = useState<string>(defaultStartDate);
  const [customEnd, setCustomEnd] = useState<string>(formatDateString(today));

  // Compute active date bounds
  const { startDateStr, endDateStr, periodLabel } = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();
    let label = '7 Hari Terakhir';

    if (periodPreset === '7days') {
      start.setDate(now.getDate() - 6);
      end = now;
      label = '7 Hari Terakhir';
    } else if (periodPreset === 'thisWeek') {
      // Senin sampai hari ini/Minggu
      const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
      const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      start.setDate(now.getDate() - distanceToMonday);
      end = now;
      label = 'Minggu Ini (Senin - Sekarang)';
    } else if (periodPreset === '14days') {
      start.setDate(now.getDate() - 13);
      end = now;
      label = '14 Hari Terakhir';
    } else if (periodPreset === '30days') {
      start.setDate(now.getDate() - 29);
      end = now;
      label = '30 Hari Terakhir';
    } else if (periodPreset === 'all') {
      start = new Date('2020-01-01');
      end = new Date('2030-12-31');
      label = 'Semua Waktu';
    } else if (periodPreset === 'custom') {
      label = 'Rentang Kustom';
      return {
        startDateStr: customStart,
        endDateStr: customEnd,
        periodLabel: label,
      };
    }

    return {
      startDateStr: formatDateString(start),
      endDateStr: formatDateString(end),
      periodLabel: label,
    };
  }, [periodPreset, customStart, customEnd]);

  // Filter reports by active date range and selectedCategoryFilter
  const filteredReports = useMemo(() => {
    return savedReports.filter((rep) => {
      const rDate = rep.reportDate || (rep.submittedAt ? rep.submittedAt.slice(0, 10) : '');
      if (!rDate) return false;
      if (rDate < startDateStr || rDate > endDateStr) return false;

      if (selectedCategoryFilter !== 'All') {
        const isPeng = isPengamananReport(rep);
        if (selectedCategoryFilter === 'Pengamanan' && !isPeng) return false;
        if (selectedCategoryFilter === 'Relokasi Goverment' && isPeng) return false;
      }
      return true;
    });
  }, [savedReports, startDateStr, endDateStr, selectedCategoryFilter]);

  // Build Structured Weekly Recap Data (grouped by Area -> Waspang)
  const recapData: WeeklyRecapData = useMemo(() => {
    const definedAreas = ['Jabo 1', 'Jabo 2', 'Jabo 3'];
    const areaMap: Record<string, Record<string, {
      reports: DailyReportFormData[];
      dates: Set<string>;
      totalSipil: number;
      totalKabel: number;
      kendala: string[];
      projects: Set<string>;
    }>> = {
      'Jabo 1': {},
      'Jabo 2': {},
      'Jabo 3': {},
    };

    filteredReports.forEach((rep) => {
      let areaKey = rep.area?.trim() || '';
      if (!definedAreas.includes(areaKey)) {
        areaKey = 'Jabo 1'; // fallback default
      }

      // Identify waspang name
      const waspangKey = (rep.waspangName && rep.waspangName.trim()) || 
        (rep.authorEmail ? rep.authorEmail.split('@')[0] : 'Waspang Lapangan');

      if (!areaMap[areaKey]) {
        areaMap[areaKey] = {};
      }
      if (!areaMap[areaKey][waspangKey]) {
        areaMap[areaKey][waspangKey] = {
          reports: [],
          dates: new Set(),
          totalSipil: 0,
          totalKabel: 0,
          kendala: [],
          projects: new Set(),
        };
      }

      const wData = areaMap[areaKey][waspangKey];
      wData.reports.push(rep);
      if (rep.reportDate) wData.dates.add(rep.reportDate);
      if (rep.projectName) wData.projects.add(rep.projectName);

      // Sipil Progress: sum from totalProgressSipil or calculate from boring & pits
      const sipilVal = parseFloat(rep.totalProgressSipil) || 0;
      wData.totalSipil += sipilVal;

      // Kabel Progress: sum from totalProgressKabel + coax
      const kabelVal = (parseFloat(rep.totalProgressKabel) || 0) + (parseFloat(rep.totalProgressKabelCoax || rep.pulling?.pullingCoax || '0') || 0);
      wData.totalKabel += kabelVal;

      // Kendala: check if real issue reported
      const kendala = rep.kendalaLapangan?.trim();
      if (kendala && kendala.toLowerCase() !== 'tidak ada kendala' && kendala !== '-') {
        wData.kendala.push(`${rep.reportDate || 'Hari ini'}: ${kendala}`);
      }
    });

    let grandReports = 0;
    let grandSipil = 0;
    let grandKabel = 0;
    let grandKendala = 0;
    const allActiveWaspangs = new Set<string>();

    const areas: AreaWeeklyStats[] = definedAreas.map((areaName) => {
      const waspangsDict = areaMap[areaName] || {};
      const waspangsList: WaspangWeeklyStats[] = Object.entries(waspangsDict).map(([wName, wInfo]) => {
        allActiveWaspangs.add(wName);
        grandReports += wInfo.reports.length;
        grandSipil += wInfo.totalSipil;
        grandKabel += wInfo.totalKabel;
        grandKendala += wInfo.kendala.length;

        const sortedDates = Array.from(wInfo.dates as Set<string>).filter(Boolean).sort();
        const latestDailyDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : undefined;

        return {
          waspangName: wName,
          reportCount: wInfo.reports.length,
          totalDays: wInfo.dates.size || wInfo.reports.length,
          totalSipil: Math.round(wInfo.totalSipil * 10) / 10,
          totalKabel: Math.round(wInfo.totalKabel * 10) / 10,
          totalKendala: wInfo.kendala.length,
          kendalaSummaries: wInfo.kendala,
          projects: Array.from(wInfo.projects),
          reportDates: sortedDates,
          latestDailyDate,
        };
      });

      // Sort waspangs by total days / activity descending
      waspangsList.sort((a, b) => b.totalDays - a.totalDays || b.totalSipil - a.totalSipil);

      const areaReports = waspangsList.reduce((acc, w) => acc + w.reportCount, 0);
      const areaSipil = waspangsList.reduce((acc, w) => acc + w.totalSipil, 0);
      const areaKabel = waspangsList.reduce((acc, w) => acc + w.totalKabel, 0);
      const areaKendala = waspangsList.reduce((acc, w) => acc + w.totalKendala, 0);

      return {
        areaName,
        waspangs: waspangsList,
        totalReports: areaReports,
        totalSipil: Math.round(areaSipil * 10) / 10,
        totalKabel: Math.round(areaKabel * 10) / 10,
        totalKendala: areaKendala,
      };
    });

    // Compute category-separated data for Relokasi Government and Pengamanan
    const relokasiReports = filteredReports.filter((r) => !isPengamananReport(r));
    const pengamananReports = filteredReports.filter((r) => isPengamananReport(r));

    const relokasi = buildCategorySummary(relokasiReports, 'relokasi');
    const pengamanan = buildCategorySummary(pengamananReports, 'pengamanan');
    const allKendalaList = extractKendalaList(filteredReports);

    return {
      startDate: startDateStr,
      endDate: endDateStr,
      periodLabel,
      areas,
      grandTotal: {
        totalReports: grandReports,
        activeWaspangs: allActiveWaspangs.size,
        totalSipil: Math.round(grandSipil * 10) / 10,
        totalKabel: Math.round(grandKabel * 10) / 10,
        totalKendala: grandKendala,
      },
      relokasi,
      pengamanan,
      allKendalaList,
    };
  }, [filteredReports, startDateStr, endDateStr, periodLabel]);

  // Filtered areas according to user area chip and search query
  const displayedAreas = useMemo(() => {
    return recapData.areas
      .filter((area) => {
        if (selectedAreaFilter !== 'All' && area.areaName !== selectedAreaFilter) {
          return false;
        }
        return true;
      })
      .map((area) => {
        if (!searchQuery.trim()) return area;
        const q = searchQuery.toLowerCase();
        const filteredWaspangs = area.waspangs.filter(
          (w) =>
            w.waspangName.toLowerCase().includes(q) ||
            w.projects.some((p) => p.toLowerCase().includes(q))
        );
        return {
          ...area,
          waspangs: filteredWaspangs,
        };
      });
  }, [recapData, selectedAreaFilter, searchQuery]);

  // Toggle waspang card expansion
  const toggleWaspangExpand = (key: string) => {
    setExpandedWaspang((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle Copy WhatsApp text
  const handleCopyWAText = () => {
    const text = generateWeeklyAdminWhatsAppText(recapData);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedWA(true);
      setTimeout(() => setCopiedWA(false), 2500);
    });
  };

  // Handle Share to WhatsApp
  const handleShareWA = () => {
    shareWeeklyRecapToWhatsApp(recapData, targetPhoneWA);
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      
      {/* Top Banner: Admin Dashboard Welcome */}
      <div className="bg-gradient-to-r from-[#091730] via-[#0b1a38] to-[#091730] border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-xl shadow-cyan-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/40 text-amber-400 text-[10px] font-mono-cyber font-bold tracking-wider">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                ADMINISTRATOR ACCESS
              </span>
              <span className="text-xs font-mono-cyber text-slate-400">• PMO MS CKT</span>
            </div>
            <h2 className="text-base sm:text-xl font-bold font-cyber text-white tracking-wide flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Admin Dashboard: Rekap Mingguan
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Monitoring capaian kinerja lapangan per <span className="text-cyan-300 font-semibold">Area</span> &amp; per <span className="text-cyan-300 font-semibold">Waspang</span>, keaktifan lapor harian, progres sipil, kabel, serta rekapitulasi kendala lapangan.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onBackToForm && (
              <button
                type="button"
                onClick={onBackToForm}
                className="h-9 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-mono-cyber text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Input Harian</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Date Range & Filter Controls */}
      <div className="bg-[#091224] border border-cyan-500/30 rounded-2xl p-4 shadow-xl shadow-cyan-950/15 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-mono-cyber text-cyan-300">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold uppercase tracking-wider">Rentang Waktu Rekapitulasi:</span>
            <span className="text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/60">
              {startDateStr} s/d {endDateStr}
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setPeriodPreset('7days')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-cyber font-medium transition-all cursor-pointer whitespace-nowrap ${
                periodPreset === '7days'
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-[#050b14] border border-slate-700 text-slate-300 hover:text-cyan-300'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              type="button"
              onClick={() => setPeriodPreset('thisWeek')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-cyber font-medium transition-all cursor-pointer whitespace-nowrap ${
                periodPreset === 'thisWeek'
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-[#050b14] border border-slate-700 text-slate-300 hover:text-cyan-300'
              }`}
            >
              Minggu Ini
            </button>
            <button
              type="button"
              onClick={() => setPeriodPreset('14days')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-cyber font-medium transition-all cursor-pointer whitespace-nowrap ${
                periodPreset === '14days'
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-[#050b14] border border-slate-700 text-slate-300 hover:text-cyan-300'
              }`}
            >
              14 Hari
            </button>
            <button
              type="button"
              onClick={() => setPeriodPreset('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-cyber font-medium transition-all cursor-pointer whitespace-nowrap ${
                periodPreset === 'all'
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-[#050b14] border border-slate-700 text-slate-300 hover:text-cyan-300'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setPeriodPreset('custom')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-cyber font-medium transition-all cursor-pointer whitespace-nowrap ${
                periodPreset === 'custom'
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-[#050b14] border border-slate-700 text-slate-300 hover:text-cyan-300'
              }`}
            >
              Kustom
            </button>
          </div>
        </div>

        {/* Custom Date Pickers (if custom selected) */}
        {periodPreset === 'custom' && (
          <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-[#050b14] border border-slate-800 animate-fadeIn">
            <div className="w-full sm:w-auto flex items-center gap-2">
              <span className="text-xs font-mono-cyber text-slate-400">Dari:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono-cyber text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="w-full sm:w-auto flex items-center gap-2">
              <span className="text-xs font-mono-cyber text-slate-400">Sampai:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono-cyber text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        )}

        {/* Filter Area, Kategori & Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Category & Area Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-wrap">
            {/* Kategori Filter */}
            <div className="flex items-center bg-[#050b14] border border-slate-800 rounded-lg p-0.5 text-xs font-mono-cyber">
              {(['All', 'Relokasi Goverment', 'Pengamanan'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px] ${
                    selectedCategoryFilter === cat
                      ? 'bg-cyan-500 text-black font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'All' ? 'Semua Kategori' : cat === 'Relokasi Goverment' ? 'Relokasi Gov' : 'Pengamanan'}
                </button>
              ))}
            </div>

            {/* Area Chips */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono-cyber text-slate-400 mx-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Area:
              </span>
              {(['All', 'Jabo 1', 'Jabo 2', 'Jabo 3'] as const).map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setSelectedAreaFilter(area)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-cyber transition-all cursor-pointer ${
                    selectedAreaFilter === area
                      ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 font-semibold'
                      : 'bg-[#050b14] border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {area === 'All' ? 'Semua' : area}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari Waspang / Project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050b14] border border-slate-700 rounded-xl pl-8 pr-7 py-1.5 text-xs font-mono-cyber text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards: Grand Totals for Selected Period (Interactive: Klik untuk rincian) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
        {/* Total Laporan */}
        <div 
          onClick={() => setActiveKpiModal('reports')}
          className="bg-[#091224] border border-cyan-500/30 hover:border-cyan-400 rounded-2xl p-3 sm:p-3.5 shadow-lg shadow-cyan-950/15 flex flex-col justify-between relative overflow-hidden group transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.99]"
          title="Klik untuk melihat seluruh daftar laporan terperinci"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-teal-400" />
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] sm:text-xs font-mono-cyber uppercase font-bold tracking-wider group-hover:text-cyan-300 transition-colors">Total Laporan</span>
            <div className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-900 transition-colors">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono-cyber text-white my-0.5 group-hover:text-cyan-200 transition-colors">
            {recapData.grandTotal.totalReports}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono-cyber text-cyan-400/80 pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>{periodLabel}</span>
            </span>
            <span className="text-cyan-300 font-bold group-hover:underline">💡 Rincian ↗</span>
          </div>
        </div>

        {/* Waspang Aktif */}
        <div 
          onClick={() => setActiveKpiModal('waspangs')}
          className="bg-[#091224] border border-blue-500/30 hover:border-blue-400 rounded-2xl p-3 sm:p-3.5 shadow-lg shadow-blue-950/15 flex flex-col justify-between relative overflow-hidden group transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.99]"
          title="Klik untuk melihat performa & keaktifan personil waspang"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-400" />
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] sm:text-xs font-mono-cyber uppercase font-bold tracking-wider group-hover:text-blue-300 transition-colors">Waspang Aktif</span>
            <div className="w-6 h-6 rounded-lg bg-blue-950/80 border border-blue-500/30 flex items-center justify-center group-hover:bg-blue-900 transition-colors">
              <User className="w-3.5 h-3.5 text-blue-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono-cyber text-blue-300 my-0.5 group-hover:text-blue-200 transition-colors">
            {recapData.grandTotal.activeWaspangs}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono-cyber text-blue-400/80 pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Personil Lapangan</span>
            </span>
            <span className="text-blue-300 font-bold group-hover:underline">💡 Rincian ↗</span>
          </div>
        </div>

        {/* Total Progres Sipil */}
        <div 
          onClick={() => setActiveKpiModal('sipil')}
          className="bg-[#091224] border border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-3 sm:p-3.5 shadow-lg shadow-emerald-950/15 flex flex-col justify-between relative overflow-hidden group transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.99]"
          title="Klik untuk melihat rincian progres sipil (Boring, Galian, HDPE)"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] sm:text-xs font-mono-cyber uppercase font-bold tracking-wider group-hover:text-emerald-300 transition-colors">Progres Sipil</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-900 transition-colors">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono-cyber text-emerald-300 my-0.5 group-hover:text-emerald-200 transition-colors">
            {recapData.grandTotal.totalSipil.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-emerald-400 ml-1">m</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono-cyber text-emerald-400/80 pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Boring &amp; Akses</span>
            </span>
            <span className="text-emerald-300 font-bold group-hover:underline">💡 Rincian ↗</span>
          </div>
        </div>

        {/* Total Progres Kabel */}
        <div 
          onClick={() => setActiveKpiModal('kabel')}
          className="bg-[#091224] border border-amber-500/30 hover:border-amber-400 rounded-2xl p-3 sm:p-3.5 shadow-lg shadow-amber-950/15 flex flex-col justify-between relative overflow-hidden group transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.99]"
          title="Klik untuk melihat rincian progres penarikan kabel (FO & Coax)"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] sm:text-xs font-mono-cyber uppercase font-bold tracking-wider group-hover:text-amber-300 transition-colors">Progres Kabel</span>
            <div className="w-6 h-6 rounded-lg bg-amber-950/80 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-900 transition-colors">
              <Cable className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono-cyber text-amber-300 my-0.5 group-hover:text-amber-200 transition-colors">
            {recapData.grandTotal.totalKabel.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-amber-400 ml-1">m</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono-cyber text-amber-400/80 pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>FO &amp; Coaxial</span>
            </span>
            <span className="text-amber-300 font-bold group-hover:underline">💡 Rincian ↗</span>
          </div>
        </div>

        {/* Total Kendala Lapangan */}
        <div 
          onClick={() => setActiveKpiModal('kendala')}
          className="col-span-2 sm:col-span-1 bg-[#091224] border border-rose-500/30 hover:border-rose-400 rounded-2xl p-3 sm:p-3.5 shadow-lg shadow-rose-950/15 flex flex-col justify-between relative overflow-hidden group transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.99]"
          title="Klik untuk melihat seluruh kendala & isu lapangan terintegrasi"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-400" />
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] sm:text-xs font-mono-cyber uppercase font-bold tracking-wider group-hover:text-rose-300 transition-colors">Isu Lapangan</span>
            <div className="w-6 h-6 rounded-lg bg-rose-950/80 border border-rose-500/30 flex items-center justify-center group-hover:bg-rose-900 transition-colors">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono-cyber text-rose-300 my-0.5 group-hover:text-rose-200 transition-colors">
            {recapData.grandTotal.totalKendala}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono-cyber text-rose-400/80 pt-0.5">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${recapData.grandTotal.totalKendala > 0 ? 'bg-rose-400' : 'bg-emerald-400'}`} />
              <span>{recapData.grandTotal.totalKendala > 0 ? 'Perlu Perhatian' : 'Kondisi Aman'}</span>
            </span>
            <span className="text-rose-300 font-bold group-hover:underline">💡 Rincian ↗</span>
          </div>
        </div>
      </div>

      {/* VISUALISASI GRAFIK PERFORMA WASPANG (PIE & DONUT CHART) */}
      <WaspangPerformanceChart
        recapData={recapData}
        periodLabel={periodLabel}
        onSelectWaspang={(wName, aName) => {
          setSelectedWaspangModal({ waspangName: wName, areaName: aName });
        }}
      />

      {/* WHATSAPP EXPORT ACTION BAR (KHUSUS ADMIN) */}
      <div className="bg-gradient-to-r from-[#072418] via-[#0a3020] to-[#072418] border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-xl shadow-emerald-950/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm sm:text-base font-cyber font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-emerald-400" />
                Ekspor WhatsApp Khusus Admin
              </h3>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Kirimkan ringkasan performa seluruh Waspang &amp; Area periode ini langsung ke grup WhatsApp manajemen atau stakeholder.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="h-9 px-3 rounded-xl bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/40 text-xs font-mono-cyber text-emerald-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Lihat format pesan WhatsApp yang akan dikirim"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-300" />
              <span>Preview Teks</span>
            </button>

            <button
              type="button"
              onClick={handleCopyWAText}
              className="h-9 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono-cyber text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Salin teks ke clipboard"
            >
              {copiedWA ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareWA}
              className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono-cyber transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95"
              title="Buka WhatsApp dengan format rekap mingguan"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Share via WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Target Phone Toggle */}
        <div className="flex items-center justify-between text-xs font-mono-cyber">
          <button
            type="button"
            onClick={() => setShowPhoneInput(!showPhoneInput)}
            className="text-emerald-300 hover:text-emerald-100 flex items-center gap-1 underline decoration-dotted cursor-pointer"
          >
            <Phone className="w-3 h-3" />
            <span>{showPhoneInput ? 'Tutup nomor tujuan spesifik' : '+ Kirim ke nomor WhatsApp spesifik (Opsional)'}</span>
          </button>

          {showPhoneInput && (
            <div className="flex items-center gap-2 animate-fadeIn">
              <input
                type="text"
                placeholder="Contoh: 08123456789 atau 62812..."
                value={targetPhoneWA}
                onChange={(e) => setTargetPhoneWA(e.target.value)}
                className="bg-[#051a10] border border-emerald-500/40 rounded-lg px-2.5 py-1 text-xs font-mono-cyber text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-emerald-400 w-48"
              />
            </div>
          )}
        </div>

        {/* Category Breakdown Badges */}
        <div className="pt-2 border-t border-emerald-500/20 flex items-center gap-2 flex-wrap text-[11px] font-mono-cyber">
          <span className="text-emerald-300/70">Format Pesan WhatsApp (Otomatis Dikelompokkan):</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-500/30 text-blue-200">
            <span>🔵</span>
            <span>Relokasi Gov: <strong>{recapData.relokasi?.totalReports || 0} Lap</strong> ({recapData.relokasi?.totalSipil.toLocaleString('id-ID')}m sipil • {recapData.relokasi?.totalKabel.toLocaleString('id-ID')}m kabel)</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/30 text-amber-200">
            <span>🛡️</span>
            <span>Pengamanan: <strong>{recapData.pengamanan?.totalReports || 0} Lap</strong> ({recapData.pengamanan?.activeWaspangs || 0} personil • {recapData.pengamanan?.totalKendala || 0} isu)</span>
          </span>
          {recapData.allKendalaList && recapData.allKendalaList.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-500/30 text-rose-200">
              <span>⚠️</span>
              <span>{recapData.allKendalaList.length} Kendala Terintegrasi</span>
            </span>
          )}
        </div>
      </div>

      {/* REKAP DETAIL PER AREA & PER WASPANG */}
      <div className="space-y-4">
        {displayedAreas.map((area) => {
          const areaAccent = 
            area.areaName === 'Jabo 1' ? 'cyan' : 
            area.areaName === 'Jabo 2' ? 'blue' : 'amber';
          
          return (
            <div 
              key={area.areaName}
              className="bg-[#091224] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xl shadow-cyan-950/10 space-y-4 transition-all"
            >
              {/* Area Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono-cyber text-sm ${
                    areaAccent === 'cyan' ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300' :
                    areaAccent === 'blue' ? 'bg-blue-950/80 border border-blue-500/40 text-blue-300' :
                    'bg-amber-950/80 border border-amber-500/40 text-amber-300'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-cyber font-bold text-sm sm:text-base text-white uppercase tracking-wider flex items-center gap-2">
                      {area.areaName}
                      <span className="text-[10px] font-mono-cyber font-normal text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {area.waspangs.length} Waspang
                      </span>
                    </h3>
                    <p className="text-[11px] font-mono-cyber text-slate-400">
                      Total Laporan: <span className="text-slate-200 font-semibold">{area.totalReports} Lap</span> • Sipil: <span className="text-emerald-300 font-semibold">{area.totalSipil.toLocaleString('id-ID')} m</span> • Kabel: <span className="text-amber-300 font-semibold">{area.totalKabel.toLocaleString('id-ID')} m</span>
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {area.totalKendala > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono-cyber font-semibold text-rose-300 bg-rose-950/70 px-2.5 py-1 rounded-lg border border-rose-500/40">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      {area.totalKendala} Kendala
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono-cyber font-semibold text-emerald-300 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-500/40">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Operasional Lancar
                    </span>
                  )}
                </div>
              </div>

              {/* Waspang Cards Grid */}
              {area.waspangs.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#050b14]/70 border border-slate-800/80 text-center text-xs font-mono-cyber text-slate-500">
                  Tidak ada laporan untuk {area.areaName} pada periode {periodLabel}.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {area.waspangs.map((waspang) => {
                    const waspangKey = `${area.areaName}-${waspang.waspangName}`;
                    const isExpanded = !!expandedWaspang[waspangKey];

                    return (
                      <div
                        key={waspang.waspangName}
                        className="bg-[#050b14] border border-slate-800 hover:border-slate-700/80 rounded-xl p-3.5 transition-all space-y-3"
                      >
                        {/* Waspang Title & Quick Stats */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <div 
                              onClick={() => setSelectedWaspangModal({ waspangName: waspang.waspangName, areaName: area.areaName })}
                              className="w-9 h-9 rounded-xl bg-[#091224] border border-cyan-500/30 flex items-center justify-center text-slate-300 font-bold font-mono-cyber text-xs shrink-0 shadow-sm cursor-pointer hover:border-cyan-400 hover:bg-cyan-950/80 transition-colors"
                              title="Klik untuk melihat rincian kinerja lengkap"
                            >
                              <User className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span 
                                  onClick={() => setSelectedWaspangModal({ waspangName: waspang.waspangName, areaName: area.areaName })}
                                  className="font-cyber font-bold text-sm sm:text-base text-white tracking-wide truncate cursor-pointer hover:text-cyan-300 transition-colors flex items-center gap-1"
                                  title="Klik untuk melihat rincian terperinci"
                                >
                                  <span>{waspang.waspangName}</span>
                                  <span className="text-[10px] text-cyan-400 font-mono-cyber">↗</span>
                                </span>
                                <span className="text-[10px] font-mono-cyber px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-500/30">
                                  Waspang
                                </span>
                              </div>
                              <div className="text-xs font-mono-cyber text-slate-400 truncate mt-0.5" title={waspang.projects.join(', ')}>
                                <span className="text-slate-500">Project:</span> {waspang.projects.join(', ') || '-'}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono-cyber mt-1">
                                <div className="flex items-center gap-1 text-slate-400">
                                  <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
                                  <span>Update Daily:</span>
                                </div>
                                {waspang.reportDates && waspang.reportDates.length > 0 ? (
                                  <span className="text-emerald-300 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30 text-[10px]">
                                    {waspang.reportDates
                                      .map((d) => {
                                        const p = d.split('-');
                                        return p.length === 3 ? `${p[2]}/${p[1]}` : d;
                                      })
                                      .join(', ')}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 italic text-[10px]">Belum ada tanggal</span>
                                )}
                                {waspang.latestDailyDate && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300 border border-slate-700">
                                    Terakhir: {waspang.latestDailyDate}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 4 Performance Metric Chips & Action Buttons */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-1.5 sm:gap-2 text-xs font-mono-cyber shrink-0">
                            {/* a. Total Hari Lapor */}
                            <div className="px-2.5 py-1.5 rounded-lg bg-[#091224] border border-cyan-500/30 flex items-center justify-between lg:justify-start gap-1.5 min-w-[90px]" title="Total Hari Lapor / Keaktifan">
                              <span className="text-[10px] text-slate-400">Lapor:</span>
                              <span className="font-bold text-cyan-300">{waspang.totalDays} Hari</span>
                            </div>

                            {/* b. Total Progress Sipil */}
                            <div className="px-2.5 py-1.5 rounded-lg bg-[#091224] border border-emerald-500/30 flex items-center justify-between lg:justify-start gap-1.5 min-w-[95px]" title="Total Progres Sipil (Boring & Pits)">
                              <span className="text-[10px] text-slate-400">Sipil:</span>
                              <span className="font-bold text-emerald-300">{waspang.totalSipil.toLocaleString('id-ID')} m</span>
                            </div>

                            {/* c. Total Progress Kabel */}
                            <div className="px-2.5 py-1.5 rounded-lg bg-[#091224] border border-amber-500/30 flex items-center justify-between lg:justify-start gap-1.5 min-w-[95px]" title="Total Progres Kabel (Pulling FO & Coax)">
                              <span className="text-[10px] text-slate-400">Kabel:</span>
                              <span className="font-bold text-amber-300">{waspang.totalKabel.toLocaleString('id-ID')} m</span>
                            </div>

                            {/* d. Kendala */}
                            <div className={`px-2.5 py-1.5 rounded-lg border flex items-center justify-between lg:justify-start gap-1.5 min-w-[80px] ${
                              waspang.totalKendala > 0 
                                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300' 
                                : 'bg-[#091224] border-slate-700/60 text-slate-400'
                            }`} title="Jumlah Kendala/Isu Lapangan yang dilaporkan">
                              <span className="text-[10px]">Kendala:</span>
                              <span className="font-bold">{waspang.totalKendala}</span>
                            </div>

                            {/* Action: Rincian Modal Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedWaspangModal({ waspangName: waspang.waspangName, areaName: area.areaName })}
                              className="col-span-1 h-8 px-2.5 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-xs font-mono-cyber font-medium"
                              title="Buka Rincian Kinerja Terperinci Waspang ini"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Rincian</span>
                            </button>

                            {/* Toggle Expand Button */}
                            <button
                              type="button"
                              onClick={() => toggleWaspangExpand(waspangKey)}
                              className="col-span-1 h-8 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                              title="Buka / Tutup Ringkasan di Halaman"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Section: Detail Kendala & Laporan Waspang */}
                        {isExpanded && (
                          <div className="pt-2.5 border-t border-slate-800/80 space-y-2.5 animate-fadeIn">
                            {/* Rincian Kendala */}
                            <div>
                              <span className="text-[11px] font-mono-cyber text-slate-400 flex items-center gap-1 mb-1">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                Catatan Kendala Lapangan:
                              </span>
                              {waspang.kendalaSummaries.length === 0 ? (
                                <p className="text-xs text-slate-400 italic bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                  Tidak ada isu atau kendala teknis dilaporkan pada periode ini.
                                </p>
                              ) : (
                                <div className="space-y-1">
                                  {waspang.kendalaSummaries.map((k, idx) => (
                                    <div 
                                      key={idx} 
                                      className="text-xs text-rose-200 bg-rose-950/30 border border-rose-500/30 p-2 rounded-lg flex items-start gap-2"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                      <span>{k}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Daftar Laporan Tersimpan dari Waspang Ini */}
                            <div>
                              <span className="text-[11px] font-mono-cyber text-slate-400 flex items-center gap-1 mb-1.5">
                                <FileText className="w-3 h-3 text-cyan-400" />
                                Daftar Laporan Harian Terkirim ({waspang.reportCount} Laporan):
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {filteredReports
                                  .filter((r) => {
                                    const wName = (r.waspangName && r.waspangName.trim()) || 
                                      (r.authorEmail ? r.authorEmail.split('@')[0] : 'Waspang Lapangan');
                                    return (r.area || 'Jabo 1') === area.areaName && wName === waspang.waspangName;
                                  })
                                  .map((rep, rIdx) => (
                                    <button
                                      key={rep.id || rIdx}
                                      type="button"
                                      onClick={() => onSelectReport && onSelectReport(rep)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950 hover:border-cyan-500/40 border border-slate-800 text-[11px] font-mono-cyber text-slate-300 hover:text-cyan-200 transition-all cursor-pointer"
                                      title="Klik untuk membuka detail laporan harian ini"
                                    >
                                      <Calendar className="w-3 h-3 text-cyan-400" />
                                      <span>{rep.reportDate || 'Hari ini'}</span>
                                      {rep.dayNumber && <span className="text-cyan-400 font-semibold">[H-{rep.dayNumber}]</span>}
                                      <Eye className="w-2.5 h-2.5 text-slate-500 ml-0.5" />
                                    </button>
                                  ))}
                              </div>
                            </div>

                            {/* Quick Action: Buka Rincian Modal */}
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => setSelectedWaspangModal({ waspangName: waspang.waspangName, areaName: area.areaName })}
                                className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono-cyber flex items-center gap-1.5 transition-all cursor-pointer font-medium"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Buka Rincian Fisik &amp; Analisis Kinerja Lengkap {waspang.waspangName} ↗</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PREVIEW WHATSAPP MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#091424] border border-emerald-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-emerald-950/60 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#072b20] via-[#093527] to-[#072b20] border-b border-emerald-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-sm">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-cyber font-bold text-white tracking-wide flex items-center gap-2">
                    Pratinjau Pesan WhatsApp Admin
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-400/40 text-[10px] text-emerald-300 font-mono-cyber">
                      PMO Rekap
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-200/70 font-mono-cyber">
                    Format rapi, berstruktur pohon (tree-view), dan mudah dibaca penerima
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mode Switcher */}
                <div className="flex items-center bg-[#051710] border border-emerald-500/30 rounded-lg p-0.5 text-xs font-mono-cyber">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('chat')}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      previewMode === 'chat'
                        ? 'bg-emerald-500 text-black font-bold shadow-xs'
                        : 'text-emerald-300/80 hover:text-emerald-100'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Chat UI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('raw')}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      previewMode === 'raw'
                        ? 'bg-emerald-500 text-black font-bold shadow-xs'
                        : 'text-emerald-300/80 hover:text-emerald-100'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Teks Mentah</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content / Preview Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#081018] relative">
              {previewMode === 'chat' ? (
                /* Authentic WhatsApp Chat Preview */
                <div className="max-w-xl mx-auto space-y-2 py-2">
                  <div className="text-center my-1">
                    <span className="px-2.5 py-1 rounded-full bg-[#111e29] border border-slate-800 text-[10px] font-mono-cyber text-slate-400 shadow-inner">
                      HARI INI • PESAN RESMI PMO
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div className="bg-[#005c4b] border border-emerald-500/30 rounded-2xl rounded-tr-sm p-4 sm:p-5 text-white shadow-xl shadow-black/40 space-y-1 relative font-mono text-[11px] sm:text-xs">
                    {/* Bubble Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-400/25">
                      <span className="text-emerald-300 font-bold font-cyber text-[11px] tracking-wide flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                        PMO MS CKT • GovMonitor System
                      </span>
                      <span className="text-[10px] text-emerald-200/80 font-mono-cyber">
                        Admin Export
                      </span>
                    </div>

                    {/* Rendered Text with Highlighted Elements */}
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-100 font-mono-cyber">
                      {generateWeeklyAdminWhatsAppText(recapData)
                        .split('\n')
                        .map((line, idx) => {
                          if (!line.trim()) {
                            return <div key={idx} className="h-2" />;
                          }

                          // Section Dividers
                          if (line.includes('━') || line.includes('═') || line.includes('─')) {
                            return (
                              <div key={idx} className="text-emerald-300/40 select-none py-0.5 text-[10px] overflow-hidden whitespace-nowrap">
                                {line}
                              </div>
                            );
                          }

                          // Box Headers
                          if (line.includes('┏') || line.includes('┗')) {
                            return (
                              <div key={idx} className="text-emerald-300 font-bold text-center py-0.5 text-xs">
                                {line}
                              </div>
                            );
                          }

                          // Category Header Highlights
                          if (line.includes('KATEGORI A: RELOKASI GOV')) {
                            return (
                              <div key={idx} className="my-1.5 py-1 px-2.5 rounded-lg bg-sky-950/80 border border-sky-400/40 text-sky-200 font-bold text-xs tracking-wide flex items-center gap-1.5">
                                <span>🔵</span>
                                <span>KATEGORI A: RELOKASI GOV</span>
                              </div>
                            );
                          }
                          if (line.includes('KATEGORI B: PENGAMANAN')) {
                            return (
                              <div key={idx} className="my-1.5 py-1 px-2.5 rounded-lg bg-amber-950/80 border border-amber-400/40 text-amber-200 font-bold text-xs tracking-wide flex items-center gap-1.5">
                                <span>🛡️</span>
                                <span>KATEGORI B: PENGAMANAN</span>
                              </div>
                            );
                          }
                          if (line.includes('REKAP KENDALA & ISU LAPANGAN')) {
                            return (
                              <div key={idx} className="my-1.5 py-1 px-2.5 rounded-lg bg-rose-950/80 border border-rose-400/40 text-rose-200 font-bold text-xs tracking-wide flex items-center gap-1.5">
                                <span>⚠️</span>
                                <span>REKAP KENDALA &amp; ISU LAPANGAN</span>
                              </div>
                            );
                          }

                          // Parse *bold* and _italic_
                          const parts = line.split(/(\*[^*]+\*|_[^_]+_)/g);
                          return (
                            <div key={idx} className="leading-relaxed">
                              {parts.map((part, pIdx) => {
                                if (part.startsWith('*') && part.endsWith('*')) {
                                  const content = part.slice(1, -1);
                                  return (
                                    <strong key={pIdx} className="font-bold text-white tracking-wide">
                                      {content}
                                    </strong>
                                  );
                                }
                                if (part.startsWith('_') && part.endsWith('_')) {
                                  const content = part.slice(1, -1);
                                  return (
                                    <em key={pIdx} className="italic text-emerald-200/90 font-mono">
                                      {content}
                                    </em>
                                  );
                                }
                                return <span key={pIdx} className="text-slate-100">{part}</span>;
                              })}
                            </div>
                          );
                        })}
                    </div>

                    {/* Bubble Timestamp & Double Checkmarks */}
                    <div className="flex items-center justify-end gap-1 pt-3 text-[10px] text-emerald-200/80 font-mono-cyber">
                      <span>Baru saja</span>
                      <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Raw Monospace Code Box */
                <div className="font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed bg-[#050b14] p-4 rounded-xl border border-slate-800">
                  {generateWeeklyAdminWhatsAppText(recapData)}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#07131e] border-t border-slate-800 gap-3">
              <button
                type="button"
                onClick={handleCopyWAText}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono-cyber text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-700 active:scale-95"
              >
                {copiedWA ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-300" />
                    <span>Salin Format Teks</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-mono-cyber text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    handleShareWA();
                    setShowPreviewModal(false);
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono-cyber transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Sekarang ke WhatsApp</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL INTERAKTIF: RINCIAN KPI TERPERINCI (Klik Kartu KPI) */}
      {activeKpiModal && (
        <KpiDetailModal
          type={activeKpiModal}
          recapData={recapData}
          filteredReports={filteredReports}
          periodLabel={periodLabel}
          onClose={() => setActiveKpiModal(null)}
          onSelectReport={(rep) => {
            setActiveKpiModal(null);
            if (onSelectReport) onSelectReport(rep);
          }}
          onSelectWaspang={(wName, aName) => {
            setActiveKpiModal(null);
            setSelectedWaspangModal({ waspangName: wName, areaName: aName });
          }}
        />
      )}

      {/* MODAL INTERAKTIF: RINCIAN KINERJA & PROGRES FISIK WASPANG TERPERINCI (Klik Baris / Nama Waspang) */}
      {selectedWaspangModal && (
        <WaspangDetailModal
          waspangName={selectedWaspangModal.waspangName}
          areaName={selectedWaspangModal.areaName}
          recapData={recapData}
          periodLabel={periodLabel}
          allReports={filteredReports}
          onClose={() => setSelectedWaspangModal(null)}
          onSelectReport={(rep) => {
            if (onSelectReport) onSelectReport(rep);
          }}
        />
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  Clock,
  CloudSun, 
  Layers, 
  Cable, 
  Boxes, 
  Zap, 
  Trash2, 
  AlertCircle, 
  Calculator,
  ChevronDown,
  ChevronUp,
  Send,
  Sparkles,
  Info,
  FolderPlus,
  Edit3,
  Check,
  UserCheck
} from 'lucide-react';
import { DailyReportFormData, ProjectItem } from '../types';
import { WEATHER_OPTIONS } from '../data';
import { AccordionSection } from './AccordionSection';

interface DailyReportFormProps {
  formData: DailyReportFormData;
  onChange: (data: DailyReportFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  projects: ProjectItem[];
  onOpenProjectManagement: () => void;
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

export const DailyReportForm: React.FC<DailyReportFormProps> = ({
  formData,
  onChange,
  onSubmit,
  projects,
  onOpenProjectManagement,
  isEditing,
  onCancelEdit,
}) => {
  // Accordion toggle states
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    boring: true,
    pulling: true,
    pits: true,
    tiangHdpe: false,
    dismantling: false,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllAccordions = (open: boolean) => {
    setOpenAccordions({
      boring: open,
      pulling: open,
      pits: open,
      tiangHdpe: open,
      dismantling: open,
    });
  };

  // Helper to update top-level keys
  const handleTopLevelChange = (field: keyof DailyReportFormData, value: string) => {
    if (validationError) setValidationError(null);

    onChange({
      ...formData,
      [field]: value,
    });
  };

  // Helper to update nested object fields
  const handleNestedChange = <T extends keyof DailyReportFormData>(
    section: T,
    subField: keyof DailyReportFormData[T],
    value: string
  ) => {
    onChange({
      ...formData,
      [section]: {
        ...(formData[section] as Record<string, string>),
        [subField]: value,
      },
    });
  };

  // Subtotal calculations for HH, HB, MH, MB
  const totalHH = 
    (parseFloat(formData.instalasiHH.hh60x60) || 0) +
    (parseFloat(formData.instalasiHH.hh80x80) || 0) +
    (parseFloat(formData.instalasiHH.hh100x100) || 0) +
    (parseFloat(formData.instalasiHH.hh120x120) || 0);

  const totalHB = 
    (parseFloat(formData.instalasiHB.hb60x60) || 0) +
    (parseFloat(formData.instalasiHB.hb80x80) || 0) +
    (parseFloat(formData.instalasiHB.hb100x100) || 0) +
    (parseFloat(formData.instalasiHB.hb120x120) || 0);

  const totalMH = 
    (parseFloat(formData.instalasiMH.mh80x80) || 0) +
    (parseFloat(formData.instalasiMH.mh100x100) || 0) +
    (parseFloat(formData.instalasiMH.mh120x120) || 0);

  const totalMB = 
    (parseFloat(formData.instalasiMB.mb80x80) || 0) +
    (parseFloat(formData.instalasiMB.mb100x100) || 0) +
    (parseFloat(formData.instalasiMB.mb120x120) || 0);

  // Section summary metrics for badges
  const totalBoringMeters = 
    (parseFloat(formData.boring.boringAlur) || 0) +
    (parseFloat(formData.boring.boringCrossingJalan) || 0) +
    (parseFloat(formData.boring.boringCrossingJalanTol) || 0) +
    (parseFloat(formData.boring.boringCrossingJembatan) || 0);

  const totalPullingMeters = 
    (parseFloat(formData.pulling.pulling288) || 0) +
    (parseFloat(formData.pulling.pulling288GL) || 0) +
    (parseFloat(formData.pulling.pulling144) || 0) +
    (parseFloat(formData.pulling.pulling96) || 0) +
    (parseFloat(formData.pulling.pulling96GL) || 0) +
    (parseFloat(formData.pulling.pulling48) || 0) +
    (parseFloat(formData.pulling.pulling24) || 0);

  const totalPitsCombined = totalHH + totalHB + totalMH + totalMB;

  // Auto-sync helper: fills Total Progress Sipil with totalBoringMeters, and Total Progress Kabel with totalPullingMeters
  const handleAutoSyncTotals = () => {
    onChange({
      ...formData,
      totalProgressSipil: totalBoringMeters.toString(),
      totalProgressKabel: totalPullingMeters.toString(),
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName || !formData.projectName.trim()) {
      setValidationError('Silakan ketikkan Nama Project terlebih dahulu.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setValidationError(null);
    onSubmit(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="pb-28">
      {/* Editing Mode Banner */}
      {isEditing && (
        <div className="mb-4 p-3 rounded-xl bg-amber-950/80 border border-amber-500/70 text-amber-200 text-xs flex items-center justify-between gap-2 shadow-lg shadow-amber-950/40">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold uppercase font-cyber text-amber-300">Mode Edit Laporan:</span> Menyunting laporan untuk <strong>{formData.projectName}</strong> ({formData.reportDate})
            </div>
          </div>
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-mono-cyber cursor-pointer"
            >
              Batal
            </button>
          )}
        </div>
      )}

      {/* Validation banner */}
      {validationError && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/70 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DAILY PROGRESS */}
      {/* ========================================================================= */}
      <div className="bg-[#091224] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 mb-5 shadow-xl shadow-cyan-950/20 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <h2 className="font-cyber font-bold text-sm tracking-wide text-white uppercase">
              Daily Progress
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenProjectManagement}
            className="inline-flex items-center gap-1 text-[11px] font-mono-cyber px-2.5 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/80 transition-colors cursor-pointer"
            title="Buka master data project"
          >
            <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kelola Project ({projects.length})</span>
          </button>
        </div>

        {/* 1. Input Nama Project & Nama Waspang */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Input Nama Project Manual */}
          <div>
            <div className="flex items-center justify-between mb-1.5 h-5">
              <label 
                htmlFor="input-project-name" 
                className="flex items-center gap-1.5 text-xs font-mono-cyber text-cyan-300 uppercase tracking-wider font-semibold"
              >
                <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Nama Project <span className="text-amber-400">*</span></span>
              </label>
              <button
                type="button"
                onClick={onOpenProjectManagement}
                className="text-[11px] font-mono-cyber text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                + Tambah Master
              </button>
            </div>
            
            <div className="relative">
              <input
                id="input-project-name"
                type="text"
                required
                value={formData.projectName}
                onChange={(e) => handleTopLevelChange('projectName', e.target.value)}
                placeholder="Ketik nama project secara manual..."
                className="w-full h-10 bg-[#050b14] border border-cyan-500/40 focus:border-cyan-400 rounded-xl px-3.5 text-xs sm:text-sm text-slate-100 font-mono-cyber focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Input Nama Waspang */}
          <div>
            <div className="flex items-center justify-between mb-1.5 h-5">
              <label 
                htmlFor="input-waspang-name" 
                className="flex items-center gap-1.5 text-xs font-mono-cyber text-cyan-300 uppercase tracking-wider font-semibold"
              >
                <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Nama Waspang (Pengawas Lapangan)</span>
              </label>
            </div>
            
            <div className="relative">
              <input
                id="input-waspang-name"
                type="text"
                value={formData.waspangName || ''}
                onChange={(e) => handleTopLevelChange('waspangName', e.target.value)}
                placeholder="Nama waspang / pengawas lapangan..."
                className="w-full h-10 bg-[#050b14] border border-cyan-500/40 focus:border-cyan-400 rounded-xl px-3.5 text-xs sm:text-sm text-slate-100 font-mono-cyber focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Quick Picker from created projects if any */}
        {projects.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-0.5">
            <span className="text-slate-500 font-mono-cyber">Pilih cepat project:</span>
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onChange({
                    ...formData,
                    projectName: p.name,
                    projectId: p.id,
                    waspangName: p.pic || formData.waspangName || '',
                    startDate: p.startDate || formData.startDate,
                    endDate: p.endDate || formData.endDate,
                  });
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-cyber transition-all border cursor-pointer ${
                  formData.projectName === p.name
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                    : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:border-cyan-500/50 hover:text-white'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {/* 2. Input Daily Perhari: Tanggal Laporan, Hari Ke-, dan Kondisi Cuaca */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Tanggal Laporan */}
          <div className="flex flex-col">
            <label 
              htmlFor="input-report-date" 
              className="h-5 flex items-center gap-1.5 text-xs font-mono-cyber text-slate-300 uppercase tracking-wider mb-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Tanggal Laporan</span>
            </label>
            <div className="relative flex items-center">
              <input
                id="input-report-date"
                type="date"
                value={formData.reportDate}
                onChange={(e) => handleTopLevelChange('reportDate', e.target.value)}
                className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3 text-xs sm:text-sm text-slate-100 font-mono-cyber focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Input Hari ke- (Daily Progress Counter) */}
          <div className="flex flex-col">
            <label 
              htmlFor="input-day-number" 
              className="h-5 flex items-center gap-1.5 text-xs font-mono-cyber text-slate-300 uppercase tracking-wider mb-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Hari Ke- (Tracker)</span>
            </label>
            <div className="relative flex items-center">
              <input
                id="input-day-number"
                type="number"
                min="1"
                value={formData.dayNumber || '1'}
                onChange={(e) => handleTopLevelChange('dayNumber', e.target.value)}
                placeholder="1"
                className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-cyan-400 rounded-xl pl-3 pr-14 text-xs sm:text-sm text-slate-100 font-mono-cyber focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
              <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                Hari
              </span>
            </div>
          </div>

          {/* Kondisi Cuaca */}
          <div className="flex flex-col">
            <label 
              htmlFor="select-weather" 
              className="h-5 flex items-center gap-1.5 text-xs font-mono-cyber text-slate-300 uppercase tracking-wider mb-1.5"
            >
              <CloudSun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Kondisi Cuaca</span>
            </label>
            <div className="relative flex items-center">
              <select
                id="select-weather"
                value={formData.weatherCondition}
                onChange={(e) => handleTopLevelChange('weatherCondition', e.target.value)}
                className="w-full h-10 appearance-none bg-[#050b14] border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3 text-xs sm:text-sm text-slate-100 font-mono-cyber focus:outline-none focus:ring-1 focus:ring-cyan-400 pr-9 cursor-pointer transition-colors"
              >
                {WEATHER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 3. Tanggal Start Project & End Project */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-800/80">
          <div className="flex flex-col">
            <label 
              htmlFor="input-start-date" 
              className="h-5 flex items-center gap-1.5 text-xs font-mono-cyber text-slate-300 uppercase tracking-wider mb-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Tanggal Start Project</span>
            </label>
            <input
              id="input-start-date"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleTopLevelChange('startDate', e.target.value)}
              className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3 text-xs sm:text-sm text-slate-100 font-mono-cyber focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
            />
          </div>

          <div className="flex flex-col">
            <label 
              htmlFor="input-end-date" 
              className="h-5 flex items-center gap-1.5 text-xs font-mono-cyber text-slate-300 uppercase tracking-wider mb-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Tanggal End Project</span>
            </label>
            <input
              id="input-end-date"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleTopLevelChange('endDate', e.target.value)}
              className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3 text-xs sm:text-sm text-slate-100 font-mono-cyber focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
            />
          </div>
        </div>

        {/* 4. Total Progress Sipil & Total Progress Kabel */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-cyber uppercase tracking-wider text-slate-200 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ringkasan Capaian Harian (Key Totals)</span>
            </span>
            <button
              type="button"
              onClick={handleAutoSyncTotals}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono-cyber text-cyan-400 hover:text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/70 px-2.5 py-1 rounded-lg border border-cyan-500/40 transition-colors cursor-pointer font-medium"
              title="Salin total dari rincian accordion otomatis"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Hitung dari Rincian</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Total Progress Sipil Card */}
            <div className="p-3 rounded-xl bg-[#060c18] border border-cyan-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <label 
                  htmlFor="input-total-sipil" 
                  className="flex items-center gap-1.5 text-xs font-mono-cyber text-cyan-300 uppercase tracking-wider font-semibold"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                  <span>Total Progress Sipil</span>
                </label>
              </div>
              <div className="relative flex items-center h-10">
                <input
                  id="input-total-sipil"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.totalProgressSipil}
                  onChange={(e) => handleTopLevelChange('totalProgressSipil', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#091224] border border-cyan-500/40 focus:border-cyan-400 rounded-lg pl-3 pr-16 text-sm sm:text-base font-bold font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
                <span className="absolute right-2.5 px-2 py-0.5 text-[11px] font-mono-cyber font-semibold text-cyan-300 bg-cyan-950/90 border border-cyan-500/40 rounded pointer-events-none">
                  Meter
                </span>
              </div>
            </div>

            {/* Total Progress Kabel Card */}
            <div className="p-3 rounded-xl bg-[#060c18] border border-emerald-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <label 
                  htmlFor="input-total-kabel" 
                  className="flex items-center gap-1.5 text-xs font-mono-cyber text-emerald-300 uppercase tracking-wider font-semibold"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span>Total Progress Kabel</span>
                </label>
              </div>
              <div className="relative flex items-center h-10">
                <input
                  id="input-total-kabel"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.totalProgressKabel}
                  onChange={(e) => handleTopLevelChange('totalProgressKabel', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#091224] border border-emerald-500/40 focus:border-emerald-400 rounded-lg pl-3 pr-16 text-sm sm:text-base font-bold font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                />
                <span className="absolute right-2.5 px-2 py-0.5 text-[11px] font-mono-cyber font-semibold text-emerald-300 bg-emerald-950/90 border border-emerald-500/40 rounded pointer-events-none">
                  Meter
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RINCIAN PROGRES HARIAN LAPANGAN (ACCORDION) */}
      {/* ========================================================================= */}
      <div className="mb-5 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-bold font-cyber text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Rincian Progres Harian Lapangan</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Gunakan menu lipat (accordion) di bawah untuk mengisi rincian teknis
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleAllAccordions(true)}
              className="text-[10px] font-mono-cyber px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              Buka Semua
            </button>
            <button
              type="button"
              onClick={() => toggleAllAccordions(false)}
              className="text-[10px] font-mono-cyber px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* I. PEKERJAAN BORING (Meter) */}
        {/* ----------------------------------------------------------------------- */}
        <AccordionSection
          id="accordion-boring"
          title="I. Pekerjaan Boring (Meter)"
          subtitle="Boring Alur, Crossing Jalan, Tol, & Jembatan"
          badge={`${totalBoringMeters} m`}
          isOpen={openAccordions.boring}
          onToggle={() => toggleAccordion('boring')}
          accentColor="cyan"
          icon={<Layers className="w-4 h-4 text-cyan-400" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="flex flex-col">
              <label 
                htmlFor="input-boring-alur" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Boring Alur
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-boring-alur"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.boring.boringAlur}
                  onChange={(e) => handleNestedChange('boring', 'boringAlur', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-cyan-400 rounded-xl pl-3 pr-10 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  m
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label 
                htmlFor="input-boring-crossing-jalan" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Boring Crossing Jalan
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-boring-crossing-jalan"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.boring.boringCrossingJalan}
                  onChange={(e) => handleNestedChange('boring', 'boringCrossingJalan', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-cyan-400 rounded-xl pl-3 pr-10 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  m
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label 
                htmlFor="input-boring-crossing-tol" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Boring Crossing Jalan Tol
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-boring-crossing-tol"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.boring.boringCrossingJalanTol}
                  onChange={(e) => handleNestedChange('boring', 'boringCrossingJalanTol', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-cyan-400 rounded-xl pl-3 pr-10 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  m
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label 
                htmlFor="input-boring-crossing-jembatan" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Boring Crossing Jembatan
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-boring-crossing-jembatan"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.boring.boringCrossingJembatan}
                  onChange={(e) => handleNestedChange('boring', 'boringCrossingJembatan', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-cyan-400 rounded-xl pl-3 pr-10 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  m
                </span>
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* ----------------------------------------------------------------------- */}
        {/* II. PENARIKAN KABEL / PULLING (Meter) */}
        {/* ----------------------------------------------------------------------- */}
        <AccordionSection
          id="accordion-pulling"
          title="II. Penarikan Kabel / Pulling (Meter)"
          subtitle="Pulling Kabel 288, 288 GL, 144, 96, 96 GL, 48, 24"
          badge={`${totalPullingMeters} m`}
          isOpen={openAccordions.pulling}
          onToggle={() => toggleAccordion('pulling')}
          accentColor="emerald"
          icon={<Cable className="w-4 h-4 text-emerald-400" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="flex flex-col">
              <label 
                htmlFor="input-pulling-288" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Pulling Kabel 288
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-pulling-288"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.pulling.pulling288}
                  onChange={(e) => handleNestedChange('pulling', 'pulling288', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-emerald-400 rounded-xl pl-3 pr-10 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  m
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label 
                htmlFor="input-pulling-288gl" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Pulling Kabel 288 GL
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-pulling-288gl"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.pulling.pulling288GL}
                  onChange={(e) => handleNestedChange('pulling', 'pulling288GL', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-emerald-400 rounded-xl pl-3 pr-10 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  m
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label 
                htmlFor="input-pulling-144" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Pulling Kabel 144
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-pulling-144"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.pulling.pulling144}
                  onChange={(e) => handleNestedChange('pulling', 'pulling144', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-emerald-400 rounded-xl pl-3 pr-10 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  m
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label 
                htmlFor="input-pulling-96" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Pulling Kabel 96
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-pulling-96"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.pulling.pulling96}
                  onChange={(e) => handleNestedChange('pulling', 'pulling96', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-emerald-400 rounded-xl pl-3 pr-10 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  m
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label 
                htmlFor="input-pulling-96gl" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Pulling Kabel 96 GL
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-pulling-96gl"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.pulling.pulling96GL}
                  onChange={(e) => handleNestedChange('pulling', 'pulling96GL', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-emerald-400 rounded-xl pl-3 pr-10 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  m
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label 
                htmlFor="input-pulling-48" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Pulling Kabel 48
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-pulling-48"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.pulling.pulling48}
                  onChange={(e) => handleNestedChange('pulling', 'pulling48', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-emerald-400 rounded-xl pl-3 pr-10 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  m
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label 
                htmlFor="input-pulling-24" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Pulling Kabel 24
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-pulling-24"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.pulling.pulling24}
                  onChange={(e) => handleNestedChange('pulling', 'pulling24', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-emerald-400 rounded-xl pl-3 pr-10 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  m
                </span>
              </div>
            </div>

            {/* Symmetrical 8th slot balancing the 2-column grid */}
            <div className="flex flex-col">
              <div className="h-5 flex items-center text-xs font-mono-cyber text-emerald-400 mb-1.5 font-semibold">
                <span>Total Tarikan Kabel</span>
              </div>
              <div className="h-10 flex items-center justify-between px-3.5 bg-[#060c18] border border-emerald-500/40 rounded-xl">
                <span className="text-xs font-mono-cyber text-slate-400">Akumulasi:</span>
                <span className="text-xs sm:text-sm font-bold font-mono-cyber text-emerald-300">{totalPullingMeters} m</span>
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* ----------------------------------------------------------------------- */}
        {/* III. INSTALASI HH, HB, MH & MB (Pcs) */}
        {/* Dibagi menjadi 4 sub-kategori, masing-masing dengan "Total Pcs" */}
        {/* ----------------------------------------------------------------------- */}
        <AccordionSection
          id="accordion-pits"
          title="III. Instalasi HH, HB, MH & MB (Pcs)"
          subtitle="Handhole, Handbox, Manhole, Manbox"
          badge={`${totalPitsCombined} Pcs`}
          isOpen={openAccordions.pits}
          onToggle={() => toggleAccordion('pits')}
          accentColor="amber"
          icon={<Boxes className="w-4 h-4 text-amber-400" />}
        >
          <div className="space-y-3 pt-2">
            
            {/* Sub-kategori 1: Instalasi HH (Handhole 60x60 s/d 120x120) */}
            <div className="p-3 rounded-xl bg-[#060c18] border border-slate-800">
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-xs font-cyber font-bold text-white uppercase">
                    1) Instalasi HH (60x60 s/d 120x120)
                  </span>
                </div>
                {/* Tampilkan Total Pcs */}
                <div className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono-cyber text-xs font-bold">
                  Total: {totalHH} Pcs
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="flex flex-col">
                  <label htmlFor="input-hh-60" className="h-4 flex items-center text-[11px] font-mono-cyber text-slate-400 mb-1">
                    HH 60x60
                  </label>
                  <input
                    id="input-hh-60"
                    type="number"
                    min="0"
                    value={formData.instalasiHH.hh60x60}
                    onChange={(e) => handleNestedChange('instalasiHH', 'hh60x60', e.target.value)}
                    placeholder="0"
                    className="w-full h-9 bg-[#091224] border border-slate-700/80 focus:border-cyan-400 rounded-lg px-2.5 text-xs font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="input-hh-80" className="h-4 flex items-center text-[11px] font-mono-cyber text-slate-400 mb-1">
                    HH 80x80
                  </label>
                  <input
                    id="input-hh-80"
                    type="number"
                    min="0"
                    value={formData.instalasiHH.hh80x80}
                    onChange={(e) => handleNestedChange('instalasiHH', 'hh80x80', e.target.value)}
                    placeholder="0"
                    className="w-full h-9 bg-[#091224] border border-slate-700/80 focus:border-cyan-400 rounded-lg px-2.5 text-xs font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="input-hh-100" className="h-4 flex items-center text-[11px] font-mono-cyber text-slate-400 mb-1">
                    HH 100x100
                  </label>
                  <input
                    id="input-hh-100"
                    type="number"
                    min="0"
                    value={formData.instalasiHH.hh100x100}
                    onChange={(e) => handleNestedChange('instalasiHH', 'hh100x100', e.target.value)}
                    placeholder="0"
                    className="w-full h-9 bg-[#091224] border border-slate-700/80 focus:border-cyan-400 rounded-lg px-2.5 text-xs font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="input-hh-120" className="h-4 flex items-center text-[11px] font-mono-cyber text-slate-400 mb-1">
                    HH 120x120
                  </label>
                  <input
                    id="input-hh-120"
                    type="number"
                    min="0"
                    value={formData.instalasiHH.hh120x120}
                    onChange={(e) => handleNestedChange('instalasiHH', 'hh120x120', e.target.value)}
                    placeholder="0"
                    className="w-full h-9 bg-[#091224] border border-slate-700/80 focus:border-cyan-400 rounded-lg px-2.5 text-xs font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Sub-kategori 2: Instalasi HB (Handbox 60x60 s/d 120x120) */}
            <div className="p-3 rounded-xl bg-[#060c18] border border-slate-800">
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-cyber font-bold text-white uppercase">
                    2) Instalasi HB (60x60 s/d 120x120)
                  </span>
                </div>
                {/* Tampilkan Total Pcs */}
                <div className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono-cyber text-xs font-bold">
                  Total: {totalHB} Pcs
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="flex flex-col">
                  <label htmlFor="input-hb-60" className="h-4 flex items-center text-[11px] font-mono-cyber text-slate-400 mb-1">
                    HB 60x60
                  </label>
                  <input
                    id="input-hb-60"
                    type="number"
                    min="0"
                    value={formData.instalasiHB.hb60x60}
                    onChange={(e) => handleNestedChange('instalasiHB', 'hb60x60', e.target.value)}
                    placeholder="0"
                    className="w-full h-9 bg-[#091224] border border-slate-700/80 focus:border-emerald-400 rounded-lg px-2.5 text-xs font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="input-hb-80" className="h-4 flex items-center text-[11px] font-mono-cyber text-slate-400 mb-1">
                    HB 80x80
                  </label>
                  <input
                    id="input-hb-80"
                    type="number"
                    min="0"
                    value={formData.instalasiHB.hb80x80}
                    onChange={(e) => handleNestedChange('instalasiHB', 'hb80x80', e.target.value)}
                    placeholder="0"
                    className="w-full h-9 bg-[#091224] border border-slate-700/80 focus:border-emerald-400 rounded-lg px-2.5 text-xs font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="input-hb-100" className="h-4 flex items-center text-[11px] font-mono-cyber text-slate-400 mb-1">
                    HB 100x100
                  </label>
                  <input
                    id="input-hb-100"
                    type="number"
                    min="0"
                    value={formData.instalasiHB.hb100x100}
                    onChange={(e) => handleNestedChange('instalasiHB', 'hb100x100', e.target.value)}
                    placeholder="0"
                    className="w-full h-9 bg-[#091224] border border-slate-700/80 focus:border-emerald-400 rounded-lg px-2.5 text-xs font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="input-hb-120" className="h-4 flex items-center text-[11px] font-mono-cyber text-slate-400 mb-1">
                    HB 120x120
                  </label>
                  <input
                    id="input-hb-120"
                    type="number"
                    min="0"
                    value={formData.instalasiHB.hb120x120}
                    onChange={(e) => handleNestedChange('instalasiHB', 'hb120x120', e.target.value)}
                    placeholder="0"
                    className="w-full h-9 bg-[#091224] border border-slate-700/80 focus:border-emerald-400 rounded-lg px-2.5 text-xs font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Sub-kategori 3: Instalasi MH (Manhole 80x80 s/d 120x120) */}
            <div className="p-3 rounded-xl bg-[#060c18] border border-slate-800">
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-cyber font-bold text-white uppercase">
                    3) Instalasi MH (80x80 s/d 120x120)
                  </span>
                </div>
                {/* Tampilkan Total Pcs */}
                <div className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono-cyber text-xs font-bold">
                  Total: {totalMH} Pcs
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="flex flex-col">
                  <label htmlFor="input-mh-80" className="h-4 flex items-center text-[11px] font-mono-cyber text-slate-400 mb-1">
                    MH 80x80
                  </label>
                  <input
                    id="input-mh-80"
                    type="number"
                    min="0"
                    value={formData.instalasiMH.mh80x80}
                    onChange={(e) => handleNestedChange('instalasiMH', 'mh80x80', e.target.value)}
                    placeholder="0"
                    className="w-full h-9 bg-[#091224] border border-slate-700/80 focus:border-amber-400 rounded-lg px-2.5 text-xs font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="input-mh-100" className="h-4 flex items-center text-[11px] font-mono-cyber text-slate-400 mb-1">
                    MH 100x100
                  </label>
                  <input
                    id="input-mh-100"
                    type="number"
                    min="0"
                    value={formData.instalasiMH.mh100x100}
                    onChange={(e) => handleNestedChange('instalasiMH', 'mh100x100', e.target.value)}
                    placeholder="0"
                    className="w-full h-9 bg-[#091224] border border-slate-700/80 focus:border-amber-400 rounded-lg px-2.5 text-xs font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="input-mh-120" className="h-4 flex items-center text-[11px] font-mono-cyber text-slate-400 mb-1">
                    MH 120x120
                  </label>
                  <input
                    id="input-mh-120"
                    type="number"
                    min="0"
                    value={formData.instalasiMH.mh120x120}
                    onChange={(e) => handleNestedChange('instalasiMH', 'mh120x120', e.target.value)}
                    placeholder="0"
                    className="w-full h-9 bg-[#091224] border border-slate-700/80 focus:border-amber-400 rounded-lg px-2.5 text-xs font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Sub-kategori 4: Instalasi MB (Manbox 80x80 s/d 120x120) */}
            <div className="p-3 rounded-xl bg-[#060c18] border border-slate-800">
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-xs font-cyber font-bold text-white uppercase">
                    4) Instalasi MB (80x80 s/d 120x120)
                  </span>
                </div>
                {/* Tampilkan Total Pcs */}
                <div className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono-cyber text-xs font-bold">
                  Total: {totalMB} Pcs
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="flex flex-col">
                  <label htmlFor="input-mb-80" className="h-4 flex items-center text-[11px] font-mono-cyber text-slate-400 mb-1">
                    MB 80x80
                  </label>
                  <input
                    id="input-mb-80"
                    type="number"
                    min="0"
                    value={formData.instalasiMB.mb80x80}
                    onChange={(e) => handleNestedChange('instalasiMB', 'mb80x80', e.target.value)}
                    placeholder="0"
                    className="w-full h-9 bg-[#091224] border border-slate-700/80 focus:border-purple-400 rounded-lg px-2.5 text-xs font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-purple-400 transition-colors"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="input-mb-100" className="h-4 flex items-center text-[11px] font-mono-cyber text-slate-400 mb-1">
                    MB 100x100
                  </label>
                  <input
                    id="input-mb-100"
                    type="number"
                    min="0"
                    value={formData.instalasiMB.mb100x100}
                    onChange={(e) => handleNestedChange('instalasiMB', 'mb100x100', e.target.value)}
                    placeholder="0"
                    className="w-full h-9 bg-[#091224] border border-slate-700/80 focus:border-purple-400 rounded-lg px-2.5 text-xs font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-purple-400 transition-colors"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="input-mb-120" className="h-4 flex items-center text-[11px] font-mono-cyber text-slate-400 mb-1">
                    MB 120x120
                  </label>
                  <input
                    id="input-mb-120"
                    type="number"
                    min="0"
                    value={formData.instalasiMB.mb120x120}
                    onChange={(e) => handleNestedChange('instalasiMB', 'mb120x120', e.target.value)}
                    placeholder="0"
                    className="w-full h-9 bg-[#091224] border border-slate-700/80 focus:border-purple-400 rounded-lg px-2.5 text-xs font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-purple-400 transition-colors"
                  />
                </div>
              </div>
            </div>

          </div>
        </AccordionSection>

        {/* ----------------------------------------------------------------------- */}
        {/* IV. TIANG, GALVANIS & HDPE */}
        {/* ----------------------------------------------------------------------- */}
        <AccordionSection
          id="accordion-tiang-hdpe"
          title="IV. Tiang, Galvanis & HDPE"
          subtitle="Tiang Bersama (Pcs), Galvanis 2 & 4 inch, HDPE (m)"
          badge={formData.tiangGalvanisHDPE.tiangBersama ? `${formData.tiangGalvanisHDPE.tiangBersama} Pcs` : ''}
          isOpen={openAccordions.tiangHdpe}
          onToggle={() => toggleAccordion('tiangHdpe')}
          accentColor="blue"
          icon={<Zap className="w-4 h-4 text-blue-400" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="flex flex-col">
              <label 
                htmlFor="input-tiang-bersama" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Tiang Bersama
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-tiang-bersama"
                  type="number"
                  min="0"
                  value={formData.tiangGalvanisHDPE.tiangBersama}
                  onChange={(e) => handleNestedChange('tiangGalvanisHDPE', 'tiangBersama', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-blue-400 rounded-xl pl-3 pr-12 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  Pcs
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label 
                htmlFor="input-galvanis-2" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Galvanis 2"
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-galvanis-2"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.tiangGalvanisHDPE.galvanis2Inch}
                  onChange={(e) => handleNestedChange('tiangGalvanisHDPE', 'galvanis2Inch', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-blue-400 rounded-xl pl-3 pr-10 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  m
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label 
                htmlFor="input-galvanis-4" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Galvanis 4"
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-galvanis-4"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.tiangGalvanisHDPE.galvanis4Inch}
                  onChange={(e) => handleNestedChange('tiangGalvanisHDPE', 'galvanis4Inch', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-blue-400 rounded-xl pl-3 pr-10 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  m
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label 
                htmlFor="input-instal-hdpe" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Instal HDPE
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-instal-hdpe"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.tiangGalvanisHDPE.instalHDPE}
                  onChange={(e) => handleNestedChange('tiangGalvanisHDPE', 'instalHDPE', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-blue-400 rounded-xl pl-3 pr-10 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  m
                </span>
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* ----------------------------------------------------------------------- */}
        {/* V. DISMANTLING (BONGKAR) */}
        {/* ----------------------------------------------------------------------- */}
        <AccordionSection
          id="accordion-dismantling"
          title="V. Dismantling (Bongkar)"
          subtitle="Dismantle Kabel (m), Dismantle Tiang (Pcs)"
          badge={formData.dismantling.dismantleKabel ? `${formData.dismantling.dismantleKabel} m` : ''}
          isOpen={openAccordions.dismantling}
          onToggle={() => toggleAccordion('dismantling')}
          accentColor="amber"
          icon={<Trash2 className="w-4 h-4 text-amber-400" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="flex flex-col">
              <label 
                htmlFor="input-dismantle-kabel" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Dismantle Kabel
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-dismantle-kabel"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.dismantling.dismantleKabel}
                  onChange={(e) => handleNestedChange('dismantling', 'dismantleKabel', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-amber-400 rounded-xl pl-3 pr-10 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  m
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label 
                htmlFor="input-dismantle-tiang" 
                className="h-5 flex items-center text-xs font-mono-cyber text-slate-300 mb-1.5 truncate"
              >
                Dismantle Tiang
              </label>
              <div className="relative flex items-center h-10">
                <input
                  id="input-dismantle-tiang"
                  type="number"
                  min="0"
                  value={formData.dismantling.dismantleTiang}
                  onChange={(e) => handleNestedChange('dismantling', 'dismantleTiang', e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-[#050b14] border border-slate-700/80 focus:border-amber-400 rounded-xl pl-3 pr-12 text-xs sm:text-sm font-mono-cyber text-white focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                />
                <span className="absolute right-3 text-xs font-mono-cyber text-slate-400 pointer-events-none">
                  Pcs
                </span>
              </div>
            </div>
          </div>
        </AccordionSection>
      </div>

      {/* ========================================================================= */}
      {/* CATATAN AKHIR: KENDALA / ISU LAPANGAN */}
      {/* ========================================================================= */}
      <div className="bg-[#091224] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 mb-8 shadow-xl shadow-cyan-950/20">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h3 className="font-cyber font-bold text-sm text-white uppercase tracking-wide">
              Catatan Akhir: Kendala / Isu Lapangan
            </h3>
          </div>
          <button
            type="button"
            onClick={() => handleTopLevelChange('kendalaLapangan', 'Tidak ada kendala')}
            className="text-[10px] font-mono-cyber px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60"
          >
            + Set 'Tidak ada kendala'
          </button>
        </div>

        <div>
          <textarea
            id="textarea-kendala-lapangan"
            rows={3}
            value={formData.kendalaLapangan}
            onChange={(e) => handleTopLevelChange('kendalaLapangan', e.target.value)}
            placeholder="Sebutkan kendala perizinan, sosial, cuaca ekstrim, blocker material, atau tulis 'Tidak ada kendala'..."
            className="w-full bg-[#050b14] border border-slate-700/80 focus:border-cyan-400 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors leading-relaxed"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTION BUTTON: STICKY BOTTOM HP BAR (PROPORTIONAL SIZE) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#060c18]/95 backdrop-blur-md border-t border-slate-800/80 px-3 py-2.5 shadow-2xl shadow-black/80">
        <div className="max-w-md mx-auto flex items-center justify-center gap-2">
          {isEditing && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-cyber text-xs border border-slate-700 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              Batal
            </button>
          )}

          <button
            id="btn-simpan-laporan"
            type="submit"
            className={`w-full max-w-xs sm:max-w-sm py-2.5 px-4 rounded-xl ${
              isEditing 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/20' 
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
            } font-bold font-cyber tracking-wide uppercase text-xs shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300/30`}
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span className="truncate">Update & Simpan Laporan</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span className="truncate">Simpan Laporan Progress Harian</span>
              </>
            )}
          </button>
        </div>
      </div>

    </form>
  );
};

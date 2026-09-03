import React, { useState } from 'react';
import { 
  CheckCircle, 
  X, 
  Copy, 
  Check, 
  Calendar, 
  Cloud, 
  MapPin, 
  Share2, 
  MessageSquare, 
  Edit3, 
  Plus, 
  Clock, 
  Phone
} from 'lucide-react';
import { DailyReportFormData } from '../types';
import { calculateTotals, shareToWhatsApp, generateWhatsAppReportText } from '../utils/whatsapp';

interface ReportSummaryModalProps {
  report: DailyReportFormData | null;
  onClose: () => void;
  onNewReport: () => void;
  onEditReport?: (report: DailyReportFormData) => void;
}

export const ReportSummaryModal: React.FC<ReportSummaryModalProps> = ({
  report,
  onClose,
  onNewReport,
  onEditReport,
}) => {
  const [copied, setCopied] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  if (!report) return null;

  const { totalBoring, totalPulling, totalHH, totalHB, totalMH, totalMB, totalPit } =
    calculateTotals(report);

  const handleCopySummary = () => {
    const text = generateWhatsAppReportText(report);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWA = () => {
    shareToWhatsApp(report, whatsappPhone.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#091224] border border-cyan-500/50 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fadeIn">
        
        {/* Top Glowing Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 pb-3 flex items-start justify-between shrink-0 bg-[#070e1c] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono-cyber uppercase tracking-wider text-emerald-400 font-semibold">
                LAPORAN TERSIMPAN
              </span>
              <h2 className="text-base font-bold font-cyber text-white">
                Rekap Progress Harian
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Metadata Card */}
          <div className="bg-[#050b14] p-3.5 rounded-xl border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 font-mono-cyber">Nama Project:</span>
              <span className="font-cyber font-bold text-cyan-300 text-xs sm:text-sm truncate max-w-[200px]">
                {report.projectName || 'Project Lapangan'}
              </span>
            </div>

            {report.waspangName && (
              <div className="flex items-center justify-between text-slate-300 text-[11px] pt-1 border-t border-slate-800/60">
                <span className="text-slate-400 font-mono-cyber">Waspang (Pengawas):</span>
                <span className="font-mono-cyber font-semibold text-emerald-300">
                  {report.waspangName}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-white shrink-0" />
                <span>
                  {report.reportDate} {report.dayNumber ? `(Hari ke-${report.dayNumber})` : ''}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Cloud className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">{report.weatherCondition}</span>
              </div>
            </div>

            {(report.startDate || report.endDate) && (
              <div className="text-[11px] font-mono-cyber text-slate-400 pt-1 border-t border-slate-800/60 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-white shrink-0" />
                <span>Periode: <span className="text-slate-200">{report.startDate || '-'} s/d {report.endDate || '-'}</span></span>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-cyan-950/30 border border-cyan-500/30 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-mono-cyber text-cyan-300 block mb-1">
                Total Sipil Hari Ini
              </span>
              <div className="text-lg font-bold font-mono-cyber text-white">
                {report.totalProgressSipil || '0'} <span className="text-xs font-normal text-cyan-400">m</span>
              </div>
            </div>
            <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-mono-cyber text-emerald-300 block mb-1">
                Total Kabel Hari Ini
              </span>
              <div className="text-lg font-bold font-mono-cyber text-white">
                {report.totalProgressKabel || '0'} <span className="text-xs font-normal text-emerald-400">m</span>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown Recap */}
          <div className="bg-[#050b14] p-3 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-cyber font-semibold text-slate-200 text-xs flex items-center justify-between">
              <span>Rincian Item Pekerjaan</span>
              <span className="text-[10px] font-mono-cyber text-emerald-400">VERIFIED</span>
            </h4>
            
            <div className="space-y-1.5 text-[11px] font-mono-cyber">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">I. Pekerjaan Boring:</span>
                <span className="text-cyan-300 font-semibold">{totalBoring} meter</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">II. Penarikan Kabel:</span>
                <span className="text-emerald-300 font-semibold">{totalPulling} meter</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">III. Total Pit (HH,HB,MH,MB):</span>
                <span className="text-amber-300 font-semibold">{totalPit} Pcs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">IV. Tiang Bersama:</span>
                <span className="text-slate-200">{report.tiangGalvanisHDPE.tiangBersama || 0} Pcs</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">V. Dismantling Kabel:</span>
                <span className="text-slate-200">{report.dismantling.dismantleKabel || 0} m</span>
              </div>
            </div>
          </div>

          {/* Field Issues Note */}
          <div className="bg-[#050b14] p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-mono-cyber text-slate-400 block mb-1">
              Kendala / Isu Lapangan
            </span>
            <p className="text-xs text-slate-200 italic leading-relaxed">
              "{report.kendalaLapangan || 'Tidak ada kendala'}"
            </p>
          </div>

          {/* WhatsApp Direct Share Box */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cyber font-bold text-emerald-300 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Kirim Laporan via WhatsApp</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPhoneInput(!showPhoneInput)}
                className="text-[10px] font-mono-cyber text-emerald-400 hover:text-emerald-300 underline"
              >
                {showPhoneInput ? 'Sembunyikan Nomor' : '+ Target Nomor'}
              </button>
            </div>

            {showPhoneInput && (
              <div className="space-y-1 animate-fadeIn">
                <label className="text-[10px] font-mono-cyber text-slate-300 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>Nomor WhatsApp Tujuan (opsional, contoh: 08123456789)</span>
                </label>
                <input
                  type="tel"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx atau kosongkan untuk pilih kontak di WA"
                  className="w-full bg-[#050b14] border border-emerald-500/50 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono-cyber focus:outline-none"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleShareWA}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-bold font-cyber text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.99] transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-slate-950" />
              <span>Buka & Kirim WhatsApp Sekarang</span>
            </button>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#070e1c] border-t border-slate-800 flex flex-col gap-2 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>

            {onEditReport ? (
              <button
                type="button"
                onClick={() => {
                  onEditReport(report);
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Edit Laporan Ini</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onNewReport}
                className="py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-cyber flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Laporan Baru</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onNewReport}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono-cyber flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Buat Laporan Baru</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-slate-400 hover:text-slate-200 py-1 font-mono-cyber"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

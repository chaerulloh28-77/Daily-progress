import React from 'react';
import { 
  Sparkles, 
  Eraser, 
  CalendarPlus, 
  Trash2, 
  X, 
  ArrowRight, 
  Building2, 
  Calendar,
  Layers
} from 'lucide-react';

interface ClearScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearScreen: (mode: 'new_day' | 'full_reset') => void;
  projectName?: string;
  currentDay?: string;
  nextDayCalculated?: string;
}

export const ClearScreenModal: React.FC<ClearScreenModalProps> = ({
  isOpen,
  onClose,
  onClearScreen,
  projectName,
  currentDay = '1',
  nextDayCalculated,
}) => {
  if (!isOpen) return null;

  const targetNextDay = nextDayCalculated || (parseInt(currentDay, 10) + 1).toString();
  const hasProject = Boolean(projectName && projectName.trim());

  return (
    <div 
      id="clear-screen-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="clear-screen-modal-card"
        className="relative w-full max-w-lg bg-[#091224] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden my-auto flex flex-col"
      >
        {/* Header with Cyber Gradient Accent */}
        <div className="relative px-5 py-4 border-b border-slate-800 bg-[#060c18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/20">
              <Eraser className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cyber font-bold text-sm sm:text-base text-white tracking-wide">
                  Clear Screen
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-cyber font-semibold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  Form Reset
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono-cyber">
                Pilih opsi pembersihan layar untuk membuat daily progress baru
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Context Summary */}
        {hasProject && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-[#060e1d] border border-cyan-500/20 flex items-center justify-between gap-3 text-xs font-mono-cyber">
            <div className="flex items-center gap-2 text-slate-300 truncate">
              <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-400">Project Aktif:</span>
              <span className="text-white font-bold truncate">{projectName}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/30 text-amber-300 text-[11px] shrink-0 font-semibold">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>Hari Ke-{currentDay}</span>
            </div>
          </div>
        )}

        {/* Options Body */}
        <div className="p-5 space-y-3.5">
          {/* Option 1: Next Day (Keep Project, Clear Progress Inputs) */}
          <div 
            onClick={() => onClearScreen('new_day')}
            className="group relative p-4 rounded-xl bg-[#070f20] hover:bg-[#0c1933] border border-cyan-500/30 hover:border-cyan-400/70 transition-all cursor-pointer shadow-md hover:shadow-cyan-950/40"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <CalendarPlus className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-cyber font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      Input Hari Baru {hasProject ? `(Hari Ke-${targetNextDay})` : ''}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-cyber font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      Disarankan
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Kosongkan rincian progres hari ini (boring, pulling kabel, manhole/handhole, kendala) dan perbarui tanggal ke hari ini.
                </p>
                <div className="flex items-center gap-2 mt-2.5 text-[11px] font-mono-cyber text-slate-400">
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    ✓ Project & Waspang tetap tersimpan
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-cyan-300">
                    ✓ Target di-reset ke nilai awal
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Option 2: Full Reset (Complete Blank Screen) */}
          <div 
            onClick={() => onClearScreen('full_reset')}
            className="group relative p-4 rounded-xl bg-[#070f20] hover:bg-[#150e18] border border-slate-700/80 hover:border-red-500/60 transition-all cursor-pointer shadow-md hover:shadow-red-950/20"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-cyber font-bold text-sm text-slate-200 group-hover:text-red-300 transition-colors">
                    Reset Total (Kosongkan Seluruh Formulir)
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Kosongkan semua data dari awal: nama project, ID, tanggal, waspang, dan seluruh angka capaian untuk memulai form dari nol.
                </p>
                <div className="flex items-center gap-2 mt-2 text-[11px] font-mono-cyber text-red-400/80">
                  <span>Bersih total seperti pertama kali dibuka</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#060c18] border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-cyber font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

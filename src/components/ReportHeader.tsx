import React from 'react';
import { LogOut, Cpu, FolderKanban, Eraser, ShieldCheck, UserCheck, Cloud } from 'lucide-react';
import { PmoLogo } from './PmoLogo';
import { LinkNetLogo } from './LinkNetLogo';
import { UserRole } from '../types';

interface ReportHeaderProps {
  userEmail: string;
  userRole?: UserRole;
  onLogout: () => void;
  savedReportsCount: number;
  onOpenHistory?: () => void;
  onOpenProjects?: () => void;
  onOpenClearScreen?: () => void;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  userEmail,
  userRole = 'waspang',
  onLogout,
  savedReportsCount,
  onOpenHistory,
  onOpenProjects,
  onOpenClearScreen,
}) => {
  const isAdmin = userRole === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-[#050b14]/95 backdrop-blur-md border-b border-cyan-500/20 px-4 py-3 shadow-lg shadow-black/40">
      <div className="max-w-2xl mx-auto">
        {/* Top telemetry bar */}
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80 text-[11px] font-mono-cyber">
          {/* Dual Brand Logos: LinkNet (Left) + PMO MS CKT (Right) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center px-1.5 py-0.5 rounded-md bg-[#0a1222] border border-amber-500/30 shadow-sm">
              <LinkNetLogo className="h-3.5 sm:h-4 w-auto" />
            </div>

            <div className="h-3 w-[1px] bg-slate-700/80" />

            <div className="flex items-center gap-1.5">
              <PmoLogo className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0 drop-shadow-[0_0_8px_rgba(87,204,246,0.35)]" />
              <span className="font-cyber font-extrabold tracking-wider text-xs sm:text-sm text-white">
                PMO MS CKT
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {onOpenClearScreen && (
              <button
                type="button"
                onClick={onOpenClearScreen}
                className="h-7 inline-flex items-center gap-1.5 px-2.5 rounded-lg bg-amber-950/70 border border-amber-500/40 text-amber-300 hover:bg-amber-900/70 hover:text-amber-200 transition-all cursor-pointer text-[11px] font-mono-cyber font-semibold shadow-sm"
                title="Bersihkan layar untuk membuat daily progress baru"
              >
                <Eraser className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden xs:inline">Clear Screen</span>
                <span className="xs:hidden">Clear</span>
              </button>
            )}

            {onOpenProjects && (
              <button
                type="button"
                onClick={onOpenProjects}
                className="h-7 inline-flex items-center gap-1.5 px-2.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/70 transition-all cursor-pointer text-[11px] font-mono-cyber font-semibold"
                title="Kelola Master Project"
              >
                <FolderKanban className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Projects</span>
              </button>
            )}

            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="h-7 inline-flex items-center gap-1.5 px-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-slate-600 transition-all cursor-pointer text-[11px] font-mono-cyber font-semibold"
                title="Lihat riwayat laporan tersimpan"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Logs ({savedReportsCount})</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 text-slate-400 pl-1 border-l border-slate-800">
              {/* User Identity & Role Badge */}
              <div className="hidden xs:flex flex-col items-end leading-tight">
                <span className="text-slate-300 truncate max-w-[110px] text-[10px] font-mono-cyber font-medium" title={userEmail}>
                  {userEmail.split('@')[0]}
                </span>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-mono-cyber font-bold text-amber-400 bg-amber-950/80 px-1 rounded border border-amber-500/40">
                    <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />
                    ADMIN
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-mono-cyber font-semibold text-cyan-300 bg-cyan-950/80 px-1 rounded border border-cyan-500/30">
                    <UserCheck className="w-2.5 h-2.5 text-cyan-400" />
                    WASPANG
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-red-950 hover:text-red-400 hover:border-red-800/60 border border-slate-700/60 text-slate-300 transition-all cursor-pointer"
                title={`Keluar (${userEmail} - Role: ${userRole})`}
                aria-label="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Header title and subtext */}
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-sm bg-cyan-400 rotate-45 shrink-0" />
              <h1 className="text-base sm:text-lg font-bold font-cyber text-white tracking-wide">
                Monitoring Harian <span className="text-cyan-400">(Daily Progress)</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono-cyber text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/30" title="Sinkronisasi multi-perangkat siap via Firebase/Supabase">
                <Cloud className="w-3 h-3 text-emerald-400" />
                Sync Ready
              </span>
              <span className="text-[10px] font-mono-cyber text-cyan-400/90 font-medium tracking-wider">
                Designed by PAUL
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

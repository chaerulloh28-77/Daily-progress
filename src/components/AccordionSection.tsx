import React from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string | number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'blue';
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  id,
  title,
  subtitle,
  badge,
  isOpen,
  onToggle,
  children,
  icon,
  accentColor = 'cyan',
}) => {
  const accentClasses = {
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-400/60',
      activeBorder: 'border-cyan-400/80 bg-cyan-950/20',
      headerGlow: 'text-cyan-400',
      badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-400/60',
      activeBorder: 'border-emerald-400/80 bg-emerald-950/20',
      headerGlow: 'text-emerald-400',
      badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-400/60',
      activeBorder: 'border-amber-400/80 bg-amber-950/20',
      headerGlow: 'text-amber-400',
      badge: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    },
    blue: {
      border: 'border-blue-500/30 hover:border-blue-400/60',
      activeBorder: 'border-blue-400/80 bg-blue-950/20',
      headerGlow: 'text-blue-400',
      badge: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
    },
  }[accentColor];

  return (
    <div
      id={id}
      className={`rounded-xl border transition-all duration-200 overflow-hidden bg-[#0a1122]/90 ${
        isOpen ? accentClasses.activeBorder : accentClasses.border
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer transition-colors focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {icon && (
            <div className={`shrink-0 p-1.5 rounded-lg bg-slate-900/80 ${accentClasses.headerGlow}`}>
              {icon}
            </div>
          )}
          <div className="truncate">
            <h3 className="text-sm font-semibold tracking-wide font-cyber text-slate-100 truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {badge !== undefined && badge !== '' && (
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono-cyber font-semibold border ${accentClasses.badge}`}
            >
              {badge}
            </span>
          )}
          <div
            className={`w-7 h-7 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-300 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-cyan-400 bg-cyan-950/50' : ''
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-800/70">
          {children}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Radio, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';
import { PmoLogo } from './PmoLogo';
import { LinkNetLogo } from './LinkNetLogo';
import { sendLoginNotification } from '../utils/emailHelper';
import { CurrentUser, UserRole } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: CurrentUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deteksi role berdasarkan input email
  const cleanEmail = email.trim().toLowerCase();
  const isDetectedAdmin = cleanEmail === 'admin@gov.com';
  const detectedRole: UserRole = isDetectedAdmin ? 'admin' : 'waspang';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!cleanEmail) {
      setErrorMessage('Email wajib diisi');
      return;
    }

    if (!password) {
      setErrorMessage('Password wajib diisi');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Aturan Keamanan 1: Validasi Khusus Akun Admin
      if (isDetectedAdmin) {
        if (password !== 'gov_123') {
          setErrorMessage('Password Admin tidak valid');
          setIsSubmitting(false);
          return;
        }
      } else {
        // Aturan Keamanan 2: Validasi Akun Waspang (User)
        if (password !== 'waspang_gov123') {
          setErrorMessage('Password Waspang tidak valid');
          setIsSubmitting(false);
          return;
        }
      }

      const currentUser: CurrentUser = {
        email: email.trim(),
        role: detectedRole,
        name: isDetectedAdmin ? 'Administrator' : email.trim().split('@')[0],
      };

      // Kirim notifikasi login real-time ke chaerulloh28@gmail.com
      sendLoginNotification(email.trim()).catch((err) => {
        console.error('[LoginPage] Gagal mengirim notifikasi email login:', err);
      });

      onLoginSuccess(currentUser);
      setIsSubmitting(false);
    }, 250);
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 bg-[#050b14] relative overflow-hidden">
      {/* Cyber Grid Background Accents */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00f0ff15 1px, transparent 1px),
            linear-gradient(to bottom, #00f0ff15 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Subtle Glow Spheres */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />

      {/* Centered Login Card */}
      <div className="w-full max-w-sm z-10">
        <div className="bg-[#091224]/90 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl relative">
          
          {/* Cyber Decorative Accents */}
          <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <div className="absolute -bottom-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
          
          {/* Top Badge */}
          <div className="flex items-center justify-between mb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono-cyber font-medium text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>GOV SECURE PORTAL</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono-cyber text-slate-400">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>

          {/* Symmetrical Dual Brand Logos (LinkNet on Left, PMO MS CKT on Right) */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 mb-4">
            {/* 1. LinkNet Logo Container (Left) */}
            <div className="h-14 sm:h-15 px-3.5 sm:px-4 rounded-xl bg-gradient-to-br from-[#0e1726] to-[#060b14] border border-amber-500/40 flex items-center justify-center shadow-lg shadow-black/60 hover:border-amber-400/60 transition-all">
              <LinkNetLogo className="h-6 sm:h-7 w-auto" />
            </div>

            {/* Symmetrical Cyber Divider */}
            <div className="flex flex-col items-center justify-center gap-1 opacity-50 shrink-0">
              <div className="w-1 h-2 rounded-full bg-slate-600" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
              <div className="w-1 h-2 rounded-full bg-slate-600" />
            </div>

            {/* 2. PMO MS CKT Logo Container (Right) */}
            <div className="h-14 sm:h-15 px-3 sm:px-3.5 rounded-xl bg-gradient-to-br from-cyan-950/70 to-[#060b14] border border-cyan-500/40 flex items-center gap-2 justify-center shadow-lg shadow-cyan-950/40 hover:border-cyan-400/60 transition-all">
              <PmoLogo className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]" />
              <div className="text-left">
                <span className="text-[9px] font-mono-cyber text-cyan-400 font-bold block leading-none">PMO</span>
                <span className="font-cyber font-extrabold text-xs sm:text-[13px] text-white tracking-wider block mt-0.5 leading-none">MS CKT</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-5">
            <h1 className="text-xl sm:text-2xl font-bold font-cyber tracking-wide text-white uppercase">
              Monitoring Harian <span className="text-cyan-400">GOV</span>
            </h1>
            <p className="text-xs text-cyan-400 font-mono-cyber mt-1 tracking-wider font-semibold uppercase flex items-center justify-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-cyan-400 inline-block"></span>
              Designed by PAUL
              <span className="w-1 h-1 rounded-full bg-cyan-400 inline-block"></span>
            </p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div 
              id="login-error-alert" 
              className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center gap-2.5 text-red-300 text-xs animate-shake"
            >
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <div className="font-semibold text-red-200">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="input-email" 
                className="block text-xs font-mono-cyber uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4 text-cyan-400/70" />
                </div>
                <input
                  id="input-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[#0d1830] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
              </div>

              {/* Dynamic Role Badge Indicator */}
              {cleanEmail && (
                <div className="mt-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono-cyber text-slate-400">Terdeteksi Role:</span>
                    {isDetectedAdmin ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-[10px] font-mono-cyber font-bold text-amber-300">
                        <ShieldCheck className="w-3 h-3 text-amber-400" />
                        ADMIN (Akses Penuh)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-[10px] font-mono-cyber font-semibold text-cyan-300">
                        <UserCheck className="w-3 h-3 text-cyan-400" />
                        WASPANG (Pengawas)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label 
                htmlFor="input-password" 
                className="block text-xs font-mono-cyber uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4 text-cyan-400/70" />
                </div>
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Masukkan password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#0d1830] border text-white placeholder-slate-500 text-sm focus:outline-none transition-colors ${
                    errorMessage 
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                      : 'border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-[#050b14] font-bold font-cyber tracking-wider uppercase text-sm shadow-lg shadow-cyan-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <span>MEMVERIFIKASI...</span>
              ) : (
                <span>Masuk</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer Brand Info */}
        <div className="text-center mt-4 text-slate-500 text-[11px] font-mono-cyber">
          GOV-FO-NET v4.2 • Designed by PAUL
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, CheckCircle2, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const MobileInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [justInstalledToast, setJustInstalledToast] = useState(false);

  useEffect(() => {
    // Cek apakah sudah terpasang (standalone PWA di HP atau flag localStorage)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      localStorage.getItem('gov_pwa_installed') === 'true';

    setIsInstalled(isStandalone);

    // Cek perangkat iOS (iPhone / iPad)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      localStorage.setItem('gov_pwa_installed', 'true');
      setIsInstalled(true);
      setDeferredPrompt(null);
      setJustInstalledToast(true);
      setTimeout(() => setJustInstalledToast(false), 3500);
    };

    const handleOpenModal = () => {
      setShowIOSModal(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('open-gov-install-modal', handleOpenModal);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-gov-install-modal', handleOpenModal);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          localStorage.setItem('gov_pwa_installed', 'true');
          setIsInstalled(true);
          setDeferredPrompt(null);
          setJustInstalledToast(true);
          setTimeout(() => setJustInstalledToast(false), 3500);
        }
      } catch (err) {
        console.warn('Gagal memicu install prompt native:', err);
        setShowIOSModal(true);
      }
    } else {
      // Buka modal petunjuk pemasangan interaktif
      setShowIOSModal(true);
    }
  };

  const handleMarkAsInstalled = () => {
    // Sembunyikan permanen setelah dipasang di layar utama
    localStorage.setItem('gov_pwa_installed', 'true');
    setIsInstalled(true);
    setShowIOSModal(false);
    setJustInstalledToast(true);
    setTimeout(() => setJustInstalledToast(false), 3500);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('gov_install_banner_dismissed', 'true');
  };

  if (isInstalled && !justInstalledToast) {
    return null;
  }

  if (isDismissed && !justInstalledToast) {
    return null;
  }

  return (
    <>
      {/* Toast Notifikasi Sukses Pemasangan */}
      {justInstalledToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-cyber shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Ikon aplikasi GovMonitor berhasil dipasang di Layar Utama HP!</span>
        </div>
      )}

      {/* Banner Pasang Icon di Layar Utama HP */}
      {!isInstalled && !isDismissed && (
        <div className="bg-gradient-to-r from-[#051326] via-[#091b35] to-[#051326] border-y sm:border sm:rounded-2xl border-cyan-500/40 p-3 sm:p-3.5 my-3 shadow-lg shadow-cyan-950/30 transition-all">
          <div className="flex items-center justify-between gap-3">
            {/* App Icon preview - Dapat Di-Klik & Dioperasikan */}
            <button
              type="button"
              onClick={handleInstallClick}
              className="relative shrink-0 group cursor-pointer focus:outline-none"
              title="Ketuk untuk Pasang Icon di Layar Utama HP"
            >
              <img
                src="/icon.svg"
                alt="Icon Aplikasi GovMonitor"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain shadow-md shadow-cyan-500/40 border border-cyan-400/60 bg-[#050b14] p-0.5 group-hover:scale-105 group-hover:border-cyan-300 group-active:scale-95 transition-all"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#050b14] flex items-center justify-center text-[9px] text-black font-bold group-hover:scale-110 transition-transform">
                ✓
              </span>
            </button>

            {/* Text description - Dapat Di-Klik */}
            <div 
              onClick={handleInstallClick}
              className="min-w-0 flex-1 cursor-pointer group"
              title="Ketuk untuk Pasang Icon di Layar Utama HP"
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-cyber font-bold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors tracking-wide">
                  Pasang Icon di Layar Utama HP
                </span>
                <span className="text-[9px] font-mono-cyber font-bold text-cyan-300 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-500/40">
                  PWA Siap
                </span>
              </div>
              <p className="text-[11px] text-slate-300 group-hover:text-slate-200 font-sans mt-0.5 line-clamp-1 transition-colors">
                Buka aplikasi langsung dari beranda HP seperti aplikasi Android & iOS native.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-[#050b14] font-cyber font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Pasang Icon Aplikasi di HP"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Pasang Icon</span>
                <span className="xs:hidden">Pasang</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Sembunyikan banner sementara"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Panduan Lengkap Pemasangan Icon di Layar Utama HP */}
      {showIOSModal && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowIOSModal(false)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl bg-[#081226] border border-cyan-500/40 p-5 shadow-2xl shadow-cyan-950/60 text-white relative animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header dengan Tombol Kembali */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowIOSModal(false)}
                  className="p-1 -ml-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Kembali"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-cyber text-slate-300">Kembali</span>
                </button>
                <div className="h-4 w-px bg-slate-700 mx-0.5" />
                <div>
                  <h3 className="font-cyber font-bold text-sm text-white">
                    Pasang di Layar HP
                  </h3>
                  <span className="text-[10px] font-mono-cyber text-cyan-400">
                    GovMonitor &bull; Monitoring Harian
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* App Icon preview di dalam modal */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#050b14] border border-cyan-500/30 mb-3.5">
              <img
                src="/icon.svg"
                alt="GovMonitor App Icon"
                className="w-12 h-12 rounded-xl border border-cyan-400/60 bg-[#050b14] p-0.5 shadow-md shadow-cyan-500/30 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-cyber font-bold text-xs text-white">
                  Monitoring Harian GOV
                </h4>
                <p className="text-[10px] text-slate-400 font-mono-cyber">
                  Setelah terpasang di layar utama HP, banner panduan ini otomatis disembunyikan.
                </p>
              </div>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-2.5 text-xs text-slate-300">
              {deferredPrompt && (
                <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-between gap-2">
                  <span className="text-xs text-cyan-200 font-medium">Instal Langsung Otomatis:</span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (deferredPrompt) {
                        await deferredPrompt.prompt();
                        const choice = await deferredPrompt.userChoice;
                        if (choice.outcome === 'accepted') {
                          handleMarkAsInstalled();
                        }
                      }
                    }}
                    className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-cyber font-bold text-xs cursor-pointer active:scale-95"
                  >
                    Instal Sekarang
                  </button>
                </div>
              )}

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#050b14] border border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 font-mono-cyber font-bold text-xs">
                  1
                </div>
                <div>
                  <p className="font-medium text-slate-200">
                    {isIOS 
                      ? 'Ketuk tombol Bagikan (Share) di browser Safari' 
                      : 'Ketuk menu titik tiga (⋮) di pojok kanan atas browser HP'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    {isIOS ? <Share className="w-3.5 h-3.5 text-cyan-400 inline" /> : null}
                    {isIOS 
                      ? 'Ikon kotak dengan panah ke atas di bilah bawah browser Safari.' 
                      : 'Pilih menu browser Chrome / Edge / Samsung Internet.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#050b14] border border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 font-mono-cyber font-bold text-xs">
                  2
                </div>
                <div>
                  <p className="font-medium text-slate-200">
                    Pilih menu <strong className="text-white">"Tambahkan ke Layar Utama"</strong> (Add to Home Screen)
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
                    Ikon aplikasi GovMonitor akan otomatis disematkan ke layar beranda HP Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#050b14] border border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 font-mono-cyber font-bold text-xs">
                  3
                </div>
                <div>
                  <p className="font-medium text-slate-200">
                    Buka Langsung Sekali Ketuk
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Aplikasi terbuka cepat tanpa bilah URL browser, layaknya aplikasi native.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons footer */}
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleMarkAsInstalled}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-cyber font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Sudah Dipasang di HP (Sembunyikan)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-cyber text-xs text-center cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Aplikasi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

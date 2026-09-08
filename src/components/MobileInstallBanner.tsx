import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, CheckCircle2 } from 'lucide-react';

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

  useEffect(() => {
    // Check if dismissed previously in this session
    if (sessionStorage.getItem('gov_install_banner_dismissed') === 'true') {
      setIsDismissed(true);
    }

    // Check standalone mode (already installed as PWA on HP)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Check iOS devices (iPhone, iPad)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General guidance modal for mobile browsers
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('gov_install_banner_dismissed', 'true');
  };

  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Mobile Floating / Top Banner */}
      <div className="bg-gradient-to-r from-[#051326] via-[#091b35] to-[#051326] border-y sm:border sm:rounded-2xl border-cyan-500/40 p-3 sm:p-3.5 my-3 shadow-lg shadow-cyan-950/30">
        <div className="flex items-center justify-between gap-3">
          {/* App Icon preview */}
          <div className="relative shrink-0">
            <img
              src="/icon.svg"
              alt="Icon Aplikasi GovMonitor"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain shadow-md shadow-cyan-500/30 border border-cyan-400/50 bg-[#050b14] p-0.5"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#050b14] flex items-center justify-center text-[9px] text-black font-bold">
              ✓
            </span>
          </div>

          {/* Text description */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-cyber font-bold text-xs sm:text-sm text-white tracking-wide">
                Pasang Icon di Layar Utama HP
              </span>
              <span className="text-[9px] font-mono-cyber font-bold text-cyan-300 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-500/40">
                PWA Siap
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans mt-0.5 line-clamp-1">
              Buka aplikasi langsung dari beranda HP seperti aplikasi Android / iOS native.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-[#050b14] font-cyber font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Pasang Icon</span>
              <span className="xs:hidden">Pasang</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
              title="Tutup banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Guidance Modal for iOS & Browsers where prompt is manual */}
      {showIOSModal && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowIOSModal(false)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl bg-[#081226] border border-cyan-500/40 p-5 shadow-2xl shadow-cyan-950/60 text-white relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <img
                  src="/icon.svg"
                  alt="GovMonitor App Icon"
                  className="w-10 h-10 rounded-xl border border-cyan-400/60 bg-[#050b14] p-0.5 shadow-md shadow-cyan-500/30"
                />
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
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#050b14] border border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 font-mono-cyber font-bold text-xs">
                  1
                </div>
                <div>
                  <p className="font-medium text-slate-200">
                    {isIOS ? 'Ketuk tombol Bagikan (Share) di browser Safari' : 'Ketuk menu titik tiga (⋮) di Chrome / browser HP'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    {isIOS ? <Share className="w-3.5 h-3.5 text-cyan-400 inline" /> : null}
                    {isIOS ? 'Ikon kotak dengan panah ke atas di bagian bawah layar.' : 'Terletak di pojok kanan atas browser Anda.'}
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
                    Ikon aplikasi GovMonitor akan otomatis tersimpan di layar utama HP Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#050b14] border border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 font-mono-cyber font-bold text-xs">
                  3
                </div>
                <div>
                  <p className="font-medium text-slate-200">
                    Buka Langsung Kapan Saja
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Icon GovMonitor di HP dapat langsung dibuka satu ketukan tanpa mengetik URL lagi.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-4 py-2.5 px-4 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-cyber font-bold text-xs text-center cursor-pointer transition-colors"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};

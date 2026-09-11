import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Sun, 
  HardDrive,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  subscribeToBackgroundSync, 
  processBackgroundSyncQueue, 
  requestScreenWakeLock, 
  releaseScreenWakeLock,
  isScreenWakeLockActive
} from '../services/backgroundSync';

export const BackgroundStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWakeLockOn, setIsWakeLockOn] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  useEffect(() => {
    const unsub = subscribeToBackgroundSync((status) => {
      setIsOnline(status.isOnline);
      setPendingCount(status.pendingCount);
      setIsSyncing(status.isSyncing);
      if (status.lastSyncTime) {
        setLastSyncTime(status.lastSyncTime);
      }
    });

    const handleDraftSaved = () => {
      setDraftSavedToast(true);
      setTimeout(() => setDraftSavedToast(false), 3000);
    };

    window.addEventListener('gov-draft-saved-bg', handleDraftSaved);

    return () => {
      unsub();
      window.removeEventListener('gov-draft-saved-bg', handleDraftSaved);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    await processBackgroundSyncQueue();
    setIsSyncing(false);
  };

  const toggleWakeLock = async () => {
    if (isWakeLockOn) {
      await releaseScreenWakeLock();
      setIsWakeLockOn(false);
    } else {
      const success = await requestScreenWakeLock();
      setIsWakeLockOn(success);
    }
  };

  // Format sync time
  const formatTime = (isoString: string | null) => {
    if (!isoString) return null;
    try {
      return new Date(isoString).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-1.5 pb-2">
      {/* Draft Auto-Saved in Background Notification */}
      {draftSavedToast && (
        <div className="mb-2 p-2 rounded-lg bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs font-mono-cyber flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
          <span>Draft formulir berhasil diamankan di latar belakang (Background Auto-Save).</span>
        </div>
      )}

      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="mb-2 p-2.5 rounded-xl bg-amber-950/90 border border-amber-500 text-amber-200 text-xs font-mono-cyber flex items-start sm:items-center justify-between gap-2 shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300">Mode Offline Lapangan Aktif:</span>{' '}
              Aplikasi tetap bekerja di belakang layar. Laporan yang Anda simpan akan masuk antrean dan otomatis dikirim saat online kembali.
            </div>
          </div>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/30 border border-amber-400 font-bold text-[11px] whitespace-nowrap">
              {pendingCount} Antrean
            </span>
          )}
        </div>
      )}

      {/* Pending queue notification when online */}
      {isOnline && pendingCount > 0 && (
        <div className="mb-2 p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500 text-cyan-200 text-xs font-mono-cyber flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Ada <strong className="text-cyan-300">{pendingCount}</strong> laporan di antrean latar belakang.
            </span>
          </div>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-[11px] font-cyber transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>
      )}

      {/* Background Status & Telemetry Bar */}
      <div className="rounded-xl bg-[#070e1c]/90 border border-slate-800 px-3 py-2 text-xs font-mono-cyber shadow-sm">
        <div className="flex items-center justify-between gap-2">
          {/* Status Left */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700/80 text-[10px]">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-amber-400 animate-ping'}`} />
              <span className={isOnline ? 'text-emerald-300' : 'text-amber-300'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span>Background Engine:</span>
              <span className="text-cyan-300 font-semibold">Aktif</span>
            </span>

            {lastSyncTime && (
              <span className="hidden sm:inline-block text-[10px] text-slate-400">
                (Sinkron: {formatTime(lastSyncTime)})
              </span>
            )}
          </div>

          {/* Quick Actions Right */}
          <div className="flex items-center gap-1.5">
            {/* Screen Wake Lock toggle */}
            <button
              type="button"
              onClick={toggleWakeLock}
              title={isWakeLockOn ? 'Layar tetap menyala (Ketuk untuk matikan)' : 'Jaga layar HP tetap menyala saat di lapangan'}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] border transition-all cursor-pointer ${
                isWakeLockOn
                  ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className={`w-3 h-3 ${isWakeLockOn ? 'text-amber-400' : 'text-slate-500'}`} />
              <span className="hidden xs:inline">
                {isWakeLockOn ? 'Layar Terjaga ON' : 'Jaga Layar'}
              </span>
            </button>

            {/* Expand details button */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Lihat Detail Kerja Latar Belakang"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible details info */}
        {isExpanded && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-cyan-300 font-medium">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Fitur Kerja Dibalik Layar (Background Capabilities):</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-300 text-[10.5px]">
              <li>
                <strong>PWA Service Worker Caching:</strong> Aset aplikasi tersimpan di memori perangkat, sehingga dapat dibuka dan digunakan meski tanpa sinyal.
              </li>
              <li>
                <strong>Background Auto-Save:</strong> Formulir otomatis tersimpan saat Anda berpindah ke aplikasi lain (WhatsApp/Kamera), tab diminimalkan, atau layar HP mati.
              </li>
              <li>
                <strong>Offline Queue & Background Sync:</strong> Laporan yang disimpan saat sinyal hilang akan masuk ke antrean lokal dan otomatis terunggah ke Cloud saat jaringan pulih.
              </li>
              <li>
                <strong>Database IndexedDB Persistence:</strong> Data proyek dan riwayat tetap dapat dibaca secara instan tanpa perlu memuat ulang server.
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

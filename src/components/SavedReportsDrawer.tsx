import React, { useState } from 'react';
import { X, Calendar, MapPin, Eye, Trash2, Clock, MessageSquare, Edit3, Plus, Lock, User, Cloud } from 'lucide-react';
import { DailyReportFormData, CurrentUser } from '../types';
import { shareToWhatsApp, calculateTotals } from '../utils/whatsapp';

interface SavedReportsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reports: DailyReportFormData[];
  currentUser: CurrentUser;
  onSelectReport: (report: DailyReportFormData) => void;
  onEditReport: (report: DailyReportFormData) => void;
  onDeleteReport: (index: number) => void;
  onNewReport: () => void;
}

export const SavedReportsDrawer: React.FC<SavedReportsDrawerProps> = ({
  isOpen,
  onClose,
  reports,
  currentUser,
  onSelectReport,
  onEditReport,
  onDeleteReport,
  onNewReport,
}) => {
  const [deleteConfirmIdx, setDeleteConfirmIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleDelete = (index: number) => {
    onDeleteReport(index);
    setDeleteConfirmIdx(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm h-full bg-[#080f1e] border-l border-cyan-500/30 flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#060c18]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-cyber font-bold text-sm text-white uppercase tracking-wider">
              Riwayat Laporan ({reports.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-4 py-2.5 bg-[#050b14] border-b border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] font-mono-cyber text-slate-400">
            Arsip Harian Project
          </span>
          <button
            type="button"
            onClick={() => {
              onNewReport();
              onClose();
            }}
            className="inline-flex items-center gap-1 text-[11px] font-mono-cyber text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-500/30"
          >
            <Plus className="w-3 h-3" />
            <span>+ Laporan Baru</span>
          </button>
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 font-cyber">
                  Belum Ada Laporan Tersimpan
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Data telah dikosongkan. Silakan isi form laporan harian dan simpan progres lapangan Anda.
                </p>
              </div>
            </div>
          ) : (
            reports.map((report, idx) => {
              const author = report.authorEmail || '';
              const isOwner = !!(currentUser?.email && author && currentUser.email.toLowerCase() === author.toLowerCase());
              const isAdmin = currentUser?.role === 'admin';
              const canModify = isAdmin || isOwner || !author;

              return (
                <div
                  key={report.id || idx}
                  className="bg-[#0b1428] border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3.5 transition-all text-xs space-y-2.5 shadow-md shadow-black/40"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {report.projectId && (
                          <span className="text-[10px] font-mono-cyber px-1.5 py-0.2 rounded bg-slate-800/90 border border-cyan-500/40 text-cyan-300 font-semibold">
                            ID: {report.projectId}
                          </span>
                        )}
                        <span className="font-cyber font-bold text-white text-xs">
                          {report.projectName || 'Project Tanpa Nama'}
                        </span>
                        {report.dayNumber && (
                          <span className="text-[10px] font-mono-cyber px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-semibold">
                            Hari ke-{report.dayNumber}
                          </span>
                        )}
                        {report.waspangName && (
                          <span className="text-[10px] font-mono-cyber px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                            Waspang: {report.waspangName}
                          </span>
                        )}
                      </div>

                      {/* Author Ownership Badge & Sync Status */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span 
                          className={`text-[10px] font-mono-cyber px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${
                            isOwner 
                              ? 'bg-cyan-950/90 border-cyan-400/60 text-cyan-200' 
                              : isAdmin
                              ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                              : 'bg-slate-900 border-slate-700/80 text-slate-400'
                          }`}
                          title={`Email Pembuat: ${author || 'Tidak terdata'}`}
                        >
                          <User className="w-2.5 h-2.5 shrink-0" />
                          <span>Oleh: {author ? (isOwner ? `${author.split('@')[0]} (Anda)` : author) : 'Anonim'}</span>
                        </span>

                        {report.syncedToCloud && (
                          <span className="text-[9px] font-mono-cyber px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 inline-flex items-center gap-0.5">
                            <Cloud className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Cloud</span>
                          </span>
                        )}

                        {!canModify && (
                          <span className="text-[9px] font-mono-cyber px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-300 inline-flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5 text-red-400" />
                            <span>Read-Only</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono-cyber mt-1 flex-wrap">
                        <Calendar className="w-3.5 h-3.5 text-white shrink-0" />
                        <span>{report.reportDate}</span>
                        <span className="text-slate-600">•</span>
                        <span>{report.weatherCondition}</span>
                        {report.durasiPekerjaan && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-emerald-400 font-medium">Sisa: {report.durasiPekerjaan} Hari</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Proteksi Tombol Hapus */}
                    {canModify ? (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmIdx(idx)}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors shrink-0 cursor-pointer"
                        title={isAdmin ? "Hapus Laporan (Akses Penuh Admin)" : "Hapus Laporan Milik Anda"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span
                        className="p-1 rounded text-slate-600 shrink-0 cursor-not-allowed opacity-50"
                        title={`Hapus Dibatasi: Laporan ini dibuat oleh ${author || 'user lain'}. Hanya pembuat atau Admin yang dapat menghapus.`}
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      </span>
                    )}
                  </div>

                  {/* Metrics summary */}
                  {(() => {
                    const { totalHH, totalHB, totalMH } = calculateTotals(report);
                    const displayHH = report.totalProgressHH || totalHH.toString();
                    const displayHB = report.totalProgressHB || totalHB.toString();
                    const displayMH = report.totalProgressMH || totalMH.toString();
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 py-1.5 px-2 rounded-lg bg-[#070e1c] border border-slate-800/60 font-mono-cyber text-[10px] sm:text-[11px]">
                        <div className="text-slate-400">
                          Sipil: <span className="text-white font-semibold">{report.totalProgressSipil || 0}m</span>
                        </div>
                        <div className="text-slate-400">
                          Kabel: <span className="text-emerald-400 font-semibold">{report.totalProgressKabel || 0}m</span>
                        </div>
                        <div className="text-slate-400">
                          HH: <span className="text-amber-300 font-semibold">{displayHH}</span>
                        </div>
                        <div className="text-slate-400">
                          HB: <span className="text-orange-300 font-semibold">{displayHB}</span>
                        </div>
                        <div className="text-slate-400">
                          MH: <span className="text-purple-300 font-semibold">{displayMH}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {report.kendalaLapangan && (
                    <div className="text-[10px] text-slate-400 italic line-clamp-1">
                      "{report.kendalaLapangan}"
                    </div>
                  )}

                  {report.submittedAt && (
                    <div className="text-[9px] text-slate-500 font-mono-cyber">
                      Tersimpan: {report.submittedAt}
                    </div>
                  )}

                  {/* Delete confirm inline */}
                  {deleteConfirmIdx === idx && (
                    <div className="p-2 rounded bg-red-950/90 border border-red-500/80 text-[11px] flex items-center justify-between gap-1 animate-fadeIn">
                      <span className="text-red-200">Hapus laporan ini?</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(idx)}
                          className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]"
                        >
                          Ya, Hapus
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmIdx(null)}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action buttons: Lihat Rekap, Edit, Kirim WA */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800/60">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectReport(report);
                        onClose();
                      }}
                      className="py-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center justify-center gap-1 text-[10px] font-semibold transition-colors"
                      title="Lihat Pratinjau Rekap"
                    >
                      <Eye className="w-3 h-3 text-cyan-400" />
                      <span>Rekap</span>
                    </button>

                    {/* Proteksi Tombol Edit */}
                    {canModify ? (
                      <button
                        type="button"
                        onClick={() => {
                          onEditReport(report);
                          onClose();
                        }}
                        className="py-1 px-1.5 rounded bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 flex items-center justify-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer"
                        title={isAdmin ? "Sunting Data Laporan (Akses Penuh Admin)" : "Sunting & Edit Data Laporan Anda"}
                      >
                        <Edit3 className="w-3 h-3 text-amber-400" />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="py-1 px-1.5 rounded bg-slate-900/90 border border-slate-800 text-slate-600 flex items-center justify-center gap-1 text-[10px] font-semibold cursor-not-allowed opacity-60"
                        title={`Edit Terkunci: Dibuat oleh ${author || 'user lain'}. Hanya pembuat atau Admin yang berhak mengedit.`}
                      >
                        <Lock className="w-3 h-3 text-slate-600" />
                        <span>Terkunci</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => shareToWhatsApp(report)}
                      className="py-1 px-1.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-1 text-[10px] font-semibold transition-colors"
                      title="Bagikan Laporan via WhatsApp"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      <span>Kirim WA</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-[#060c18] border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono-cyber">
          Sistem Monitoring Harian GOV Network
        </div>
      </div>
    </div>
  );
};

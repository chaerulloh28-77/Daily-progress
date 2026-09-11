import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Eye, 
  Trash2, 
  Clock, 
  MessageSquare, 
  Edit3, 
  Lock, 
  User, 
  Cloud, 
  Paperclip,
  Search,
  Filter,
  ArrowLeft,
  Shield,
  Building
} from 'lucide-react';
import { DailyReportFormData, CurrentUser } from '../types';
import { shareToWhatsApp, calculateTotals } from '../utils/whatsapp';

interface SavedReportsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reports: DailyReportFormData[];
  currentUser: CurrentUser;
  onSelectReport: (report: DailyReportFormData) => void;
  onEditReport: (report: DailyReportFormData) => void;
  onDeleteReport: (reportId: string) => void;
  onNewReport?: () => void;
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<string>('all');

  const filteredReports = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return reports.filter((r) => {
      const matchQuery = !q || 
        (r.projectName && r.projectName.toLowerCase().includes(q)) ||
        (r.projectId && r.projectId.toLowerCase().includes(q)) ||
        (r.jenisPengamanan && r.jenisPengamanan.toLowerCase().includes(q)) ||
        (r.waspangName && r.waspangName.toLowerCase().includes(q)) ||
        (r.reportDate && r.reportDate.toLowerCase().includes(q)) ||
        (r.authorEmail && r.authorEmail.toLowerCase().includes(q)) ||
        (r.kendalaLapangan && r.kendalaLapangan.toLowerCase().includes(q));

      const matchArea = areaFilter === 'all' || r.area === areaFilter;
      return matchQuery && matchArea;
    });
  }, [reports, searchQuery, areaFilter]);

  if (!isOpen) return null;

  const handleDelete = (reportId: string) => {
    onDeleteReport(reportId);
    setDeleteConfirmId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm sm:max-w-md h-full bg-[#080f1e] border-l border-cyan-500/30 flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-[#060c18]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1 -ml-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
              title="Kembali ke formulir laporan"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-cyber text-slate-200">Kembali</span>
            </button>
            <div className="h-4 w-px bg-slate-700 mx-0.5" />
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-cyber font-bold text-xs sm:text-sm text-white uppercase tracking-wider truncate">
              Riwayat ({reports.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup Riwayat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar & Search */}
        <div className="p-3 bg-[#050b14] border-b border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-cyber text-slate-400 font-semibold">
              Riwayat & Arsip Laporan
            </span>
            <span className="text-[10px] font-mono-cyber text-slate-500">
              Total: {reports.length} laporan
            </span>
          </div>

          {/* Search Box & Area Filter */}
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari project, waspang, tanggal..."
                className="w-full bg-[#081022] border border-slate-700/80 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-100 font-mono-cyber placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="bg-[#081022] border border-slate-700/80 rounded-lg px-2 py-1 text-[11px] font-mono-cyber text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="all">Semua Area</option>
              <option value="Jabo 1">Jabo 1</option>
              <option value="Jabo 2">Jabo 2</option>
              <option value="Jabo 3">Jabo 3</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
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
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <p className="text-xs font-bold text-slate-400 font-cyber">
                Tidak ada laporan yang cocok
              </p>
              <p className="text-[11px] text-slate-500">
                Pencarian "{searchQuery}" tidak menemukan laporan.
              </p>
            </div>
          ) : (
            filteredReports.map((report, idx) => {
              const reportId = report.id || `rep-${idx}`;
              const author = report.authorEmail || '';
              const isOwner = !!(currentUser?.email && author && currentUser.email.toLowerCase() === author.toLowerCase());
              const isAdmin = currentUser?.role === 'admin';
              const canModify = isAdmin || isOwner || !author;

              return (
                <div
                  key={reportId}
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
                        {(report.projectCategory === 'Pengamanan' || report.projectName?.toLowerCase().includes('pengamanan')) ? (
                          <span className="text-[9px] font-mono-cyber px-1.5 py-0.2 rounded bg-amber-950/90 border border-amber-500/50 text-amber-300 font-semibold flex items-center gap-0.5">
                            <Shield className="w-2.5 h-2.5 text-amber-400" />
                            <span>Pengamanan</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono-cyber px-1.5 py-0.2 rounded bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-semibold flex items-center gap-0.5">
                            <Building className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Relokasi Gov</span>
                          </span>
                        )}
                        <span className="font-cyber font-bold text-white text-xs">
                          {report.projectName || 'Project Tanpa Nama'}
                        </span>
                        {report.jenisPengamanan && (
                          <span className="text-[9px] font-mono-cyber px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 font-semibold">
                            {report.jenisPengamanan}
                          </span>
                        )}
                        {report.area && (
                          <span className="text-[10px] font-mono-cyber px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-semibold">
                            {report.area}
                          </span>
                        )}
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
                        onClick={() => setDeleteConfirmId(reportId)}
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
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 py-1.5 px-2 rounded-lg bg-[#070e1c] border border-slate-800/60 font-mono-cyber text-[10px] sm:text-[11px]">
                        <div className="text-slate-400">
                          Sipil: <span className="text-white font-semibold">{report.totalProgressSipil || 0}m</span>
                        </div>
                        <div className="text-slate-400">
                          Kabel: <span className="text-emerald-400 font-semibold">{report.totalProgressKabel || 0}m</span>
                        </div>
                        <div className="text-slate-400">
                          Coax: <span className="text-blue-300 font-semibold">{report.totalProgressKabelCoax || report.pulling?.pullingCoax || 0}m</span>
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
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono-cyber">
                      <span>Tersimpan: {report.submittedAt}</span>
                      {report.attachments && report.attachments.length > 0 && (
                        <span className="text-cyan-400 flex items-center gap-1">
                          <Paperclip className="w-2.5 h-2.5" />
                          <span>{report.attachments.length} Dokumen/Foto</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Delete confirm inline */}
                  {deleteConfirmId === reportId && (
                    <div className="p-2 rounded bg-red-950/90 border border-red-500/80 text-[11px] flex items-center justify-between gap-1 animate-fadeIn">
                      <span className="text-red-200">Hapus laporan ini secara permanen?</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(reportId)}
                          className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Ya, Hapus
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
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
                      className="py-1.5 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center justify-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer"
                      title="Lihat Pratinjau Rekap Lengkap"
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
                        className="py-1.5 px-1.5 rounded bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 flex items-center justify-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer"
                        title={isAdmin ? "Sunting Data Laporan (Akses Penuh Admin)" : "Sunting & Edit Data Laporan Anda"}
                      >
                        <Edit3 className="w-3 h-3 text-amber-400" />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="py-1.5 px-1.5 rounded bg-slate-900/90 border border-slate-800 text-slate-600 flex items-center justify-center gap-1 text-[10px] font-semibold cursor-not-allowed opacity-60"
                        title={`Edit Terkunci: Dibuat oleh ${author || 'user lain'}. Hanya pembuat atau Admin yang berhak mengedit.`}
                      >
                        <Lock className="w-3 h-3 text-slate-600" />
                        <span>Terkunci</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        shareToWhatsApp(report);
                        setTimeout(() => onClose(), 600);
                      }}
                      className="py-1.5 px-1.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer"
                      title="Bagikan Laporan via WhatsApp & kembali ke tampilan form"
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

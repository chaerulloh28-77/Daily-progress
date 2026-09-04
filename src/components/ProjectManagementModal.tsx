import React, { useState } from 'react';
import { 
  X, 
  FolderPlus, 
  Building2, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  Check, 
  Plus, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  User,
  Layers,
  Clock
} from 'lucide-react';
import { ProjectItem } from '../types';

interface ProjectManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectItem[];
  onAddProject: (project: ProjectItem) => void;
  onUpdateProject: (project: ProjectItem) => void;
  onDeleteProject: (projectId: string) => void;
  onSelectProjectForForm: (project: ProjectItem) => void;
}

export const ProjectManagementModal: React.FC<ProjectManagementModalProps> = ({
  isOpen,
  onClose,
  projects,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onSelectProjectForForm,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [durasiPekerjaan, setDurasiPekerjaan] = useState('30');
  const [targetSipil, setTargetSipil] = useState('');
  const [targetKabel, setTargetKabel] = useState('');
  const [pic, setPic] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Confirm delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setCode('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setDurasiPekerjaan('30');
    setTargetSipil('');
    setTargetKabel('');
    setPic('');
    setError(null);
    setEditingProjectId(null);
    setIsFormOpen(false);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleStartEdit = (proj: ProjectItem) => {
    setName(proj.name || '');
    setCode(proj.code || '');
    setLocation(proj.location || '');
    setStartDate(proj.startDate || '');
    setEndDate(proj.endDate || '');
    setDurasiPekerjaan(proj.durasiPekerjaan || '30');
    setTargetSipil(proj.targetSipil || '');
    setTargetKabel(proj.targetKabel || '');
    setPic(proj.pic || '');
    setError(null);
    setEditingProjectId(proj.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama Project wajib diisi.');
      return;
    }

    if (editingProjectId) {
      // Update existing
      const updated: ProjectItem = {
        id: editingProjectId,
        name: name.trim(),
        code: code.trim() || undefined,
        location: location.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        durasiPekerjaan: durasiPekerjaan || '30',
        totalDurasi: durasiPekerjaan || '30',
        targetSipil: targetSipil || undefined,
        targetKabel: targetKabel || undefined,
        pic: pic.trim() || undefined,
      };
      onUpdateProject(updated);
    } else {
      // Create new
      const newProject: ProjectItem = {
        id: 'PRJ-' + Date.now().toString(36).toUpperCase(),
        name: name.trim(),
        code: code.trim() || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
        location: location.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        durasiPekerjaan: durasiPekerjaan || '30',
        totalDurasi: durasiPekerjaan || '30',
        targetSipil: targetSipil || undefined,
        targetKabel: targetKabel || undefined,
        pic: pic.trim() || undefined,
        createdAt: new Date().toLocaleDateString('id-ID'),
      };
      onAddProject(newProject);
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    onDeleteProject(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#091224] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-black/80 flex flex-col my-auto max-h-[92vh] overflow-hidden animate-fadeIn">
        
        {/* Top Glowing Ribbon */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 pb-3 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#070e1c]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-cyber text-white tracking-wide">
                Kelola Data Project
              </h2>
              <p className="text-[11px] text-slate-400 font-mono-cyber">
                CRUD Manajemen Project Jaringan Lapangan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Subheader button: Tambah Project Baru */}
          {!isFormOpen && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono-cyber text-slate-400">
                Total Project: <strong className="text-cyan-300">{projects.length}</strong>
              </span>
              <button
                type="button"
                onClick={handleStartAdd}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-cyber text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Project Baru</span>
              </button>
            </div>
          )}

          {/* Form Create / Edit Project */}
          {isFormOpen && (
            <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-[#050b14] border border-cyan-500/30 space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-cyber font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4" />
                  {editingProjectId ? 'Edit Data Project' : 'Form Tambah Project Baru'}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[11px] text-slate-400 hover:text-red-400 font-mono-cyber"
                >
                  Batal
                </button>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500 text-red-200 text-xs">
                  {error}
                </div>
              )}

              {/* Input Nama Project */}
              <div>
                <label className="block text-xs font-mono-cyber text-slate-300 mb-1">
                  Nama Project <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: FO Backbone Jalur Pantura Segmen 1"
                  className="w-full bg-[#091224] border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none font-mono-cyber"
                />
              </div>

              {/* Input Kode & Lokasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-cyber text-slate-300 mb-1">
                    Kode / ID Project (Opsional)
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Misal: PRJ-FIBER-01"
                    className="w-full bg-[#091224] border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs font-mono-cyber text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-cyber text-slate-300 mb-1">
                    Lokasi Project
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Kota / Wilayah Project"
                    className="w-full bg-[#091224] border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs font-mono-cyber text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Input Tanggal Mulai & Selesai */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono-cyber text-slate-300 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>Target Tanggal Mulai</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#091224] border border-slate-700 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-xs font-mono-cyber text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono-cyber text-slate-300 mb-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Durasi Pekerjaan (Hari)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={durasiPekerjaan}
                    onChange={(e) => setDurasiPekerjaan(e.target.value)}
                    placeholder="Misal: 30"
                    className="w-full bg-[#091224] border border-slate-700 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-xs font-mono-cyber text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Target Sipil & Target Kabel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-cyber text-slate-300 mb-1">
                    Target Sipil (m)
                  </label>
                  <input
                    type="number"
                    value={targetSipil}
                    onChange={(e) => setTargetSipil(e.target.value)}
                    placeholder="Misal: 5000"
                    className="w-full bg-[#091224] border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs font-mono-cyber text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-cyber text-slate-300 mb-1">
                    Target Kabel (m)
                  </label>
                  <input
                    type="number"
                    value={targetKabel}
                    onChange={(e) => setTargetKabel(e.target.value)}
                    placeholder="Misal: 8000"
                    className="w-full bg-[#091224] border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs font-mono-cyber text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* PIC / Pengawas (Waspang) */}
              <div>
                <label className="block text-xs font-mono-cyber text-slate-300 mb-1">
                  Waspang / PIC Project
                </label>
                <input
                  type="text"
                  value={pic}
                  onChange={(e) => setPic(e.target.value)}
                  placeholder="Nama Waspang / PIC Project"
                  className="w-full bg-[#091224] border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs font-mono-cyber text-white focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono-cyber transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-cyber text-xs shadow-md transition-colors"
                >
                  {editingProjectId ? 'Simpan Perubahan' : 'Simpan Project Baru'}
                </button>
              </div>
            </form>
          )}

          {/* Project List */}
          <div className="space-y-3">
            {projects.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#050b14] border border-dashed border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-300 font-cyber">
                    Data Project Masih Kosong
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Semua data bawaan telah dikosongkan. Anda dapat mengetikkan nama project langsung pada form harian, atau klik tombol di bawah untuk membuat master project baru.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 font-cyber font-bold text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Project Baru Sekarang</span>
                </button>
              </div>
            ) : (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-3.5 rounded-xl bg-[#050b14] border border-slate-800 hover:border-cyan-500/40 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {proj.code && (
                          <span className="text-[10px] font-mono-cyber font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                            {proj.code}
                          </span>
                        )}
                        <h4 className="text-xs sm:text-sm font-bold text-white font-cyber">
                          {proj.name}
                        </h4>
                      </div>
                      {proj.location && (
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono-cyber">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{proj.location}</span>
                        </p>
                      )}
                    </div>

                    {/* Actions: Edit & Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(proj)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors"
                        title="Edit Project"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(proj.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/50 transition-colors"
                        title="Hapus Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Dates & targets */}
                  {(proj.startDate || proj.durasiPekerjaan || proj.endDate || proj.targetSipil || proj.targetKabel) && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono-cyber text-slate-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">
                          Durasi: <span className="text-slate-200">{proj.durasiPekerjaan ? `${proj.durasiPekerjaan} Hari` : (proj.endDate ? `s/d ${proj.endDate}` : '-')}</span>
                        </span>
                      </div>
                      <div className="text-right truncate">
                        Target: <span className="text-cyan-400">{proj.targetSipil ? `${proj.targetSipil}m Sipil` : ''}</span>
                        {proj.targetKabel && <span className="text-emerald-400 ml-1">/ {proj.targetKabel}m Kabel</span>}
                      </div>
                    </div>
                  )}

                  {/* Confirmation modal / bar for delete */}
                  {deleteConfirmId === proj.id && (
                    <div className="p-2.5 rounded-lg bg-red-950/90 border border-red-500/70 text-xs flex items-center justify-between gap-2 animate-fadeIn">
                      <span className="text-red-200 text-[11px]">
                        Hapus project ini secara permanen?
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDelete(proj.id)}
                          className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[11px]"
                        >
                          Ya, Hapus
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px]"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Fast select for form */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProjectForForm(proj);
                        onClose();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-cyan-950 hover:border-cyan-500/50 border border-slate-700/60 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Pilih untuk Form Laporan Harian</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#070e1c] border-t border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono-cyber font-medium"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Trash2, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ReportAttachment } from '../types';
import { uploadReportAttachment } from '../services/firebase';

interface AttachmentUploaderProps {
  attachments: ReportAttachment[];
  onChange: (attachments: ReportAttachment[]) => void;
  maxFiles?: number;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  attachments = [],
  onChange,
  maxFiles = 8,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<ReportAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const availableSlots = maxFiles - attachments.length;
    if (availableSlots <= 0) {
      setErrorMessage(`Kapasitas maksimum ${maxFiles} lampiran sudah tercapai.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    setIsUploading(true);

    try {
      const newUploadedList: ReportAttachment[] = [];
      for (const file of filesToUpload) {
        // Enforce 10MB limit per file
        if (file.size > 10 * 1024 * 1024) {
          setErrorMessage(`Berkas ${file.name} melebihi batas 10MB.`);
          continue;
        }
        const uploaded = await uploadReportAttachment(file);
        newUploadedList.push(uploaded);
      }

      onChange([...attachments, ...newUploadedList]);
    } catch (err) {
      console.error('Error uploading file:', err);
      setErrorMessage('Terjadi kendala saat mengunggah lampiran ke Cloud Storage.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (id: string) => {
    onChange(attachments.filter((item) => item.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-[#091224] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 mb-8 shadow-xl shadow-cyan-950/20">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-cyan-400" />
          <h3 className="font-cyber font-bold text-sm text-white uppercase tracking-wide">
            Lampiran Berkas & Foto Lapangan (Cloud Storage)
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono-cyber">
          <span>{attachments.length}/{maxFiles} Slot Terisi</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3 font-sans leading-relaxed">
        Unggah berkas bukti pendukung progres & kendala teknis (Format: <strong className="text-slate-200">Foto JPEG/PNG</strong> atau <strong className="text-slate-200">Dokumen PDF</strong>). Tersimpan di Cloud Storage dan otomatis tersinkronisasi saat laporan dibuka di laptop atau HP lain.
      </p>

      {errorMessage && (
        <div className="mb-3 p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      {attachments.length < maxFiles && (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isUploading) handleFileSelect(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-all ${
            isUploading 
              ? 'border-cyan-500/60 bg-cyan-950/20 cursor-wait' 
              : 'border-slate-700 hover:border-cyan-400 bg-[#050b14]/70 hover:bg-[#071120]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-2">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
              <span className="text-xs font-mono-cyber text-cyan-300">Mengunggah file ke Cloud Storage...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mb-2">
                <UploadCloud className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-xs font-semibold text-slate-200 mb-1">
                Ketuk untuk memilih atau tarik file ke sini
              </p>
              <p className="text-[11px] font-mono-cyber text-slate-400">
                Maksimal 8 dokumen (Foto Dokumentasi / PDF) • Hingga 10MB/berkas
              </p>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Files Grid */}
      {attachments.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {attachments.map((file, idx) => (
            <div
              key={file.id || idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#050b14] border border-slate-700/80 hover:border-slate-600 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Thumbnail / Icon */}
                <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {file.type === 'image' && file.url ? (
                    <img 
                      src={file.url} 
                      alt={file.name} 
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setPreviewItem(file)}
                    />
                  ) : file.type === 'pdf' ? (
                    <FileText className="w-5 h-5 text-red-400" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-cyan-400" />
                  )}
                </div>

                {/* File Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200 truncate block">
                      {file.name}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Tersimpan di Cloud" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono-cyber text-slate-400 mt-0.5">
                    <span className="uppercase">{file.type}</span>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {file.url && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                    title="Buka / Unduh Berkas"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(file.id)}
                  className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 transition-colors cursor-pointer"
                  title="Hapus Lampiran"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewItem && previewItem.type === 'image' && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <img 
              src={previewItem.url} 
              alt={previewItem.name} 
              className="max-h-[80vh] w-auto max-w-full rounded-lg shadow-2xl object-contain" 
            />
            <p className="mt-3 text-xs text-slate-300 font-mono-cyber text-center">
              {previewItem.name} ({formatFileSize(previewItem.size)})
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

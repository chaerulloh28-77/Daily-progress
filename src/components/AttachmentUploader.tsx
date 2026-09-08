import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Zap, 
  RefreshCw,
  Plus,
  Camera,
  FolderOpen,
  Sparkles
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { ReportAttachment } from '../types';
import { uploadReportAttachment } from '../services/firebase';

interface AttachmentUploaderProps {
  attachments: ReportAttachment[];
  onChange: (attachments: ReportAttachment[]) => void;
  maxFiles?: number;
}

interface ActiveUploadItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  compressedSize?: number;
  compressionRatio?: string;
  type: 'image' | 'pdf' | 'document';
  previewUrl?: string;
  progress: number;
  status: 'compressing' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  resultAttachment?: ReportAttachment;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  attachments = [],
  onChange,
  maxFiles = 8,
}) => {
  const [activeUploads, setActiveUploads] = useState<ActiveUploadItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<{ name: string; url: string; size?: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Track created object URLs so we can revoke them on unmount
  const objectUrlsRef = useRef<string[]>([]);
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      });
    };
  }, []);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /**
   * Kompresi gambar otomatis super cepat:
   * - Foto <= 350KB langsung dilewati (0ms latency, instan)
   * - Foto > 350KB dikompresi dengan Web Worker (1280px, max 0.8MB) tanpa membekukan antarmuka HP
   */
  const compressImage = async (file: File): Promise<{
    compressedFile: File;
    originalSize: number;
    compressedSize: number;
    ratio: string;
  }> => {
    const originalSize = file.size;
    if (!file.type.startsWith('image/')) {
      return {
        compressedFile: file,
        originalSize,
        compressedSize: originalSize,
        ratio: '0%',
      };
    }

    // Bypass kompresi jika berkas sudah sangat ringan (<= 350KB) untuk pengiriman instan
    if (file.size <= 350 * 1024) {
      return {
        compressedFile: file,
        originalSize,
        compressedSize: originalSize,
        ratio: '0%',
      };
    }

    try {
      const options = {
        maxSizeMB: 0.8, // Target maksimal ~800KB untuk transmisi kilat
        maxWidthOrHeight: 1280, // 1280px sangat jernih untuk kabel & tiang, 4x lebih cepat
        useWebWorker: true, // Non-blocking thread
        initialQuality: 0.82,
      };

      const compressedBlob = await imageCompression(file, options);
      const compressedSize = compressedBlob.size;
      const savings = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));
      
      const compressedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type || 'image/jpeg',
        lastModified: Date.now(),
      });

      return {
        compressedFile,
        originalSize,
        compressedSize,
        ratio: savings > 0 ? `-${savings}%` : '0%',
      };
    } catch (err) {
      console.warn('Kompresi web worker dialihkan ke metode sinkron:', err);
      try {
        const fallbackOptions = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1280,
          useWebWorker: false,
          initialQuality: 0.8,
        };
        const compressedBlob = await imageCompression(file, fallbackOptions);
        const compressedSize = compressedBlob.size;
        const savings = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));
        const compressedFile = new File([compressedBlob], file.name, {
          type: compressedBlob.type || 'image/jpeg',
          lastModified: Date.now(),
        });
        return {
          compressedFile,
          originalSize,
          compressedSize,
          ratio: savings > 0 ? `-${savings}%` : '0%',
        };
      } catch (fallbackErr) {
        console.warn('Kompresi gagal, menggunakan berkas asli:', fallbackErr);
        return {
          compressedFile: file,
          originalSize,
          compressedSize: originalSize,
          ratio: '0%',
        };
      }
    }
  };

  /**
   * Penanganan pemilihan berkas dengan:
   * 1. Pembatasan ukuran & ekstensi
   * 2. Pratinjau instan (URL.createObjectURL)
   * 3. Unggahan paralel (Promise.all)
   * 4. Kompresi gambar otomatis
   * 5. Resumable Upload dengan indikator progres real-time per file
   */
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const availableSlots = maxFiles - attachments.length - activeUploads.length;
    if (availableSlots <= 0) {
      setErrorMessage(`Kapasitas maksimum ${maxFiles} slot lampiran sudah penuh.`);
      return;
    }

    const selectedFiles = Array.from(files).slice(0, availableSlots);

    // Filter ukuran maksimal awal (15MB untuk foto, 10MB untuk PDF)
    const validFiles: File[] = [];
    for (const f of selectedFiles) {
      const isImg = f.type.startsWith('image/');
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');

      if (!isImg && !isPdf) {
        setErrorMessage(`Format berkas ${f.name} tidak didukung. Harap gunakan Foto (JPEG/PNG) atau PDF.`);
        continue;
      }

      if (isImg && f.size > 15 * 1024 * 1024) {
        setErrorMessage(`Foto ${f.name} melebihi batas awal 15MB.`);
        continue;
      }

      if (isPdf && f.size > 10 * 1024 * 1024) {
        setErrorMessage(`Dokumen PDF ${f.name} melebihi batas 10MB.`);
        continue;
      }

      validFiles.push(f);
    }

    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Buat item Optimistic UI dengan URL.createObjectURL() seketika
    const newActiveItems: ActiveUploadItem[] = validFiles.map((file) => {
      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const isImg = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      
      let objectUrl: string | undefined = undefined;
      if (isImg) {
        try {
          objectUrl = URL.createObjectURL(file);
          objectUrlsRef.current.push(objectUrl);
        } catch (e) {
          console.warn('Gagal membuat objectURL:', e);
        }
      }

      return {
        id: uploadId,
        file,
        name: file.name,
        originalSize: file.size,
        type: isImg ? 'image' : isPdf ? 'pdf' : 'document',
        previewUrl: objectUrl,
        progress: 0,
        status: isImg ? 'compressing' : 'uploading',
      };
    });

    setActiveUploads((prev) => [...prev, ...newActiveItems]);

    // Eksekusi paralel menggunakan Promise.all()
    const uploadPromises = newActiveItems.map(async (item) => {
      try {
        let fileToSend = item.file;
        let originalSize = item.originalSize;
        let compressedSize = item.originalSize;
        let compressionRatio = '0%';

        // 1. Kompresi gambar otomatis (hanya jika berkas berupa foto)
        if (item.type === 'image') {
          setActiveUploads((prev) =>
            prev.map((u) => (u.id === item.id ? { ...u, status: 'compressing', progress: 10 } : u))
          );

          const compressResult = await compressImage(item.file);
          fileToSend = compressResult.compressedFile;
          originalSize = compressResult.originalSize;
          compressedSize = compressResult.compressedSize;
          compressionRatio = compressResult.ratio;

          setActiveUploads((prev) =>
            prev.map((u) =>
              u.id === item.id
                ? {
                    ...u,
                    status: 'uploading',
                    progress: 25,
                    compressedSize,
                    compressionRatio,
                  }
                : u
            )
          );
        } else {
          setActiveUploads((prev) =>
            prev.map((u) => (u.id === item.id ? { ...u, status: 'uploading', progress: 15 } : u))
          );
        }

        // 2. Unggah Resumable ke Firebase Storage dengan listener persentase real-time
        const uploaded = await uploadReportAttachment(fileToSend, (realtimeProgress) => {
          setActiveUploads((prev) =>
            prev.map((u) =>
              u.id === item.id
                ? {
                    ...u,
                    progress: Math.max(u.progress, realtimeProgress),
                    status: realtimeProgress >= 100 ? 'completed' : 'uploading',
                  }
                : u
            )
          );
        });

        const completedAttachment: ReportAttachment = {
          ...uploaded,
          originalSize,
          compressedSize,
          compressionRatio,
          status: 'completed',
          uploadProgress: 100,
        };

        // Tandai item berhasil pada active uploads
        setActiveUploads((prev) =>
          prev.map((u) =>
            u.id === item.id
              ? {
                  ...u,
                  status: 'completed',
                  progress: 100,
                  resultAttachment: completedAttachment,
                }
              : u
          )
        );

        return completedAttachment;
      } catch (err) {
        console.error(`Gagal mengunggah ${item.name}:`, err);
        setActiveUploads((prev) =>
          prev.map((u) =>
            u.id === item.id
              ? {
                  ...u,
                  status: 'error',
                  progress: 0,
                  errorMessage: 'Gagal mengirim berkas',
                }
              : u
          )
        );
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulAttachments = results.filter((r): r is ReportAttachment => r !== null);

      if (successfulAttachments.length > 0) {
        onChange([...attachments, ...successfulAttachments]);
      }

      // Bersihkan item yang berhasil dari activeUploads dengan cepat (250ms)
      setTimeout(() => {
        setActiveUploads((prev) => prev.filter((u) => u.status === 'error'));
      }, 250);
    } catch (parallelErr) {
      console.error('Error in parallel uploads:', parallelErr);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  const handleRemoveExisting = (id: string) => {
    onChange(attachments.filter((item) => item.id !== id));
  };

  const handleCancelActiveUpload = (id: string) => {
    setActiveUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const totalUsedSlots = attachments.length + activeUploads.length;
  const isAnyUploading = activeUploads.some((u) => u.status === 'compressing' || u.status === 'uploading');

  return (
    <div className="bg-[#091224] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 mb-8 shadow-xl shadow-cyan-950/20">
      {/* Hidden File & Camera Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-cyber font-bold text-sm text-white uppercase tracking-wide flex items-center gap-2">
              <span>Lampiran Berkas & Foto Lapangan</span>
              <span className="text-[10px] font-mono-cyber font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Turbo Resumable
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono-cyber">
              Kompresi otomatis kilat &bull; Kamera langsung &bull; Unggah paralel
            </p>
          </div>
        </div>

        {/* Slot Counter Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono-cyber">
          <span>{totalUsedSlots}/{maxFiles} Slot Terisi</span>
          {isAnyUploading && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping ml-1" />
          )}
        </div>
      </div>

      {/* Tombol Cepat Pengunggahan Lapangan (Mobile First Direct Actions) */}
      {totalUsedSlots < maxFiles && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 text-white font-cyber font-bold text-xs shadow-lg shadow-emerald-950/40 border border-emerald-400/40 cursor-pointer active:scale-98 transition-all"
          >
            <Camera className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>Foto Kamera Langsung (HP)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-cyan-600/90 to-blue-600/90 hover:from-cyan-500 hover:to-blue-500 text-white font-cyber font-bold text-xs shadow-lg shadow-cyan-950/40 border border-cyan-400/40 cursor-pointer active:scale-98 transition-all"
          >
            <FolderOpen className="w-4 h-4 text-cyan-200 shrink-0" />
            <span>Pilih Berkas Galeri / PDF</span>
          </button>
        </div>
      )}

      {/* Info Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4 p-3 rounded-xl bg-[#050b14] border border-slate-800 text-[11px] text-slate-400 font-sans">
        <div className="flex items-start gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span><strong>Kompresi Turbo:</strong> Cepat &le;0.5 detik, hemat kuota lapangan tanpa mengurangi ketajaman kabel.</span>
        </div>
        <div className="flex items-start gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span><strong>Multi-File Paralel:</strong> Unggah banyak foto secara serentak bersamaan via Promise.all().</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <span><strong>Resumable Storage:</strong> Aman saat sinyal HP drop, otomatis lanjut tanpa ulang dari awal.</span>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2.5 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      {totalUsedSlots < maxFiles && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFileSelect(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-[#050b14]/70 hover:bg-[#071120] rounded-xl p-4 text-center cursor-pointer transition-all mb-4 group"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-cyan-950/60 border border-cyan-500/30 group-hover:border-cyan-400 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110">
              <UploadCloud className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-xs font-semibold text-slate-200 mb-0.5">
              Ketuk untuk memilih berkas atau seret foto/PDF ke sini
            </p>
            <p className="text-[11px] font-mono-cyber text-slate-400">
              Tersisa {maxFiles - totalUsedSlots} slot &bull; JPEG/PNG &bull; PDF maks 10MB
            </p>
          </div>
        </div>
      )}

      {/* Grid Slot Lampiran (8 Slot Visual Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Item yang sedang diunggah secara aktif (Optimistic UI & Real-Time Progress Bar) */}
        {activeUploads.map((item) => (
          <div
            key={item.id}
            className="relative rounded-xl bg-[#050b14] border border-cyan-500/50 p-3 flex flex-col justify-between overflow-hidden shadow-lg shadow-cyan-950/30"
          >
            {/* Visual Progress Bar di atas kartu */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(5, item.progress))}%` }}
              />
            </div>

            <div className="flex items-start gap-2.5 mb-2 mt-1">
              {/* Thumbnail Instan */}
              <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 relative">
                {item.type === 'image' && item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : item.type === 'pdf' ? (
                  <FileText className="w-6 h-6 text-red-400" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-cyan-400" />
                )}

                {item.status !== 'completed' && item.status !== 'error' && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Detail nama & status */}
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-200 truncate block">
                  {item.name}
                </span>

                {/* Status upload & persentase */}
                <div className="flex items-center gap-1 text-[10px] font-mono-cyber mt-0.5">
                  {item.status === 'compressing' && (
                    <span className="text-amber-300 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Mengompresi...
                    </span>
                  )}
                  {item.status === 'uploading' && (
                    <span className="text-cyan-300 flex items-center gap-1 font-bold">
                      Mengunggah {item.progress}%
                    </span>
                  )}
                  {item.status === 'completed' && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Berhasil
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {item.errorMessage || 'Gagal'}
                    </span>
                  )}
                </div>

                {/* Kompresi info */}
                <div className="text-[10px] font-mono-cyber text-slate-400 mt-0.5">
                  {item.compressedSize ? (
                    <span className="text-emerald-300/90 font-medium">
                      {formatFileSize(item.originalSize)} &rarr; {formatFileSize(item.compressedSize)} ({item.compressionRatio})
                    </span>
                  ) : (
                    <span>{formatFileSize(item.originalSize)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar & Persentase Individual */}
            <div className="space-y-1 mt-1">
              <div className="flex justify-between text-[10px] font-mono-cyber text-slate-400">
                <span>Progres Slot</span>
                <span className="text-cyan-300 font-bold">{item.progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ease-out ${
                    item.status === 'error' 
                      ? 'bg-red-500' 
                      : item.status === 'completed' 
                        ? 'bg-emerald-400' 
                        : 'bg-cyan-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, item.progress))}%` }}
                />
              </div>
            </div>

            {item.status === 'error' && (
              <button
                type="button"
                onClick={() => handleCancelActiveUpload(item.id)}
                className="mt-2 text-[10px] text-red-300 hover:text-red-200 underline font-mono-cyber"
              >
                Hapus & Coba Lagi
              </button>
            )}
          </div>
        ))}

        {/* 2. Item yang sudah berhasil tersimpan (Permanent Attachment) */}
        {attachments.map((file, idx) => (
          <div
            key={file.id || idx}
            className="rounded-xl bg-[#050b14] border border-slate-700/80 hover:border-cyan-500/40 p-3 flex flex-col justify-between transition-colors group"
          >
            <div className="flex items-start gap-2.5 mb-2">
              {/* Thumbnail / Icon */}
              <div 
                onClick={() => file.type === 'image' && file.url && setPreviewItem({ name: file.name, url: file.url, size: file.size })}
                className="w-12 h-12 rounded-lg bg-slate-800/90 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              >
                {file.type === 'image' && (file.previewUrl || file.url) ? (
                  <img
                    src={file.previewUrl || file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : file.type === 'pdf' ? (
                  <FileText className="w-6 h-6 text-red-400" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-cyan-400" />
                )}
              </div>

              {/* Detail info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200 truncate block">
                    {file.name}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Tersimpan di Cloud" />
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono-cyber text-slate-400 mt-0.5">
                  <span className="uppercase text-slate-300">{file.type}</span>
                  <span>&bull;</span>
                  <span>{formatFileSize(file.compressedSize || file.size)}</span>
                </div>

                {file.compressionRatio && file.compressionRatio !== '0%' && (
                  <div className="text-[9px] font-mono-cyber text-emerald-400/90 mt-0.5">
                    Hemat {file.compressionRatio} (Web-Ready)
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-1">
              <span className="text-[9px] font-mono-cyber text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Siap Sinkron
              </span>

              <div className="flex items-center gap-1">
                {file.url && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                    title="Buka / Unduh Berkas"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveExisting(file.id)}
                  className="p-1 rounded-md bg-red-950/40 hover:bg-red-900/60 text-red-300 transition-colors"
                  title="Hapus Lampiran"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* 3. Slot Kosong Tersisa (Menunjukkan kapasitas 8 slot secara visual) */}
        {Array.from({ length: Math.max(0, maxFiles - totalUsedSlots) }).map((_, slotIdx) => (
          <div
            key={`empty_${slotIdx}`}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-dashed border-slate-800 hover:border-cyan-500/40 p-3 min-h-[105px] flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#050b14]/30 hover:bg-[#071120]/60 text-slate-600 hover:text-cyan-400"
            title="Tambah Lampiran Baru"
          >
            <Plus className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-mono-cyber uppercase tracking-wider">
              Slot {totalUsedSlots + slotIdx + 1} Kosong
            </span>
          </div>
        ))}
      </div>

      {/* Lightbox Modal Preview */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <img
              src={previewItem.url}
              alt={previewItem.name}
              className="max-h-[80vh] w-auto max-w-full rounded-lg shadow-2xl object-contain border border-slate-800"
            />
            <div className="mt-3 text-xs text-slate-300 font-mono-cyber text-center flex items-center gap-2">
              <span>{previewItem.name}</span>
              {previewItem.size && <span>&bull; {formatFileSize(previewItem.size)}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

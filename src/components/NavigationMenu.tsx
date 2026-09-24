import React, { useState } from 'react';

interface NavigationMenuProps {
  activeTab?: 'input' | 'admin';
  onTabChange?: (tab: 'input' | 'admin') => void;
  inputCategory?: 'relokasi' | 'pengamanan';
  onCategoryChange?: (cat: 'relokasi' | 'pengamanan') => void;
  children?: React.ReactNode;
}

export default function NavigationMenu({
  activeTab: controlledTab,
  onTabChange,
  inputCategory: controlledCategory,
  onCategoryChange,
  children,
}: NavigationMenuProps) {
  // State untuk Menu Utama (Uncontrolled fallback)
  const [internalTab, setInternalTab] = useState<'input' | 'admin'>('input');
  // State untuk Sub-Menu Kategori Input (Uncontrolled fallback)
  const [internalCategory, setInternalCategory] = useState<'relokasi' | 'pengamanan'>('relokasi');

  const activeTab = controlledTab ?? internalTab;
  const inputCategory = controlledCategory ?? internalCategory;

  const handleTabSelect = (tab: 'input' | 'admin') => {
    setInternalTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const handleCategorySelect = (cat: 'relokasi' | 'pengamanan') => {
    setInternalCategory(cat);
    if (onCategoryChange) {
      onCategoryChange(cat);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 bg-gray-950 font-sans">
      
      {/* 1. Navigasi Utama (Top Bar) */}
      <div className="flex bg-gray-900 p-1.5 rounded-xl border border-gray-800 shadow-lg">
        <button
          type="button"
          onClick={() => handleTabSelect('input')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
            activeTab === 'input' 
              ? 'bg-blue-900/50 text-blue-400 border border-blue-800/50 shadow-inner' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          <span>📝</span> Input Harian
        </button>
        <button
          type="button"
          onClick={() => handleTabSelect('admin')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
            activeTab === 'admin' 
              ? 'bg-orange-900/50 text-orange-400 border border-orange-800/50 shadow-inner' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          <span>📊</span> Admin Rekap
        </button>
      </div>

      {/* 2. Area Konten Dinamis */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-xl min-h-[500px]">
        
        {/* --- KONTEN INPUT HARIAN --- */}
        {activeTab === 'input' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* Sub-Menu Kategori Input */}
            <div className="flex flex-wrap gap-3 border-b border-gray-800 pb-5">
              <button
                type="button"
                onClick={() => handleCategorySelect('relokasi')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  inputCategory === 'relokasi'
                    ? 'bg-teal-500 text-gray-950 shadow-[0_0_15px_rgba(20,184,166,0.4)] font-bold'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <span>🔵</span> Relokasi Government
              </button>
              <button
                type="button"
                onClick={() => handleCategorySelect('pengamanan')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  inputCategory === 'pengamanan'
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] font-bold'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <span>🛡️</span> Pengamanan
              </button>
            </div>

            {/* Rendering Form Berdasarkan Kategori */}
            {children ? (
              <div className="pt-2">
                {children}
              </div>
            ) : (
              <div className="pt-2">
                {inputCategory === 'relokasi' ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <h3 className="text-lg font-semibold text-teal-400">Form Relokasi Government</h3>
                    <div className="p-4 border border-gray-800 border-dashed rounded-lg text-gray-500 text-sm">
                      <p>Memuat seksi: Identitas Project, Ringkasan Capaian Harian, Rincian Progres Sipil (Boring, Tiang, dll), Remarks, dan Isu Lapangan...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <h3 className="text-lg font-semibold text-blue-400">Form Pengamanan</h3>
                    <div className="p-4 border border-gray-800 border-dashed rounded-lg text-gray-500 text-sm">
                      <p>Memuat seksi: Informasi Titik, Opsi Jenis Pengamanan (Uditch, Jembatan, dll), Checklist Kalkulasi Item, dan Kendala...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* --- KONTEN ADMIN REKAP --- */}
        {activeTab === 'admin' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children ? (
              children
            ) : (
              <>
                <h3 className="text-lg font-semibold text-orange-400">Dashboard Rekap Mingguan</h3>
                <div className="p-4 border border-gray-800 border-dashed rounded-lg text-gray-500 text-sm">
                  <p>Memuat seksi: Filter Rentang Waktu, Filter Area (Jabo 1, dll), Ringkasan Kinerja Waspang, Diagram KPI, dan Ekspor WhatsApp...</p>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

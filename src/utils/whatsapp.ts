import { DailyReportFormData } from '../types';

export function calculateTotals(report: DailyReportFormData) {
  const sumValues = (obj: Record<string, string>) =>
    Object.values(obj).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);

  const totalBoring = sumValues(report.boring as unknown as Record<string, string>);
  const totalPulling = sumValues(report.pulling as unknown as Record<string, string>);
  const totalHH = sumValues(report.instalasiHH as unknown as Record<string, string>);
  const totalHB = sumValues(report.instalasiHB as unknown as Record<string, string>);
  const totalMH = sumValues(report.instalasiMH as unknown as Record<string, string>);
  const totalMB = sumValues(report.instalasiMB as unknown as Record<string, string>);
  const totalPit = totalHH + totalHB + totalMH + totalMB;

  return {
    totalBoring,
    totalPulling,
    totalHH,
    totalHB,
    totalMH,
    totalMB,
    totalPit,
  };
}

export function generateWhatsAppReportText(report: DailyReportFormData): string {
  const { totalBoring, totalPulling, totalHH, totalHB, totalMH, totalMB, totalPit } =
    calculateTotals(report);

  const dayInfo = report.dayNumber ? ` [Hari ke-${report.dayNumber}]` : '';

  const lines = [
    `*🚨 LAPORAN MONITORING HARIAN PROJECT 🚨*`,
    `*LINKNET & PMO MS CKT - Daily Progress*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ...(report.projectId ? [`🆔 *Project ID:* ${report.projectId}`] : []),
    `📌 *Nama Project:* ${report.projectName || 'Project Jaringan'}`,
    ...(report.projectCategory ? [`🏷️ *Kategori Project:* ${report.projectCategory}`] : []),
    ...(report.jenisPengamanan ? [`🛡️ *Jenis Pengamanan:* ${report.jenisPengamanan}`] : []),
    ...(report.subJenisPerapihanAsset && report.subJenisPerapihanAsset.length > 0
      ? [`   • *Rincian Perapihan:* ${report.subJenisPerapihanAsset.join(', ')}`]
      : []),
    ...(report.keteranganPengamanan ? [`   • *Catatan Pengamanan:* ${report.keteranganPengamanan}`] : []),
    ...(report.area ? [`📍 *Area:* ${report.area}`] : []),
    ...(report.waspangName ? [`👷 *Waspang (Pengawas):* ${report.waspangName}`] : []),
    `📅 *Tanggal:* ${report.reportDate}${dayInfo}`,
    `🌦️ *Kondisi Cuaca:* ${report.weatherCondition || '-'}`,
    report.durasiPekerjaan
      ? `⏱️ *Durasi Pekerjaan:* ${report.durasiPekerjaan} Hari (Start: ${report.startDate || '-'})`
      : `⏱️ *Periode Project:* ${report.startDate || '-'} s/d ${report.endDate || '-'}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `*📊 RINGKASAN PROGRES UTAMA:*`,
    `• Total Progres Sipil : *${report.totalProgressSipil || 0} Meter*`,
    `• Total Progres Kabel : *${report.totalProgressKabel || 0} Meter*`,
    `• Total Progres Coax  : *${report.totalProgressKabelCoax || report.pulling?.pullingCoax || 0} Meter*`,
    `• Total Handhole (HH) : *${report.totalProgressHH || totalHH} Pcs*`,
    `• Total Handbox (HB)  : *${report.totalProgressHB || totalHB} Pcs*`,
    `• Total Manhole (MH)  : *${report.totalProgressMH || totalMH} Pcs*`,
    ``,
    `*🛠️ RINCIAN PEKERJAAN HARIAN:*`,
    ``,
    `*1. Boring & Crossing (Total: ${totalBoring} m)*`,
    `   - Boring Alur: ${report.boring.boringAlur || 0} m`,
    `   - Crossing Jalan: ${report.boring.boringCrossingJalan || 0} m`,
    `   - Boring Akses: ${report.boring.boringAkses || report.boring.boringCrossingJalanTol || 0} m`,
    `   - Crossing Jembatan: ${report.boring.boringCrossingJembatan || 0} m`,
    ``,
    `*2. Penarikan Kabel / Pulling (Total: ${totalPulling} m)*`,
    `   - Kabel 288: ${report.pulling.pulling288 || 0} m`,
    `   - Kabel 288 GL: ${report.pulling.pulling288GL || 0} m`,
    `   - Kabel 144: ${report.pulling.pulling144 || 0} m`,
    `   - Kabel 96: ${report.pulling.pulling96 || 0} m`,
    `   - Kabel 96 GL: ${report.pulling.pulling96GL || 0} m`,
    `   - Kabel 48: ${report.pulling.pulling48 || 0} m`,
    `   - Kabel 24: ${report.pulling.pulling24 || 0} m`,
    `   - Kabel Coaxial: ${report.pulling?.pullingCoax || report.totalProgressKabelCoax || 0} m`,
    ``,
    `*3. Instalasi Pit (Total: ${totalPit} Pcs)*`,
    `   - Handhole (HH): ${totalHH} Pcs (60x60: ${report.instalasiHH.hh60x60 || 0}, 80x80: ${report.instalasiHH.hh80x80 || 0}, 100x100: ${report.instalasiHH.hh100x100 || 0}, 110x110: ${report.instalasiHH.hh110x110 || 0}, 120x120: ${report.instalasiHH.hh120x120 || 0})`,
    `   - Handbox (HB): ${totalHB} Pcs (60x60: ${report.instalasiHB.hb60x60 || 0}, 80x80: ${report.instalasiHB.hb80x80 || 0}, 100x100: ${report.instalasiHB.hb100x100 || 0}, 110x110: ${report.instalasiHB.hb110x110 || 0}, 120x120: ${report.instalasiHB.hb120x120 || 0})`,
    `   - Manhole (MH): ${totalMH} Pcs (80x80: ${report.instalasiMH.mh80x80 || 0}, 100x100: ${report.instalasiMH.mh100x100 || 0}, 110x110: ${report.instalasiMH.mh110x110 || 0}, 120x120: ${report.instalasiMH.mh120x120 || 0})`,
    `   - Manbox (MB): ${totalMB} Pcs (80x80: ${report.instalasiMB.mb80x80 || 0}, 100x100: ${report.instalasiMB.mb100x100 || 0}, 120x120: ${report.instalasiMB.mb120x120 || 0})`,
    ``,
    `*4. Tiang, Galvanis & HDPE*`,
    `   - Tiang Bersama: ${report.tiangGalvanisHDPE.tiangBersama || 0} Pcs`,
    `   - Galvanis 2": ${report.tiangGalvanisHDPE.galvanis2Inch || 0} m`,
    `   - Galvanis ATB (${report.tiangGalvanisHDPE.galvanisATBOption || 'Galv 4"'}): ${report.tiangGalvanisHDPE.galvanisATB ?? report.tiangGalvanisHDPE.galvanis4Inch ?? 0} m`,
    `   - Instal HDPE: ${report.tiangGalvanisHDPE.instalHDPE || 0} m`,
    ``,
    `*5. Dismantling (Bongkar)*`,
    `   - Dismantle Kabel: ${report.dismantling.dismantleKabel || 0} m`,
    `   - Dismantle Tiang: ${report.dismantling.dismantleTiang || 0} Pcs`,
    ...(report.remarks ? [``, `📝 *REMARKS:*`, `   ${report.remarks}`] : []),
    ``,
    `⚠️ *KENDALA / ISU LAPANGAN:*`,
    `${report.kendalaLapangan ? `"${report.kendalaLapangan}"` : 'Tidak ada kendala lapangan.'}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `_Designed by PAUL • Waktu Kirim: ${report.submittedAt || new Date().toLocaleString('id-ID')} WIB_`,
  ];

  return lines.join('\n');
}

export function shareToWhatsApp(report: DailyReportFormData, targetPhone?: string): void {
  const text = generateWhatsAppReportText(report);
  const encodedText = encodeURIComponent(text);

  let url = `https://api.whatsapp.com/send?text=${encodedText}`;

  if (targetPhone && targetPhone.trim()) {
    let cleaned = targetPhone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    url = `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodedText}`;
  }

  // Use a link element click for maximum browser/mobile compatibility
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface WaspangWeeklyStats {
  waspangName: string;
  reportCount: number;
  totalDays: number;
  totalSipil: number;
  totalKabel: number;
  totalKendala: number;
  kendalaSummaries: string[];
  projects: string[];
  reportDates?: string[];
  latestDailyDate?: string;
}

export interface AreaWeeklyStats {
  areaName: string;
  waspangs: WaspangWeeklyStats[];
  totalReports: number;
  totalSipil: number;
  totalKabel: number;
  totalKendala: number;
}

export interface WeeklyRecapData {
  startDate: string;
  endDate: string;
  periodLabel: string;
  areas: AreaWeeklyStats[];
  grandTotal: {
    totalReports: number;
    activeWaspangs: number;
    totalSipil: number;
    totalKabel: number;
    totalKendala: number;
  };
}

function formatIndonesianDate(isoDate: string): string {
  if (!isoDate) return '-';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const day = parseInt(parts[2], 10);
    const mIdx = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    return `${day} ${months[mIdx] || parts[1]} ${year}`;
  }
  return isoDate;
}

function formatGeneratedTimestamp(): string {
  try {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const dayName = days[now.getDay()];
    const dateNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${dayName}, ${dateNum} ${monthName} ${year} • ${hours}:${minutes} WIB`;
  } catch {
    return `${new Date().toLocaleString('id-ID')} WIB`;
  }
}

function formatShortIdDate(isoDate: string): string {
  if (!isoDate) return '-';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const day = parseInt(parts[2], 10);
    const mIdx = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    return `${day} ${months[mIdx] || parts[1]} ${year}`;
  }
  return isoDate;
}

function formatDatesList(dates?: string[], latest?: string): string {
  if (!dates || dates.length === 0) {
    return latest ? `*${formatShortIdDate(latest)}*` : '_Belum ada data tanggal_';
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  if (dates.length === 1) {
    return `*${formatShortIdDate(dates[0])}*`;
  }

  const dateItems = dates.map((d) => {
    const parts = d.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const mIdx = parseInt(parts[1], 10) - 1;
      return `${day} ${months[mIdx] || ''}`.trim();
    }
    return d;
  });

  const latestStr = latest ? ` (Terakhir: *${formatShortIdDate(latest)}*)` : '';
  return `*${dateItems.join(', ')}*${latestStr}`;
}

export function generateWeeklyAdminWhatsAppText(data: WeeklyRecapData): string {
  const startFmt = formatIndonesianDate(data.startDate);
  const endFmt = formatIndonesianDate(data.endDate);
  const periodText = startFmt === endFmt ? startFmt : `${startFmt} s/d ${endFmt}`;
  const timestamp = formatGeneratedTimestamp();

  const lines: string[] = [
    `*┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓*`,
    `*📊 REKAP KINERJA & PROGRES WASPANG*`,
    `*🏢 LINKNET & PMO MS CKT*`,
    `*┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛*`,
    ``,
    `📅 *Periode     :* ${periodText}`,
    `🏷️ *Rentang     :* ${data.periodLabel}`,
    `🕒 *Waktu       :* ${timestamp}`,
    `👤 *Update from :* Admin Dashboard (admin@gov.com)`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
  ];

  if (data.areas.length === 0 || data.grandTotal.totalReports === 0) {
    lines.push(``);
    lines.push(`_Belum ada data laporan harian yang masuk pada periode ini._`);
    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`_GovMonitor Intelligence System • PMO MS CKT_`);
    return lines.join('\n');
  }

  // 1. EXECUTIVE SUMMARY BLOCK
  lines.push(``);
  lines.push(`*📈 RINGKASAN EKSEKUTIF (GRAND TOTAL)*`);
  lines.push(`• Total Laporan Masuk  : *${data.grandTotal.totalReports} Laporan*`);
  lines.push(`• Waspang Aktif        : *${data.grandTotal.activeWaspangs} Personil Bertugas*`);
  lines.push(`• Akumulasi Pek. Sipil : *${data.grandTotal.totalSipil.toLocaleString('id-ID')} Meter*`);
  lines.push(`• Akumulasi Pek. Kabel : *${data.grandTotal.totalKabel.toLocaleString('id-ID')} Meter*`);
  if (data.grandTotal.totalKendala > 0) {
    lines.push(`• Isu Lapangan         : *⚠️ ${data.grandTotal.totalKendala} Kendala Perlu Atensi*`);
  } else {
    lines.push(`• Isu Lapangan         : *✅ Kondisi Operasional Aman & Lancar*`);
  }
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // 2. BREAKDOWN PER AREA & WASPANG
  lines.push(``);
  lines.push(`*📍 CAPAIAN KINERJA PER AREA & WASPANG*`);

  const allKendalaList: { area: string; waspang: string; notes: string }[] = [];

  data.areas.forEach((area, aIdx) => {
    lines.push(``);
    lines.push(`*🔹 [AREA ${area.areaName.toUpperCase()}]*`);
    lines.push(
      `   📊 _Subtotal Area: ${area.totalReports} Lap | Sipil: ${area.totalSipil.toLocaleString('id-ID')} m | Kabel: ${area.totalKabel.toLocaleString('id-ID')} m_`
    );
    lines.push(`   ───────────────────────────`);

    if (area.waspangs.length === 0) {
      lines.push(`   _(Tidak ada pelaporan aktif pada area ini)_`);
    } else {
      area.waspangs.forEach((w) => {
        // Collect kendala for summary section
        if (w.kendalaSummaries && w.kendalaSummaries.length > 0) {
          w.kendalaSummaries.forEach((kNote) => {
            allKendalaList.push({
              area: area.areaName,
              waspang: w.waspangName,
              notes: kNote,
            });
          });
        }

        const projectText = w.projects.length > 0 ? w.projects.join(', ') : '-';
        const statusLabel = w.totalKendala > 0 
          ? `⚠️ *${w.totalKendala} Kendala Terlaporkan*` 
          : `✅ *Lancar / Nihil Kendala*`;
        const datesText = formatDatesList(w.reportDates, w.latestDailyDate);

        lines.push(`   👷 *${w.waspangName.toUpperCase()}*`);
        lines.push(`      ├ 🗓️ *Kehadiran*    : *${w.totalDays} Hari* (${w.reportCount} laporan)`);
        lines.push(`      ├ 📅 *Update Daily* : ${datesText}`);
        lines.push(`      ├ 🏗️ *Pek. Sipil*   : *${w.totalSipil.toLocaleString('id-ID')} m* (Boring & Pit)`);
        lines.push(`      ├ ⚡ *Pek. Kabel*   : *${w.totalKabel.toLocaleString('id-ID')} m* (FO & Coax)`);
        lines.push(`      ├ 🎯 *Project*      : ${projectText}`);
        lines.push(`      └ 🚦 *Status*       : ${statusLabel}`);
        lines.push(``);
      });
    }
  });

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // 3. DAFTAR KENDALA & ACTION ITEMS SECTION
  if (allKendalaList.length > 0) {
    lines.push(``);
    lines.push(`*⚠️ DAFTAR KENDALA & ISU LAPANGAN (${allKendalaList.length} Isu):*`);
    lines.push(`Berikut kendala lapangan yang membutuhkan koordinasi / tindak lanjut:`);
    lines.push(``);
    allKendalaList.forEach((item, idx) => {
      lines.push(`${idx + 1}. *[${item.area} • ${item.waspang}]*`);
      lines.push(`   ↳ _"${item.notes}"_`);
    });
    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  } else {
    lines.push(``);
    lines.push(`*✅ EVALUASI KENDALA:*`);
    lines.push(`Seluruh pekerjaan sipil & penarikan kabel berjalan aman dan sesuai rencana.`);
    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  }

  // 4. FOOTER & INSTRUCTIONS
  lines.push(`📌 *CATATAN PMO MS CKT:*`);
  lines.push(`1. Data diatas dihimpun otomatis dari sistem pelaporan harian resmi.`);
  lines.push(`2. Mohon Waspang terkait segera memperbarui progres harian secara berkala.`);
  lines.push(``);
  lines.push(`_GovMonitor Admin System • PT Link Net & PMO MS CKT_`);
  lines.push(`_Dokumen Resmi Terverifikasi_`);

  return lines.join('\n');
}

export function shareWeeklyRecapToWhatsApp(data: WeeklyRecapData, targetPhone?: string): void {
  const text = generateWeeklyAdminWhatsAppText(data);
  const encodedText = encodeURIComponent(text);

  let url = `https://api.whatsapp.com/send?text=${encodedText}`;

  if (targetPhone && targetPhone.trim()) {
    let cleaned = targetPhone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    url = `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodedText}`;
  }

  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

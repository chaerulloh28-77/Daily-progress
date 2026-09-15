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

export interface KendalaIssueItem {
  date?: string;
  area: string;
  waspang: string;
  projectName: string;
  category: string;
  notes: string;
}

export interface CategoryRecapStats {
  categoryKey: 'relokasi' | 'pengamanan';
  categoryTitle: string;
  badge: string;
  totalReports: number;
  activeWaspangs: number;
  totalSipil: number;
  totalKabel: number;
  totalKendala: number;
  areas: AreaWeeklyStats[];
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
  relokasi?: CategoryRecapStats;
  pengamanan?: CategoryRecapStats;
  allKendalaList?: KendalaIssueItem[];
}

export function isPengamananReport(rep: { projectCategory?: string; projectName?: string }): boolean {
  if (rep.projectCategory === 'Pengamanan') return true;
  const cat = (rep.projectCategory || '').toLowerCase();
  const name = (rep.projectName || '').toLowerCase();
  return cat.includes('pengamanan') || name.includes('pengamanan');
}

export function buildCategorySummary(
  reports: DailyReportFormData[],
  categoryKey: 'relokasi' | 'pengamanan'
): CategoryRecapStats {
  const definedAreas = ['Jabo 1', 'Jabo 2', 'Jabo 3'];
  const isPeng = categoryKey === 'pengamanan';
  const categoryTitle = isPeng ? 'PENGAMANAN' : 'RELOKASI GOV';
  const badge = isPeng ? '🛡️' : '🔵';

  const areaMap: Record<string, Record<string, {
    reports: DailyReportFormData[];
    dates: Set<string>;
    totalSipil: number;
    totalKabel: number;
    kendala: string[];
    projects: Set<string>;
  }>> = {
    'Jabo 1': {},
    'Jabo 2': {},
    'Jabo 3': {},
  };

  reports.forEach((rep) => {
    let areaKey = rep.area?.trim() || '';
    if (!definedAreas.includes(areaKey)) {
      areaKey = 'Jabo 1';
    }

    const waspangKey = (rep.waspangName && rep.waspangName.trim()) || 
      (rep.authorEmail ? rep.authorEmail.split('@')[0] : 'Waspang Lapangan');

    if (!areaMap[areaKey]) {
      areaMap[areaKey] = {};
    }
    if (!areaMap[areaKey][waspangKey]) {
      areaMap[areaKey][waspangKey] = {
        reports: [],
        dates: new Set(),
        totalSipil: 0,
        totalKabel: 0,
        kendala: [],
        projects: new Set(),
      };
    }

    const wData = areaMap[areaKey][waspangKey];
    wData.reports.push(rep);
    if (rep.reportDate) wData.dates.add(rep.reportDate);
    if (rep.projectName) wData.projects.add(rep.projectName);

    const sipilVal = parseFloat(rep.totalProgressSipil) || 0;
    wData.totalSipil += sipilVal;

    const kabelVal = (parseFloat(rep.totalProgressKabel) || 0) + 
      (parseFloat(rep.totalProgressKabelCoax || rep.pulling?.pullingCoax || '0') || 0);
    wData.totalKabel += kabelVal;

    const kendala = rep.kendalaLapangan?.trim();
    if (kendala && kendala.toLowerCase() !== 'tidak ada kendala' && kendala !== '-') {
      wData.kendala.push(`${rep.reportDate || 'Hari ini'}: ${kendala}`);
    }
  });

  let totalReports = 0;
  let totalSipil = 0;
  let totalKabel = 0;
  let totalKendala = 0;
  const activeWaspangs = new Set<string>();

  const areas: AreaWeeklyStats[] = definedAreas.map((areaName) => {
    const waspangsDict = areaMap[areaName] || {};
    const waspangsList: WaspangWeeklyStats[] = Object.entries(waspangsDict).map(([wName, wInfo]) => {
      activeWaspangs.add(wName);
      totalReports += wInfo.reports.length;
      totalSipil += wInfo.totalSipil;
      totalKabel += wInfo.totalKabel;
      totalKendala += wInfo.kendala.length;

      const sortedDates = Array.from(wInfo.dates as Set<string>).filter(Boolean).sort();
      const latestDailyDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : undefined;

      return {
        waspangName: wName,
        reportCount: wInfo.reports.length,
        totalDays: wInfo.dates.size || wInfo.reports.length,
        totalSipil: Math.round(wInfo.totalSipil * 10) / 10,
        totalKabel: Math.round(wInfo.totalKabel * 10) / 10,
        totalKendala: wInfo.kendala.length,
        kendalaSummaries: wInfo.kendala,
        projects: Array.from(wInfo.projects),
        reportDates: sortedDates,
        latestDailyDate,
      };
    });

    waspangsList.sort((a, b) => b.totalDays - a.totalDays || b.totalSipil - a.totalSipil);

    const areaReports = waspangsList.reduce((acc, w) => acc + w.reportCount, 0);
    const areaSipil = waspangsList.reduce((acc, w) => acc + w.totalSipil, 0);
    const areaKabel = waspangsList.reduce((acc, w) => acc + w.totalKabel, 0);
    const areaKendala = waspangsList.reduce((acc, w) => acc + w.totalKendala, 0);

    return {
      areaName,
      waspangs: waspangsList,
      totalReports: areaReports,
      totalSipil: Math.round(areaSipil * 10) / 10,
      totalKabel: Math.round(areaKabel * 10) / 10,
      totalKendala: areaKendala,
    };
  });

  return {
    categoryKey,
    categoryTitle,
    badge,
    totalReports,
    activeWaspangs: activeWaspangs.size,
    totalSipil: Math.round(totalSipil * 10) / 10,
    totalKabel: Math.round(totalKabel * 10) / 10,
    totalKendala,
    areas,
  };
}

export function extractKendalaList(reports: DailyReportFormData[]): KendalaIssueItem[] {
  const issues: KendalaIssueItem[] = [];
  reports.forEach((rep) => {
    const kendala = rep.kendalaLapangan?.trim();
    if (kendala && kendala.toLowerCase() !== 'tidak ada kendala' && kendala !== '-') {
      const area = rep.area?.trim() || 'Jabo 1';
      const waspang = (rep.waspangName && rep.waspangName.trim()) || 
        (rep.authorEmail ? rep.authorEmail.split('@')[0] : 'Waspang Lapangan');
      const projectName = rep.projectName?.trim() || 'Project';
      const category = isPengamananReport(rep) ? 'Pengamanan' : 'Relokasi Government';

      issues.push({
        date: rep.reportDate,
        area,
        waspang,
        projectName,
        category,
        notes: kendala,
      });
    }
  });
  return issues;
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
    `👤 *Update from :* Admin Dashboard`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
  ];

  if (data.grandTotal.totalReports === 0) {
    lines.push(``);
    lines.push(`_Belum ada data laporan harian yang masuk pada periode ini._`);
    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`_GovMonitor Intelligence System • PMO MS CKT_`);
    return lines.join('\n');
  }

  // 1. EXECUTIVE SUMMARY BLOCK (GRAND TOTAL)
  lines.push(``);
  lines.push(`*📈 RINGKASAN EKSEKUTIF (GRAND TOTAL)*`);
  lines.push(`• Total Laporan Masuk  : *${data.grandTotal.totalReports} Laporan*`);
  lines.push(`• Waspang Bertugas     : *${data.grandTotal.activeWaspangs} Personil*`);
  lines.push(`• Akumulasi Pek. Sipil : *${data.grandTotal.totalSipil.toLocaleString('id-ID')} Meter*`);
  lines.push(`• Akumulasi Pek. Kabel : *${data.grandTotal.totalKabel.toLocaleString('id-ID')} Meter*`);
  if (data.grandTotal.totalKendala > 0) {
    lines.push(`• Isu Lapangan         : *⚠️ ${data.grandTotal.totalKendala} Kendala Perlu Atensi*`);
  } else {
    lines.push(`• Isu Lapangan         : *✅ Kondisi Operasional Aman & Lancar*`);
  }
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // CATEGORY A: RELOKASI GOVERNMENT
  const relokasi = data.relokasi;
  lines.push(``);
  lines.push(`=================================`);
  lines.push(`🔵 *KATEGORI A: RELOKASI GOV*`);
  lines.push(`=================================`);
  lines.push(`*Ringkasan Relokasi:*`);
  if (relokasi) {
    lines.push(`- Total Laporan: *${relokasi.totalReports} Laporan* (${relokasi.activeWaspangs} Personil)`);
    lines.push(
      `- Total Sipil  : *${relokasi.totalSipil.toLocaleString('id-ID')} m* | Total Kabel: *${relokasi.totalKabel.toLocaleString('id-ID')} m*`
    );
    lines.push(
      `- Status Isu   : *${relokasi.totalKendala > 0 ? `⚠️ ${relokasi.totalKendala} Kendala Terlaporkan` : `✅ Aman / Nihil Kendala`}*`
    );
    lines.push(`─────────────────────────────────`);

    const activeAreas = relokasi.areas.filter((a) => a.waspangs.length > 0);
    if (activeAreas.length === 0) {
      lines.push(`_(Tidak ada laporan project Relokasi Government pada periode ini)_`);
    } else {
      activeAreas.forEach((area) => {
        lines.push(``);
        lines.push(`*🔹 [AREA ${area.areaName.toUpperCase()}]*`);
        lines.push(
          `   📊 _Subtotal: ${area.totalReports} Lap | Sipil: ${area.totalSipil.toLocaleString('id-ID')} m | Kabel: ${area.totalKabel.toLocaleString('id-ID')} m_`
        );
        lines.push(`   ───────────────────────────`);

        area.waspangs.forEach((w) => {
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
      });
    }
  } else {
    lines.push(`_(Data kategori relokasi belum terdefinisi)_`);
  }

  // CATEGORY B: PENGAMANAN
  const pengamanan = data.pengamanan;
  lines.push(``);
  lines.push(`=================================`);
  lines.push(`🛡️ *KATEGORI B: PENGAMANAN*`);
  lines.push(`=================================`);
  lines.push(`*Ringkasan Pengamanan:*`);
  if (pengamanan) {
    lines.push(`- Total Laporan: *${pengamanan.totalReports} Laporan* (${pengamanan.activeWaspangs} Personil)`);
    lines.push(
      `- Total Sipil  : *${pengamanan.totalSipil.toLocaleString('id-ID')} m* | Total Kabel: *${pengamanan.totalKabel.toLocaleString('id-ID')} m*`
    );
    lines.push(
      `- Status Isu   : *${pengamanan.totalKendala > 0 ? `⚠️ ${pengamanan.totalKendala} Kendala Terlaporkan` : `✅ Aman / Nihil Kendala`}*`
    );
    lines.push(`─────────────────────────────────`);

    const activeAreas = pengamanan.areas.filter((a) => a.waspangs.length > 0);
    if (activeAreas.length === 0) {
      lines.push(`_(Tidak ada laporan project Pengamanan pada periode ini)_`);
    } else {
      activeAreas.forEach((area) => {
        lines.push(``);
        lines.push(`*🔹 [AREA ${area.areaName.toUpperCase()}]*`);
        lines.push(
          `   📊 _Subtotal: ${area.totalReports} Lap | Sipil: ${area.totalSipil.toLocaleString('id-ID')} m | Kabel: ${area.totalKabel.toLocaleString('id-ID')} m_`
        );
        lines.push(`   ───────────────────────────`);

        area.waspangs.forEach((w) => {
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
      });
    }
  } else {
    lines.push(`_(Data kategori pengamanan belum terdefinisi)_`);
  }

  // 3. COMBINED KENDALA & ACTION ITEMS SECTION
  lines.push(``);
  lines.push(`=================================`);
  lines.push(`⚠️ *REKAP KENDALA & ISU LAPANGAN*`);
  lines.push(`=================================`);

  const kendalaList = data.allKendalaList || [];
  if (kendalaList.length > 0) {
    lines.push(`Daftar kendala lapangan yang memerlukan koordinasi / tindak lanjut (${kendalaList.length} Isu):`);
    lines.push(``);
    kendalaList.forEach((item, idx) => {
      lines.push(`${idx + 1}. *[${item.area} • ${item.waspang}]*`);
      lines.push(`   🏷️ _Project: ${item.projectName} (${item.category})_`);
      lines.push(`   ↳ ⚠️ _"${item.notes}"_`);
      lines.push(``);
    });
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  } else {
    lines.push(`*✅ EVALUASI KENDALA:*`);
    lines.push(`Seluruh pekerjaan Relokasi Government & Pengamanan berjalan aman dan sesuai rencana (Nihil Kendala).`);
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

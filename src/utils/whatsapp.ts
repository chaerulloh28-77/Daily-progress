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
    `📌 *Nama Project:* ${report.projectName || 'Project Jaringan'}`,
    ...(report.waspangName ? [`👷 *Waspang (Pengawas):* ${report.waspangName}`] : []),
    `📅 *Tanggal:* ${report.reportDate}${dayInfo}`,
    `🌦️ *Kondisi Cuaca:* ${report.weatherCondition || '-'}`,
    `⏱️ *Periode Project:* ${report.startDate || '-'} s/d ${report.endDate || '-'}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `*📊 RINGKASAN PROGRES UTAMA:*`,
    `• Total Progres Sipil : *${report.totalProgressSipil || 0} Meter*`,
    `• Total Progres Kabel : *${report.totalProgressKabel || 0} Meter*`,
    ``,
    `*🛠️ RINCIAN PEKERJAAN HARIAN:*`,
    ``,
    `*1. Boring & Crossing (Total: ${totalBoring} m)*`,
    `   - Boring Alur: ${report.boring.boringAlur || 0} m`,
    `   - Crossing Jalan: ${report.boring.boringCrossingJalan || 0} m`,
    `   - Crossing Jalan Tol: ${report.boring.boringCrossingJalanTol || 0} m`,
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
    ``,
    `*3. Instalasi Pit (Total: ${totalPit} Pcs)*`,
    `   - Handhole (HH): ${totalHH} Pcs (60x60: ${report.instalasiHH.hh60x60 || 0}, 80x80: ${report.instalasiHH.hh80x80 || 0}, 100x100: ${report.instalasiHH.hh100x100 || 0}, 120x120: ${report.instalasiHH.hh120x120 || 0})`,
    `   - Handbox (HB): ${totalHB} Pcs (60x60: ${report.instalasiHB.hb60x60 || 0}, 80x80: ${report.instalasiHB.hb80x80 || 0}, 100x100: ${report.instalasiHB.hb100x100 || 0}, 120x120: ${report.instalasiHB.hb120x120 || 0})`,
    `   - Manhole (MH): ${totalMH} Pcs (80x80: ${report.instalasiMH.mh80x80 || 0}, 100x100: ${report.instalasiMH.mh100x100 || 0}, 120x120: ${report.instalasiMH.mh120x120 || 0})`,
    `   - Manbox (MB): ${totalMB} Pcs (80x80: ${report.instalasiMB.mb80x80 || 0}, 100x100: ${report.instalasiMB.mb100x100 || 0}, 120x120: ${report.instalasiMB.mb120x120 || 0})`,
    ``,
    `*4. Tiang, Galvanis & HDPE*`,
    `   - Tiang Bersama: ${report.tiangGalvanisHDPE.tiangBersama || 0} Pcs`,
    `   - Galvanis 2": ${report.tiangGalvanisHDPE.galvanis2Inch || 0} m`,
    `   - Galvanis 4": ${report.tiangGalvanisHDPE.galvanis4Inch || 0} m`,
    `   - Instal HDPE: ${report.tiangGalvanisHDPE.instalHDPE || 0} m`,
    ``,
    `*5. Dismantling (Bongkar)*`,
    `   - Dismantle Kabel: ${report.dismantling.dismantleKabel || 0} m`,
    `   - Dismantle Tiang: ${report.dismantling.dismantleTiang || 0} Pcs`,
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

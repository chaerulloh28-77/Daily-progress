import emailjs from '@emailjs/browser';
import { DailyReportFormData } from '../types';
import { calculateTotals } from './whatsapp';

export const TARGET_EMAIL = import.meta.env.VITE_NOTIFICATION_EMAIL || 'chaerulloh28@gmail.com';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

export interface EmailSendResult {
  success: boolean;
  simulated: boolean;
  message: string;
}

/**
 * Formats a clean timestamp string in Indonesian timezone (WIB)
 */
export const getFormattedTimestamp = (): string => {
  return (
    new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' WIB'
  );
};

/**
 * Core email sender through EmailJS with safe fallback & console simulation
 */
export const sendEmailNotification = async (params: {
  subject: string;
  eventType: 'LOGIN' | 'SAVE_DAILY_PROGRESS' | 'EDIT_REPORT';
  message: string;
  userEmail?: string;
  projectName?: string;
  waspangName?: string;
  reportDetails?: string;
}): Promise<EmailSendResult> => {
  const timestamp = getFormattedTimestamp();

  const templateParams: Record<string, unknown> = {
    to_email: TARGET_EMAIL,
    to_name: 'Chaerulloh (PMO Admin)',
    subject: params.subject,
    event_type: params.eventType,
    user_email: params.userEmail || 'pengawas.lapangan@gov-network.id',
    project_name: params.projectName || '-',
    waspang_name: params.waspangName || '-',
    timestamp,
    message: params.message,
    report_details: params.reportDetails || '',
  };

  // If EmailJS credentials are configured, execute real network dispatch
  if (SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY) {
    try {
      const response = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY
      );
      console.info('[EmailHelper] Email sent successfully via EmailJS:', response.status, response.text);
      return {
        success: true,
        simulated: false,
        message: `Email notifikasi terkirim via EmailJS ke ${TARGET_EMAIL}`,
      };
    } catch (error) {
      console.error('[EmailHelper] EmailJS dispatch error:', error);
      // Fall through to simulated success so UI is uninterrupted
      return {
        success: false,
        simulated: true,
        message: `Gagal mengirim via EmailJS: ${(error as Error)?.message || 'Network error'}. Disimpan dalam log sistem.`,
      };
    }
  }

  // Fallback Simulation Mode (when API keys are not yet configured in .env)
  console.info(
    `%c[EmailHelper Similated Dispatch] To: ${TARGET_EMAIL} | Subject: ${params.subject}`,
    'color: #00f0ff; font-weight: bold; background: #09142b; padding: 4px;',
    {
      to: TARGET_EMAIL,
      ...templateParams,
      info: 'To enable live SMTP/Email delivery, provide VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in .env',
    }
  );

  return {
    success: true,
    simulated: true,
    message: `Notifikasi email disimulasikan ke ${TARGET_EMAIL}`,
  };
};

/**
 * 1. Notifikasi Login
 * Dikirim secara real-time setiap kali user berhasil login ke portal GOV
 */
export const sendLoginNotification = async (
  userEmail: string,
  loginTimestamp?: string
): Promise<EmailSendResult> => {
  const time = loginTimestamp || getFormattedTimestamp();
  const subject = `🔐 [LOGIN NOTIFICATION] User Masuk Portal GOV - ${userEmail}`;
  const message = [
    `🚨 PEMBERITAHUAN KEAMANAN & AKSES USER 🚨`,
    `Waktu Akses   : ${time}`,
    `Email Akun    : ${userEmail}`,
    `Portal        : GOV SECURE PORTAL (PMO MS CKT / LinkNet)`,
    `Status        : Autentikasi Pengawas Berhasil - Sesi Logger Aktif`,
    `Platform      : ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser'}`,
  ].join('\n');

  return sendEmailNotification({
    subject,
    eventType: 'LOGIN',
    userEmail,
    message,
  });
};

/**
 * Formats a clean textual recap of a Daily Report for email content
 */
export const formatReportRecapForEmail = (report: DailyReportFormData): string => {
  const boringDetails = [
    report.boring?.boringAlur ? `Boring Alur: ${report.boring.boringAlur}m` : '',
    report.boring?.boringCrossingJalan ? `Crossing Jalan: ${report.boring.boringCrossingJalan}m` : '',
    report.boring?.boringCrossingJalanTol ? `Crossing Tol: ${report.boring.boringCrossingJalanTol}m` : '',
    report.boring?.boringCrossingJembatan ? `Crossing Jembatan: ${report.boring.boringCrossingJembatan}m` : '',
  ].filter(Boolean).join(', ') || '-';

  const pullingDetails = [
    report.pulling?.pulling288 ? `288 Core: ${report.pulling.pulling288}m` : '',
    report.pulling?.pulling288GL ? `288 GL: ${report.pulling.pulling288GL}m` : '',
    report.pulling?.pulling144 ? `144 Core: ${report.pulling.pulling144}m` : '',
    report.pulling?.pulling96 ? `96 Core: ${report.pulling.pulling96}m` : '',
    report.pulling?.pulling48 ? `48 Core: ${report.pulling.pulling48}m` : '',
    report.pulling?.pulling24 ? `24 Core: ${report.pulling.pulling24}m` : '',
  ].filter(Boolean).join(', ') || '-';

  const tiangDetails = [
    report.tiangGalvanisHDPE?.tiangBersama ? `Tiang Bersama: ${report.tiangGalvanisHDPE.tiangBersama}` : '',
    report.tiangGalvanisHDPE?.galvanis2Inch ? `Galvanis 2": ${report.tiangGalvanisHDPE.galvanis2Inch}` : '',
    report.tiangGalvanisHDPE?.galvanis4Inch ? `Galvanis 4": ${report.tiangGalvanisHDPE.galvanis4Inch}` : '',
    report.tiangGalvanisHDPE?.instalHDPE ? `HDPE: ${report.tiangGalvanisHDPE.instalHDPE}m` : '',
  ].filter(Boolean).join(', ') || '-';

  const pitsDetails = [
    report.instalasiHH?.hh80x80 ? `HH 80x80: ${report.instalasiHH.hh80x80}` : '',
    report.instalasiHB?.hb80x80 ? `HB 80x80: ${report.instalasiHB.hb80x80}` : '',
    report.instalasiMH?.mh80x80 ? `MH 80x80: ${report.instalasiMH.mh80x80}` : '',
  ].filter(Boolean).join(', ') || '-';

  const dismantleDetails = [
    report.dismantling?.dismantleKabel ? `Kabel: ${report.dismantling.dismantleKabel}m` : '',
    report.dismantling?.dismantleTiang ? `Tiang: ${report.dismantling.dismantleTiang} unit` : '',
  ].filter(Boolean).join(', ') || '-';

  const { totalHH, totalHB, totalMH } = calculateTotals(report);
  const displayHH = report.totalProgressHH || totalHH;
  const displayHB = report.totalProgressHB || totalHB;
  const displayMH = report.totalProgressMH || totalMH;

  return [
    ...(report.projectId ? [`🆔 PROJECT ID        : ${report.projectId}`] : []),
    `📌 NAMA PROJECT       : ${report.projectName || 'Project Jaringan'}`,
    `👷 WASPANG / PENGAWAS : ${report.waspangName || 'Belum diisi'}`,
    `📅 TANGGAL LAPORAN    : ${report.reportDate} (Hari ke-${report.dayNumber || '1'})`,
    `🌦️ KONDISI CUACA      : ${report.weatherCondition || 'Normal'}`,
    report.durasiPekerjaan
      ? `⏱️ DURASI PEKERJAAN  : ${report.durasiPekerjaan} Hari (Start: ${report.startDate || '-'})`
      : `⏱️ PERIODE PROJECT    : ${report.startDate || '-'} s/d ${report.endDate || '-'}`,
    `--------------------------------------------------`,
    `📊 REKAP PROGRES UTAMA:`,
    `• Total Progres Sipil : ${report.totalProgressSipil || 0} Meter`,
    `• Total Progres Kabel : ${report.totalProgressKabel || 0} Meter`,
    `• Total Handhole (HH) : ${displayHH} Pcs`,
    `• Total Handbox (HB)  : ${displayHB} Pcs`,
    `• Total Manhole (MH)  : ${displayMH} Pcs`,
    `--------------------------------------------------`,
    `🛠️ DETAIL PEKERJAAN LAPANGAN:`,
    `• Boring / HDD        : ${boringDetails}`,
    `• Pulling Kabel FO    : ${pullingDetails}`,
    `• Tiang & HDPE        : ${tiangDetails}`,
    `• Pits / Manhole / HH : ${pitsDetails}`,
    `• Dismantling         : ${dismantleDetails}`,
    `--------------------------------------------------`,
    `⚠️ KENDALA & ISU LAPANGAN:`,
    `${report.kendalaLapangan ? `"${report.kendalaLapangan}"` : 'Tidak ada kendala lapangan.'}`,
  ].join('\n');
};

/**
 * 2. Auto-Save & Rekap Daily Progress
 * Dikirim setiap kali formulir Daily Progress disimpan/disubmit
 */
export const sendDailyReportNotification = async (
  report: DailyReportFormData,
  userEmail?: string
): Promise<EmailSendResult> => {
  const timestamp = report.submittedAt || getFormattedTimestamp();
  const subject = `📊 [DAILY PROGRESS] ${report.projectName || 'Project'} - Hari ke-${report.dayNumber || '1'} (${report.reportDate})`;
  
  const reportDetails = formatReportRecapForEmail(report);
  const message = [
    `🚨 REKAP PROGRES HARIAN BARU TERSIMPAN 🚨`,
    `Waktu Simpan: ${timestamp}`,
    `Dicatat oleh: ${userEmail || 'Pengawas Lapangan'}`,
    ``,
    reportDetails,
  ].join('\n');

  return sendEmailNotification({
    subject,
    eventType: 'SAVE_DAILY_PROGRESS',
    userEmail,
    projectName: report.projectName,
    waspangName: report.waspangName,
    message,
    reportDetails,
  });
};

/**
 * 3. Notifikasi Edit Laporan
 * Dikirim saat user mengedit atau memperbarui data laporan yang sudah tersimpan
 */
export const sendReportEditNotification = async (
  updatedReport: DailyReportFormData,
  previousReport?: DailyReportFormData | null,
  userEmail?: string
): Promise<EmailSendResult> => {
  const timestamp = getFormattedTimestamp();
  const subject = `⚠️ [PERINGATAN EDIT LAPORAN] Update Data Progress: ${updatedReport.projectName || 'Project'} (Hari ke-${updatedReport.dayNumber || '1'})`;

  let diffSummary = '';
  if (previousReport) {
    const changes: string[] = [];
    if (previousReport.projectName !== updatedReport.projectName) {
      changes.push(`- Nama Project: "${previousReport.projectName}" -> "${updatedReport.projectName}"`);
    }
    if (previousReport.waspangName !== updatedReport.waspangName) {
      changes.push(`- Waspang: "${previousReport.waspangName || '-'}" -> "${updatedReport.waspangName || '-'}"`);
    }
    if (previousReport.weatherCondition !== updatedReport.weatherCondition) {
      changes.push(`- Cuaca: "${previousReport.weatherCondition}" -> "${updatedReport.weatherCondition}"`);
    }
    if (previousReport.durasiPekerjaan !== updatedReport.durasiPekerjaan) {
      changes.push(`- Sisa Durasi: ${previousReport.durasiPekerjaan || '-'} Hari -> ${updatedReport.durasiPekerjaan || '-'} Hari`);
    }
    if (previousReport.totalProgressSipil !== updatedReport.totalProgressSipil) {
      changes.push(`- Progres Sipil: ${previousReport.totalProgressSipil}m -> ${updatedReport.totalProgressSipil}m`);
    }
    if (previousReport.totalProgressKabel !== updatedReport.totalProgressKabel) {
      changes.push(`- Progres Kabel: ${previousReport.totalProgressKabel}m -> ${updatedReport.totalProgressKabel}m`);
    }
    if (previousReport.totalProgressHH !== updatedReport.totalProgressHH) {
      changes.push(`- Total HH: ${previousReport.totalProgressHH || 0} -> ${updatedReport.totalProgressHH || 0} Pcs`);
    }
    if (previousReport.totalProgressHB !== updatedReport.totalProgressHB) {
      changes.push(`- Total HB: ${previousReport.totalProgressHB || 0} -> ${updatedReport.totalProgressHB || 0} Pcs`);
    }
    if (previousReport.totalProgressMH !== updatedReport.totalProgressMH) {
      changes.push(`- Total MH: ${previousReport.totalProgressMH || 0} -> ${updatedReport.totalProgressMH || 0} Pcs`);
    }
    if (previousReport.kendalaLapangan !== updatedReport.kendalaLapangan) {
      changes.push(`- Kendala: "${previousReport.kendalaLapangan || '-'}" -> "${updatedReport.kendalaLapangan || '-'}"`);
    }
    if (changes.length > 0) {
      diffSummary = `\n🔍 RINGKASAN PERUBAHAN:\n` + changes.join('\n') + `\n`;
    }
  }

  const updatedRecap = formatReportRecapForEmail(updatedReport);
  const message = [
    `🚨 PERINGATAN PEMBARUAN / EDIT LAPORAN 🚨`,
    `Telah dilakukan pengeditan pada data laporan harian tersimpan.`,
    `Waktu Edit  : ${timestamp}`,
    `Editor      : ${userEmail || 'Pengawas Lapangan'}`,
    `ID Laporan  : ${updatedReport.id || 'Unknown'}`,
    diffSummary,
    `--------------------------------------------------`,
    `📋 DATA LAPORAN TERBARU HASIL EDIT:`,
    updatedRecap,
  ].join('\n');

  return sendEmailNotification({
    subject,
    eventType: 'EDIT_REPORT',
    userEmail,
    projectName: updatedReport.projectName,
    waspangName: updatedReport.waspangName,
    message,
    reportDetails: updatedRecap,
  });
};

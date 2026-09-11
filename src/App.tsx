import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { ReportHeader } from './components/ReportHeader';
import { DailyReportForm } from './components/DailyReportForm';
import { ReportSummaryModal } from './components/ReportSummaryModal';
import { SavedReportsDrawer } from './components/SavedReportsDrawer';
import { ProjectManagementModal } from './components/ProjectManagementModal';
import { ClearScreenModal } from './components/ClearScreenModal';
import { MobileInstallBanner } from './components/MobileInstallBanner';
import { BackgroundStatusBanner } from './components/BackgroundStatusBanner';
import { DailyReportFormData, ProjectItem, CurrentUser, UserRole } from './types';
import { INITIAL_REPORT_DATA, ACTIVE_PROJECTS, PROJECT_RELOKASI_GOVERNMENT } from './data';
import { CheckCircle } from 'lucide-react';
import { 
  sendLoginNotification, 
  sendDailyReportNotification, 
  sendReportEditNotification,
  TARGET_EMAIL 
} from './utils/emailHelper';
import { 
  syncReportToCloud, 
  deleteReportFromCloud, 
  subscribeToDailyReports,
  subscribeToProjects,
  saveProjectToCloud,
  deleteProjectFromCloud 
} from './services/cloudSync';
import { 
  saveActiveDraftInBackground, 
  enqueueReportForBackgroundSync 
} from './services/backgroundSync';

export default function App() {
  // Auth state: Routing utama (/) langsung merender LoginPage tanpa splash screen atau intro
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('gov_user_email') || '';
  });
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    const email = localStorage.getItem('gov_user_email') || '';
    const savedRole = localStorage.getItem('gov_user_role') as UserRole;
    const role: UserRole = savedRole || (email.trim().toLowerCase() === 'admin@gov.com' ? 'admin' : 'waspang');
    return {
      email,
      role,
      name: role === 'admin' ? 'Administrator' : (email ? email.split('@')[0] : 'Pengawas'),
    };
  });

  // Master projects list
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    const saved = localStorage.getItem('gov_network_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Bersihkan project bawaan bernama 'Pengamanan'
          return parsed.filter(
            (p: ProjectItem) => p.id !== 'PRJ-PENGAMANAN' && p.name.trim().toLowerCase() !== 'pengamanan'
          );
        }
      } catch {
        // fallback
      }
    }
    return ACTIVE_PROJECTS;
  });

  // Current active form data
  const [formData, setFormData] = useState<DailyReportFormData>(() => {
    const saved = localStorage.getItem('gov_current_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          // Jika draft sebelumnya terisi 'Pengamanan' karena auto-fill, kosongkan nama project
          if (parsed.projectName && parsed.projectName.trim().toLowerCase() === 'pengamanan') {
            parsed.projectName = '';
          }
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_REPORT_DATA;
  });

  // Tracking if currently editing an existing report
  const [editingReportId, setEditingReportId] = useState<string | null>(null);

  // List of saved reports: starts empty as requested
  const [savedReports, setSavedReports] = useState<DailyReportFormData[]>(() => {
    const saved = localStorage.getItem('gov_saved_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  // Modals & Drawers state
  const [activeReportModal, setActiveReportModal] = useState<DailyReportFormData | null>(null);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isClearScreenModalOpen, setIsClearScreenModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync projects to local storage
  useEffect(() => {
    localStorage.setItem('gov_network_projects', JSON.stringify(projects));
  }, [projects]);

  // Sync draft to local storage
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('gov_current_draft', JSON.stringify(formData));
    }
  }, [formData, isLoggedIn]);

  // Background Auto-Save (berjalan saat tab diminimalkan, layar mati, atau beralih aplikasi)
  useEffect(() => {
    const handleBgFlush = () => {
      if (isLoggedIn && formData) {
        saveActiveDraftInBackground(formData);
        window.dispatchEvent(new CustomEvent('gov-draft-saved-bg'));
      }
    };
    window.addEventListener('gov-bg-flush-draft', handleBgFlush);
    return () => {
      window.removeEventListener('gov-bg-flush-draft', handleBgFlush);
    };
  }, [formData, isLoggedIn]);

  // Sync saved reports to local storage
  useEffect(() => {
    localStorage.setItem('gov_saved_reports', JSON.stringify(savedReports));
  }, [savedReports]);

  // Real-time synchronization for daily reports & projects from Firebase Firestore (HP ⇋ Laptop)
  useEffect(() => {
    const unsubReports = subscribeToDailyReports(
      (cloudReports) => {
        if (cloudReports && cloudReports.length > 0) {
          setSavedReports(cloudReports);
        }
      },
      (err) => {
        console.warn('Real-time sync daily_reports notification:', err);
      }
    );

    const unsubProjects = subscribeToProjects((cloudProjects) => {
      if (cloudProjects && cloudProjects.length > 0) {
        // Hapus project 'PRJ-PENGAMANAN' atau project bernama 'Pengamanan' jika tersimpan di cloud
        const pengamananItem = cloudProjects.find(
          (p) => p.id === 'PRJ-PENGAMANAN' || p.name.trim().toLowerCase() === 'pengamanan'
        );
        if (pengamananItem) {
          deleteProjectFromCloud(pengamananItem.id).catch(console.warn);
        }

        const filtered = cloudProjects.filter(
          (p) => p.id !== 'PRJ-PENGAMANAN' && p.name.trim().toLowerCase() !== 'pengamanan'
        );
        setProjects(filtered);
      } else {
        setProjects(ACTIVE_PROJECTS);
      }
    });

    return () => {
      unsubReports();
      unsubProjects();
    };
  }, []);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auth handler
  const handleLoginSuccess = (user: CurrentUser) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    setUserEmail(user.email);
    localStorage.setItem('gov_logged_in', 'true');
    localStorage.setItem('gov_user_email', user.email);
    localStorage.setItem('gov_user_role', user.role);

    // Dispatch real-time login email alert ke chaerulloh28@gmail.com
    sendLoginNotification(user.email).catch((err) => {
      console.error('[App] Gagal mengirim notifikasi login:', err);
    });

    showToast(`Autentikasi Berhasil sebagai ${user.role === 'admin' ? 'ADMIN (Full Access)' : 'WASPANG'}.`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('gov_logged_in');
    showToast('Anda telah keluar dari sistem.');
  };

  // ==========================================
  // PROJECT CRUD HANDLERS
  // ==========================================
  const handleAddProject = (projectData: Omit<ProjectItem, 'id' | 'createdAt'>) => {
    const newProject: ProjectItem = {
      ...projectData,
      id: 'proj-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
    saveProjectToCloud(newProject).catch((err) => {
      console.warn('Notice saving project to cloud:', err);
    });

    // Automatically fill into form
    const projectTotalDurasi = newProject.durasiPekerjaan || newProject.totalDurasi || '30';
    const curDay = parseInt(formData.dayNumber || '1', 10);
    const dayCount = !isNaN(curDay) && curDay >= 1 ? curDay : 1;
    const computedDurasi = Math.max(0, parseFloat(projectTotalDurasi) - dayCount).toString();

    const baseSipil = newProject.targetSipil || '1000';
    const baseKabel = newProject.targetKabel || '2000';
    const baseCoax = newProject.targetKabelCoax || '0';
    const baseHH = newProject.targetHH || '10';
    const baseHB = newProject.targetHB || '10';
    const baseMH = newProject.targetMH || '5';

    setFormData((prev) => ({
      ...prev,
      projectName: newProject.name,
      projectId: newProject.code || newProject.id,
      area: newProject.area || prev.area || 'Jabo 1',
      waspangName: newProject.pic || prev.waspangName || '',
      startDate: newProject.startDate || prev.startDate,
      endDate: newProject.endDate || prev.endDate,
      durasiPekerjaan: computedDurasi,
      totalDurasi: projectTotalDurasi,
      baseTargetSipil: baseSipil,
      baseTargetKabel: baseKabel,
      baseTargetKabelCoax: baseCoax,
      baseTargetHH: baseHH,
      baseTargetHB: baseHB,
      baseTargetMH: baseMH,
      totalProgressSipil: baseSipil,
      totalProgressKabel: baseKabel,
      totalProgressKabelCoax: baseCoax,
      totalProgressHH: baseHH,
      totalProgressHB: baseHB,
      totalProgressMH: baseMH,
    }));

    showToast(`Project "${newProject.name}" berhasil ditambahkan.`);
  };

  const handleUpdateProject = (updated: ProjectItem) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    saveProjectToCloud(updated).catch((err) => {
      console.warn('Notice updating project in cloud:', err);
    });
    // If the active form is using this project, update its name as well
    if (formData.projectId === updated.id) {
      const projectTotalDurasi = updated.durasiPekerjaan || updated.totalDurasi || formData.totalDurasi || '30';
      const curDay = parseInt(formData.dayNumber || '1', 10);
      const dayCount = !isNaN(curDay) && curDay >= 1 ? curDay : 1;
      const computedDurasi = Math.max(0, parseFloat(projectTotalDurasi) - dayCount).toString();

      setFormData((prev) => ({
        ...prev,
        projectName: updated.name,
        area: updated.area || prev.area || 'Jabo 1',
        waspangName: updated.pic || prev.waspangName || '',
        startDate: updated.startDate || prev.startDate,
        endDate: updated.endDate || prev.endDate,
        durasiPekerjaan: computedDurasi,
        totalDurasi: projectTotalDurasi,
      }));
    }
    showToast(`Project "${updated.name}" berhasil diperbarui.`);
  };

  const handleDeleteProject = (id: string) => {
    const deleted = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    deleteProjectFromCloud(id).catch((err) => {
      console.warn('Notice deleting project from cloud:', err);
    });
    showToast(`Project "${deleted?.name || id}" telah dihapus.`);
  };

  const handleSelectProject = (project: ProjectItem) => {
    const projectTotalDurasi = project.durasiPekerjaan || project.totalDurasi || formData.totalDurasi || '30';
    const curDay = parseInt(formData.dayNumber || '1', 10);
    const dayCount = !isNaN(curDay) && curDay >= 1 ? curDay : 1;
    const computedDurasi = Math.max(0, parseFloat(projectTotalDurasi) - dayCount).toString();

    const baseSipil = project.targetSipil || formData.baseTargetSipil || '1000';
    const baseKabel = project.targetKabel || formData.baseTargetKabel || '2000';
    const baseCoax = project.targetKabelCoax || formData.baseTargetKabelCoax || '0';
    const baseHH = project.targetHH || formData.baseTargetHH || '10';
    const baseHB = project.targetHB || formData.baseTargetHB || '10';
    const baseMH = project.targetMH || formData.baseTargetMH || '5';

    const curBoring = 
      (parseFloat(formData.boring.boringAlur) || 0) +
      (parseFloat(formData.boring.boringCrossingJalan) || 0) +
      (parseFloat(formData.boring.boringCrossingJalanTol) || 0) +
      (parseFloat(formData.boring.boringCrossingJembatan) || 0);

    const curPulling = 
      (parseFloat(formData.pulling.pulling288) || 0) +
      (parseFloat(formData.pulling.pulling288GL) || 0) +
      (parseFloat(formData.pulling.pulling144) || 0) +
      (parseFloat(formData.pulling.pulling96) || 0) +
      (parseFloat(formData.pulling.pulling96GL) || 0) +
      (parseFloat(formData.pulling.pulling48) || 0) +
      (parseFloat(formData.pulling.pulling24) || 0);

    const curPullingCoax = parseFloat(formData.pulling?.pullingCoax || '0') || 0;

    const curHH = 
      (parseFloat(formData.instalasiHH.hh60x60) || 0) +
      (parseFloat(formData.instalasiHH.hh80x80) || 0) +
      (parseFloat(formData.instalasiHH.hh100x100) || 0) +
      (parseFloat(formData.instalasiHH.hh120x120) || 0);

    const curHB = 
      (parseFloat(formData.instalasiHB.hb60x60) || 0) +
      (parseFloat(formData.instalasiHB.hb80x80) || 0) +
      (parseFloat(formData.instalasiHB.hb100x100) || 0) +
      (parseFloat(formData.instalasiHB.hb120x120) || 0);

    const curMH = 
      (parseFloat(formData.instalasiMH.mh80x80) || 0) +
      (parseFloat(formData.instalasiMH.mh100x100) || 0) +
      (parseFloat(formData.instalasiMH.mh120x120) || 0);

    setFormData((prev) => ({
      ...prev,
      projectName: project.name,
      projectId: project.code || project.id,
      projectCategory: project.category || prev.projectCategory || 'Relokasi Government',
      jenisPengamanan: project.jenisPengamanan || (project.category === 'Pengamanan' ? prev.jenisPengamanan : ''),
      subJenisPerapihanAsset: project.subJenisPerapihanAsset || (project.category === 'Pengamanan' ? prev.subJenisPerapihanAsset : []),
      area: project.area || prev.area || 'Jabo 1',
      waspangName: project.pic || prev.waspangName || '',
      startDate: project.startDate || prev.startDate,
      endDate: project.endDate || prev.endDate,
      durasiPekerjaan: computedDurasi,
      totalDurasi: projectTotalDurasi,
      baseTargetSipil: baseSipil,
      baseTargetKabel: baseKabel,
      baseTargetKabelCoax: baseCoax,
      baseTargetHH: baseHH,
      baseTargetHB: baseHB,
      baseTargetMH: baseMH,
      totalProgressSipil: Math.max(0, (parseFloat(baseSipil) || 0) - curBoring).toString(),
      totalProgressKabel: Math.max(0, (parseFloat(baseKabel) || 0) - curPulling).toString(),
      totalProgressKabelCoax: baseCoax !== '0' ? Math.max(0, (parseFloat(baseCoax) || 0) - curPullingCoax).toString() : (prev.totalProgressKabelCoax || curPullingCoax.toString()),
      totalProgressHH: Math.max(0, (parseFloat(baseHH) || 0) - curHH).toString(),
      totalProgressHB: Math.max(0, (parseFloat(baseHB) || 0) - curHB).toString(),
      totalProgressMH: Math.max(0, (parseFloat(baseMH) || 0) - curMH).toString(),
    }));
    setIsProjectModalOpen(false);
    showToast(`Project terpilih: "${project.name}"`);
  };

  // ==========================================
  // DAILY REPORT CRUD HANDLERS
  // ==========================================
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (editingReportId) {
      // Dapatkan data laporan sebelum diubah untuk menghitung detail perubahannya
      const previousReport = savedReports.find((item) => item.id === editingReportId) || null;
      const prevAuthor = previousReport?.authorEmail || '';

      // Validasi izin edit: Hanya author atau Admin
      const canEdit = currentUser.role === 'admin' || !prevAuthor || prevAuthor.toLowerCase() === currentUser.email.toLowerCase();
      if (!canEdit) {
        showToast(`Akses Ditolak: Hanya pembuat (${prevAuthor}) atau Admin yang dapat menyunting laporan ini.`);
        return;
      }

      // UPDATE EXISTING REPORT
      const updatedReport: DailyReportFormData = {
        ...formData,
        id: editingReportId,
        submittedAt: timestamp + ' (Diedit)',
        authorEmail: previousReport?.authorEmail || currentUser.email,
        authorRole: previousReport?.authorRole || currentUser.role,
        lastEditedBy: currentUser.email,
        syncedToCloud: isOnline,
      };

      setSavedReports((prev) =>
        prev.map((item) => (item.id === editingReportId ? updatedReport : item))
      );

      if (!isOnline) {
        enqueueReportForBackgroundSync(updatedReport, currentUser.email, currentUser.role);
        showToast('Mode Offline: Perubahan disimpan di latar belakang & akan sinkron otomatis.');
      } else {
        // Sinkronisasi background ke cloud storage (Firebase Firestore)
        syncReportToCloud(updatedReport, currentUser).then((res) => {
          if (!res.success) {
            enqueueReportForBackgroundSync(updatedReport, currentUser.email, currentUser.role);
          }
        }).catch((err) => {
          console.error('[App] Gagal cloud sync, dialihkan ke antrean latar belakang:', err);
          enqueueReportForBackgroundSync(updatedReport, currentUser.email, currentUser.role);
        });

        // Trigger notifikasi edit laporan ke chaerulloh28@gmail.com
        sendReportEditNotification(updatedReport, previousReport, currentUser.email).catch((err) => {
          console.error('[App] Gagal mengirim email notifikasi edit laporan:', err);
        });

        showToast(`Perubahan laporan disimpan & sinkron cloud aktif!`);
      }

      setEditingReportId(null);
      setActiveReportModal(updatedReport);
    } else {
      // CREATE NEW REPORT
      const newReportId = 'rep-' + Date.now();
      const reportWithTimestamp: DailyReportFormData = {
        ...formData,
        id: newReportId,
        submittedAt: timestamp,
        authorEmail: currentUser.email,
        authorRole: currentUser.role,
        authorName: currentUser.name || currentUser.email.split('@')[0],
        syncedToCloud: isOnline,
      };

      setSavedReports((prev) => [reportWithTimestamp, ...prev]);

      if (!isOnline) {
        enqueueReportForBackgroundSync(reportWithTimestamp, currentUser.email, currentUser.role);
        showToast('Mode Offline: Laporan disimpan di latar belakang. Akan otomatis dikirim saat online.');
      } else {
        // Sinkronisasi background ke cloud storage (Firebase Firestore)
        syncReportToCloud(reportWithTimestamp, currentUser).then((res) => {
          if (!res.success) {
            enqueueReportForBackgroundSync(reportWithTimestamp, currentUser.email, currentUser.role);
          }
        }).catch((err) => {
          console.error('[App] Gagal cloud sync, dialihkan ke antrean latar belakang:', err);
          enqueueReportForBackgroundSync(reportWithTimestamp, currentUser.email, currentUser.role);
        });

        // Trigger auto-save rekap progress harian ke chaerulloh28@gmail.com
        sendDailyReportNotification(reportWithTimestamp, currentUser.email).catch((err) => {
          console.error('[App] Gagal mengirim email rekap progress harian:', err);
        });

        showToast(`Laporan dibuat oleh ${currentUser.email} & tersimpan aman.`);
      }

      setActiveReportModal(reportWithTimestamp);
    }
  };

  // Start editing a report
  const handleStartEditReport = (report: DailyReportFormData) => {
    const author = report.authorEmail || '';
    const canEdit = currentUser.role === 'admin' || !author || author.toLowerCase() === currentUser.email.toLowerCase();

    if (!canEdit) {
      showToast(`Akses Ditolak: Hanya pembuat (${author}) atau Admin yang dapat menyunting.`);
      return;
    }

    setFormData(report);
    setEditingReportId(report.id || 'rep-' + Date.now());
    setActiveReportModal(null);
    setIsHistoryDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Mode edit aktif untuk laporan: ${report.projectName || 'Project'}`);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingReportId(null);
    handleClearScreen('new_day');
    showToast('Mode edit dibatalkan.');
  };

  // Helper calculate next day number if same project has reports
  const getNextDayNumber = (projName?: string) => {
    const targetProject = projName || formData.projectName;
    if (!targetProject) return '1';
    const sameProjectReports = savedReports.filter(
      (r) => r.projectName === targetProject
    );
    if (sameProjectReports.length > 0) {
      const maxDay = Math.max(
        ...sameProjectReports.map((r) => parseInt(r.dayNumber || '0', 10))
      );
      if (maxDay > 0) {
        return (maxDay + 1).toString();
      }
    }
    const cur = parseInt(formData.dayNumber || '1', 10);
    return (!isNaN(cur) && cur >= 1 ? cur + 1 : 1).toString();
  };

  // Clear Screen / New Daily Progress
  const handleClearScreen = (mode: 'new_day' | 'full_reset') => {
    setIsClearScreenModalOpen(false);
    setEditingReportId(null);
    setActiveReportModal(null);

    const todayStr = new Date().toISOString().split('T')[0];

    if (mode === 'new_day') {
      const nextDay = getNextDayNumber(formData.projectName);
      const totalBase = parseFloat(formData.totalDurasi || '30');
      const nextDayNum = parseInt(nextDay, 10);
      const dayNum = !isNaN(nextDayNum) && nextDayNum >= 1 ? nextDayNum : 1;
      const nextDurasi = Math.max(0, totalBase - dayNum).toString();

      // Find matching project from list for base targets if available
      const matchedProject = projects.find((p) => p.name === formData.projectName);
      const baseSipil = matchedProject?.targetSipil || formData.baseTargetSipil || '1000';
      const baseKabel = matchedProject?.targetKabel || formData.baseTargetKabel || '2000';
      const baseCoax = matchedProject?.targetKabelCoax || formData.baseTargetKabelCoax || '0';
      const baseHH = matchedProject?.targetHH || formData.baseTargetHH || '10';
      const baseHB = matchedProject?.targetHB || formData.baseTargetHB || '10';
      const baseMH = matchedProject?.targetMH || formData.baseTargetMH || '5';

      setFormData({
        ...INITIAL_REPORT_DATA,
        reportDate: todayStr,
        dayNumber: nextDay,
        projectName: formData.projectName,
        projectId: formData.projectId || matchedProject?.id || '',
        area: formData.area || matchedProject?.area || 'Jabo 1',
        waspangName: formData.waspangName || matchedProject?.pic || '',
        startDate: matchedProject?.startDate || formData.startDate,
        endDate: matchedProject?.endDate || formData.endDate,
        durasiPekerjaan: nextDurasi,
        totalDurasi: totalBase.toString(),
        baseTargetSipil: baseSipil,
        baseTargetKabel: baseKabel,
        baseTargetKabelCoax: baseCoax,
        baseTargetHH: baseHH,
        baseTargetHB: baseHB,
        baseTargetMH: baseMH,
        totalProgressSipil: baseSipil,
        totalProgressKabel: baseKabel,
        totalProgressKabelCoax: baseCoax,
        totalProgressHH: baseHH,
        totalProgressHB: baseHB,
        totalProgressMH: baseMH,
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast(`Layar dibersihkan: siap input progres Hari Ke-${nextDay}`);
    } else {
      // Full reset to blank form
      setFormData({
        ...INITIAL_REPORT_DATA,
        reportDate: todayStr,
        dayNumber: '1',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('Layar telah dibersihkan sepenuhnya (Reset Total).');
    }
  };

  // Reset to new report (defaults to next day for active project)
  const handleNewReport = () => {
    handleClearScreen('new_day');
  };

  // Delete saved report (supports reportId string or index number)
  const handleDeleteReport = (targetReportOrId: string | number) => {
    let target: DailyReportFormData | undefined;
    if (typeof targetReportOrId === 'number') {
      target = savedReports[targetReportOrId];
    } else {
      target = savedReports.find((r) => r.id === targetReportOrId);
    }
    if (!target) return;

    const author = target.authorEmail || '';
    const canDelete = currentUser.role === 'admin' || !author || author.toLowerCase() === currentUser.email.toLowerCase();

    if (!canDelete) {
      showToast(`Akses Ditolak: Hanya pembuat (${author}) atau Admin yang dapat menghapus laporan ini.`);
      return;
    }

    setSavedReports((prev) => prev.filter((r) => r.id !== target!.id));

    // Sinkronisasi hapus ke cloud
    if (target.id) {
      deleteReportFromCloud(target.id, currentUser).catch((err) => {
        console.error('[App] Gagal menghapus laporan di cloud:', err);
      });
    }

    if (editingReportId && target?.id === editingReportId) {
      handleCancelEdit();
    }
    if (activeReportModal && activeReportModal.id === target.id) {
      setActiveReportModal(null);
    }
    showToast(`Laporan "${target.projectName || 'Project'}" berhasil dihapus.`);
  };

  return (
    <div className="min-h-[100dvh] bg-[#050b14] text-slate-100 flex flex-col items-center selection:bg-cyan-500 selection:text-black font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="system-toast"
          className="fixed top-4 z-50 px-4 py-2.5 rounded-xl bg-[#09142b] border border-cyan-400 text-cyan-200 text-xs font-mono-cyber shadow-xl shadow-cyan-950/80 flex items-center gap-2 animate-fadeIn"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Viewport Container: Mobile-First Layout */}
      {!isLoggedIn ? (
        // 1. Halaman Login
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        // 2. Halaman Laporan Harian (Setelah Login)
        <div className="w-full max-w-2xl min-h-[100dvh] flex flex-col bg-[#050b14] relative border-x border-slate-900/60 shadow-2xl shadow-cyan-950/20">
          
          {/* Header Component */}
          <ReportHeader
            userEmail={currentUser.email}
            userRole={currentUser.role}
            onLogout={handleLogout}
            savedReportsCount={savedReports.length}
            onOpenHistory={() => setIsHistoryDrawerOpen(true)}
            onOpenProjects={() => setIsProjectModalOpen(true)}
            onOpenClearScreen={() => setIsClearScreenModalOpen(true)}
          />

          {/* Body Content / Form */}
          <main className="flex-1 px-3 sm:px-5 pt-2 pb-8">
            <MobileInstallBanner />
            <BackgroundStatusBanner />
            
            <DailyReportForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleFormSubmit}
              projects={projects}
              onOpenProjectManagement={() => setIsProjectModalOpen(true)}
              onOpenClearScreen={() => setIsClearScreenModalOpen(true)}
              isEditing={!!editingReportId}
              onCancelEdit={handleCancelEdit}
              onDeleteCurrentReport={() => {
                if (editingReportId) {
                  handleDeleteReport(editingReportId);
                }
              }}
            />
          </main>

          {/* Modal Recap / Success Preview with WhatsApp Sharing, Edit & Delete */}
          <ReportSummaryModal
            report={activeReportModal}
            currentUser={currentUser}
            onClose={() => setActiveReportModal(null)}
            onNewReport={handleNewReport}
            onEditReport={handleStartEditReport}
            onDeleteReport={handleDeleteReport}
          />

          {/* Saved Reports Drawer */}
          <SavedReportsDrawer
            isOpen={isHistoryDrawerOpen}
            onClose={() => setIsHistoryDrawerOpen(false)}
            reports={savedReports}
            currentUser={currentUser}
            onSelectReport={(report) => {
              setActiveReportModal(report);
            }}
            onEditReport={handleStartEditReport}
            onDeleteReport={handleDeleteReport}
            onNewReport={handleNewReport}
          />

          {/* Project Management Modal (CRUD) */}
          <ProjectManagementModal
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            projects={projects}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onSelectProject={handleSelectProject}
            currentProjectName={formData.projectName}
          />

          {/* Clear Screen Modal */}
          <ClearScreenModal
            isOpen={isClearScreenModalOpen}
            onClose={() => setIsClearScreenModalOpen(false)}
            onClearScreen={handleClearScreen}
            projectName={formData.projectName}
            currentDay={formData.dayNumber}
            nextDayCalculated={getNextDayNumber(formData.projectName)}
          />

        </div>
      )}

    </div>
  );
}

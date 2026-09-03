import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { ReportHeader } from './components/ReportHeader';
import { DailyReportForm } from './components/DailyReportForm';
import { ReportSummaryModal } from './components/ReportSummaryModal';
import { SavedReportsDrawer } from './components/SavedReportsDrawer';
import { ProjectManagementModal } from './components/ProjectManagementModal';
import { DailyReportFormData, ProjectItem } from './types';
import { INITIAL_REPORT_DATA } from './data';
import { CheckCircle } from 'lucide-react';

export default function App() {
  // Auth state: dummy login as requested
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('gov_logged_in') === 'true';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('gov_user_email') || 'pengawas.lapangan@gov-network.id';
  });

  // Master projects list: starts empty as requested
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    const saved = localStorage.getItem('gov_network_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  // Current active form data
  const [formData, setFormData] = useState<DailyReportFormData>(() => {
    const saved = localStorage.getItem('gov_current_draft');
    if (saved) {
      try {
        return JSON.parse(saved);
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

  // Sync saved reports to local storage
  useEffect(() => {
    localStorage.setItem('gov_saved_reports', JSON.stringify(savedReports));
  }, [savedReports]);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auth handler
  const handleLoginSuccess = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    localStorage.setItem('gov_logged_in', 'true');
    localStorage.setItem('gov_user_email', email);
    showToast('Autentikasi Pengawas Berhasil. Sesi Logger Aktif.');
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

    // Automatically fill into form
    setFormData((prev) => ({
      ...prev,
      projectName: newProject.name,
      projectId: newProject.id,
      waspangName: newProject.pic || prev.waspangName || '',
      startDate: newProject.startDate || prev.startDate,
      endDate: newProject.endDate || prev.endDate,
    }));

    showToast(`Project "${newProject.name}" berhasil ditambahkan.`);
  };

  const handleUpdateProject = (updated: ProjectItem) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    // If the active form is using this project, update its name as well
    if (formData.projectId === updated.id) {
      setFormData((prev) => ({
        ...prev,
        projectName: updated.name,
        waspangName: updated.pic || prev.waspangName || '',
        startDate: updated.startDate || prev.startDate,
        endDate: updated.endDate || prev.endDate,
      }));
    }
    showToast(`Project "${updated.name}" berhasil diperbarui.`);
  };

  const handleDeleteProject = (id: string) => {
    const deleted = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    showToast(`Project "${deleted?.name || id}" telah dihapus.`);
  };

  const handleSelectProject = (project: ProjectItem) => {
    setFormData((prev) => ({
      ...prev,
      projectName: project.name,
      projectId: project.id,
      waspangName: project.pic || prev.waspangName || '',
      startDate: project.startDate || prev.startDate,
      endDate: project.endDate || prev.endDate,
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

    if (editingReportId) {
      // UPDATE EXISTING REPORT
      const updatedReport: DailyReportFormData = {
        ...formData,
        id: editingReportId,
        submittedAt: timestamp + ' (Diedit)',
      };

      setSavedReports((prev) =>
        prev.map((item) => (item.id === editingReportId ? updatedReport : item))
      );

      setEditingReportId(null);
      setActiveReportModal(updatedReport);
      showToast('Perubahan laporan progress harian berhasil diperbarui!');
    } else {
      // CREATE NEW REPORT
      const newReportId = 'rep-' + Date.now();
      const reportWithTimestamp: DailyReportFormData = {
        ...formData,
        id: newReportId,
        submittedAt: timestamp,
      };

      setSavedReports((prev) => [reportWithTimestamp, ...prev]);
      setActiveReportModal(reportWithTimestamp);
      showToast('Laporan progress harian berhasil disimpan!');
    }
  };

  // Start editing a report
  const handleStartEditReport = (report: DailyReportFormData) => {
    setFormData(report);
    setEditingReportId(report.id || 'rep-' + Date.now());
    setActiveReportModal(null);
    setIsHistoryDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Mode edit aktif untuk laporan ${report.projectName || ''}`);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingReportId(null);
    handleNewReport();
    showToast('Mode edit dibatalkan.');
  };

  // Reset to new report
  const handleNewReport = () => {
    setActiveReportModal(null);
    setEditingReportId(null);

    // Calculate next day number if same project has reports
    let nextDay = '1';
    const sameProjectReports = savedReports.filter(
      (r) => r.projectName === formData.projectName
    );
    if (sameProjectReports.length > 0) {
      const maxDay = Math.max(
        ...sameProjectReports.map((r) => parseInt(r.dayNumber || '0', 10))
      );
      if (maxDay > 0) {
        nextDay = (maxDay + 1).toString();
      }
    }

    setFormData({
      ...INITIAL_REPORT_DATA,
      reportDate: new Date().toISOString().split('T')[0],
      dayNumber: nextDay,
      projectName: formData.projectName, // preserve active project name for ease of daily logging
      projectId: formData.projectId,
      waspangName: formData.waspangName,
      startDate: formData.startDate,
      endDate: formData.endDate,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete saved report
  const handleDeleteReport = (index: number) => {
    const target = savedReports[index];
    setSavedReports((prev) => prev.filter((_, i) => i !== index));
    if (editingReportId && target?.id === editingReportId) {
      handleCancelEdit();
    }
    showToast('Laporan dihapus dari riwayat.');
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
            userEmail={userEmail}
            onLogout={handleLogout}
            savedReportsCount={savedReports.length}
            onOpenHistory={() => setIsHistoryDrawerOpen(true)}
            onOpenProjects={() => setIsProjectModalOpen(true)}
          />

          {/* Body Content / Form */}
          <main className="flex-1 px-3 sm:px-5 pt-4 pb-8">
            <DailyReportForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleFormSubmit}
              projects={projects}
              onOpenProjectManagement={() => setIsProjectModalOpen(true)}
              isEditing={!!editingReportId}
              onCancelEdit={handleCancelEdit}
            />
          </main>

          {/* Modal Recap / Success Preview with WhatsApp Sharing & Edit */}
          <ReportSummaryModal
            report={activeReportModal}
            onClose={() => setActiveReportModal(null)}
            onNewReport={handleNewReport}
            onEditReport={handleStartEditReport}
          />

          {/* Saved Reports Drawer */}
          <SavedReportsDrawer
            isOpen={isHistoryDrawerOpen}
            onClose={() => setIsHistoryDrawerOpen(false)}
            reports={savedReports}
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

        </div>
      )}

    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AccessGovernance } from './components/AccessGovernance';
import { AiChatbot } from './components/AiChatbot';
import { DeveloperDocs } from './components/DeveloperDocs';
import { IncidentModal } from './components/IncidentModal';
import { LiveExplorer } from './components/LiveExplorer';
import { LoginPage } from './components/LoginPage';
import { MetricsCharts } from './components/MetricsCharts';
import { Navbar } from './components/Navbar';
import { PayloadSimulator } from './components/PayloadSimulator';
import { ProjectManager } from './components/ProjectManager';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { UserManagement } from './components/UserManagement';
import { UserManual } from './components/UserManual';
import { getProjects, getStats, onSessionRevoked, queryLogs, updateIncidentStatus, validateSession } from './services/api';
import { signalRService } from './services/signalr';
import type { LogStats, Project, RorrLog, User } from './types/rorr';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rorr_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('metrics');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // Collapsed / OFF by default!
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [logs, setLogs] = useState<RorrLog[]>([]);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [isArchivedFilter, setIsArchivedFilter] = useState<boolean | undefined>(undefined);
  const [isResolvedFilter, setIsResolvedFilter] = useState<boolean | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [autoScroll, setAutoScroll] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<RorrLog | null>(null);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [revocationMessage, setRevocationMessage] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.roleName?.toLowerCase() === 'admin';
  const permissions = currentUser?.permissions || [];
  const canViewUsers = isAdmin || permissions.includes('users.view');
  const canManageRoles = isAdmin || permissions.includes('roles.manage');
  const canManageProjects = isAdmin || permissions.includes('projects.create') || permissions.includes('projects.manage_keys');

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setRevocationMessage(null);
    localStorage.setItem('rorr_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rorr_user');
  };

  // Listen to background API 401/403 session revocation
  useEffect(() => {
    const unsubscribe = onSessionRevoked((message) => {
      setRevocationMessage(message);
      handleLogout();
    });
    return unsubscribe;
  }, []);

  // Periodic active session validation check
  useEffect(() => {
    if (!currentUser?.id) return;
    let isMounted = true;

    const checkSession = async () => {
      try {
        const res = await validateSession(currentUser.id);
        if (!res.isActive && isMounted) {
          setRevocationMessage('Access has been revoked. Your account is no longer active in the system.');
          handleLogout();
        }
      } catch (err: any) {
        if (isMounted) {
          const msg = err?.response?.data?.message || 'Access revoked: Account removed from system.';
          setRevocationMessage(msg);
          handleLogout();
        }
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser?.id]);

  // Fetch registered projects
  const fetchProjects = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  }, [currentUser]);

  // Fetch error logs
  const fetchLogs = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await queryLogs({
        projectCode: selectedProject || undefined,
        severity: selectedSeverity || undefined,
        search: searchTerm || undefined,
        isArchived: isArchivedFilter,
        isResolved: isResolvedFilter,
        page,
        pageSize: 25,
      });
      setLogs(res.items);
      setTotalLogs(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to query logs:', err);
    }
  }, [currentUser, selectedProject, selectedSeverity, searchTerm, isArchivedFilter, isResolvedFilter, page]);

  // Fetch metrics stats
  const fetchMetrics = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await getStats(selectedProject || undefined);
      setStats(res);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [currentUser, selectedProject]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchLogs();
    fetchMetrics();
  }, [fetchLogs, fetchMetrics]);

  // Real-time SignalR listener setup
  useEffect(() => {
    if (!currentUser) return;
    
    const syncSubscription = () => {
      if (selectedProject) {
        signalRService.subscribeToProject(selectedProject);
      } else {
        signalRService.subscribeToGlobal();
      }
    };

    signalRService.startConnection(syncSubscription);
    syncSubscription();

    const unsubscribe = signalRService.onLogReceived((newLog: RorrLog) => {
      if (isStreaming) {
        if (selectedProject && newLog.projectCode.toUpperCase() !== selectedProject.toUpperCase()) {
          return;
        }

        setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
        setTotalLogs((prev) => prev + 1);
        fetchMetrics();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, isStreaming, selectedProject, fetchMetrics]);

  const handleStatusChange = async (id: string, updates: { isArchived?: boolean; isResolved?: boolean }) => {
    try {
      const updated = await updateIncidentStatus(id, updates);
      setLogs((prev) => prev.map((l) => (l.id === id ? updated : l)));
      if (selectedLog?.id === id) {
        setSelectedLog(updated);
      }
      fetchMetrics();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // If user is not logged in, show Enterprise Login Page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} revocationMessage={revocationMessage} />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#07090e] text-slate-100 font-sans relative">
      <Navbar
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={(code) => {
          setSelectedProject(code);
          setPage(1);
        }}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 flex overflow-hidden">
          {activeTab === 'stream' && (
            <LiveExplorer
              logs={logs}
              total={totalLogs}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              selectedSeverity={selectedSeverity}
              onSeverityChange={(sev) => {
                setSelectedSeverity(sev);
                setPage(1);
              }}
              isArchivedFilter={isArchivedFilter}
              onArchivedFilterChange={setIsArchivedFilter}
              isResolvedFilter={isResolvedFilter}
              onResolvedFilterChange={setIsResolvedFilter}
              onRefresh={fetchLogs}
              onSelectLog={setSelectedLog}
              autoScroll={autoScroll}
              onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
            />
          )}

          {activeTab === 'metrics' && <MetricsCharts stats={stats} selectedProject={selectedProject} />}

          {activeTab === 'simulator' && (
            <PayloadSimulator
              projects={projects}
              onSuccess={() => {
                fetchLogs();
                fetchMetrics();
              }}
            />
          )}

          {activeTab === 'docs' && <DeveloperDocs />}

          {activeTab === 'projects' && (
            canManageProjects ? (
              <ProjectManager projects={projects} onProjectCreated={fetchProjects} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
                <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-xl">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
                <p className="text-xs text-slate-400 max-w-md font-mono">
                  Your role does not have permission to register new projects or manage project API keys.
                </p>
              </div>
            )
          )}

          {activeTab === 'users' && (
            canViewUsers ? (
              <UserManagement />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
                <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-xl">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
                <p className="text-xs text-slate-400 max-w-md font-mono">
                  Your account does not have permission to view or manage system users. Contact your administrator to request access.
                </p>
              </div>
            )
          )}

          {activeTab === 'governance' && (
            canManageRoles ? (
              <AccessGovernance />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
                <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-xl">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
                <p className="text-xs text-slate-400 max-w-md font-mono">
                  Your account does not have permission to configure access governance and system roles.
                </p>
              </div>
            )
          )}

          {activeTab === 'manual' && <UserManual />}
        </main>
      </div>

      <IncidentModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onStatusChange={handleStatusChange}
      />

      {/* Floating Rorr AI Assistant at bottom right */}
      <AiChatbot currentLog={selectedLog} />
    </div>
  );
}

export default App;

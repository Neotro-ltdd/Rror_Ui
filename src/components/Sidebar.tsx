import React from 'react';
import { BarChart3, BookOpen, Code2, FolderKanban, KeyRound, LogOut, PlaySquare, Radio, Shield, Users, X } from 'lucide-react';
import type { User } from '../types/rorr';

export type NavTab = 'metrics' | 'stream' | 'simulator' | 'docs' | 'projects' | 'users' | 'governance' | 'manual';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser?: User | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<Props> = ({ isOpen, onClose, activeTab, onTabChange, currentUser, onLogout }) => {
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.roleName?.toLowerCase() === 'admin';
  const permissions = currentUser?.permissions || [];
  const hasPerm = (code: string) => isAdmin || permissions.includes(code);

  const rawNavItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; visible: boolean }[] = [
    { id: 'metrics', label: 'Analytics & Metrics', icon: BarChart3, visible: true },
    { id: 'stream', label: 'Live Explorer', icon: Radio, visible: true },
    { id: 'simulator', label: 'Payload Simulator', icon: PlaySquare, visible: true },
    { id: 'docs', label: 'Integration SDKs', icon: Code2, visible: true },
    { id: 'projects', label: 'Project Keys', icon: FolderKanban, visible: hasPerm('projects.create') || hasPerm('projects.manage_keys') },
    { id: 'users', label: 'User Management', icon: Users, visible: hasPerm('users.view') },
    { id: 'governance', label: 'Access Governance', icon: KeyRound, visible: hasPerm('roles.manage') },
    { id: 'manual', label: 'User Manual & Docs', icon: BookOpen, visible: true },
  ];

  const navItems = rawNavItems.filter((item) => item.visible);

  const handleSelectTab = (tab: NavTab) => {
    onTabChange(tab);
    onClose(); // Automatically collapse sidebar after clicking a tab for maximum workspace area!
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay for closing menu */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Collapsible Slide-out Sidebar Drawer */}
      <aside className="fixed left-0 top-16 bottom-0 z-50 w-72 border-r border-[#27272a] bg-[#121215] flex flex-col justify-between py-5 select-none shadow-2xl animate-in slide-in-from-left duration-200">
        <div className="space-y-2 px-4">
          <div className="pb-3 mb-2 border-b border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300">
                Navigation Deck
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-[#18181b] transition"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id as NavTab)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-[#18181b] text-emerald-400 border border-emerald-500/30 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#18181b]/60'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full"></div>
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3 px-4">
          {currentUser && (
            <div className="p-3.5 bg-[#18181b] rounded-2xl border border-[#27272a] flex items-center justify-between shadow-inner">
              <div className="truncate space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
                </div>
                <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider font-semibold">
                  {currentUser.role} Tier
                </p>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <div className="px-4 py-2.5 bg-[#09090b] rounded-xl border border-[#27272a] text-center">
            <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Rorr Diagnostics Hub</p>
            <p className="text-[9px] text-zinc-400 font-mono mt-0.5">System SRS v1.1.0 Ready</p>
          </div>
        </div>
      </aside>
    </>
  );
};



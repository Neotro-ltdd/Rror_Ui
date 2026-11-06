import React from 'react';
import { LogOut, PanelLeft, Radio, Search } from 'lucide-react';
import type { Project, User } from '../types/rorr';

interface Props {
  projects: Project[];
  selectedProject: string;
  onSelectProject: (code: string) => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  currentUser?: User | null;
  onLogout?: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<Props> = ({
  projects,
  selectedProject,
  onSelectProject,
  isStreaming,
  onToggleStreaming,
  searchTerm,
  onSearchChange,
  currentUser,
  onLogout,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  return (
    <header className="h-16 border-b border-[#27272a] bg-[#121215]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Project Selector */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Collapsible Sidebar Menu Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-2 cursor-pointer ${
            isSidebarOpen
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-bold'
              : 'bg-[#18181b] text-zinc-300 border-[#27272a] hover:text-emerald-400 hover:border-zinc-700'
          }`}
          title={isSidebarOpen ? 'Collapse Navigation Menu' : 'Open Navigation Menu'}
        >
          <PanelLeft className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-semibold">
            {isSidebarOpen ? 'Menu: ON' : 'Menu'}
          </span>
        </button>

        <div className="flex items-center gap-3">
          <img
            src="/rorr-icon.png"
            alt="RORR Logo"
            className="w-8 h-8 rounded-lg object-contain drop-shadow-[0_0_12px_rgba(31,214,138,0.35)] shrink-0"
          />
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white tracking-wider font-sans">RORR</span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                v1.2
              </span>
            </div>
            <p className="text-[9px] text-zinc-400 font-mono tracking-widest uppercase">System Error Intelligence</p>
          </div>
        </div>

        <div className="h-5 w-px bg-[#27272a] hidden sm:block" />

        {/* Project Selector */}
        <select
          value={selectedProject}
          onChange={(e) => onSelectProject(e.target.value)}
          className="bg-[#18181b] border border-[#27272a] text-zinc-200 text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 transition cursor-pointer hover:border-zinc-700"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.projectCode}>
              {p.projectCode} - {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Global Search & Actions */}
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search errors, endpoints..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Live Stream Toggle Button */}
        <button
          onClick={onToggleStreaming}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition border ${
            isStreaming
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-[#18181b] text-zinc-400 border-[#27272a] hover:text-zinc-200'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'animate-pulse text-emerald-400' : ''}`} />
          <span>{isStreaming ? 'Stream: Active' : 'Stream: Paused'}</span>
        </button>

        {/* User Profile & Logout */}
        {currentUser && (
          <div className="flex items-center gap-3 pl-3 border-l border-[#27272a]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white leading-none">{currentUser.fullName}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{currentUser.email}</p>
              </div>
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
      </div>
    </header>
  );
};


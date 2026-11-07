import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, FolderKanban, Layers, ShieldCheck, XCircle } from 'lucide-react';
import type { LogStats } from '../types/rorr';

interface Props {
  stats: LogStats | null;
  selectedProject: string;
  onRefresh?: () => void;
}

export const MetricsCharts: React.FC<Props> = ({ stats, selectedProject, onRefresh }) => {
  if (!stats) {
    return (
      <div className="p-12 text-center text-zinc-400 font-mono text-xs space-y-3">
        <p className="animate-pulse">[SYS_MONITOR] Querying real-time telemetry metrics...</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 text-[11px] transition cursor-pointer"
          >
            ↻ Retry Telemetry Sync
          </button>
        )}
      </div>
    );
  }

  const activeTotal = stats.totalActiveUnresolved || 1;
  const criticalPct = ((stats.activeCriticalCount / activeTotal) * 100).toFixed(1);
  const errorPct = ((stats.activeErrorCount / activeTotal) * 100).toFixed(1);
  const warningPct = ((stats.activeWarningCount / activeTotal) * 100).toFixed(1);
  const infoPct = ((stats.activeInfoCount / activeTotal) * 100).toFixed(1);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-[#09090b]">
      {/* Dashboard Title & Overview Banner */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
            Telemetry Analytics & System Control Deck
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Real-time telemetry for {selectedProject ? `Project: ${selectedProject}` : 'All Monitored Application Systems'}.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Ingestion Engine: ONLINE</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Monitored Projects */}
        <div className="p-4 rounded-2xl bg-[#121215] border border-[#27272a] space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Monitored Apps</span>
            <FolderKanban className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-mono font-extrabold text-white">{stats.totalProjects}</p>
          <span className="text-[10px] text-emerald-400 font-mono block">{stats.activeProjects} active projects</span>
        </div>

        {/* Active Unresolved Errors */}
        <div className="p-4 rounded-2xl bg-[#121215] border border-[#27272a] space-y-1">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Active Incidents</span>
          <p className="text-2xl font-mono font-extrabold text-amber-400">{stats.totalActiveUnresolved}</p>
          <span className="text-[10px] font-mono text-zinc-400 block">Pending developer action</span>
        </div>

        {/* Active Critical */}
        <div className="p-4 rounded-2xl bg-[#1c0f14] border border-[#ef4444]/30 space-y-1">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Critical</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-mono font-extrabold text-red-400">{stats.activeCriticalCount}</p>
          <span className="text-[10px] font-mono text-red-400/80 block">{criticalPct}% of active</span>
        </div>

        {/* Active Error */}
        <div className="p-4 rounded-2xl bg-[#1c140f] border border-[#f97316]/30 space-y-1">
          <div className="flex items-center justify-between text-orange-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Errors</span>
            <AlertOctagon className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-mono font-extrabold text-orange-400">{stats.activeErrorCount}</p>
          <span className="text-[10px] font-mono text-orange-400/80 block">{errorPct}% of active</span>
        </div>

        {/* Active Warnings */}
        <div className="p-4 rounded-2xl bg-[#1c190f] border border-[#f59e0b]/30 space-y-1">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-mono font-extrabold text-amber-400">{stats.activeWarningCount}</p>
          <span className="text-[10px] font-mono text-amber-400/80 block">{warningPct}% of active</span>
        </div>

        {/* Cleared & Resolved */}
        <div className="p-4 rounded-2xl bg-[#0f1c16] border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-mono font-extrabold text-emerald-400">{stats.resolvedCount}</p>
          <span className="text-[10px] font-mono text-emerald-400/80 block">Lifetime resolved</span>
        </div>
      </div>

      {/* System Volume Bar & Top Failing Endpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Progress Breakdown */}
        <div className="p-6 rounded-2xl bg-[#121215] border border-[#27272a] space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" /> Active Severity Distribution
            </h3>
            <span className="text-xs text-zinc-400 font-mono">Total Lifetime: {stats.totalLogs}</span>
          </div>

          <div className="h-4 w-full bg-[#09090b] rounded-full overflow-hidden flex border border-[#27272a]">
            <div style={{ width: `${criticalPct}%` }} className="bg-red-500 h-full" title={`Critical: ${stats.activeCriticalCount}`} />
            <div style={{ width: `${errorPct}%` }} className="bg-orange-500 h-full" title={`Error: ${stats.activeErrorCount}`} />
            <div style={{ width: `${warningPct}%` }} className="bg-amber-500 h-full" title={`Warning: ${stats.activeWarningCount}`} />
            <div style={{ width: `${infoPct}%` }} className="bg-emerald-500 h-full" title={`Info: ${stats.activeInfoCount}`} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-300">
              <div className="w-3 h-3 rounded bg-red-500 shrink-0" />
              <span>Critical ({stats.activeCriticalCount})</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <div className="w-3 h-3 rounded bg-orange-500 shrink-0" />
              <span>Errors ({stats.activeErrorCount})</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <div className="w-3 h-3 rounded bg-amber-500 shrink-0" />
              <span>Warnings ({stats.activeWarningCount})</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <div className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
              <span>Information ({stats.activeInfoCount})</span>
            </div>
          </div>
        </div>

        {/* Top Failing Endpoints */}
        <div className="p-6 rounded-2xl bg-[#121215] border border-[#27272a] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Top Failing Endpoints (Unresolved)</span>
            <span className="text-xs font-mono text-zinc-400 font-normal">Active Trace</span>
          </h3>

          {stats.topEndpoints.length === 0 ? (
            <p className="text-xs text-zinc-500 font-mono italic">No active unresolved endpoint errors recorded.</p>
          ) : (
            <div className="space-y-3">
              {stats.topEndpoints.map((ep, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-200 truncate max-w-xs">{ep.endpoint}</span>
                    <span className="text-orange-400 font-bold">{ep.count} errors</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#09090b] rounded-full overflow-hidden border border-[#27272a]">
                    <div
                      style={{ width: `${Math.min(100, (ep.count / (stats.totalActiveUnresolved || 1)) * 100)}%` }}
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


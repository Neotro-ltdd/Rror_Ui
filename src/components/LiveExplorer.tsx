import React, { useEffect, useRef } from 'react';
import { AlertCircle, AlertTriangle, Archive, CheckCircle2, ChevronLeft, ChevronRight, Info, RefreshCw, XCircle } from 'lucide-react';
import type { LogSeverity, RorrLog } from '../types/rorr';

interface Props {
  logs: RorrLog[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  selectedSeverity: string;
  onSeverityChange: (sev: string) => void;
  isArchivedFilter: boolean | undefined;
  onArchivedFilterChange: (val: boolean | undefined) => void;
  isResolvedFilter: boolean | undefined;
  onResolvedFilterChange: (val: boolean | undefined) => void;
  onRefresh: () => void;
  onSelectLog: (log: RorrLog) => void;
  autoScroll: boolean;
  onToggleAutoScroll: () => void;
}

export const LiveExplorer: React.FC<Props> = ({
  logs,
  total,
  page,
  totalPages,
  onPageChange,
  selectedSeverity,
  onSeverityChange,
  isArchivedFilter,
  onArchivedFilterChange,
  isResolvedFilter,
  onResolvedFilterChange,
  onRefresh,
  onSelectLog,
  autoScroll,
  onToggleAutoScroll,
}) => {
  const tableBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && tableBottomRef.current) {
      tableBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const getSeverityBadge = (severity: LogSeverity) => {
    switch (severity) {
      case 'Critical':
        return (
          <span className="badge-critical px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
            <XCircle className="w-3 h-3 text-[#ff2a55]" /> CRITICAL
          </span>
        );
      case 'Error':
        return (
          <span className="badge-error px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
            <AlertCircle className="w-3 h-3 text-[#ff6b35]" /> ERROR
          </span>
        );
      case 'Warning':
        return (
          <span className="badge-warning px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
            <AlertTriangle className="w-3 h-3 text-[#ffbe0b]" /> WARNING
          </span>
        );
      default:
        return (
          <span className="badge-info px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
            <Info className="w-3 h-3 text-[#3a86ff]" /> INFO
          </span>
        );
    }
  };

  const isRecentLog = (dateStr: string) => {
    try {
      const diff = Math.abs(Date.now() - new Date(dateStr).getTime());
      return diff < 20000; // Received or created within 20 seconds
    } catch {
      return false;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] overflow-hidden">
      {/* Control Toolbar */}
      <div className="p-4 border-b border-[#27272a] bg-[#121215]/80 backdrop-blur-md flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Severity Filter Pills */}
          <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded-xl border border-[#27272a]">
            {['', 'Critical', 'Error', 'Warning', 'Information'].map((sev) => (
              <button
                key={sev}
                onClick={() => onSeverityChange(sev)}
                className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg transition-all ${
                  selectedSeverity === sev
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]'
                }`}
              >
                {sev || 'All Severities'}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <button
            onClick={() => onResolvedFilterChange(isResolvedFilter === true ? undefined : true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition flex items-center gap-1.5 ${
              isResolvedFilter === true
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm'
                : 'bg-[#09090b] text-zinc-400 border-[#27272a] hover:text-zinc-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved</span>
          </button>

          <button
            onClick={() => onArchivedFilterChange(isArchivedFilter === true ? undefined : true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition flex items-center gap-1.5 ${
              isArchivedFilter === true
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-sm'
                : 'bg-[#09090b] text-zinc-400 border-[#27272a] hover:text-zinc-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archived</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto Scroll Toggle */}
          <label className="flex items-center gap-2 text-xs font-mono text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={onToggleAutoScroll}
              className="rounded bg-[#09090b] border-[#27272a] text-emerald-500 focus:ring-emerald-500"
            />
            <span>Auto-scroll</span>
          </label>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-xl bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/40 transition"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="text-xs font-mono text-zinc-400">
            Records: <span className="font-bold text-emerald-400">{total}</span>
          </div>
        </div>
      </div>

      {/* Log Data Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {logs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-[#27272a] rounded-2xl p-6 text-center bg-[#121215]/40">
            <Info className="w-8 h-8 text-emerald-400/60 mb-2" />
            <p className="text-sm font-bold text-zinc-200">No incident logs match your active query</p>
            <p className="text-xs text-zinc-400 mt-1 font-mono">Use the Payload Simulator or trigger exceptions in your application project.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const isNewArrival = isRecentLog(log.createdAtUtc);
              return (
                <div
                  key={log.id}
                  onClick={() => onSelectLog(log)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-sm relative overflow-hidden ${
                    isNewArrival
                      ? 'border-emerald-500/60 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse'
                      : 'border-[#27272a] bg-[#121215] hover:bg-[#18181b] hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isNewArrival && (
                      <span className="flex h-2 w-2 relative shrink-0" title="Live Arrival">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}

                    {getSeverityBadge(log.severity)}

                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#18181b] text-emerald-400 rounded-md border border-[#27272a] shrink-0">
                    {log.projectCode}
                  </span>

                  <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-950/40 text-purple-300 rounded-md border border-purple-800/40 shrink-0">
                    {log.errorCode}
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs font-mono text-zinc-200 truncate group-hover:text-emerald-400 transition">
                      {log.message}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono mt-0.5">
                      <span>Endpoint: <strong className="text-zinc-300">{log.endpoint || '-'}</strong></span>
                      <span className="hidden md:inline">• Source: {log.source || '-'}</span>
                      {log.isResolved && <span className="text-emerald-400 font-bold">✓ Resolved</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-zinc-300 font-bold block">
                    {new Date(log.createdAtUtc).toLocaleTimeString()}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">
                    {new Date(log.createdAtUtc).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
            <div ref={tableBottomRef} />
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[#27272a] bg-[#121215]/80 backdrop-blur-md flex items-center justify-between">
        <div className="text-xs font-mono text-zinc-400">
          Page <span className="font-bold text-emerald-400">{page}</span> of{' '}
          <span className="font-bold text-zinc-200">{totalPages || 1}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-1.5 rounded-xl bg-[#18181b] border border-[#27272a] text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#27272a] hover:text-emerald-400 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-1.5 rounded-xl bg-[#18181b] border border-[#27272a] text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#27272a] hover:text-emerald-400 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};


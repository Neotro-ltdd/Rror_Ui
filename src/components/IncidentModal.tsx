import React, { useState } from 'react';
import { AlertOctagon, Check, Copy, ExternalLink, FileCode, Layers, Terminal, X } from 'lucide-react';
import type { RorrLog } from '../types/rorr';

interface Props {
  log: RorrLog | null;
  onClose: () => void;
  onStatusChange?: (id: string, updates: { isArchived?: boolean; isResolved?: boolean }) => void;
}

export const IncidentModal: React.FC<Props> = ({ log, onClose, onStatusChange }) => {
  const [activeTab, setActiveTab] = useState<'stack' | 'inner' | 'payload' | 'markdown'>('stack');
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const severityStr = String(log.severity ?? 'Error');
  const severityUpper = severityStr.toUpperCase();

  const formatDateSafe = (dateStr?: string) => {
    if (!dateStr) return new Date().toISOString();
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    } catch {
      return String(dateStr);
    }
  };

  const generateMarkdownNote = () => {
    try {
      return `
### 🚨 Incident Bug Ticket: [${log.projectCode ?? 'UNKNOWN'}] ${log.errorName ?? log.errorCode ?? 'Error'}
* **Incident ID:** \`${log.id ?? 'N/A'}\`
* **Endpoint / Job:** \`${log.endpoint ?? 'N/A'}\`
* **Severity:** **${severityUpper}**
* **Occurred At (UTC):** ${formatDateSafe(log.createdAtUtc)}
* **Source:** \`${log.source ?? 'N/A'}\`
* **Caller / User ID:** \`${log.createdById ?? log.clientIp ?? 'N/A'}\`

#### 📝 Error Summary
> ${log.message ?? 'No summary message captured.'}

#### 🥞 Stack Trace
\`\`\`text
${log.stackTrace || 'No stack trace captured.'}
\`\`\`

${log.innerException ? `#### 🔗 Inner Exception\n\`\`\`text\n${log.innerException}\n\`\`\`\n` : ''}
#### 📦 Request Payload / State Context
\`\`\`json
${log.payload || '{}'}
\`\`\`
`.trim();
    } catch (err) {
      console.error('Failed to generate markdown note:', err);
      return `### 🚨 Incident Bug Ticket: [${log.projectCode}] ${log.errorCode}\n> ${log.message}\n\n\`\`\`text\n${log.stackTrace || ''}\n\`\`\``;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const severityBadgeColor =
    severityUpper.includes('CRITICAL') || severityStr === '3'
      ? 'bg-red-500/20 text-red-400 border-red-500/40'
      : severityUpper.includes('ERROR') || severityStr === '2'
      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
      : severityUpper.includes('WARN') || severityStr === '1'
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
      : 'bg-blue-500/20 text-blue-400 border-blue-500/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${severityBadgeColor}`}>
              {severityStr}
            </span>
            <span className="px-2.5 py-1 text-xs font-mono bg-slate-800 border border-slate-700 rounded-md text-slate-300">
              {log.errorCode}
            </span>
            <span className="px-2.5 py-1 text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
              {log.projectCode}
            </span>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              #{log.id.substring(0, 8)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Exception Summary Banner */}
          <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-xl flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-400">
                {log.errorName || 'Exception Details'}
              </div>
              <div className="text-sm font-semibold text-slate-100 mt-1 font-mono leading-relaxed">
                {log.message}
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Endpoint</span>
              <span className="font-mono text-xs text-slate-200 mt-0.5 block truncate">{log.endpoint || '-'}</span>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source</span>
              <span className="font-mono text-xs text-slate-200 mt-0.5 block truncate">{log.source || '-'}</span>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Caller / IP</span>
              <span className="font-mono text-xs text-slate-200 mt-0.5 block truncate">{log.createdById || log.clientIp || '-'}</span>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Timestamp (UTC)</span>
              <span className="font-mono text-xs text-slate-200 mt-0.5 block">{new Date(log.createdAtUtc).toLocaleString()}</span>
            </div>
          </div>

          {/* Segregated Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('stack')}
              className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
                activeTab === 'stack' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Stack Trace</span>
            </button>

            <button
              onClick={() => setActiveTab('inner')}
              className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
                activeTab === 'inner' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Inner Exception</span>
            </button>

            <button
              onClick={() => setActiveTab('payload')}
              className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
                activeTab === 'payload' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Request Payload Context</span>
            </button>

            <button
              onClick={() => setActiveTab('markdown')}
              className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
                activeTab === 'markdown' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>DevOps Bug Ticket</span>
            </button>
          </div>

          {/* Code Container */}
          <div className="relative bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-72">
            <button
              onClick={() => {
                const textToCopy =
                  activeTab === 'stack'
                    ? log.stackTrace || ''
                    : activeTab === 'inner'
                    ? log.innerException || ''
                    : activeTab === 'payload'
                    ? log.payload || ''
                    : generateMarkdownNote();
                handleCopy(textToCopy);
              }}
              className="absolute top-3 right-3 p-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            {activeTab === 'stack' && (
              <pre className="whitespace-pre-wrap leading-relaxed text-slate-300">
                {log.stackTrace || 'No stack trace provided for this incident.'}
              </pre>
            )}

            {activeTab === 'inner' && (
              <pre className="whitespace-pre-wrap leading-relaxed text-slate-300">
                {log.innerException || 'No inner exception recorded.'}
              </pre>
            )}

            {activeTab === 'payload' && (
              <pre className="whitespace-pre-wrap leading-relaxed text-emerald-400">
                {(() => {
                  if (!log.payload) return 'No request payload recorded.';
                  try {
                    return typeof log.payload === 'string'
                      ? JSON.stringify(JSON.parse(log.payload), null, 2)
                      : JSON.stringify(log.payload, null, 2);
                  } catch {
                    return String(log.payload);
                  }
                })()}
              </pre>
            )}

            {activeTab === 'markdown' && (
              <pre className="whitespace-pre-wrap leading-relaxed text-indigo-300">
                {generateMarkdownNote()}
              </pre>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {onStatusChange && (
              <>
                <button
                  onClick={() => onStatusChange(log.id, { isResolved: !log.isResolved })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                    log.isResolved
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {log.isResolved ? '✓ Resolved' : 'Mark as Resolved'}
                </button>

                <button
                  onClick={() => onStatusChange(log.id, { isArchived: !log.isArchived })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                    log.isArchived
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {log.isArchived ? 'Unarchive' : 'Archive Incident'}
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleCopy(generateMarkdownNote())}
              className="px-4 py-1.5 bg-indigo-600 text-white font-semibold text-xs rounded-lg hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied Ticket Note!' : 'Copy Bug Ticket Note'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

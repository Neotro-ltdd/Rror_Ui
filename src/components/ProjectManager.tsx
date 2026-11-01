import React, { useCallback, useEffect, useState } from 'react';
import { Check, Copy, FolderPlus, Key, ShieldCheck, UserMinus, UserPlus, Users, X } from 'lucide-react';
import { assignProjectMember, createProject, getProjectMembers, getUsers, revokeProjectMember } from '../services/api';
import type { Project, ProjectMember, User } from '../types/rorr';

interface Props {
  projects: Project[];
  onProjectCreated: () => void;
}

export const ProjectManager: React.FC<Props> = ({ projects, onProjectCreated }) => {
  const [projectCode, setProjectCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manage Team Members Modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [memberError, setMemberError] = useState<string | null>(null);
  const [memberSuccess, setMemberSuccess] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const uList = await getUsers();
      setAllUsers(uList);
    } catch (err) {
      console.error('Failed to load user directory for PBAC assignment:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenMembersModal = async (project: Project) => {
    setSelectedProject(project);
    setMemberError(null);
    setMemberSuccess(null);
    setSelectedUserId('');
    setLoadingMembers(true);

    try {
      const mList = await getProjectMembers(project.id);
      setMembers(mList);
    } catch (err) {
      console.error('Failed to load project members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleAssignMember = async () => {
    if (!selectedProject || !selectedUserId) return;
    setMemberError(null);
    setMemberSuccess(null);

    try {
      await assignProjectMember(selectedProject.id, selectedUserId);
      const updatedList = await getProjectMembers(selectedProject.id);
      setMembers(updatedList);
      const assignedUser = allUsers.find((u) => u.id === selectedUserId);
      setMemberSuccess(`Successfully assigned ${assignedUser?.fullName || 'developer'} to ${selectedProject.projectCode}.`);
      setSelectedUserId('');
      onProjectCreated(); // Refresh project list counts
    } catch (err: any) {
      setMemberError(err?.response?.data?.message || 'Failed to assign project member.');
    }
  };

  const handleRevokeMember = async (userId: string, userName: string) => {
    if (!selectedProject) return;
    if (!window.confirm(`Are you sure you want to revoke ${userName}'s access to ${selectedProject.projectCode}?`)) return;

    setMemberError(null);
    setMemberSuccess(null);

    try {
      await revokeProjectMember(selectedProject.id, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      setMemberSuccess(`Revoked ${userName}'s access to ${selectedProject.projectCode}.`);
      onProjectCreated();
    } catch (err: any) {
      setMemberError(err?.response?.data?.message || 'Failed to revoke member access.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNewKey(null);

    try {
      const res = await createProject({ projectCode, name, description });
      if (res.rawApiKey) {
        setNewKey(res.rawApiKey);
      }
      setProjectCode('');
      setName('');
      setDescription('');
      onProjectCreated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filter out users already assigned as members
  const unassignedUsers = allUsers.filter((u) => !members.some((m) => m.userId === u.id));

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-950">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FolderPlus className="w-5 h-5 text-indigo-400" /> Monitored Projects & Project-Based Access Control (PBAC)
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Register new upstream applications, issue cryptographically secure SHA-256 hashed API keys, and assign developers.
        </p>
      </div>

      {/* Register New Project Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-2xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-400" /> Register Application Project
        </h3>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Project Code (Unique)</label>
              <input
                type="text"
                placeholder="e.g. AUTH_SERVICE"
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-2 focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Application Name</label>
              <input
                type="text"
                placeholder="e.g. Authentication Microservice"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:border-indigo-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Description (Optional)</label>
            <input
              type="text"
              placeholder="Primary OAuth2 authentication server."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:border-indigo-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Register Project & Issue Key'}
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Generated Key Alert Banner */}
        {newKey && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Project API Key Generated Successfully</span>
            </div>
            <p className="text-xs text-slate-300">
              Save this raw key now! It will never be displayed again (stored securely as a SHA-256 hash).
            </p>
            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="font-mono text-xs text-emerald-300 flex-1 truncate">{newKey}</span>
              <button
                onClick={handleCopyKey}
                className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-md hover:bg-emerald-500 transition flex items-center gap-1 shrink-0"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Key'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Registered Projects List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Registered Applications ({projects.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                  {p.projectCode}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  ● Active
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100">{p.name}</h4>
              <p className="text-xs text-slate-400">{p.description || 'No description provided.'}</p>
              
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-mono">
                  <span>{p.totalErrors ?? 0} Incidents</span>
                  <span className="mx-2">•</span>
                  <span>{p.memberCount ?? 0} Assigned Members</span>
                </div>

                <button
                  onClick={() => handleOpenMembersModal(p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-lg transition border border-slate-700"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Manage Team</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manage Team Members PBAC Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-base text-white">Project Members & Access Control</h3>
                  <p className="text-xs text-indigo-400 font-mono">{selectedProject.projectCode} - {selectedProject.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* PBAC Notice */}
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-lg text-indigo-200 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict PBAC Isolation:</strong> Non-admin developers will only be authorized to query logs, view incident traces, or stream SignalR telemetry for this project if assigned below.
                </span>
              </div>

              {memberError && (
                <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-lg text-red-300 text-xs">
                  {memberError}
                </div>
              )}

              {memberSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs">
                  {memberSuccess}
                </div>
              )}

              {/* Assign New Developer */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-slate-300">Assign Developer / Engineer</label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Select user to assign --</option>
                    {unassignedUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.email}) - {u.role}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleAssignMember}
                    disabled={!selectedUserId}
                    className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Assign</span>
                  </button>
                </div>
              </div>

              {/* Current Assigned Members List */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Assigned Team Members ({members.length})
                </h4>

                {loadingMembers ? (
                  <div className="py-6 text-center text-xs text-slate-400">Loading project members...</div>
                ) : members.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 italic">
                    No developers currently assigned. Only Platform Admins can access logs for this project.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60 max-h-48 overflow-y-auto">
                    {members.map((m) => (
                      <div key={m.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-white">{m.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{m.email} • {m.role}</p>
                        </div>

                        <button
                          onClick={() => handleRevokeMember(m.userId, m.fullName)}
                          title="Revoke Access"
                          className="flex items-center gap-1 px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-semibold rounded-md transition"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


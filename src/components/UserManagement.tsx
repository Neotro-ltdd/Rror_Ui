import React, { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  FolderGit2,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';
import { createUser, deleteUser, getProjects, getRoles, getUsers, resendInvite, toggleUserStatus } from '../services/api';
import type { Project, RoleItem, User, UserRole } from '../types/rorr';
import { ConfirmModal } from './ConfirmModal';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'primary';
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  // Form state for provision modal
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('Engineer');
  const [rolesList, setRolesList] = useState<RoleItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, projectsData, rolesData] = await Promise.all([
        getUsers(),
        getProjects(),
        getRoles().catch(() => [] as RoleItem[])
      ]);
      setUsers(usersData);
      setProjects(projectsData);
      setRolesList(rolesData);
      if (rolesData.length > 0 && !selectedRoleId) {
        const engRole = rolesData.find(r => r.name.toLowerCase() === 'engineer') || rolesData[0];
        setSelectedRoleId(engRole.id);
      }
    } catch (err) {
      console.error('Failed to load user management data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedRoleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleProjectSelection = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim() || !email.trim()) {
      setErrorMsg('Username and Email are required.');
      return;
    }

    setSubmitting(true);
    try {
      await createUser({
        username: username.trim(),
        email: email.trim(),
        fullName: fullName.trim() || username.trim(),
        role,
        roleId: selectedRoleId || undefined,
        projectIds: selectedProjectIds,
      });

      setSuccessMsg(`Staff user '${username}' provisioned! Invitation with 6-digit OTP dispatched to ${email}.`);
      setIsModalOpen(false);
      // Reset form
      setUsername('');
      setEmail('');
      setFullName('');
      setRole('Engineer');
      if (rolesList.length > 0) {
        const engRole = rolesList.find(r => r.name.toLowerCase() === 'engineer') || rolesList[0];
        setSelectedRoleId(engRole.id);
      }
      setSelectedProjectIds([]);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to provision user. Ensure email/username is unique.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendInvite = async (userId: string, targetEmail: string) => {
    setActionLoadingId(userId);
    setErrorMsg(null);
    try {
      const msg = await resendInvite(userId);
      setSuccessMsg(msg || `Fresh invitation and OTP sent to ${targetEmail}`);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to resend invitation.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = (user: User) => {
    const nextStatus = !user.isActive;
    const actionLabel = nextStatus ? 'activate' : 'deactivate (revoke access for)';
    setConfirmDialog({
      isOpen: true,
      title: `${nextStatus ? 'Activate' : 'Deactivate'} User Account`,
      message: `Are you sure you want to ${actionLabel} user '${user.username}'? ${
        !nextStatus ? 'The user will immediately be locked out and their active sessions revoked.' : 'The user will regain access to their assigned projects.'
      }`,
      confirmText: nextStatus ? 'Activate User' : 'Deactivate & Revoke',
      variant: nextStatus ? 'primary' : 'warning',
      onConfirm: async () => {
        setConfirmDialog(null);
        setActionLoadingId(user.id);
        try {
          const msg = await toggleUserStatus(user.id, nextStatus);
          setSuccessMsg(msg);
          fetchData();
        } catch (err: any) {
          setErrorMsg(err?.response?.data?.message || 'Failed to update user status.');
        } finally {
          setActionLoadingId(null);
        }
      },
    });
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Permanently Delete User',
      message: `Are you sure you want to permanently delete user '${name}'? All project memberships and credentials will be permanently purged. This action cannot be undone.`,
      confirmText: 'Delete User',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await deleteUser(id);
          setUsers((prev) => prev.filter((u) => u.id !== id));
          setSuccessMsg(`User '${name}' permanently removed. Platform access revoked.`);
        } catch (err: any) {
          setErrorMsg(err?.response?.data?.message || 'Failed to delete user.');
        }
      },
    });
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto p-6 text-slate-100">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">Staff Provisioning &amp; Access Governance</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Provision staff accounts, directly assign project memberships, dispatch email invitations with OTPs, and enforce instant revocation.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-emerald-950/40 shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Staff Member</span>
        </button>
      </div>

      {/* Global Success / Error Toast Banners */}
      {successMsg && (
        <div className="mt-4 p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center justify-between font-mono animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white font-bold text-sm cursor-pointer ml-3">
            &times;
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center justify-between font-mono">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white font-bold text-sm cursor-pointer ml-3">
            &times;
          </button>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 my-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Staff</p>
            <p className="text-xl font-bold text-white">{users.length}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Staff</p>
            <p className="text-xl font-bold text-white">{users.filter((u) => u.isActive && !u.mustChangePassword).length}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pending Activation</p>
            <p className="text-xl font-bold text-white">{users.filter((u) => u.isActive && u.mustChangePassword).length}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Deactivated / Revoked</p>
            <p className="text-xl font-bold text-white">{users.filter((u) => !u.isActive).length}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search staff by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          onClick={fetchData}
          title="Refresh User Directory"
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading staff directory...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No matching staff accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Assigned Projects</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-xs">
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.fullName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">@{user.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">{user.email}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'Admin'
                            ? 'bg-purple-950 text-purple-300 border border-purple-700/50'
                            : user.role === 'Engineer'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {user.roleName || user.role}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {user.assignedProjects && user.assignedProjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.assignedProjects.map((pName) => (
                            <span
                              key={pName}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono"
                            >
                              <FolderGit2 className="w-2.5 h-2.5 text-indigo-400" />
                              <span>{pName}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">No assigned projects</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {!user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-950/70 border border-rose-800/60 text-rose-300 text-[10px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Access Revoked
                        </span>
                      ) : user.mustChangePassword ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-800/60 text-amber-300 text-[10px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          Pending OTP Activation
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-[10px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Active
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(user.createdAtUtc).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {user.isActive && user.mustChangePassword && (
                          <button
                            onClick={() => handleResendInvite(user.id, user.email)}
                            disabled={actionLoadingId === user.id}
                            title="Resend Invitation Email & OTP"
                            className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={actionLoadingId === user.id}
                          title={user.isActive ? 'Deactivate & Revoke Access' : 'Reactivate User'}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            user.isActive
                              ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
                              : 'text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          title="Permanently Remove User"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provision User Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Provision New Staff Member</h3>
                  <p className="text-xs text-slate-400">Invite user, assign project(s), and dispatch OTP</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Informative Security Callout */}
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs flex items-start gap-3 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Automated Invitation Workflow:</strong> A 6-digit cryptographic OTP will be generated and emailed to the user with a direct activation link. The user will be required to verify the OTP and configure their permanent password before accessing the system.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. jdoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. jdoe@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Role</label>
                  <select
                    value={selectedRoleId || ''}
                    onChange={(e) => {
                      const rId = e.target.value;
                      setSelectedRoleId(rId);
                      const found = rolesList.find((r) => r.id === rId);
                      if (found) {
                        const lower = found.name.toLowerCase();
                        if (lower === 'admin') setRole('Admin');
                        else if (lower === 'viewer') setRole('Viewer');
                        else setRole('Engineer');
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {rolesList.length > 0 ? (
                      rolesList.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} {r.isSystem ? `(System - ${r.permissionCount} perms)` : `(Custom - ${r.permissionCount} perms)`}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Engineer">Engineer (Diagnostics &amp; Resolving)</option>
                        <option value="Admin">Admin (Full Control &amp; Provisioning)</option>
                        <option value="Viewer">Viewer (Read-Only Telemetry)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Direct Project Assignment Section */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Assign to Project(s) Directly At Once</span>
                  <span className="text-[10px] text-slate-400 font-mono font-normal">
                    {selectedProjectIds.length} project(s) selected
                  </span>
                </label>

                {projects.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded-xl border border-slate-800">
                    No active projects available to assign.
                  </p>
                ) : (
                  <div className="max-h-36 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    {projects.map((proj) => {
                      const isChecked = selectedProjectIds.includes(proj.id);
                      return (
                        <label
                          key={proj.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition text-xs ${
                            isChecked ? 'bg-emerald-950/40 border border-emerald-500/30 text-white' : 'hover:bg-slate-900 text-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleProjectSelection(proj.id)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="flex-1 flex items-center justify-between">
                            <span className="font-medium">{proj.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400">
                              {proj.projectCode}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-emerald-950/40 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{submitting ? 'Provisioning & Dispatching...' : 'Provision Staff & Dispatch Invite'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDialog && (
        <ConfirmModal
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
};

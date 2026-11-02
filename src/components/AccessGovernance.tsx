import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  FolderGit2,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users
} from 'lucide-react';
import {
  createCustomRole,
  deleteCustomRole,
  getPermissionsCatalog,
  getRolePermissions,
  getRoles,
  updateRolePermissions
} from '../services/api';
import type { PermissionCategoryGroup, RoleDetail, RoleItem } from '../types/rorr';
import { ConfirmModal } from './ConfirmModal';

export const AccessGovernance: React.FC = () => {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [catalog, setCatalog] = useState<PermissionCategoryGroup[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [roleDetail, setRoleDetail] = useState<RoleDetail | null>(null);
  const [activePermissions, setActivePermissions] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Custom Role Modal state
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState<boolean>(false);
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [newRoleDescription, setNewRoleDescription] = useState<string>('');
  const [templateRoleId, setTemplateRoleId] = useState<string>('');
  const [submittingRole, setSubmittingRole] = useState<boolean>(false);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'primary';
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [rolesData, catalogData] = await Promise.all([
        getRoles(),
        getPermissionsCatalog()
      ]);
      setRoles(rolesData);
      setCatalog(catalogData);

      if (rolesData.length > 0 && !selectedRoleId) {
        setSelectedRoleId(rolesData[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load access governance data:', err);
      setErrorMsg(err?.response?.data?.message || 'Failed to load roles and permissions catalog.');
    } finally {
      setLoading(false);
    }
  }, [selectedRoleId]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Load details when selected role changes
  const fetchRoleDetail = useCallback(async (roleId: string) => {
    setDetailLoading(true);
    setErrorMsg(null);
    try {
      const detail = await getRolePermissions(roleId);
      setRoleDetail(detail);
      setActivePermissions(new Set(detail.assignedPermissionCodes));
    } catch (err: any) {
      console.error('Failed to fetch role permissions:', err);
      setErrorMsg(err?.response?.data?.message || 'Failed to fetch permissions for the selected role.');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      fetchRoleDetail(selectedRoleId);
    }
  }, [selectedRoleId, fetchRoleDetail]);

  const totalCatalogPermissionsCount = catalog.reduce(
    (acc, group) => acc + group.permissions.length,
    0
  );

  const grantedPercentage = totalCatalogPermissionsCount > 0
    ? Math.round((activePermissions.size / totalCatalogPermissionsCount) * 100)
    : 0;

  const handleTogglePermission = (code: string) => {
    setActivePermissions((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const handleToggleCategory = (group: PermissionCategoryGroup) => {
    const groupCodes = group.permissions.map((p) => p.code);
    const allSelected = groupCodes.every((c) => activePermissions.has(c));

    setActivePermissions((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        groupCodes.forEach((c) => next.delete(c));
      } else {
        groupCodes.forEach((c) => next.add(c));
      }
      return next;
    });
  };

  const handleGrantAll = () => {
    const allCodes = catalog.flatMap((g) => g.permissions.map((p) => p.code));
    setActivePermissions(new Set(allCodes));
  };

  const handleRevokeAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Revoke All Permissions?',
      message: `Are you sure you want to revoke all permissions from '${roleDetail?.name}'? Users assigned to this role will lose access to all modules.`,
      confirmText: 'Revoke All',
      variant: 'warning',
      onConfirm: () => {
        setActivePermissions(new Set());
        setConfirmDialog(null);
      }
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const permissionCodes = Array.from(activePermissions);
      const msg = await updateRolePermissions(selectedRoleId, permissionCodes);
      setSuccessMsg(msg || `Permissions for '${roleDetail?.name}' updated successfully!`);

      // Refresh roles overview list to update permission count badge
      const updatedRoles = await getRoles();
      setRoles(updatedRoles);
    } catch (err: any) {
      console.error('Failed to update permissions:', err);
      setErrorMsg(err?.response?.data?.message || 'Failed to update permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      setErrorMsg('Role name is required.');
      return;
    }

    setSubmittingRole(true);
    setErrorMsg(null);
    try {
      let initialCodes: string[] = [];
      if (templateRoleId) {
        const templateDetail = await getRolePermissions(templateRoleId);
        initialCodes = templateDetail.assignedPermissionCodes;
      }

      const created = await createCustomRole({
        name: newRoleName.trim(),
        description: newRoleDescription.trim() || undefined,
        permissionCodes: initialCodes
      });

      setSuccessMsg(`Role '${created.name}' created successfully!`);
      setIsAddRoleModalOpen(false);
      setNewRoleName('');
      setNewRoleDescription('');
      setTemplateRoleId('');

      const updatedRoles = await getRoles();
      setRoles(updatedRoles);
      setSelectedRoleId(created.id);
    } catch (err: any) {
      console.error('Failed to create custom role:', err);
      setErrorMsg(err?.response?.data?.message || 'Failed to create custom role.');
    } finally {
      setSubmittingRole(false);
    }
  };

  const handleDeleteRole = (role: RoleItem) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Custom Role '${role.name}'?`,
      message: `This will permanently delete the custom role '${role.name}'. Any users currently assigned to this role will have their role unassigned until reassigned.`,
      confirmText: 'Delete Role',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const msg = await deleteCustomRole(role.id);
          setSuccessMsg(msg || `Role '${role.name}' deleted.`);
          const updatedRoles = await getRoles();
          setRoles(updatedRoles);
          if (updatedRoles.length > 0) {
            setSelectedRoleId(updatedRoles[0].id);
          } else {
            setSelectedRoleId(null);
            setRoleDetail(null);
          }
        } catch (err: any) {
          setErrorMsg(err?.response?.data?.message || 'Failed to delete custom role.');
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('project')) return <FolderGit2 className="w-5 h-5 text-indigo-400" />;
    if (cat.includes('error')) return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    if (cat.includes('user')) return <Users className="w-5 h-5 text-emerald-400" />;
    return <ShieldCheck className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-950 p-6 text-slate-100">
      <div className="max-w-7xl mx-auto w-full space-y-6 pb-28">
        {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Access Governance &bull; Permissions Matrix</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User &amp; Access Governance</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure system roles and fine-tune granular permission matrices for staff members.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (selectedRoleId) fetchRoleDetail(selectedRoleId);
            }}
            disabled={detailLoading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${detailLoading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>

          <button
            onClick={() => setIsAddRoleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-950/40 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Custom Role</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center justify-between font-mono animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white font-bold text-sm cursor-pointer ml-3">
            &times;
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center justify-between font-mono animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white font-bold text-sm cursor-pointer ml-3">
            &times;
          </button>
        </div>
      )}

      {/* Role Selection Horizontal Pills */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex items-center gap-2 overflow-x-auto shadow-sm">
        {loading ? (
          <div className="py-2 px-4 text-xs text-slate-400 font-mono">Loading roles list...</div>
        ) : roles.length === 0 ? (
          <div className="py-2 px-4 text-xs text-slate-500 italic">No roles configured.</div>
        ) : (
          roles.map((r) => {
            const isSelected = r.id === selectedRoleId;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRoleId(r.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border border-emerald-500/50 text-white shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/50 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-600'
                  }`}
                />
                <span className="font-bold">{r.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                    isSelected ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {r.userCount} {r.userCount === 1 ? 'user' : 'users'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  &bull; {r.permissionCount} perms
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Active Role Governance Card */}
      {roleDetail && (
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Role Info & Stats */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold text-white tracking-tight">{roleDetail.name} Role Permissions</h2>
                    {roleDetail.isSystem ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-700/50 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        System Role
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-teal-950/80 text-teal-300 border border-teal-700/50">
                        Custom Role
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                    {roleDetail.description || 'Custom defined role for specialized platform operations and privileges.'}
                  </p>
                </div>
              </div>

              {/* Access Metric & Bar */}
              <div className="flex items-center gap-3 pt-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider font-mono ${
                    grantedPercentage === 100
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      : grantedPercentage > 50
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/50'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  {grantedPercentage}% ACCESS GRANTED ({activePermissions.size}/{totalCatalogPermissionsCount})
                </span>

                <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${grantedPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleGrantAll}
                className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
              >
                Grant All
              </button>

              <button
                type="button"
                onClick={handleRevokeAll}
                className="px-3.5 py-2 bg-slate-800/80 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/40 rounded-xl text-xs font-semibold text-slate-300 hover:text-rose-300 transition cursor-pointer"
              >
                Revoke All
              </button>

              {!roleDetail.isSystem && (
                <button
                  type="button"
                  onClick={() => {
                    const currentRole = roles.find((r) => r.id === roleDetail.id);
                    if (currentRole) handleDeleteRole(currentRole);
                  }}
                  className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 rounded-xl text-xs font-semibold text-rose-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                  title="Delete Custom Role"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/40 transition cursor-pointer"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Role Permissions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Module Cards Grid */}
      {detailLoading ? (
        <div className="py-20 text-center text-xs text-slate-400 font-mono">
          Loading role permission configuration...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {catalog.map((group) => {
            const groupCodes = group.permissions.map((p) => p.code);
            const grantedInGroup = groupCodes.filter((c) => activePermissions.has(c)).length;
            const isAllGroupGranted = grantedInGroup === groupCodes.length;

            return (
              <div
                key={group.category}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col"
              >
                {/* Module Header */}
                <div className="p-4 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                      {getCategoryIcon(group.category)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                        {group.category}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {grantedInGroup} of {groupCodes.length} active
                      </p>
                    </div>
                  </div>

                  {/* Select All Toggle for Category */}
                  <button
                    type="button"
                    onClick={() => handleToggleCategory(group)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide transition cursor-pointer font-mono ${
                      isAllGroupGranted
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                    }`}
                  >
                    {isAllGroupGranted ? 'Revoke Module' : 'Select All'}
                  </button>
                </div>

                {/* Module Permission Rows */}
                <div className="p-4 space-y-3.5 divide-y divide-slate-800/50 flex-1">
                  {group.permissions.map((perm, idx) => {
                    const isChecked = activePermissions.has(perm.code);
                    return (
                      <div
                        key={perm.code}
                        className={`flex items-start justify-between gap-4 ${idx > 0 ? 'pt-3.5' : ''}`}
                      >
                        <div className="flex-1 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200">{perm.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800/80 text-slate-400 border border-slate-700/60">
                              {perm.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            {perm.description || 'Allows standard operational authority for this operation.'}
                          </p>
                        </div>

                        {/* Modern Toggle Switch */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isChecked}
                          onClick={() => handleTogglePermission(perm.code)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                            isChecked ? 'bg-emerald-500' : 'bg-slate-800'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isChecked ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Add Custom Role Modal */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Create Custom System Role</h3>
                  <p className="text-xs text-slate-400">Define a new security profile with tailored permissions</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddRoleModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Security Auditor, DevOps Lead, QA Specialist"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summarize the operational responsibilities of this role..."
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Clone Initial Permissions From Existing Role (Optional)
                </label>
                <select
                  value={templateRoleId}
                  onChange={(e) => setTemplateRoleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Start with zero permissions (Blank Slate)</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.permissionCount} permissions)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddRoleModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRole}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/40 transition cursor-pointer"
                >
                  {submittingRole ? 'Creating Role...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
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

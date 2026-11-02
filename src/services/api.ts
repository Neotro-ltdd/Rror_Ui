import axios from 'axios';
import type { AiExplanationResponse, ApiResponse, LogStats, PaginatedResult, PermissionCategoryGroup, Project, ProjectMember, RoleDetail, RoleItem, RorrLog, User, UserRole } from '../types/rorr';

const BACKEND_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_BASE = `${BACKEND_BASE}/api/v1`;

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Bearer token automatically from stored session
api.interceptors.request.use((config) => {
  try {
    const rawUser = localStorage.getItem('rorr_user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch {
    // ignore parse error
  }
  return config;
});

// Event listener for unauthorized / revoked sessions
type SessionRevokedCallback = (message: string) => void;
const sessionRevokedListeners: SessionRevokedCallback[] = [];

export const onSessionRevoked = (callback: SessionRevokedCallback) => {
  sessionRevokedListeners.push(callback);
  return () => {
    const idx = sessionRevokedListeners.indexOf(callback);
    if (idx !== -1) sessionRevokedListeners.splice(idx, 1);
  };
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const msg = error.response.data?.message || 'Access revoked: Your account is no longer active in the system.';
      // Only fire session revocation for authenticated background calls (not initial login failures)
      if (error.config?.url && !error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/verify-otp')) {
        sessionRevokedListeners.forEach((cb) => cb(msg));
      }
    }
    return Promise.reject(error);
  }
);

export const getProjects = async (): Promise<Project[]> => {
  const res = await api.get<ApiResponse<Project[]>>('/projects');
  return res.data.data;
};

export const createProject = async (data: { projectCode: string; name: string; description?: string }): Promise<Project> => {
  const res = await api.post<ApiResponse<Project>>('/projects', data);
  return res.data.data;
};

export const getProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
  const res = await api.get<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`);
  return res.data.data;
};

export const assignProjectMember = async (projectId: string, userId: string): Promise<void> => {
  await api.post(`/projects/${projectId}/members`, { userId });
};

export const revokeProjectMember = async (projectId: string, userId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}/members/${userId}`);
};

export interface QueryLogsParams {
  projectCode?: string;
  severity?: string;
  fromUtc?: string;
  toUtc?: string;
  search?: string;
  isArchived?: boolean;
  isResolved?: boolean;
  page?: number;
  pageSize?: number;
}

export const queryLogs = async (params: QueryLogsParams): Promise<PaginatedResult<RorrLog>> => {
  const res = await api.get<ApiResponse<PaginatedResult<RorrLog>>>('/errors/query', { params });
  return res.data.data;
};

export const updateIncidentStatus = async (id: string, updates: { isArchived?: boolean; isResolved?: boolean }): Promise<RorrLog> => {
  const res = await api.patch<ApiResponse<RorrLog>>(`/errors/${id}/status`, null, { params: updates });
  return res.data.data;
};

export const getStats = async (projectCode?: string): Promise<LogStats> => {
  const res = await api.get<ApiResponse<LogStats>>('/errors/stats', { params: { projectCode } });
  return res.data.data;
};

export const simulateError = async (apiKey: string, payload: any) => {
  const res = await api.post('/errors/ingest', payload, {
    headers: {
      'x-api-key': apiKey,
    },
  });
  return res.data;
};

// Users & Auth API
export const getUsers = async (): Promise<User[]> => {
  const res = await api.get<ApiResponse<User[]>>('/users');
  return res.data.data;
};

export const createUser = async (data: {
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  roleId?: string;
  projectIds?: string[];
}): Promise<User> => {
  const res = await api.post<ApiResponse<User>>('/users', data);
  return res.data.data;
};

export const resendInvite = async (userId: string): Promise<string> => {
  const res = await api.post<ApiResponse<object>>(`/users/${userId}/resend-invite`);
  return res.data.message;
};

export const toggleUserStatus = async (userId: string, isActive: boolean): Promise<string> => {
  const res = await api.patch<ApiResponse<object>>(`/users/${userId}/status`, null, {
    params: { isActive },
  });
  return res.data.message;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

// Roles & Access Governance API
export const getRoles = async (): Promise<RoleItem[]> => {
  const res = await api.get<ApiResponse<RoleItem[]>>('/roles');
  return res.data.data;
};

export const getPermissionsCatalog = async (): Promise<PermissionCategoryGroup[]> => {
  const res = await api.get<ApiResponse<PermissionCategoryGroup[]>>('/roles/permissions');
  return res.data.data;
};

export const getRolePermissions = async (roleId: string): Promise<RoleDetail> => {
  const res = await api.get<ApiResponse<RoleDetail>>(`/roles/${roleId}/permissions`);
  return res.data.data;
};

export const updateRolePermissions = async (roleId: string, permissionCodes: string[]): Promise<string> => {
  const res = await api.put<ApiResponse<object>>(`/roles/${roleId}/permissions`, { permissionCodes });
  return res.data.message;
};

export const createCustomRole = async (data: { name: string; description?: string; permissionCodes?: string[] }): Promise<RoleItem> => {
  const res = await api.post<ApiResponse<RoleItem>>('/roles', data);
  return res.data.data;
};

export const deleteCustomRole = async (roleId: string): Promise<string> => {
  const res = await api.delete<ApiResponse<object>>(`/roles/${roleId}`);
  return res.data.message;
};

export interface LoginResultData {
  mustChangePassword?: boolean;
  verifiedOtp?: string;
  username?: string;
  email?: string;
  fullName?: string;
  id?: string;
  role?: UserRole;
  isActive?: boolean;
  createdAtUtc?: string;
  lastLoginAtUtc?: string;
  token?: string;
}

export const loginUser = async (credentials: { usernameOrEmail: string; password?: string }): Promise<LoginResultData> => {
  const res = await api.post<ApiResponse<LoginResultData>>('/auth/login', credentials);
  return res.data.data;
};

export const verifyOtp = async (data: {
  usernameOrEmail: string;
  otp: string;
}): Promise<{ verified: boolean; username: string; email: string; fullName: string }> => {
  const res = await api.post<ApiResponse<{ verified: boolean; username: string; email: string; fullName: string }>>('/auth/verify-otp', data);
  return res.data.data;
};

export const setPassword = async (data: {
  usernameOrEmail: string;
  otp: string;
  newPassword: string;
}): Promise<User> => {
  const res = await api.post<ApiResponse<User>>('/auth/set-password', data);
  return res.data.data;
};

export const validateSession = async (userId: string): Promise<{ isActive: boolean; userId: string; username: string; role: string }> => {
  const res = await api.get<ApiResponse<{ isActive: boolean; userId: string; username: string; role: string }>>('/auth/validate-session', {
    params: { userId },
  });
  return res.data.data;
};

// AI Diagnostics API
export interface ExplainErrorParams {
  errorName?: string;
  errorCode?: string;
  stackTrace?: string;
  endpoint?: string;
  userQuestion?: string;
}

export const explainErrorWithAi = async (params: ExplainErrorParams): Promise<AiExplanationResponse> => {
  const res = await api.post<ApiResponse<AiExplanationResponse>>('/aidiagnostics/explain', params);
  return res.data.data;
};

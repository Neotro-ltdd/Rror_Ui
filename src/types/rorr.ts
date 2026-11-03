export type LogSeverity = 'Information' | 'Warning' | 'Error' | 'Critical';
export type UserRole = 'Admin' | 'Engineer' | 'Viewer';

export interface RorrLog {
  id: string;
  projectCode: string;
  message: string;
  errorCode: string;
  errorName?: string;
  severity: LogSeverity;
  stackTrace?: string;
  innerException?: string;
  source?: string;
  endpoint?: string;
  clientIp?: string;
  createdById?: string;
  payload?: string;
  isArchived: boolean;
  isResolved: boolean;
  createdAtUtc: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  assignedAtUtc: string;
}

export interface Project {
  id: string;
  projectCode: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAtUtc: string;
  totalErrors?: number;
  memberCount?: number;
  members?: ProjectMember[];
  rawApiKey?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAtUtc: string;
  lastLoginAtUtc?: string;
  mustChangePassword?: boolean;
  assignedProjects?: string[];
  token?: string;
  roleId?: string;
  roleName?: string;
  permissions?: string[];
}

export interface RoleItem {
  id: string;
  name: string;
  description?: string;
  isSystem?: boolean;
  isSystemRole?: boolean;
  userCount?: number;
  usersCount?: number;
  permissionCount?: number;
  permissionsCount?: number;
  permissionCodes?: string[];
  createdAtUtc: string;
}

export interface PermissionCatalogItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
}

export interface PermissionCategoryGroup {
  category: string;
  permissions: PermissionCatalogItem[];
}

export interface RoleDetail {
  id: string;
  name: string;
  description?: string;
  isSystem?: boolean;
  isSystemRole?: boolean;
  userCount?: number;
  usersCount?: number;
  permissionCodes?: string[];
  assignedPermissionCodes: string[];
}

export interface LoginResult {
  mustChangePassword?: boolean;
  verifiedOtp?: string;
  username?: string;
  email?: string;
  user?: User;
  token?: string;
}

export interface AiExplanationResponse {
  errorName: string;
  errorCode: string;
  endpoint: string;
  explanation: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResult<T> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  items: T[];
}

export interface LogStats {
  totalProjects: number;
  activeProjects: number;
  totalLogs: number;
  totalActiveUnresolved: number;
  activeCriticalCount: number;
  activeErrorCount: number;
  activeWarningCount: number;
  activeInfoCount: number;
  resolvedCount: number;
  topEndpoints: { endpoint: string; count: number }[];
}

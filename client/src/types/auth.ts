export enum Role {
  SuperAdmin = "superAdmin",
  Admin = "admin",
  Manager = "manager",
  Accountant = "accountant",
  Viewer = "viewer",
  Cashier = "cashier",
}

export type Permission = string;

export interface Tenant {
  slug: string;
  nameEn: string;
  nameAr: string;
  logo?: string | null;
}

export interface Branch {
  id: string;
  nameEn: string;
  nameAr: string;
  code: string;
  address?: string;
  isMain: boolean;
  isActive: boolean;
}

export interface UserRole {
  id: string;
  name: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: UserRole[];
  permissions: string[];
  preferredLang: string;
  avatarUrl?: string | null;
}

/** Derive the display role from the roles array. */
export function deriveRole(user: User | null): Role {
  if (!user || !user.roles.length) return Role.Viewer;
  const name = user.roles[0].name.toLowerCase();
  if (name === "super admin" || name === "superadmin") return Role.SuperAdmin;
  if (name in Role) return Role[name as keyof typeof Role];
  // Match by lowercase value
  const match = Object.values(Role).find(v => v === name);
  return match ?? Role.Viewer;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  tenant: Tenant;
  branches: Branch[];
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SelectBranchResponse {
  accessToken: string;
  refreshToken: string;
}

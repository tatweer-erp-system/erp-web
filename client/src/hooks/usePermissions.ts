import { useAuthContext } from "@/contexts/AuthContext";
import { Role, type Permission, ROLE_PERMISSIONS } from "@/types/auth";

export function usePermissions() {
  const { user } = useAuthContext();
  const role = user?.role ?? Role.Admin;
  const rolePermissions = ROLE_PERMISSIONS[role];
  const isSuperAdmin = rolePermissions[0] === "*";

  // Use API-provided permissions if available, otherwise fall back to role-based
  const userPermissions = user?.permissions ?? [];

  const can = (permission: Permission): boolean => {
    if (isSuperAdmin) return true;

    // Check user's computed permissions from API (supports wildcard matching)
    for (const p of userPermissions) {
      if (p === "*") return true;
      if (p === permission) return true;
      // Wildcard: "sales:*" matches "sales:read", "sales:write", etc.
      if (p.endsWith(":*")) {
        const prefix = p.slice(0, -1); // "sales:"
        if (permission.startsWith(prefix)) return true;
      }
    }

    // Fallback to static role permissions if no API permissions
    if (userPermissions.length === 0) {
      return (rolePermissions as Permission[]).includes(permission);
    }

    return false;
  };

  return { can, role };
}

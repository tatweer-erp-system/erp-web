import { useAuthContext } from "@/contexts/AuthContext";
import { Role, Permission, ROLE_PERMISSIONS } from "@/types/auth";

export function usePermissions() {
  const { user } = useAuthContext();
  const role = user?.role ?? Role.Admin;
  const permissions = ROLE_PERMISSIONS[role];
  const isSuperAdmin = permissions[0] === "*";

  const can = (permission: Permission): boolean => {
    if (isSuperAdmin) return true;
    return (permissions as Permission[]).includes(permission);
  };

  return { can, role };
}

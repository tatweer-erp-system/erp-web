import { useAuthContext } from "@/contexts/AuthContext";
import { Role, deriveRole } from "@/types/auth";

export function usePermissions() {
  const { user } = useAuthContext();
  const role = deriveRole(user);

  const isSuperAdmin = role === Role.SuperAdmin;
  const userPermissions = user?.permissions ?? [];

  const can = (permission: string): boolean => {
    if (isSuperAdmin) return true;

    for (const p of userPermissions) {
      if (p === "*") return true;
      if (p === permission) return true;
      if (p.endsWith(":*")) {
        const prefix = p.slice(0, -1);
        if (permission.startsWith(prefix)) return true;
      }
    }

    return false;
  };

  return { can, role };
}

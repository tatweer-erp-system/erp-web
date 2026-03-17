import { useMemo } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

type PermissionResult = {
  hasPermission: boolean;
  isLoading: boolean;
};

type PermissionsResult = {
  hasAll: boolean;
  hasAny: boolean;
  results: Record<string, boolean>;
  isLoading: boolean;
};

function checkPermission(userPermissions: string[], required: string): boolean {
  for (const p of userPermissions) {
    if (p === "*") return true;
    if (p === required) return true;
    if (p.endsWith(":*") && required.startsWith(p.slice(0, -1))) return true;
  }
  return false;
}

/**
 * Checks whether the current user holds a single permission.
 */
export function usePermission(required: string): PermissionResult {
  const { user, isLoading } = useAuthContext();
  const permissions = user?.permissions ?? [];

  const hasPermission = useMemo(
    () => checkPermission(permissions, required),
    [permissions, required]
  );

  return { hasPermission, isLoading };
}

/**
 * Checks whether the current user holds multiple permissions.
 */
export function usePermissions(required: string[]): PermissionsResult {
  const { user, isLoading } = useAuthContext();
  const permissions = user?.permissions ?? [];

  const results = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const perm of required) {
      map[perm] = checkPermission(permissions, perm);
    }
    return map;
  }, [permissions, required]);

  const values = Object.values(results);

  return {
    hasAll: values.length > 0 && values.every(Boolean),
    hasAny: values.some(Boolean),
    results,
    isLoading,
  };
}

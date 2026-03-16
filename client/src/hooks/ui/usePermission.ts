import { useMemo } from "react";

import { useAuthStore } from "@/stores/auth.store";
import type { Permission } from "@/types/auth";

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

function checkPermission(
  userPermissions: Permission[],
  required: Permission
): boolean {
  for (const p of userPermissions) {
    if (p === "*") return true;
    if (p === required) return true;
    if (p.endsWith(":*") && required.startsWith(p.slice(0, -1))) return true;
  }
  return false;
}

/**
 * Checks whether the current user holds a single permission.
 *
 * @param required - The permission string to check (e.g. `'sales:write'`).
 * @returns `{ hasPermission, isLoading }` derived from the auth store.
 */
export function usePermission(required: Permission): PermissionResult {
  const permissions = useAuthStore(s => s.permissions);
  const isLoading = useAuthStore(s => s.isLoading);

  const hasPermission = useMemo(
    () => checkPermission(permissions, required),
    [permissions, required]
  );

  return { hasPermission, isLoading };
}

/**
 * Checks whether the current user holds multiple permissions.
 *
 * @param required - Array of permission strings to check.
 * @returns `{ hasAll, hasAny, results, isLoading }` where `results` maps each permission to its check.
 */
export function usePermissions(required: Permission[]): PermissionsResult {
  const permissions = useAuthStore(s => s.permissions);
  const isLoading = useAuthStore(s => s.isLoading);

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

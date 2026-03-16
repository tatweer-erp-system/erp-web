/**
 * Checks whether a user has a specific permission.
 *
 * Supports wildcard permissions: `"*"` grants all, and
 * `"sales:*"` matches any permission starting with `"sales:"`.
 *
 * @param userPermissions - The list of permissions the user holds.
 * @param requiredPermission - The single permission to check.
 * @returns `true` if the user has the required permission.
 */
export function hasPermission(
  userPermissions: readonly string[],
  requiredPermission: string
): boolean {
  for (const permission of userPermissions) {
    if (permission === "*") return true;
    if (permission === requiredPermission) return true;

    if (permission.endsWith(":*")) {
      const prefix = permission.slice(0, -1);
      if (requiredPermission.startsWith(prefix)) return true;
    }
  }

  return false;
}

/**
 * Checks whether a user has ALL of the specified permissions.
 *
 * Returns `true` if every permission in the required list is satisfied.
 * Returns `true` for an empty requirements array.
 *
 * @param userPermissions - The list of permissions the user holds.
 * @param requiredPermissions - The list of permissions that must all be present.
 * @returns `true` if the user satisfies every required permission.
 */
export function canAccess(
  userPermissions: readonly string[],
  requiredPermissions: readonly string[]
): boolean {
  return requiredPermissions.every(required =>
    hasPermission(userPermissions, required)
  );
}

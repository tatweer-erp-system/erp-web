import { useQuery } from "@tanstack/react-query";

import { usersService } from "@/services/users.service";
import { rolesService } from "@/services/roles.service";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { TableParams } from "@/types/api";

/** Paginated user list */
export function useUsers(params: TableParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, params],
    queryFn: () => usersService.list(params),
  });
}

/** Single user by ID */
export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, id],
    queryFn: () => usersService.get(id!),
    enabled: !!id,
  });
}

/** All available roles */
export function useRoles() {
  return useQuery({
    queryKey: [QUERY_KEYS.ROLES],
    queryFn: () => rolesService.list(),
    staleTime: 5 * 60 * 1000,
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { usersService } from "@/services/users.service";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { User } from "@/types/auth";

type AssignRoleDto = {
  userId: string;
  roleId: string;
};

/** Create a new user */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: Omit<User, "id">) => usersService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
    },
  });
}

/** Update an existing user */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<User> }) =>
      usersService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
    },
  });
}

/** Assign a role to a user */
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AssignRoleDto) =>
      usersService.update(dto.userId, {
        roles: [{ id: dto.roleId, name: "" }],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROLES] });
    },
  });
}

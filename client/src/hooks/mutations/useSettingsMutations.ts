import { useMutation, useQueryClient } from "@tanstack/react-query";

import { generalSettingsService } from "@/services/settings.service";
import { settingsApi } from "@/api/endpoints/settings.api";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { GeneralSettings } from "@/services/settings.service";

type CreateBranchDto = {
  nameEn: string;
  nameAr: string;
  code: string;
  isDefault?: boolean;
};

type UpdateBranchDto = Partial<CreateBranchDto> & { version: number };

/** Update general application settings */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: Partial<GeneralSettings>) =>
      generalSettingsService.update(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SETTINGS] });
    },
  });
}

/** Create a new branch */
export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateBranchDto) => settingsApi.createBranch(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BRANCHES] });
    },
  });
}

/** Update an existing branch */
export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBranchDto }) =>
      settingsApi.updateBranch(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BRANCHES] });
    },
  });
}

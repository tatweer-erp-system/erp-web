import { useQuery } from "@tanstack/react-query";

import { generalSettingsService } from "@/services/settings.service";
import { branchesService } from "@/services/branches.service";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

/** General application settings */
export function useSettings() {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS],
    queryFn: () => generalSettingsService.get(),
    staleTime: 5 * 60 * 1000,
  });
}

/** All branches */
export function useBranches() {
  return useQuery({
    queryKey: [QUERY_KEYS.BRANCHES],
    queryFn: () => branchesService.list(),
    staleTime: 5 * 60 * 1000,
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { journalEntriesService } from "@/services/accounting.service";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { CreateJournalEntryDto } from "@/types/modules/accounting";

/** Create a new journal entry */
export function useCreateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateJournalEntryDto) =>
      journalEntriesService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.JOURNAL_ENTRIES],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TRIAL_BALANCE],
      });
    },
  });
}

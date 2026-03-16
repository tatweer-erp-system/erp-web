import { useQuery } from "@tanstack/react-query";

import {
  journalEntriesService,
  accountsService,
  reportsService,
} from "@/services/accounting.service";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { TableParams } from "@/types/api";

type TrialBalanceParams = {
  from: string;
  to: string;
};

/** Paginated journal entries */
export function useJournalEntries(params?: Partial<TableParams>) {
  return useQuery({
    queryKey: [QUERY_KEYS.JOURNAL_ENTRIES, params],
    queryFn: () => journalEntriesService.list(params),
  });
}

/** Full chart of accounts tree */
export function useChartOfAccounts() {
  return useQuery({
    queryKey: [QUERY_KEYS.CHART_OF_ACCOUNTS],
    queryFn: () => accountsService.tree(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Trial balance report for a date range */
export function useTrialBalance(params: TrialBalanceParams | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.TRIAL_BALANCE, params],
    queryFn: () => reportsService.trialBalance(params!.from, params!.to),
    enabled: !!params?.from && !!params?.to,
  });
}

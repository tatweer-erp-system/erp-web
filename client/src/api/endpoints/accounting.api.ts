import { apiClient } from "@/api/client";
import type { ApiResponse, PaginatedResponse, TableParams } from "@/types/api";
import type {
  JournalEntry,
  CreateJournalEntryDto,
  Account,
  TrialBalanceResult,
} from "@/types/modules/accounting";

/** Fetch paginated journal entries */
export function getJournalEntries(params?: Partial<TableParams>) {
  return apiClient
    .get<PaginatedResponse<JournalEntry>>("/accounting/journal-entries", {
      params,
    })
    .then(r => r.data);
}

/** Create a new journal entry */
export function createJournalEntry(dto: CreateJournalEntryDto) {
  return apiClient
    .post<ApiResponse<JournalEntry>>("/accounting/journal-entries", dto)
    .then(r => r.data);
}

/** Fetch the full chart of accounts as a tree */
export function getChartOfAccounts() {
  return apiClient
    .get<ApiResponse<Account[]>>("/accounting/accounts/tree")
    .then(r => r.data);
}

/** Fetch the trial balance for a date range */
export function getTrialBalance(from: string, to: string) {
  return apiClient
    .get<
      ApiResponse<TrialBalanceResult>
    >("/accounting/reports/trial-balance", { params: { from, to } })
    .then(r => r.data);
}

import apiClient from "@/lib/api";
import type { ApiResponse, PaginatedResponse, TableParams } from "@/types/api";
import type {
  Account,
  CreateAccountDto,
  UpdateAccountDto,
  AccountGroup,
  CreateAccountGroupDto,
  UpdateAccountGroupDto,
  Journal,
  CreateJournalDto,
  UpdateJournalDto,
  JournalEntry,
  CreateJournalEntryDto,
  UpdateJournalEntryDto,
  CostCenter,
  FiscalPeriod,
  CreateFiscalPeriodDto,
  TaxGroup,
  CreateTaxGroupDto,
  UpdateTaxGroupDto,
  Tax,
  CreateTaxDto,
  UpdateTaxDto,
  TrialBalanceResult,
  GeneralLedgerRow,
  AccountStatementResult,
  IncomeStatementResult,
  BalanceSheetResult,
  AccountingConfig,
  PaymentTerm,
  CreatePaymentTermDto,
  UpdatePaymentTermDto,
} from "@/types/modules/accounting";
import { JournalEntryStatus } from "@/constants/enums";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveJEStatus(entry: {
  isPosted: boolean;
  reversedBy?: string | null;
}): JournalEntryStatus {
  if (!entry.isPosted) return JournalEntryStatus.DRAFT;
  if (entry.reversedBy) return JournalEntryStatus.REVERSED;
  return JournalEntryStatus.POSTED;
}

function downloadBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export const accountsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<Account>>("/accounting/accounts", { params })
      .then(r => r.data),

  tree: () =>
    apiClient
      .get<ApiResponse<Account[]>>("/accounting/accounts/tree")
      .then(r => r.data.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<Account>>(`/accounting/accounts/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateAccountDto) =>
    apiClient
      .post<ApiResponse<Account>>("/accounting/accounts", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateAccountDto) =>
    apiClient
      .patch<ApiResponse<Account>>(`/accounting/accounts/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/accounting/accounts/${id}`)
      .then(r => r.data),
};

// ─── Journal Entries ──────────────────────────────────────────────────────────

export const journalEntriesService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<JournalEntry>>("/accounting/journal-entries", {
        params,
      })
      .then(r => {
        r.data.data = r.data.data.map(e => ({
          ...e,
          status: deriveJEStatus(e),
        }));
        return r.data;
      }),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<JournalEntry>>(`/accounting/journal-entries/${id}`)
      .then(r => {
        const entry = r.data.data;
        entry.status = deriveJEStatus(entry);
        return entry;
      }),

  create: (dto: CreateJournalEntryDto) =>
    apiClient
      .post<ApiResponse<JournalEntry>>("/accounting/journal-entries", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateJournalEntryDto) =>
    apiClient
      .patch<
        ApiResponse<JournalEntry>
      >(`/accounting/journal-entries/${id}`, dto)
      .then(r => r.data.data),

  post: (id: string) =>
    apiClient
      .post<ApiResponse<JournalEntry>>(`/accounting/journal-entries/${id}/post`)
      .then(r => r.data.data),

  reverse: (id: string) =>
    apiClient
      .post<
        ApiResponse<JournalEntry>
      >(`/accounting/journal-entries/${id}/reverse`)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/accounting/journal-entries/${id}`)
      .then(r => r.data),
};

// ─── Cost Centers ─────────────────────────────────────────────────────────────

export const costCentersService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<CostCenter>>("/accounting/cost-centers", {
        params,
      })
      .then(r => r.data),

  tree: () =>
    apiClient
      .get<ApiResponse<CostCenter[]>>("/accounting/cost-centers/tree")
      .then(r => r.data.data),

  create: (dto: Partial<CostCenter>) =>
    apiClient
      .post<ApiResponse<CostCenter>>("/accounting/cost-centers", dto)
      .then(r => r.data.data),

  update: (id: string, dto: Partial<CostCenter>) =>
    apiClient
      .patch<ApiResponse<CostCenter>>(`/accounting/cost-centers/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/accounting/cost-centers/${id}`)
      .then(r => r.data),
};

// ─── Fiscal Periods ───────────────────────────────────────────────────────────

export const fiscalPeriodsService = {
  list: () =>
    apiClient
      .get<ApiResponse<FiscalPeriod[]>>("/accounting/periods")
      .then(r => r.data.data),

  get: (id: number) =>
    apiClient
      .get<ApiResponse<FiscalPeriod>>(`/accounting/periods/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateFiscalPeriodDto) =>
    apiClient
      .post<ApiResponse<FiscalPeriod>>("/accounting/periods", dto)
      .then(r => r.data.data),

  update: (id: number, dto: Partial<CreateFiscalPeriodDto>) =>
    apiClient
      .patch<ApiResponse<FiscalPeriod>>(`/accounting/periods/${id}`, dto)
      .then(r => r.data.data),

  close: (id: number) =>
    apiClient
      .post<ApiResponse<FiscalPeriod>>(`/accounting/periods/${id}/close`)
      .then(r => r.data.data),

  reopen: (id: number) =>
    apiClient
      .post<ApiResponse<FiscalPeriod>>(`/accounting/periods/${id}/reopen`)
      .then(r => r.data.data),

  lock: (id: number) =>
    apiClient
      .post<ApiResponse<FiscalPeriod>>(`/accounting/periods/${id}/lock`)
      .then(r => r.data.data),
};

// ─── Reports ──────────────────────────────────────────────────────────────────

export const reportsService = {
  trialBalance: (from: string, to: string) =>
    apiClient
      .get<ApiResponse<TrialBalanceResult>>(
        "/accounting/reports/trial-balance",
        {
          params: { from, to },
        }
      )
      .then(r => r.data.data),

  exportTrialBalance: (from: string, to: string, format: "pdf" | "xlsx") =>
    apiClient
      .get("/accounting/reports/trial-balance", {
        params: { from, to, format },
        responseType: "blob",
      })
      .then(r => downloadBlob(r.data, `trial-balance.${format}`)),

  generalLedger: (accountId: string, from: string, to: string) =>
    apiClient
      .get<
        ApiResponse<GeneralLedgerRow[]>
      >("/accounting/reports/general-ledger", { params: { accountId, from, to } })
      .then(r => r.data.data),

  incomeStatement: (from: string, to: string, costCenterId?: string) =>
    apiClient
      .get<
        ApiResponse<IncomeStatementResult>
      >("/accounting/reports/income-statement", { params: { from, to, ...(costCenterId ? { costCenterId } : {}) } })
      .then(r => r.data.data),

  exportIncomeStatement: (
    from: string,
    to: string,
    format: "pdf" | "xlsx",
    costCenterId?: string
  ) =>
    apiClient
      .get("/accounting/reports/income-statement", {
        params: {
          from,
          to,
          format,
          ...(costCenterId ? { costCenterId } : {}),
        },
        responseType: "blob",
      })
      .then(r => downloadBlob(r.data, `income-statement.${format}`)),

  balanceSheet: (asOfDate: string) =>
    apiClient
      .get<
        ApiResponse<BalanceSheetResult>
      >("/accounting/reports/balance-sheet", { params: { asOfDate } })
      .then(r => r.data.data),

  exportBalanceSheet: (asOfDate: string, format: "pdf" | "xlsx") =>
    apiClient
      .get("/accounting/reports/balance-sheet", {
        params: { asOfDate, format },
        responseType: "blob",
      })
      .then(r => downloadBlob(r.data, `balance-sheet.${format}`)),

  accountStatement: (accountId: string, from: string, to: string) =>
    apiClient
      .get<
        ApiResponse<AccountStatementResult>
      >("/accounting/reports/account-statement", { params: { accountId, from, to } })
      .then(r => r.data.data),
};

// ─── Account Groups ──────────────────────────────────────────────────────────

export const accountGroupsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<AccountGroup>>("/account-groups", { params })
      .then(r => r.data),

  tree: () =>
    apiClient
      .get<ApiResponse<AccountGroup[]>>("/account-groups/tree")
      .then(r => r.data.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<AccountGroup>>(`/account-groups/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateAccountGroupDto) =>
    apiClient
      .post<ApiResponse<AccountGroup>>("/account-groups", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateAccountGroupDto) =>
    apiClient
      .patch<ApiResponse<AccountGroup>>(`/account-groups/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/account-groups/${id}`)
      .then(r => r.data),
};

// ─── Journals ────────────────────────────────────────────────────────────────

export const journalsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<Journal>>("/journals", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<Journal>>(`/journals/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateJournalDto) =>
    apiClient
      .post<ApiResponse<Journal>>("/journals", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateJournalDto) =>
    apiClient
      .patch<ApiResponse<Journal>>(`/journals/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/journals/${id}`).then(r => r.data),
};

// ─── Tax Groups ──────────────────────────────────────────────────────────────

export const taxGroupsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<TaxGroup>>("/tax-groups", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<TaxGroup>>(`/tax-groups/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateTaxGroupDto) =>
    apiClient
      .post<ApiResponse<TaxGroup>>("/tax-groups", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateTaxGroupDto) =>
    apiClient
      .patch<ApiResponse<TaxGroup>>(`/tax-groups/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/tax-groups/${id}`).then(r => r.data),
};

// ─── Taxes ───────────────────────────────────────────────────────────────────

export const taxesService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<Tax>>("/taxes", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Tax>>(`/taxes/${id}`).then(r => r.data.data),

  create: (dto: CreateTaxDto) =>
    apiClient.post<ApiResponse<Tax>>("/taxes", dto).then(r => r.data.data),

  update: (id: string, dto: UpdateTaxDto) =>
    apiClient
      .patch<ApiResponse<Tax>>(`/taxes/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/taxes/${id}`).then(r => r.data),
};

// ─── Payment Terms ───────────────────────────────────────────────────────────

export const paymentTermsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<PaymentTerm>>("/payment-terms", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<PaymentTerm>>(`/payment-terms/${id}`)
      .then(r => r.data.data),

  create: (dto: CreatePaymentTermDto) =>
    apiClient
      .post<ApiResponse<PaymentTerm>>("/payment-terms", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdatePaymentTermDto) =>
    apiClient
      .patch<ApiResponse<PaymentTerm>>(`/payment-terms/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/payment-terms/${id}`)
      .then(r => r.data),
};

// ─── Accounting Config ────────────────────────────────────────────────────────

export const accountingConfigService = {
  get: () =>
    apiClient
      .get<ApiResponse<AccountingConfig>>("/config/accounting")
      .then(r => r.data.data),

  update: (dto: Partial<AccountingConfig>) =>
    apiClient
      .patch<ApiResponse<AccountingConfig>>("/config/accounting", dto)
      .then(r => r.data.data),
};

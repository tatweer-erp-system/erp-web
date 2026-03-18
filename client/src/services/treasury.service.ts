import apiClient from "@/lib/api";
import type { ApiResponse, PaginatedResponse, TableParams } from "@/types/api";
import type {
  TreasuryAccount,
  CreateTreasuryAccountDto,
  UpdateTreasuryAccountDto,
  TreasuryTransaction,
  CreateTreasuryTransactionDto,
  CreateTransferDto,
  TransferReason,
  CreateTransferReasonDto,
  UpdateTransferReasonDto,
  BankReconciliation,
  CreateReconciliationDto,
  BankStatement,
  BankStatementLine,
} from "@/types/modules/treasury";

// ─── Treasury Accounts ───────────────────────────────────────────────────────

export const treasuryAccountsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<TreasuryAccount>>("/treasury/accounts", {
        params,
      })
      .then(r => r.data),
  get: (id: string) =>
    apiClient
      .get<ApiResponse<TreasuryAccount>>(`/treasury/accounts/${id}`)
      .then(r => r.data.data),
  create: (dto: CreateTreasuryAccountDto) =>
    apiClient
      .post<ApiResponse<TreasuryAccount>>("/treasury/accounts", dto)
      .then(r => r.data.data),
  update: (id: string, dto: UpdateTreasuryAccountDto) =>
    apiClient
      .patch<ApiResponse<TreasuryAccount>>(`/treasury/accounts/${id}`, dto)
      .then(r => r.data.data),
  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/treasury/accounts/${id}`)
      .then(r => r.data),
};

// ─── Treasury Transactions ───────────────────────────────────────────────────

export const treasuryTransactionsService = {
  listByAccount: (accountId: string, params?: Partial<TableParams>) =>
    apiClient
      .get<
        PaginatedResponse<TreasuryTransaction>
      >(`/treasury/accounts/${accountId}/transactions`, { params })
      .then(r => r.data),
  statement: (accountId: string, params?: Partial<TableParams>) =>
    apiClient
      .get<
        PaginatedResponse<TreasuryTransaction>
      >(`/treasury/accounts/${accountId}/statement`, { params })
      .then(r => r.data),
  get: (id: string) =>
    apiClient
      .get<ApiResponse<TreasuryTransaction>>(`/treasury/transactions/${id}`)
      .then(r => r.data.data),
  create: (dto: CreateTreasuryTransactionDto) =>
    apiClient
      .post<ApiResponse<TreasuryTransaction>>("/treasury/transactions", dto)
      .then(r => r.data.data),
  transfer: (dto: CreateTransferDto) =>
    apiClient
      .post<
        ApiResponse<{
          outTransaction: TreasuryTransaction;
          inTransaction: TreasuryTransaction;
        }>
      >("/treasury/transfers", dto)
      .then(r => r.data.data),
};

// ─── Transfer Reasons (Definitions) ──────────────────────────────────────────

export const transferReasonsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<
        PaginatedResponse<TransferReason>
      >("/treasury/definitions/transfer-reasons", { params })
      .then(r => r.data),
  get: (id: string) =>
    apiClient
      .get<
        ApiResponse<TransferReason>
      >(`/treasury/definitions/transfer-reasons/${id}`)
      .then(r => r.data.data),
  create: (dto: CreateTransferReasonDto) =>
    apiClient
      .post<
        ApiResponse<TransferReason>
      >("/treasury/definitions/transfer-reasons", dto)
      .then(r => r.data.data),
  update: (id: string, dto: UpdateTransferReasonDto) =>
    apiClient
      .patch<
        ApiResponse<TransferReason>
      >(`/treasury/definitions/transfer-reasons/${id}`, dto)
      .then(r => r.data.data),
  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/treasury/definitions/transfer-reasons/${id}`)
      .then(r => r.data),
};

// ─── Reconciliation ──────────────────────────────────────────────────────────

export const reconciliationService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<
        PaginatedResponse<BankReconciliation>
      >("/treasury/reconciliations", { params })
      .then(r => r.data),
  get: (id: string) =>
    apiClient
      .get<ApiResponse<BankReconciliation>>(`/treasury/reconciliations/${id}`)
      .then(r => r.data.data),
  create: (dto: CreateReconciliationDto) =>
    apiClient
      .post<ApiResponse<BankReconciliation>>("/treasury/reconciliations", dto)
      .then(r => r.data.data),
  getUnmatched: (id: string) =>
    apiClient
      .get<
        ApiResponse<TreasuryTransaction[]>
      >(`/treasury/reconciliations/${id}/unmatched`)
      .then(r => r.data.data),
  match: (id: string, transactionIds: string[]) =>
    apiClient
      .post<
        ApiResponse<{ matched: number }>
      >(`/treasury/reconciliations/${id}/match`, { transactionIds })
      .then(r => r.data.data),
  unmatch: (id: string, transactionIds: string[]) =>
    apiClient
      .post<
        ApiResponse<{ unmatched: number }>
      >(`/treasury/reconciliations/${id}/unmatch`, { transactionIds })
      .then(r => r.data.data),
  complete: (id: string) =>
    apiClient
      .post<
        ApiResponse<BankReconciliation>
      >(`/treasury/reconciliations/${id}/complete`)
      .then(r => r.data.data),
};

// ─── Bank Statements ─────────────────────────────────────────────────────────

export const bankStatementsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<BankStatement>>("/bank-statements", { params })
      .then(r => r.data),
  get: (id: string) =>
    apiClient
      .get<ApiResponse<BankStatement>>(`/bank-statements/${id}`)
      .then(r => r.data.data),
  create: (dto: Partial<BankStatement>) =>
    apiClient
      .post<ApiResponse<BankStatement>>("/bank-statements", dto)
      .then(r => r.data.data),
  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/bank-statements/${id}`)
      .then(r => r.data),
  validate: (id: string) =>
    apiClient
      .post<ApiResponse<BankStatement>>(`/bank-statements/${id}/validate`)
      .then(r => r.data.data),
  autoMatch: (id: string) =>
    apiClient
      .post<
        ApiResponse<{ totalLines: number; matched: number; unmatched: number }>
      >(`/bank-statements/${id}/auto-match`)
      .then(r => r.data.data),
  getLines: (id: string, params?: Partial<TableParams>) =>
    apiClient
      .get<
        PaginatedResponse<BankStatementLine>
      >(`/bank-statements/${id}/lines`, { params })
      .then(r => r.data),
  addLine: (id: string, dto: Partial<BankStatementLine>) =>
    apiClient
      .post<ApiResponse<BankStatementLine>>(`/bank-statements/${id}/lines`, dto)
      .then(r => r.data.data),
  removeLine: (lineId: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/bank-statements/lines/${lineId}`)
      .then(r => r.data),
  matchLine: (
    lineId: string,
    dto: { paymentId?: string; journalEntryId?: string }
  ) =>
    apiClient
      .post<
        ApiResponse<BankStatementLine>
      >(`/bank-statements/lines/${lineId}/match`, dto)
      .then(r => r.data.data),
  unmatchLine: (lineId: string) =>
    apiClient
      .post<
        ApiResponse<BankStatementLine>
      >(`/bank-statements/lines/${lineId}/unmatch`)
      .then(r => r.data.data),
};

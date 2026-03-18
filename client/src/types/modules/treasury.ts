import type {
  TreasuryAccountType,
  TreasuryTransactionType,
  ReconciliationStatus,
  BankStatementStatus,
} from "@/constants/enums";

// ─── Treasury Accounts ───────────────────────────────────────────────────────

export interface TreasuryAccount {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  type: TreasuryAccountType;
  currency: string;
  currentBalance: number;
  coaAccountId?: string | null;
  branchId?: string | null;
  isDefault: boolean;
  isActive: boolean;
  bankName?: string | null;
  accountNumber?: string | null;
  iban?: string | null;
  swiftCode?: string | null;
  version?: number;
}

export interface CreateTreasuryAccountDto {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  type: TreasuryAccountType;
  currency?: string;
  coaAccountId?: string;
  branchId?: string;
  isDefault?: boolean;
  isActive?: boolean;
  bankName?: string;
  accountNumber?: string;
  iban?: string;
  swiftCode?: string;
}

export interface UpdateTreasuryAccountDto extends Partial<CreateTreasuryAccountDto> {
  version: number;
}

// ─── Treasury Transactions ───────────────────────────────────────────────────

export interface TreasuryTransaction {
  id: string;
  accountId: string;
  type: TreasuryTransactionType;
  amount: number;
  currency: string;
  exchangeRate: number;
  reference?: string | null;
  partnerId?: string | null;
  paymentId?: string | null;
  date: string;
  description?: string | null;
  isReconciled: boolean;
  reconciliationId?: string | null;
  journalEntryId?: string | null;
  runningBalance?: number;
  createdAt?: string;
  version?: number;
}

export interface CreateTreasuryTransactionDto {
  accountId: string;
  type: TreasuryTransactionType;
  amount: number;
  date: string;
  description?: string;
  reference?: string;
  partnerId?: string;
  paymentId?: string;
}

export interface CreateTransferDto {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  date: string;
  description?: string;
  reference?: string;
}

// ─── Transfer Reasons ────────────────────────────────────────────────────────

export interface TransferReason {
  id: string;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
  version?: number;
}

export interface CreateTransferReasonDto {
  nameEn: string;
  nameAr: string;
  isActive?: boolean;
}

export interface UpdateTransferReasonDto extends Partial<CreateTransferReasonDto> {
  version: number;
}

// ─── Bank Reconciliation ─────────────────────────────────────────────────────

export interface BankReconciliation {
  id: string;
  accountId: string;
  statementDate: string;
  openingBalance: number;
  closingBalance: number;
  systemBalance: number;
  difference: number;
  status: ReconciliationStatus;
  reconciledBy?: string | null;
  completedAt?: string | null;
  notes?: string | null;
  version?: number;
}

export interface CreateReconciliationDto {
  accountId: string;
  statementDate: string;
  openingBalance: number;
  closingBalance: number;
  notes?: string;
}

// ─── Bank Statements ─────────────────────────────────────────────────────────

export interface BankStatement {
  id: string;
  branchId: string;
  journalId?: string | null;
  name: string;
  dateFrom: string;
  dateTo: string;
  balanceStart: number;
  balanceEnd: number;
  balanceEndReal?: number | null;
  status: BankStatementStatus;
  version?: number;
}

export interface BankStatementLine {
  id: string;
  statementId: string;
  date: string;
  reference?: string | null;
  partnerName?: string | null;
  amount: number;
  isReconciled: boolean;
  journalEntryId?: string | null;
  paymentId?: string | null;
}

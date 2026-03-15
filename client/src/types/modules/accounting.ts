import type {
  AccountType,
  NormalBalance,
  JournalEntryType,
  JournalEntryStatus,
  FiscalPeriodStatus,
  FiscalPeriodType,
} from "@/constants/enums";

// ─── Chart of Accounts ───────────────────────────────────────────────────────

export interface Account {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  type: AccountType;
  subType?: string;
  parentId?: string | null;
  normalBalance: NormalBalance;
  isActive: boolean;
  allowDirectPosting: boolean;
  openingBalance?: number;
  openingBalanceDate?: string;
  currency?: string;
  children?: Account[];
  version?: number;
}

export interface CreateAccountDto {
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  type: AccountType;
  subType?: string;
  parentId?: string;
  normalBalance: NormalBalance;
  isActive?: boolean;
  allowDirectPosting?: boolean;
  openingBalance?: number;
  openingBalanceDate?: string;
  currency?: string;
}

export interface UpdateAccountDto extends Partial<CreateAccountDto> {
  version: number;
}

// ─── Journal Entries ──────────────────────────────────────────────────────────

export interface JournalLine {
  id?: string | number;
  accountId: string;
  costCenterId?: string | null;
  debit: number;
  credit: number;
  description?: string | null;
  currency?: string;
  exchangeRate?: number;
  accountCode?: string;
  accountNameEn?: string;
  accountNameAr?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  entryType: JournalEntryType;
  description?: string | null;
  referenceId?: string | null;
  referenceType?: string | null;
  reversedBy?: string | null;
  reversalOf?: string | null;
  isPosted: boolean;
  postedBy?: string | null;
  postedAt?: string | null;
  periodId?: number | null;
  lines?: JournalLine[];
  totalDebit?: number;
  totalCredit?: number;
  status?: JournalEntryStatus;
  createdAt?: string;
  version?: number;
}

export interface CreateJournalEntryDto {
  entryType?: JournalEntryType;
  entryDate: string;
  description?: string;
  lines: Omit<JournalLine, "id">[];
}

export interface UpdateJournalEntryDto {
  entryDate?: string;
  description?: string;
  lines?: Omit<JournalLine, "id">[];
  version: number;
}

// ─── Cost Centers ─────────────────────────────────────────────────────────────

export interface CostCenter {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  parentId?: string | null;
  isActive: boolean;
  children?: CostCenter[];
  version?: number;
}

// ─── Fiscal Periods ───────────────────────────────────────────────────────────

export interface FiscalPeriod {
  id: number;
  fiscalYear: number;
  periodNumber: number;
  periodType: FiscalPeriodType;
  nameEn: string;
  nameAr: string;
  startDate: string;
  endDate: string;
  status: FiscalPeriodStatus;
  closedBy?: string | null;
  closedAt?: string | null;
  version?: number;
}

export interface CreateFiscalPeriodDto {
  fiscalYear: number;
  periodNumber: number;
  periodType?: FiscalPeriodType;
  nameEn: string;
  nameAr: string;
  startDate: string;
  endDate: string;
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface TrialBalanceRow {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  accountType: AccountType;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export interface TrialBalanceResult {
  data: TrialBalanceRow[];
  from: string;
  to: string;
}

export interface GeneralLedgerRow {
  entryNumber: string;
  entryDate: string;
  description?: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface AccountStatementResult {
  openingBalance: number;
  movements: GeneralLedgerRow[];
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  accountId: string;
  from: string;
  to: string;
}

export interface IncomeStatementResult {
  revenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netIncome: number;
  details?: { code: string; nameEn: string; nameAr: string; balance: number }[];
  from: string;
  to: string;
}

export interface BalanceSheetRow {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  accountType: AccountType;
  balance: number;
}

export interface BalanceSheetResult {
  assets: BalanceSheetRow[];
  liabilities: BalanceSheetRow[];
  equity: BalanceSheetRow[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  asOfDate: string;
}

// ─── Accounting Settings ──────────────────────────────────────────────────────

export interface AccountingConfig {
  fiscalYearStartMonth?: number;
  vatRate?: number;
  salaryCalculationBasis?: string;
  defaultCurrency?: string;
  coaCash?: string;
  coaSalesRevenue?: string;
  coaCogs?: string;
  coaVatPayable?: string;
  coaAccountsReceivable?: string;
  coaAccountsPayable?: string;
  coaSalariesPayable?: string;
  coaGosiPayable?: string;
  coaSalariesExpense?: string;
  coaGosiExpense?: string;
  coaInventory?: string;
  coaInventoryAdjustment?: string;
  coaFxGainLoss?: string;
  coaLoyaltyLiability?: string;
  coaGiftCardLiability?: string;
}

import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/types/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month" | "quarter" | "year";
}

export interface SalesReportRow {
  status: string;
  orderCount: number;
  totalAmount: number;
}

export interface SalesReportSummary {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export interface SalesReportResult {
  reportType: "sales";
  generatedAt: string;
  filters: ReportFilters;
  data: SalesReportRow[];
  summary: SalesReportSummary;
}

export interface PurchaseReportRow {
  status: string;
  orderCount: number;
  totalAmount: number;
}

export interface PurchaseReportSummary {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export interface PurchaseReportResult {
  reportType: "sales";
  generatedAt: string;
  filters: ReportFilters;
  data: PurchaseReportRow[];
  summary: PurchaseReportSummary;
}

export interface InventoryReportRow {
  name: string;
  quantity: number;
  reorderPoint: number;
  warehouse: string;
}

export interface InventoryReportSummary {
  totalProductsInStock: number;
  totalWarehouses: number;
  totalQuantity: number;
}

export interface InventoryReportResult {
  reportType: "inventory";
  generatedAt: string;
  filters: ReportFilters;
  data: InventoryReportRow[];
  summary: InventoryReportSummary;
}

export interface FinancialReportRow {
  month: string;
  orderCount: number;
  amount: number;
}

export interface FinancialReportSummary {
  totalRevenue: number;
  cancelledAmount: number;
  totalTransactions: number;
}

export interface FinancialReportResult {
  reportType: "financial";
  generatedAt: string;
  filters: ReportFilters;
  data: FinancialReportRow[];
  summary: FinancialReportSummary;
}

export interface CrmReportRow {
  status: string;
  count: number;
  totalValue: number;
}

export interface CrmReportSummary {
  totalLeads: number;
  wonLeads: number;
  lostLeads: number;
  wonValue: number;
}

export interface CrmReportResult {
  reportType: "crm";
  generatedAt: string;
  filters: ReportFilters;
  data: CrmReportRow[];
  summary: CrmReportSummary;
}

export interface HrReportResult {
  reportType: "hr";
  generatedAt: string;
  filters: ReportFilters;
  data: unknown[];
  summary: { totalEmployees: number };
}

export interface AgingBucket {
  partnerId: string;
  partnerName: string;
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  over90: number;
  total: number;
}

export interface AgingReportResult {
  reportType: "aging";
  generatedAt: string;
  receivables: AgingBucket[];
  payables: AgingBucket[];
  summary: {
    totalReceivables: number;
    totalPayables: number;
    overdueReceivables: number;
    overduePayables: number;
  };
}

export interface TaxPeriod {
  period: string;
  salesTax: number;
  purchaseTax: number;
  netTax: number;
  status: string;
}

export interface TaxReportResult {
  reportType: "tax";
  generatedAt: string;
  periods: TaxPeriod[];
  summary: {
    totalSalesTax: number;
    totalPurchaseTax: number;
    netPayable: number;
  };
}

// ─── API functions ───────────────────────────────────────────────────────────

export function getSalesReport(params?: ReportFilters) {
  return apiClient
    .get<ApiResponse<SalesReportResult>>("/reporting/sales", { params })
    .then(r => r.data);
}

export function getPurchaseReport(params?: ReportFilters) {
  return apiClient
    .get<ApiResponse<PurchaseReportResult>>("/reporting/sales", { params })
    .then(r => r.data);
}

export function getInventoryReport(params?: ReportFilters) {
  return apiClient
    .get<ApiResponse<InventoryReportResult>>("/reporting/inventory", { params })
    .then(r => r.data);
}

export function getFinancialReport(params?: ReportFilters) {
  return apiClient
    .get<ApiResponse<FinancialReportResult>>("/reporting/financial", { params })
    .then(r => r.data);
}

export function getCrmReport(params?: ReportFilters) {
  return apiClient
    .get<ApiResponse<CrmReportResult>>("/reporting/crm", { params })
    .then(r => r.data);
}

export function getHrReport(params?: ReportFilters) {
  return apiClient
    .get<ApiResponse<HrReportResult>>("/reporting/hr", { params })
    .then(r => r.data);
}

export function getAgingReport(params?: ReportFilters) {
  return apiClient
    .get<ApiResponse<AgingReportResult>>("/reporting/aging", { params })
    .then(r => r.data);
}

export function getTaxReport(params?: ReportFilters) {
  return apiClient
    .get<ApiResponse<TaxReportResult>>("/reporting/tax", { params })
    .then(r => r.data);
}

export function exportReport(dto: {
  reportType: string;
  format: "pdf" | "csv" | "xlsx";
  startDate?: string;
  endDate?: string;
}) {
  return apiClient
    .post<ApiResponse<{ jobId: number; status: string }>>(
      "/reporting/export",
      dto,
    )
    .then(r => r.data);
}

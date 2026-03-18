/**
 * Documents hub page.
 * No backend API exists — this acts as a quick-access hub linking to
 * export/report pages across modules, with a "coming soon" notice for
 * centralized document storage.
 * Default export for lazy loading via React.lazy().
 */

import { useMemo } from "react";
import {
  Typography,
  Card,
  Row,
  Col,
  Table,
  Button,
  Alert,
  Statistic,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  FileTextOutlined,
  BarChartOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  BankOutlined,
  InboxOutlined,
  TeamOutlined,
  FundOutlined,
  ArrowRightOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  AuditOutlined,
  AccountBookOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { ROUTES } from "@/shared/constants/routes";

const { Text } = Typography;

// ─── Quick Action Cards ─────────────────────────────────────────────────────

interface QuickAction {
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  route: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    titleKey: "documents.exportSalesReport",
    descriptionKey: "documents.exportSalesReportDesc",
    icon: <BarChartOutlined />,
    iconColor: "#3b82f6",
    iconBg: "#3b82f615",
    route: ROUTES.SALES_REPORTS,
  },
  {
    titleKey: "documents.exportInventoryReport",
    descriptionKey: "documents.exportInventoryReportDesc",
    icon: <InboxOutlined />,
    iconColor: "#10b981",
    iconBg: "#10b98115",
    route: ROUTES.INVENTORY_REPORTS,
  },
  {
    titleKey: "documents.exportFinancialReport",
    descriptionKey: "documents.exportFinancialReportDesc",
    icon: <DollarOutlined />,
    iconColor: "#8b5cf6",
    iconBg: "#8b5cf615",
    route: ROUTES.FINANCIAL_REPORTS,
  },
  {
    titleKey: "documents.printInvoice",
    descriptionKey: "documents.printInvoiceDesc",
    icon: <FilePdfOutlined />,
    iconColor: "#f59e0b",
    iconBg: "#f59e0b15",
    route: ROUTES.SALES_INVOICES,
  },
];

// ─── Module Links Table ─────────────────────────────────────────────────────

interface ModuleLink {
  key: string;
  moduleKey: string;
  icon: React.ReactNode;
  iconColor: string;
  documentTypes: string[];
  routes: { labelKey: string; path: string }[];
}

const MODULE_LINKS: ModuleLink[] = [
  {
    key: "sales",
    moduleKey: "documents.moduleSales",
    icon: <ShoppingCartOutlined />,
    iconColor: "#3b82f6",
    documentTypes: [
      "documents.typeSalesReports",
      "documents.typeInvoices",
      "documents.typeQuotations",
    ],
    routes: [
      { labelKey: "documents.goSalesReports", path: ROUTES.SALES_REPORTS },
      { labelKey: "documents.goInvoices", path: ROUTES.SALES_INVOICES },
      { labelKey: "documents.goQuotations", path: ROUTES.QUOTATIONS },
    ],
  },
  {
    key: "purchasing",
    moduleKey: "documents.modulePurchasing",
    icon: <ShoppingOutlined />,
    iconColor: "#f59e0b",
    documentTypes: [
      "documents.typePurchaseReports",
      "documents.typePurchaseOrders",
    ],
    routes: [
      {
        labelKey: "documents.goPurchaseReports",
        path: ROUTES.PURCHASE_REPORTS,
      },
      {
        labelKey: "documents.goPurchaseOrders",
        path: ROUTES.PURCHASE_ORDERS,
      },
    ],
  },
  {
    key: "accounting",
    moduleKey: "documents.moduleAccounting",
    icon: <BankOutlined />,
    iconColor: "#8b5cf6",
    documentTypes: [
      "documents.typeTrialBalance",
      "documents.typeBalanceSheet",
      "documents.typeIncomeStatement",
      "documents.typeGeneralLedger",
    ],
    routes: [
      { labelKey: "documents.goTrialBalance", path: ROUTES.TRIAL_BALANCE },
      { labelKey: "documents.goBalanceSheet", path: ROUTES.BALANCE_SHEET },
      {
        labelKey: "documents.goIncomeStatement",
        path: ROUTES.INCOME_STATEMENT,
      },
      { labelKey: "documents.goGeneralLedger", path: ROUTES.GENERAL_LEDGER },
    ],
  },
  {
    key: "inventory",
    moduleKey: "documents.moduleInventory",
    icon: <InboxOutlined />,
    iconColor: "#10b981",
    documentTypes: [
      "documents.typeInventoryValuation",
      "documents.typeStockMovement",
    ],
    routes: [
      {
        labelKey: "documents.goInventoryValuation",
        path: ROUTES.INVENTORY_VALUATION,
      },
      { labelKey: "documents.goStockMovement", path: ROUTES.STOCK_MOVEMENT },
    ],
  },
  {
    key: "hr",
    moduleKey: "documents.moduleHR",
    icon: <TeamOutlined />,
    iconColor: "#ec4899",
    documentTypes: ["documents.typePayroll", "documents.typeContracts"],
    routes: [
      { labelKey: "documents.goPayroll", path: ROUTES.PAYROLL },
      { labelKey: "documents.goContracts", path: ROUTES.CONTRACTS },
    ],
  },
  {
    key: "treasury",
    moduleKey: "documents.moduleTreasury",
    icon: <AccountBookOutlined />,
    iconColor: "#06b6d4",
    documentTypes: [
      "documents.typeReceipts",
      "documents.typePayments",
      "documents.typeBankReconciliation",
    ],
    routes: [
      { labelKey: "documents.goReceipts", path: ROUTES.RECEIPTS },
      { labelKey: "documents.goPayments", path: ROUTES.PAYMENTS },
      {
        labelKey: "documents.goBankReconciliation",
        path: ROUTES.BANK_RECONCILIATION,
      },
    ],
  },
];

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function Documents() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("documents.title", lang) },
  ];

  // ── Stat cards ──────────────────────────────────────────────────────────
  const statCards = [
    {
      title: t("documents.statModules", lang),
      value: MODULE_LINKS.length,
      suffix: "",
      icon: <FundOutlined />,
      iconColor: "#3b82f6",
      iconBg: "#3b82f615",
    },
    {
      title: t("documents.statReportPages", lang),
      value: MODULE_LINKS.reduce((s, m) => s + m.routes.length, 0),
      suffix: "",
      icon: <FileTextOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
    {
      title: t("documents.statExportFormats", lang),
      value: 3,
      suffix: "",
      icon: <FileExcelOutlined />,
      iconColor: "#8b5cf6",
      iconBg: "#8b5cf615",
    },
    {
      title: t("documents.statDocTypes", lang),
      value: MODULE_LINKS.reduce((s, m) => s + m.documentTypes.length, 0),
      suffix: "",
      icon: <AuditOutlined />,
      iconColor: "#f59e0b",
      iconBg: "#f59e0b15",
    },
  ];

  // ── Table columns ───────────────────────────────────────────────────────
  const columns: TableColumnsType<ModuleLink> = useMemo(
    () => [
      {
        title: t("documents.colModule", lang),
        dataIndex: "moduleKey",
        width: 180,
        render: (_: string, rec: ModuleLink) => (
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${rec.iconColor}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: rec.iconColor,
                flexShrink: 0,
              }}
            >
              {rec.icon}
            </div>
            <Text strong>{t(rec.moduleKey, lang)}</Text>
          </div>
        ),
      },
      {
        title: t("documents.colDocumentTypes", lang),
        dataIndex: "documentTypes",
        render: (types: string[]) => (
          <Text type="secondary">{types.map(k => t(k, lang)).join(", ")}</Text>
        ),
      },
      {
        title: t("documents.colActions", lang),
        width: 280,
        render: (_: unknown, rec: ModuleLink) => (
          <div className="flex flex-wrap gap-1">
            {rec.routes.map(r => (
              <Button
                key={r.path}
                size="small"
                type="link"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate(r.path)}
              >
                {t(r.labelKey, lang)}
              </Button>
            ))}
          </div>
        ),
      },
    ],
    [t, lang, navigate]
  );

  return (
    <DashboardLayout currentPage="Documents" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        {/* ── 1. Stats Row ──────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {statCards.map(s => (
            <Col key={s.title} xs={24} sm={12} lg={6}>
              <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
                <div className="flex justify-between items-start">
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {s.title}
                    </Text>
                    <Statistic
                      value={s.value}
                      suffix={s.suffix}
                      valueStyle={{ fontSize: 24, lineHeight: 1 }}
                    />
                  </div>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: s.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      color: s.iconColor,
                    }}
                  >
                    {s.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ── 2. Quick Actions Row ──────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {QUICK_ACTIONS.map(action => (
            <Col key={action.titleKey} xs={24} sm={12} lg={6}>
              <Card
                hoverable
                size="small"
                styles={{ body: { padding: "20px" } }}
                onClick={() => navigate(action.route)}
                style={{ cursor: "pointer" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: action.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      color: action.iconColor,
                      flexShrink: 0,
                    }}
                  >
                    {action.icon}
                  </div>
                  <div>
                    <Text strong style={{ display: "block", fontSize: 14 }}>
                      {t(action.titleKey, lang)}
                    </Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: 12, marginTop: 2, display: "block" }}
                    >
                      {t(action.descriptionKey, lang)}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ── 3. Coming Soon Alert ──────────────────────────────────────── */}
        <Alert
          type="info"
          showIcon
          message={t("documents.comingSoonTitle", lang)}
          description={t("documents.comingSoonDesc", lang)}
        />

        {/* ── 4. Module Links Table ─────────────────────────────────────── */}
        <Card
          title={t("documents.moduleLinksTitle", lang)}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            rowKey="key"
            columns={columns}
            dataSource={MODULE_LINKS}
            size="middle"
            pagination={false}
            scroll={{ x: "max-content" }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Typography,
  message,
  theme as antTheme,
} from "antd";
import {
  SettingOutlined,
  SaveOutlined,
  BankOutlined,
  PercentageOutlined,
  AccountBookOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  accountingConfigService,
  accountsService,
  journalsService,
} from "@/services/accounting.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { t } from "@/i18n";
import { useLangStore } from "@/stores/lang.store";
import { getName } from "@/lib/utils";
import type { AccountingConfig, Account } from "@/types/modules/accounting";

const { Title, Text } = Typography;

// ─── Tab definitions (3 tabs) ───────────────────────────────────────────────
const TABS = [
  {
    key: "general",
    labelKey: "accounting.settings.general",
    icon: <SettingOutlined />,
  },
  {
    key: "gl-mappings",
    labelKey: "accounting.settings.glMappings",
    icon: <BankOutlined />,
  },
  {
    key: "tax",
    labelKey: "accounting.settings.taxVat",
    icon: <PercentageOutlined />,
  },
];

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const COA_FIELDS: { key: keyof AccountingConfig; i18nKey: string }[] = [
  { key: "coaCash", i18nKey: "accounting.settings.coaCash" },
  { key: "coaSalesRevenue", i18nKey: "accounting.settings.coaSalesRevenue" },
  { key: "coaCogs", i18nKey: "accounting.settings.coaCogs" },
  { key: "coaVatPayable", i18nKey: "accounting.settings.coaVatPayable" },
  {
    key: "coaAccountsReceivable",
    i18nKey: "accounting.settings.coaAccountsReceivable",
  },
  {
    key: "coaAccountsPayable",
    i18nKey: "accounting.settings.coaAccountsPayable",
  },
  {
    key: "coaSalariesPayable",
    i18nKey: "accounting.settings.coaSalariesPayable",
  },
  { key: "coaGosiPayable", i18nKey: "accounting.settings.coaGosiPayable" },
  {
    key: "coaSalariesExpense",
    i18nKey: "accounting.settings.coaSalariesExpense",
  },
  { key: "coaGosiExpense", i18nKey: "accounting.settings.coaGosiExpense" },
  { key: "coaInventory", i18nKey: "accounting.settings.coaInventory" },
  {
    key: "coaInventoryAdjustment",
    i18nKey: "accounting.settings.coaInventoryAdjustment",
  },
  { key: "coaFxGainLoss", i18nKey: "accounting.settings.coaFxGainLoss" },
  {
    key: "coaLoyaltyLiability",
    i18nKey: "accounting.settings.coaLoyaltyLiability",
  },
  {
    key: "coaGiftCardLiability",
    i18nKey: "accounting.settings.coaGiftCardLiability",
  },
];

// ─── Section wrapper ────────────────────────────────────────────────────────
function Section({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  const { token } = antTheme.useToken();
  return (
    <div
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      {title && (
        <div
          style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Text strong style={{ fontSize: 13 }}>
            {title}
          </Text>
          {description && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {description}
              </Text>
            </>
          )}
        </div>
      )}
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

// ─── Tab: General (fiscal year + timezone + salary + currency + stock) ───────
function GeneralTab({ lang }: { lang: string }) {
  return (
    <>
      <Section
        title={t("accounting.settings.generalConfig", lang)}
        description={t("accounting.settings.generalConfigDesc", lang)}
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="fiscalYearStartMonth"
              label={t("accounting.settings.fiscalYearStart", lang)}
              style={{ marginBottom: 16 }}
            >
              <Select
                options={MONTHS}
                placeholder={t("accounting.settings.selectMonth", lang)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="timezone"
              label={t("accounting.settings.timezone", lang)}
              style={{ marginBottom: 16 }}
            >
              <Select
                showSearch
                placeholder={t("accounting.settings.selectTimezone", lang)}
                options={[
                  { value: "Asia/Riyadh", label: "Asia/Riyadh (AST UTC+3)" },
                  { value: "Asia/Dubai", label: "Asia/Dubai (GST UTC+4)" },
                  { value: "Africa/Cairo", label: "Africa/Cairo (EET UTC+2)" },
                  {
                    value: "Europe/London",
                    label: "Europe/London (GMT UTC+0)",
                  },
                  {
                    value: "America/New_York",
                    label: "America/New_York (EST UTC-5)",
                  },
                ]}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="defaultCurrency"
              label={t("accounting.settings.defaultCurrency", lang)}
              style={{ marginBottom: 16 }}
            >
              <Select
                options={[
                  { value: "SAR", label: "SAR — Saudi Riyal" },
                  { value: "USD", label: "USD — US Dollar" },
                  { value: "EUR", label: "EUR — Euro" },
                  { value: "GBP", label: "GBP — British Pound" },
                  { value: "AED", label: "AED — UAE Dirham" },
                  { value: "EGP", label: "EGP — Egyptian Pound" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="salaryCalculationBasis"
              label={t("accounting.settings.salaryBasis", lang)}
              style={{ marginBottom: 16 }}
            >
              <Select
                options={[
                  {
                    value: "actual_days",
                    label: t("accounting.settings.actualDays", lang),
                  },
                  {
                    value: "fixed_30",
                    label: t("accounting.settings.fixed30Days", lang),
                  },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="allowNegativeStock"
              label={t("accounting.settings.allowNegativeStock", lang)}
              valuePropName="checked"
              style={{ marginBottom: 16 }}
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Alert
          type="info"
          showIcon
          title={t("accounting.settings.fiscalPeriodsNote", lang)}
          style={{ marginTop: 4 }}
        />
      </Section>
    </>
  );
}

// ─── Tab: GL Account Mappings + Default Journals ────────────────────────────
function GlMappingsTab({
  lang,
  accountOptions,
  accountsLoading,
  journalOptions,
  journalsLoading,
}: {
  lang: string;
  accountOptions: { value: string; label: string }[];
  accountsLoading: boolean;
  journalOptions: { value: string; label: string }[];
  journalsLoading: boolean;
}) {
  return (
    <>
      <Section
        title={t("accounting.settings.glMappings", lang)}
        description={t("accounting.settings.glMappingsDesc", lang)}
      >
        <Row gutter={[16, 0]}>
          {COA_FIELDS.map(({ key, i18nKey }) => (
            <Col xs={24} sm={12} key={key}>
              <Form.Item
                name={key}
                label={t(i18nKey, lang)}
                style={{ marginBottom: 16 }}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder={t("accounting.settings.selectAccount", lang)}
                  options={accountOptions}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  loading={accountsLoading}
                />
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Section>

      <Section
        title={t("accounting.settings.defaultJournals", lang)}
        description={t("accounting.settings.defaultJournalsDesc", lang)}
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="defaultSalesJournalId"
              label={t("accounting.settings.defaultSalesJournal", lang)}
              style={{ marginBottom: 16 }}
            >
              <Select
                showSearch
                allowClear
                placeholder={t("accounting.settings.selectJournal", lang)}
                options={journalOptions}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                loading={journalsLoading}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="defaultPurchaseJournalId"
              label={t("accounting.settings.defaultPurchaseJournal", lang)}
              style={{ marginBottom: 16 }}
            >
              <Select
                showSearch
                allowClear
                placeholder={t("accounting.settings.selectJournal", lang)}
                options={journalOptions}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                loading={journalsLoading}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="defaultCashJournalId"
              label={t("accounting.settings.defaultCashJournal", lang)}
              style={{ marginBottom: 16 }}
            >
              <Select
                showSearch
                allowClear
                placeholder={t("accounting.settings.selectJournal", lang)}
                options={journalOptions}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                loading={journalsLoading}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="defaultBankJournalId"
              label={t("accounting.settings.defaultBankJournal", lang)}
              style={{ marginBottom: 16 }}
            >
              <Select
                showSearch
                allowClear
                placeholder={t("accounting.settings.selectJournal", lang)}
                options={journalOptions}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                loading={journalsLoading}
              />
            </Form.Item>
          </Col>
        </Row>
      </Section>
    </>
  );
}

// ─── Tab: Tax / VAT ─────────────────────────────────────────────────────────
function TaxTab({
  lang,
  accountOptions,
  accountsLoading,
}: {
  lang: string;
  accountOptions: { value: string; label: string }[];
  accountsLoading: boolean;
}) {
  return (
    <Section
      title={t("accounting.settings.taxVatConfig", lang)}
      description={t("accounting.settings.taxVatConfigDesc", lang)}
    >
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="vatRate"
            label={t("accounting.settings.vatRate", lang)}
            style={{ marginBottom: 16 }}
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: "100%" }}
              addonAfter="%"
              placeholder="15"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="coaVatPayable"
            label={t("accounting.settings.vatPayableAccount", lang)}
            style={{ marginBottom: 16 }}
          >
            <Select
              showSearch
              allowClear
              placeholder={t("accounting.settings.selectAccount", lang)}
              options={accountOptions}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              loading={accountsLoading}
            />
          </Form.Item>
        </Col>
      </Row>
      <Divider style={{ margin: "8px 0 16px" }} />
      <Alert
        type="info"
        showIcon
        title={t("accounting.settings.taxSetupNote", lang)}
        style={{ marginTop: 0 }}
      />
    </Section>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AccountingSettings() {
  const params = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { token } = antTheme.useToken();
  const lang = useLangStore(s => s.lang);
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const activeTab = params.tab ?? "general";
  const activeLabel =
    TABS.find(tb => tb.key === activeTab)?.labelKey ??
    "accounting.settings.title";

  // ─── Fetch config ───────────────────────────────────────────────────────
  const { data: configRes, isLoading: configLoading } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTING_CONFIG],
    queryFn: () => accountingConfigService.get(),
  });

  const { data: accountsRes, isLoading: accountsLoading } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS_LIST_AS, "accounting-settings-dropdown"],
    queryFn: () => accountsService.list({ limit: 100 }),
  });

  const { data: journalsRes, isLoading: journalsLoading } = useQuery({
    queryKey: [QUERY_KEYS.JOURNALS, "accounting-settings-dropdown"],
    queryFn: () => journalsService.list({ limit: 100 }),
  });

  const accounts: Account[] = useMemo(() => {
    return accountsRes?.data ?? [];
  }, [accountsRes]);

  const accountOptions = useMemo(
    () =>
      accounts.map(a => ({
        value: a.id,
        label: `${a.code} - ${getName(a)}`,
      })),
    [accounts]
  );

  const journalOptions = useMemo(() => {
    const list = (journalsRes?.data ?? []) as {
      id: string;
      nameEn?: string;
      nameAr?: string;
      code?: string;
    }[];
    return list.map(j => ({
      value: j.id,
      label: j.code ? `${j.code} - ${getName(j)}` : (getName(j) ?? j.id),
    }));
  }, [journalsRes]);

  useEffect(() => {
    if (configRes) {
      const config = (configRes as Record<string, unknown>)?.data
        ? ((configRes as Record<string, unknown>).data as AccountingConfig)
        : (configRes as AccountingConfig);
      form.setFieldsValue(config);
    }
  }, [configRes, form]);

  // ─── Save ──────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (dto: Partial<AccountingConfig>) =>
      accountingConfigService.update(dto),
    onSuccess: () => {
      message.success(t("accounting.settings.saved", lang));
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ACCOUNTING_CONFIG],
      });
    },
    onError: () => {
      message.error(t("accounting.settings.saveFailed", lang));
    },
    onSettled: () => setSaving(false),
  });

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      updateMutation.mutate(values);
    } catch {
      // validation failed
    }
  };

  const isLoading = configLoading || accountsLoading;

  // ─── Tab content map ───────────────────────────────────────────────────
  const tabContent: Record<string, React.ReactNode> = {
    general: <GeneralTab lang={lang} />,
    "gl-mappings": (
      <GlMappingsTab
        lang={lang}
        accountOptions={accountOptions}
        accountsLoading={accountsLoading}
        journalOptions={journalOptions}
        journalsLoading={journalsLoading}
      />
    ),
    tax: (
      <TaxTab
        lang={lang}
        accountOptions={accountOptions}
        accountsLoading={accountsLoading}
      />
    ),
  };

  return (
    <DashboardLayout
      currentPage={t("accounting.settings.title", lang)}
      breadcrumbs={[
        { label: t("common.dashboard", lang), href: "/" },
        {
          label: t("sidebar.accounting", lang),
          href: "/accounting/chart-of-accounts",
        },
        { label: t("accounting.settings.title", lang) },
      ]}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              flexShrink: 0,
              background: `linear-gradient(135deg, ${token.colorPrimary}dd, ${token.colorPrimary}88)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AccountBookOutlined style={{ fontSize: 20, color: "#fff" }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              {t("accounting.settings.title", lang)}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t("accounting.settings.subtitle", lang)}
            </Text>
          </div>
        </div>

        {/* ─── Two-card layout ─────────────────────────────────────────────── */}
        <Spin spinning={isLoading}>
          <Form form={form} layout="vertical">
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              {/* Nav card */}
              <Card
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadiusLG,
                  width: 220,
                  flexShrink: 0,
                }}
                styles={{ body: { padding: "8px 0" } }}
              >
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => navigate(`/accounting/settings/${tab.key}`)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 16px",
                      background:
                        activeTab === tab.key
                          ? token.colorPrimaryBg
                          : "transparent",
                      color:
                        activeTab === tab.key
                          ? token.colorPrimary
                          : token.colorText,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: activeTab === tab.key ? 600 : 400,
                      transition: "background 0.15s, color 0.15s",
                      textAlign: "start",
                    }}
                    onMouseEnter={e => {
                      if (activeTab !== tab.key)
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = token.colorFillAlter;
                    }}
                    onMouseLeave={e => {
                      if (activeTab !== tab.key)
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "transparent";
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        opacity: activeTab === tab.key ? 1 : 0.55,
                      }}
                    >
                      {tab.icon}
                    </span>
                    <span style={{ flex: 1 }}>{t(tab.labelKey, lang)}</span>
                  </button>
                ))}
              </Card>

              {/* Content card */}
              <Card
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadiusLG,
                  flex: 1,
                  minWidth: 0,
                }}
                styles={{ body: { padding: 24 } }}
                title={
                  <Space>
                    {TABS.find(tb => tb.key === activeTab)?.icon}
                    <Text strong>{t(activeLabel, lang)}</Text>
                  </Space>
                }
                extra={
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={saving}
                    size="small"
                  >
                    {t("accounting.settings.save", lang)}
                  </Button>
                }
              >
                {tabContent[activeTab] ?? (
                  <Alert type="info" title="Select a tab to configure" />
                )}
              </Card>
            </div>
          </Form>
        </Spin>
      </div>
    </DashboardLayout>
  );
}

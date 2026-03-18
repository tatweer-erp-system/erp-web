import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  Row,
  Select,
  Spin,
  Typography,
  message,
  theme as antTheme,
} from "antd";
import { SaveOutlined, SettingOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  accountingConfigService,
  accountsService,
} from "@/services/accounting.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { t } from "@/i18n";
import { useLangStore } from "@/stores/lang.store";
import { getName } from "@/lib/utils";
import type { AccountingConfig, Account } from "@/types/modules/accounting";

const { Title, Text } = Typography;

const MONTHS = [
  { value: 1, labelKey: "January" },
  { value: 2, labelKey: "February" },
  { value: 3, labelKey: "March" },
  { value: 4, labelKey: "April" },
  { value: 5, labelKey: "May" },
  { value: 6, labelKey: "June" },
  { value: 7, labelKey: "July" },
  { value: 8, labelKey: "August" },
  { value: 9, labelKey: "September" },
  { value: 10, labelKey: "October" },
  { value: 11, labelKey: "November" },
  { value: 12, labelKey: "December" },
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

export default function AccountingSettings() {
  const { token } = antTheme.useToken();
  const lang = useLangStore(s => s.lang);
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // ─── Fetch current config ──────────────────────────────────────────────────
  const { data: configRes, isLoading: configLoading } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTING_CONFIG],
    queryFn: () => accountingConfigService.get(),
  });

  // ─── Fetch accounts for COA dropdowns ──────────────────────────────────────
  const { data: accountsRes, isLoading: accountsLoading } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS_LIST_AS, "accounting-settings-dropdown"],
    queryFn: () => accountsService.list({ limit: 500 }),
  });

  const accounts: Account[] = useMemo(() => {
    if (!accountsRes) return [];
    // Handle both paginated and direct array responses
    const raw = (accountsRes as Record<string, unknown>)?.data;
    if (Array.isArray(raw)) return raw as Account[];
    if (Array.isArray(accountsRes)) return accountsRes as Account[];
    return [];
  }, [accountsRes]);

  const accountOptions = useMemo(
    () =>
      accounts.map(a => ({
        value: a.id,
        label: `${a.code} - ${getName(a)}`,
      })),
    [accounts]
  );

  // ─── Populate form when config loads ───────────────────────────────────────
  useEffect(() => {
    if (configRes) {
      const config = (configRes as Record<string, unknown>)?.data
        ? ((configRes as Record<string, unknown>).data as AccountingConfig)
        : (configRes as AccountingConfig);
      form.setFieldsValue(config);
    }
  }, [configRes, form]);

  // ─── Save mutation ─────────────────────────────────────────────────────────
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
      message.error("Failed to save settings");
    },
    onSettled: () => setSaving(false),
  });

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      updateMutation.mutate(values);
    } catch {
      // validation failed — form will show field errors
    }
  };

  const isLoading = configLoading || accountsLoading;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
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
          <SettingOutlined style={{ fontSize: 20, color: "#fff" }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            {t("accounting.settings.title", lang)}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t("accounting.settings.general", lang)} &{" "}
            {t("accounting.settings.glMappings", lang)}
          </Text>
        </div>
      </div>

      {/* ─── Content ────────────────────────────────────────────────────────── */}
      <Spin spinning={isLoading}>
        <Card
          style={{
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadiusLG,
          }}
          styles={{ body: { padding: 24 } }}
        >
          <Form form={form} layout="vertical">
            {/* Section 1: General Settings */}
            <Section title={t("accounting.settings.general", lang)}>
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="fiscalYearStartMonth"
                    label={t("accounting.settings.fiscalYearStart", lang)}
                    style={{ marginBottom: 16 }}
                  >
                    <Select
                      options={MONTHS.map(m => ({
                        value: m.value,
                        label: m.labelKey,
                      }))}
                      placeholder={t("accounting.settings.selectAccount", lang)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
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
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="defaultCurrency"
                    label={t("accounting.settings.defaultCurrency", lang)}
                    style={{ marginBottom: 16 }}
                  >
                    <Select
                      options={[
                        { value: "SAR", label: "SAR" },
                        { value: "USD", label: "USD" },
                        { value: "EUR", label: "EUR" },
                        { value: "GBP", label: "GBP" },
                        { value: "AED", label: "AED" },
                        { value: "EGP", label: "EGP" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Section>

            {/* Section 2: GL Account Mappings */}
            <Section title={t("accounting.settings.glMappings", lang)}>
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
                        placeholder={t(
                          "accounting.settings.selectAccount",
                          lang
                        )}
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

            {/* Save button */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saving}
              >
                {t("accounting.settings.save", lang)}
              </Button>
            </div>
          </Form>
        </Card>
      </Spin>
    </div>
  );
}

import { useRef, useState } from "react";
import {
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
  Tag,
  Tooltip,
  Typography,
  theme as antTheme,
} from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { generalSettingsService } from "@/services/settings.service";
import type { GeneralSettings } from "@/services/settings.service";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";

const { Text } = Typography;

// ─── Section wrapper (same pattern as CompanyProfile) ────────────────────────
function Section({
  title,
  titleExtra,
  description,
  children,
}: {
  title?: string;
  titleExtra?: React.ReactNode;
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
          {titleExtra ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text strong style={{ fontSize: 13 }}>
                {title}
              </Text>
              {titleExtra}
            </div>
          ) : (
            <Text strong style={{ fontSize: 13 }}>
              {title}
            </Text>
          )}
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

// ─── Main component ──────────────────────────────────────────────────────────
export default function GeneralTab() {
  const { token } = antTheme.useToken();
  const lang = useLangStore(s => s.lang);
  const queryClient = useQueryClient();

  const [savedField, setSavedField] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // ─── Data fetching ───────────────────────────────────────────────────────
  const { data: settings } = useQuery<GeneralSettings>({
    queryKey: [QUERY_KEYS.GENERAL_SETTINGS],
    queryFn: generalSettingsService.get,
    staleTime: 5 * 60 * 1000,
  });

  // ─── Mutation ────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (dto: Partial<GeneralSettings>) =>
      generalSettingsService.update(dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GENERAL_SETTINGS],
      });
      const fieldName = Object.keys(variables)[0];
      setSavedField(fieldName);
      setTimeout(() => setSavedField(null), 2000);
    },
  });

  // ─── Debounced change handler ────────────────────────────────────────────
  const handleFieldChange = (field: string, value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      mutation.mutate({ [field]: value });
    }, 500);
  };

  // ─── Saved indicator ────────────────────────────────────────────────────
  const SavedIcon = ({ field }: { field: string }) =>
    savedField === field ? (
      <CheckCircleOutlined
        style={{ color: token.colorSuccess, fontSize: 14 }}
      />
    ) : null;

  // ─── Coming Soon badge ──────────────────────────────────────────────────
  const comingSoonBadge = (
    <Tag
      color="blue"
      style={{ fontSize: 11, lineHeight: "18px", padding: "0 6px" }}
    >
      {t("mySettings.comingSoon", lang)}
    </Tag>
  );

  return (
    <>
      {/* ── Section 1: Regional & Locale (active) ─────────────────────── */}
      <Section
        title={t("mySettings.general.regional", lang)}
        description={t("mySettings.general.regionalDesc", lang)}
      >
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            {/* System Language */}
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>
                    {t("mySettings.general.language", lang)}{" "}
                    <SavedIcon field="language" />
                  </span>
                }
                style={{ marginBottom: 16 }}
              >
                <Select
                  value={settings?.language}
                  onChange={value => handleFieldChange("language", value)}
                  options={[
                    { value: "en", label: "English" },
                    {
                      value: "ar",
                      label: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
                    },
                  ]}
                />
              </Form.Item>
            </Col>

            {/* Timezone */}
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>
                    {t("mySettings.general.timezone", lang)}{" "}
                    <SavedIcon field="timezone" />
                  </span>
                }
                style={{ marginBottom: 16 }}
              >
                <Select
                  value={settings?.timezone}
                  onChange={value => handleFieldChange("timezone", value)}
                  options={[
                    {
                      value: "UTC+3",
                      label: "UTC+3 Arabia Standard Time",
                    },
                    { value: "UTC+0", label: "UTC+0 GMT" },
                    { value: "UTC-5", label: "UTC-5 Eastern" },
                    { value: "UTC+1", label: "UTC+1 CET" },
                    { value: "UTC+4", label: "UTC+4 Dubai" },
                    { value: "UTC+8", label: "UTC+8 CST" },
                  ]}
                />
              </Form.Item>
            </Col>

            {/* Date Format */}
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>
                    {t("mySettings.general.dateFormat", lang)}{" "}
                    <SavedIcon field="dateFormat" />
                  </span>
                }
                style={{ marginBottom: 16 }}
              >
                <Select
                  value={settings?.dateFormat}
                  onChange={value => handleFieldChange("dateFormat", value)}
                  options={[
                    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                  ]}
                />
              </Form.Item>
            </Col>

            {/* Currency */}
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>
                    {t("mySettings.general.currency", lang)}{" "}
                    <SavedIcon field="currency" />
                  </span>
                }
                style={{ marginBottom: 16 }}
              >
                <Select
                  value={settings?.currency}
                  onChange={value => handleFieldChange("currency", value)}
                  options={[
                    { value: "SAR", label: "SAR" },
                    { value: "USD", label: "USD" },
                    { value: "EUR", label: "EUR" },
                    { value: "GBP", label: "GBP" },
                    { value: "AED", label: "AED" },
                  ]}
                />
              </Form.Item>
            </Col>

            {/* Financial Year */}
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>
                    {t("mySettings.general.financialYear", lang)}{" "}
                    <SavedIcon field="financialYear" />
                  </span>
                }
                style={{ marginBottom: 16 }}
              >
                <Select
                  value={settings?.financialYear}
                  onChange={value => handleFieldChange("financialYear", value)}
                  options={[
                    { value: "january", label: "January" },
                    { value: "april", label: "April" },
                    { value: "july", label: "July" },
                    { value: "october", label: "October" },
                  ]}
                />
              </Form.Item>
            </Col>

            {/* Number Format */}
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>
                    {t("mySettings.general.numberFormat", lang)}{" "}
                    <SavedIcon field="numberFormat" />
                  </span>
                }
                style={{ marginBottom: 16 }}
              >
                <Select
                  value={settings?.numberFormat}
                  onChange={value => handleFieldChange("numberFormat", value)}
                  options={[
                    { value: "1,234.56", label: "1,234.56" },
                    { value: "1.234,56", label: "1.234,56" },
                    { value: "1 234.56", label: "1 234.56" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>

      {/* ── Section 2: Data & Backup (Coming Soon) ────────────────────── */}
      <Section
        title={t("mySettings.general.dataBackup", lang)}
        titleExtra={comingSoonBadge}
        description={t("mySettings.general.dataBackupDesc", lang)}
      >
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            {/* Auto Backup */}
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.general.autoBackup", lang)}
                style={{ marginBottom: 16 }}
              >
                <Tooltip title={t("mySettings.comingSoon.tooltip", lang)}>
                  <Switch disabled />
                </Tooltip>
              </Form.Item>
            </Col>

            {/* Backup Frequency */}
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.general.backupFrequency", lang)}
                style={{ marginBottom: 16 }}
              >
                <Tooltip title={t("mySettings.comingSoon.tooltip", lang)}>
                  <Select
                    disabled
                    placeholder={t("mySettings.general.backupDaily", lang)}
                    options={[
                      {
                        value: "daily",
                        label: t("mySettings.general.backupDaily", lang),
                      },
                      {
                        value: "weekly",
                        label: t("mySettings.general.backupWeekly", lang),
                      },
                      {
                        value: "monthly",
                        label: t("mySettings.general.backupMonthly", lang),
                      },
                    ]}
                  />
                </Tooltip>
              </Form.Item>
            </Col>

            {/* Retention Period */}
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.general.retentionPeriod", lang)}
                style={{ marginBottom: 16 }}
              >
                <Tooltip title={t("mySettings.comingSoon.tooltip", lang)}>
                  <Select
                    disabled
                    placeholder={t("mySettings.general.retention30", lang)}
                    options={[
                      {
                        value: "30",
                        label: t("mySettings.general.retention30", lang),
                      },
                      {
                        value: "60",
                        label: t("mySettings.general.retention60", lang),
                      },
                      {
                        value: "90",
                        label: t("mySettings.general.retention90", lang),
                      },
                      {
                        value: "365",
                        label: t("mySettings.general.retention365", lang),
                      },
                    ]}
                  />
                </Tooltip>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>

      {/* ── Section 3: POS Configuration (Coming Soon) ────────────────── */}
      <Section
        title={t("mySettings.general.posConfig", lang)}
        titleExtra={comingSoonBadge}
        description={t("mySettings.general.posConfigDesc", lang)}
      >
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            {/* Default Tax Rate */}
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.general.defaultTaxRate", lang)}
                style={{ marginBottom: 16 }}
              >
                <Tooltip title={t("mySettings.comingSoon.tooltip", lang)}>
                  <Input disabled placeholder="15" suffix="%" />
                </Tooltip>
              </Form.Item>
            </Col>

            {/* Allow Negative Stock */}
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.general.allowNegativeStock", lang)}
                style={{ marginBottom: 16 }}
              >
                <Tooltip title={t("mySettings.comingSoon.tooltip", lang)}>
                  <Switch disabled />
                </Tooltip>
              </Form.Item>
            </Col>

            {/* Max Held Orders */}
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.general.maxHeldOrders", lang)}
                style={{ marginBottom: 16 }}
              >
                <Tooltip title={t("mySettings.comingSoon.tooltip", lang)}>
                  <InputNumber
                    disabled
                    placeholder="10"
                    style={{ width: "100%" }}
                  />
                </Tooltip>
              </Form.Item>
            </Col>

            {/* Loyalty Enabled */}
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.general.loyaltyEnabled", lang)}
                style={{ marginBottom: 16 }}
              >
                <Tooltip title={t("mySettings.comingSoon.tooltip", lang)}>
                  <Switch disabled />
                </Tooltip>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
    </>
  );
}

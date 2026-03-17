import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Row,
  Col,
  Tag,
  Tooltip,
  Typography,
  theme as antTheme,
} from "antd";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";

const { Text } = Typography;

// ─── Section wrapper (same pattern as all other tabs) ────────────────────────
function Section({
  title,
  description,
  badge,
  children,
}: {
  title?: string;
  description?: string;
  badge?: React.ReactNode;
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
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Text strong style={{ fontSize: 13 }}>
            {title}
          </Text>
          {badge}
          {description && (
            <Text type="secondary" style={{ fontSize: 12, marginLeft: "auto" }}>
              {description}
            </Text>
          )}
        </div>
      )}
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

// ─── Coming Soon badge ───────────────────────────────────────────────────────
function ComingSoonBadge({ lang }: { lang: string }) {
  return (
    <Tag
      color="blue"
      style={{ fontSize: 11, lineHeight: "18px", padding: "0 6px" }}
    >
      {t("mySettings.comingSoon", lang)}
    </Tag>
  );
}

// ─── Integration card data ───────────────────────────────────────────────────
const INTEGRATIONS = [
  {
    nameKey: "mySettings.integrations.slack",
    descKey: "mySettings.integrations.slackDesc",
  },
  {
    nameKey: "mySettings.integrations.google",
    descKey: "mySettings.integrations.googleDesc",
  },
  {
    nameKey: "mySettings.integrations.zapier",
    descKey: "mySettings.integrations.zapierDesc",
  },
] as const;

// ─── IntegrationsTab ─────────────────────────────────────────────────────────
export function IntegrationsTab() {
  const { token } = antTheme.useToken();
  const { lang: language } = useLangStore();
  const lang = language;

  return (
    <>
      <Section
        title={t("mySettings.integrations.title", lang)}
        badge={<ComingSoonBadge lang={lang} />}
        description={t("mySettings.integrations.subtitle", lang)}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {INTEGRATIONS.map(integration => (
            <div
              key={integration.nameKey}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "14px 16px",
                borderRadius: token.borderRadiusLG,
                border: `1px solid ${token.colorBorderSecondary}`,
                background: token.colorFillAlter,
                opacity: 0.7,
              }}
            >
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 13 }}>
                  {t(integration.nameKey, lang)}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t(integration.descKey, lang)}
                </Text>
              </div>
              <Tooltip title={t("mySettings.comingSoon.tooltip", lang)}>
                <Tag color="default">
                  {t("mySettings.integrations.notConnected", lang)}
                </Tag>
              </Tooltip>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

// ─── LoyaltyTab ──────────────────────────────────────────────────────────────
export function LoyaltyTab() {
  const { lang: language } = useLangStore();
  const lang = language;

  return (
    <>
      <Section
        title={t("mySettings.loyalty.title", lang)}
        badge={<ComingSoonBadge lang={lang} />}
        description={t("mySettings.loyalty.subtitle", lang)}
      >
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.loyalty.programName", lang)}
                style={{ marginBottom: 16 }}
              >
                <Tooltip title={t("mySettings.comingSoon.tooltip", lang)}>
                  <Input
                    disabled
                    placeholder={t("mySettings.loyalty.programName", lang)}
                  />
                </Tooltip>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.loyalty.pointsPerUnit", lang)}
                style={{ marginBottom: 16 }}
              >
                <Tooltip title={t("mySettings.comingSoon.tooltip", lang)}>
                  <InputNumber
                    disabled
                    placeholder="1"
                    style={{ width: "100%" }}
                  />
                </Tooltip>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.loyalty.redemptionRate", lang)}
                style={{ marginBottom: 16 }}
              >
                <Tooltip title={t("mySettings.comingSoon.tooltip", lang)}>
                  <InputNumber
                    disabled
                    placeholder="0.01"
                    style={{ width: "100%" }}
                  />
                </Tooltip>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.loyalty.expiryDays", lang)}
                style={{ marginBottom: 16 }}
              >
                <Tooltip title={t("mySettings.comingSoon.tooltip", lang)}>
                  <InputNumber
                    disabled
                    placeholder="365"
                    style={{ width: "100%" }}
                  />
                </Tooltip>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.loyalty.enabled", lang)}
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

// ─── VouchersTab ─────────────────────────────────────────────────────────────
export function VouchersTab() {
  const { lang: language } = useLangStore();
  const lang = language;

  return (
    <>
      <Section
        title={t("mySettings.vouchers.voucherTypes", lang)}
        badge={<ComingSoonBadge lang={lang} />}
        description={t("mySettings.vouchers.subtitle", lang)}
      >
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.vouchers.voucherTypes", lang)}
                style={{ marginBottom: 16 }}
              >
                <Tooltip title={t("mySettings.comingSoon.tooltip", lang)}>
                  <Select
                    disabled
                    placeholder={t("mySettings.vouchers.voucherTypes", lang)}
                    options={[
                      {
                        value: "percentage",
                        label: t("mySettings.vouchers.percentage", lang),
                      },
                      {
                        value: "fixed",
                        label: t("mySettings.vouchers.fixedAmount", lang),
                      },
                    ]}
                  />
                </Tooltip>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>

      <Section
        title={t("mySettings.vouchers.giftCardSettings", lang)}
        badge={<ComingSoonBadge lang={lang} />}
      >
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.vouchers.minimumValue", lang)}
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
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.vouchers.maximumValue", lang)}
                style={{ marginBottom: 16 }}
              >
                <Tooltip title={t("mySettings.comingSoon.tooltip", lang)}>
                  <InputNumber
                    disabled
                    placeholder="5000"
                    style={{ width: "100%" }}
                  />
                </Tooltip>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.vouchers.expiryMonths", lang)}
                style={{ marginBottom: 16 }}
              >
                <Tooltip title={t("mySettings.comingSoon.tooltip", lang)}>
                  <InputNumber
                    disabled
                    placeholder="12"
                    style={{ width: "100%" }}
                  />
                </Tooltip>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
    </>
  );
}

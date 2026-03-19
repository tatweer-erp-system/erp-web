import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { securityService } from "@/services/settings.service";
import type { ChangePasswordDto, Session } from "@/services/settings.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Alert,
  Modal,
  Tag,
  Typography,
  notification,
  theme as antTheme,
} from "antd";
import {
  SaveOutlined,
  SafetyOutlined,
  DesktopOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// ─── Time ago helper ──────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// ─── Section wrapper (matches ProfileTab pattern) ─────────────────────────────
function Section({
  title,
  description,
  children,
}: {
  title?: React.ReactNode;
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

// ─── SecurityTab ──────────────────────────────────────────────────────────────
export default function SecurityTab() {
  const { token } = antTheme.useToken();
  const lang = useLangStore(s => s.lang);
  const queryClient = useQueryClient();
  const [passwordForm] = Form.useForm();

  // 2FA state
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [setup2faModalOpen, setSetup2faModalOpen] = useState(false);
  const [disable2faModalOpen, setDisable2faModalOpen] = useState(false);
  const [qrCodeUri, setQrCodeUri] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");

  // ── Change Password mutation ─────────────────────────────────────────────
  const changePasswordMutation = useMutation({
    mutationFn: (dto: ChangePasswordDto) => securityService.changePassword(dto),
    onSuccess: () => {
      notification.success({
        message: t("mySettings.security.passwordUpdated", lang),
      });
      passwordForm.resetFields();
    },
    onError: () => {
      notification.error({
        message: t("mySettings.security.updatePasswordError", lang),
      });
    },
  });

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields();
      changePasswordMutation.mutate({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
    } catch {
      // validation errors shown by form
    }
  };

  // ── 2FA Setup mutation ───────────────────────────────────────────────────
  const setup2faMutation = useMutation({
    mutationFn: () => securityService.get2faSetup(),
    onSuccess: data => {
      setQrCodeUri(data.qrCodeUri);
      setSetup2faModalOpen(true);
    },
    onError: () => {
      notification.error({
        message: t("mySettings.security.twoFactorError", lang),
      });
    },
  });

  const verify2faMutation = useMutation({
    mutationFn: (code: string) => securityService.verify2fa(code),
    onSuccess: () => {
      setIs2faEnabled(true);
      setSetup2faModalOpen(false);
      setTotpCode("");
      notification.success({
        message: t("mySettings.security.twoFactorEnableSuccess", lang),
      });
    },
    onError: () => {
      notification.error({
        message: t("mySettings.security.twoFactorError", lang),
      });
    },
  });

  const disable2faMutation = useMutation({
    mutationFn: (password: string) => securityService.disable2fa(password),
    onSuccess: () => {
      setIs2faEnabled(false);
      setDisable2faModalOpen(false);
      setDisablePassword("");
      notification.success({
        message: t("mySettings.security.twoFactorDisableSuccess", lang),
      });
    },
    onError: () => {
      notification.error({
        message: t("mySettings.security.twoFactorError", lang),
      });
    },
  });

  // ── Sessions ─────────────────────────────────────────────────────────────
  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: [QUERY_KEYS.SESSIONS],
    queryFn: securityService.getSessions,
    staleTime: 30 * 1000,
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (id: string) => securityService.revokeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SESSIONS] });
      notification.success({
        message: t("mySettings.security.sessionRevoked", lang),
      });
    },
    onError: () => {
      notification.error({
        message: t("mySettings.security.revokeError", lang),
      });
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: () => securityService.revokeAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SESSIONS] });
      notification.success({
        message: t("mySettings.security.allSessionsRevoked", lang),
      });
    },
    onError: () => {
      notification.error({
        message: t("mySettings.security.revokeAllError", lang),
      });
    },
  });

  const handleRevoke = (id: string) => {
    revokeSessionMutation.mutate(id);
  };

  return (
    <>
      {/* ── Section 1: Change Password ──────────────────────────────────────── */}
      <Section
        title={t("mySettings.security.changePassword", lang)}
        description={t("mySettings.security.changePasswordDesc", lang)}
      >
        <Form form={passwordForm} layout="vertical" style={{ maxWidth: 480 }}>
          <Form.Item
            label={t("mySettings.security.currentPassword", lang)}
            name="currentPassword"
            rules={[{ required: true }]}
            style={{ marginBottom: 16 }}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label={t("mySettings.security.newPassword", lang)}
            name="newPassword"
            rules={[{ required: true }, { min: 8 }]}
            style={{ marginBottom: 16 }}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label={t("mySettings.security.confirmPassword", lang)}
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t("mySettings.security.passwordMismatch", lang))
                  );
                },
              }),
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input.Password />
          </Form.Item>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={changePasswordMutation.isPending}
            onClick={handlePasswordSubmit}
          >
            {t("mySettings.security.updatePassword", lang)}
          </Button>
        </Form>
      </Section>

      {/* ── Section 2: Two-Factor Authentication ────────────────────────────── */}
      <Section
        title={
          <>
            {t("mySettings.security.twoFactor", lang)}
            <Tag
              color="blue"
              style={{
                fontSize: 9,
                lineHeight: "16px",
                padding: "0 4px",
                marginInlineStart: 8,
                borderRadius: 4,
                verticalAlign: "middle",
              }}
            >
              Soon
            </Tag>
          </>
        }
        description={t("mySettings.security.twoFactorDesc", lang)}
      >
        {is2faEnabled ? (
          <Alert
            type="success"
            showIcon
            title={t("mySettings.security.twoFactorEnabled", lang)}
            description={t("mySettings.security.twoFactorEnabledDesc", lang)}
            style={{ marginBottom: 16 }}
          />
        ) : (
          <Alert
            type="warning"
            showIcon
            title={t("mySettings.security.twoFactorNotEnabled", lang)}
            description={t("mySettings.security.twoFactorNotEnabledDesc", lang)}
            style={{ marginBottom: 16 }}
          />
        )}

        {is2faEnabled ? (
          <Button danger disabled>
            {t("mySettings.security.disable2fa", lang)}
          </Button>
        ) : (
          <Button type="primary" icon={<SafetyOutlined />} disabled>
            {t("mySettings.security.enable2fa", lang)}
          </Button>
        )}
      </Section>

      {/* ── Section 3: Active Sessions ──────────────────────────────────────── */}
      <Section
        title={t("mySettings.security.activeSessions", lang)}
        description={t("mySettings.security.activeSessionsDesc", lang)}
      >
        {sessions.map(session => (
          <div
            key={session.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: token.colorFillAlter,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DesktopOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 13, fontWeight: 500 }}>
                  {session.device} · {session.browser}
                </Text>
                {session.isCurrent && (
                  <Tag color="green" style={{ marginInlineStart: 8, fontSize: 11 }}>
                    {t("mySettings.security.thisDevice", lang)}
                  </Tag>
                )}
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {session.ip} · {timeAgo(session.lastActiveAt)}
                </Text>
              </div>
            </div>
            {!session.isCurrent && (
              <Button
                size="small"
                danger
                loading={
                  revokeSessionMutation.isPending &&
                  revokeSessionMutation.variables === session.id
                }
                onClick={() => handleRevoke(session.id)}
              >
                {t("mySettings.security.revoke", lang)}
              </Button>
            )}
          </div>
        ))}

        {sessions.length > 1 && (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={revokeAllMutation.isPending}
              onClick={() => revokeAllMutation.mutate()}
            >
              {t("mySettings.security.revokeAll", lang)}
            </Button>
          </div>
        )}
      </Section>

      {/* ── Enable 2FA Modal (gradient header pattern) ──────────────────────── */}
      <Modal
        open={setup2faModalOpen}
        onCancel={() => {
          setSetup2faModalOpen(false);
          setTotpCode("");
        }}
        width={480}
        destroyOnHidden
        title={null}
        footer={null}
        closeIcon={<CloseOutlined style={{ color: "#fff", fontSize: 14 }} />}
        rootClassName="modal-gradient-header"
        styles={{
          body: { padding: 0 },
          header: { display: "none" },
          mask: { backdropFilter: "blur(4px)" },
        }}
      >
        {/* Gradient header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
            padding: "28px 32px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -30,
              left: 60,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
            }}
          />
          {/* Icon + title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                color: "#fff",
              }}
            >
              <SafetyOutlined />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {t("mySettings.security.setup2fa", lang)}
              </h2>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {t("mySettings.security.setup2faSubtitle", lang)}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 32px 8px" }}>
          <Text style={{ display: "block", marginBottom: 16 }}>
            {t("mySettings.security.scanQrCode", lang)}
          </Text>

          {qrCodeUri && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <img
                src={qrCodeUri}
                alt="2FA QR Code"
                style={{
                  width: 200,
                  height: 200,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadiusLG,
                }}
              />
            </div>
          )}

          <Input
            placeholder={t("mySettings.security.enterCode", lang)}
            value={totpCode}
            onChange={e => setTotpCode(e.target.value)}
            maxLength={6}
            style={{ textAlign: "center", fontSize: 18, letterSpacing: 8 }}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 32px 20px",
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            background: token.colorBgLayout,
          }}
        >
          <Button
            onClick={() => {
              setSetup2faModalOpen(false);
              setTotpCode("");
            }}
          >
            {t("mySettings.security.cancel", lang)}
          </Button>
          <Button
            type="primary"
            loading={verify2faMutation.isPending}
            disabled={totpCode.length !== 6}
            onClick={() => verify2faMutation.mutate(totpCode)}
          >
            {t("mySettings.security.verifyAndEnable", lang)}
          </Button>
        </div>
      </Modal>

      {/* ── Disable 2FA Modal (gradient header pattern) ─────────────────────── */}
      <Modal
        open={disable2faModalOpen}
        onCancel={() => {
          setDisable2faModalOpen(false);
          setDisablePassword("");
        }}
        width={480}
        destroyOnHidden
        title={null}
        footer={null}
        closeIcon={<CloseOutlined style={{ color: "#fff", fontSize: 14 }} />}
        rootClassName="modal-gradient-header"
        styles={{
          body: { padding: 0 },
          header: { display: "none" },
          mask: { backdropFilter: "blur(4px)" },
        }}
      >
        {/* Gradient header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
            padding: "28px 32px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -30,
              left: 60,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                color: "#fff",
              }}
            >
              <SafetyOutlined />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {t("mySettings.security.disable2faTitle", lang)}
              </h2>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {t("mySettings.security.confirmDisable2fa", lang)}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 32px 8px" }}>
          <Alert
            type="warning"
            showIcon
            title={t("mySettings.security.disable2faWarning", lang)}
            style={{ marginBottom: 20 }}
          />

          <Text style={{ display: "block", marginBottom: 8, fontSize: 13 }}>
            {t("mySettings.security.enterPassword", lang)}
          </Text>
          <Input.Password
            value={disablePassword}
            onChange={e => setDisablePassword(e.target.value)}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 32px 20px",
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            background: token.colorBgLayout,
          }}
        >
          <Button
            onClick={() => {
              setDisable2faModalOpen(false);
              setDisablePassword("");
            }}
          >
            {t("mySettings.security.cancel", lang)}
          </Button>
          <Button
            danger
            type="primary"
            loading={disable2faMutation.isPending}
            disabled={!disablePassword}
            onClick={() => disable2faMutation.mutate(disablePassword)}
          >
            {t("mySettings.security.confirmDisableBtn", lang)}
          </Button>
        </div>
      </Modal>
    </>
  );
}

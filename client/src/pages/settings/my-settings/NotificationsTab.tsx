import { useState, useEffect, useRef, useCallback } from "react";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { t } from "@/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  Switch,
  Radio,
  TimePicker,
  Typography,
  Tooltip,
  notification,
  theme as antTheme,
} from "antd";
import { LockOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { notificationSettingsService } from "@/services/settings.service";
import type { NotificationSettings } from "@/services/settings.service";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Section wrapper (same pattern as CompanyProfile) ─────────────────────────
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

// ─── Toggle channel definitions ───────────────────────────────────────────────
const NOTIFICATION_CHANNELS: Array<{
  key: string;
  i18nKey: string;
  locked?: boolean;
}> = [
  {
    key: "emailNotifications",
    i18nKey: "mySettings.notifications.emailNotifications",
  },
  { key: "orderUpdates", i18nKey: "mySettings.notifications.orderUpdates" },
  {
    key: "inventoryAlerts",
    i18nKey: "mySettings.notifications.inventoryAlerts",
  },
  {
    key: "systemAlerts",
    i18nKey: "mySettings.notifications.systemAlerts",
    locked: true,
  },
  { key: "weeklyReports", i18nKey: "mySettings.notifications.weeklyReports" },
  {
    key: "billingReminders",
    i18nKey: "mySettings.notifications.billingReminders",
  },
  { key: "productUpdates", i18nKey: "mySettings.notifications.productUpdates" },
] as const;

// ─── Local state shape ────────────────────────────────────────────────────────
interface LocalNotificationSettings {
  emailNotifications: boolean;
  orderUpdates: boolean;
  inventoryAlerts: boolean;
  systemAlerts: boolean;
  weeklyReports: boolean;
  billingReminders: boolean;
  productUpdates: boolean;
  digestFrequency: string;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

const DEFAULT_SETTINGS: LocalNotificationSettings = {
  emailNotifications: true,
  orderUpdates: true,
  inventoryAlerts: true,
  systemAlerts: true,
  weeklyReports: false,
  billingReminders: true,
  productUpdates: false,
  digestFrequency: "realtime",
  quietHoursStart: null,
  quietHoursEnd: null,
};

function mapApiToLocal(data: NotificationSettings): LocalNotificationSettings {
  const prefs = data.preferences ?? [];
  const getEnabled = (eventType: string) =>
    prefs.find(p => p.eventType === eventType)?.enabled ?? false;

  return {
    emailNotifications: getEnabled("emailNotifications"),
    orderUpdates: getEnabled("orderUpdates"),
    inventoryAlerts: getEnabled("inventoryAlerts"),
    systemAlerts: true, // always true
    weeklyReports: getEnabled("weeklyReports"),
    billingReminders: getEnabled("billingReminders"),
    productUpdates: getEnabled("productUpdates"),
    digestFrequency: data.digestFrequency ?? "realtime",
    quietHoursStart: data.quietHoursStart ?? null,
    quietHoursEnd: data.quietHoursEnd ?? null,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NotificationsTab() {
  const { token } = antTheme.useToken();
  const { language: lang } = useAppSettings();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<LocalNotificationSettings | null>(
    null
  );

  const quietHoursTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data } = useQuery<NotificationSettings>({
    queryKey: [QUERY_KEYS.NOTIFICATION_SETTINGS],
    queryFn: notificationSettingsService.get,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      setSettings(mapApiToLocal(data));
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (dto: Partial<NotificationSettings>) =>
      notificationSettingsService.update(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NOTIFICATION_SETTINGS],
      });
      notification.success({
        message: t("mySettings.notifications.saved", lang),
        icon: <CheckCircleOutlined style={{ color: token.colorSuccess }} />,
        duration: 2,
      });
    },
  });

  const handleToggle = useCallback(
    (key: string, value: boolean) => {
      // System alerts can never be disabled
      if (key === "systemAlerts") return;

      setSettings(prev => (prev ? { ...prev, [key]: value } : prev));

      const preferences = NOTIFICATION_CHANNELS.map(ch => ({
        eventType: ch.key,
        channel: "email",
        enabled:
          ch.key === key
            ? value
            : ch.key === "systemAlerts"
              ? true
              : ((settings?.[
                  ch.key as keyof LocalNotificationSettings
                ] as boolean) ?? false),
      }));

      mutation.mutate({ preferences });
    },
    [settings, mutation]
  );

  const handleDigestChange = useCallback(
    (value: string) => {
      setSettings(prev => (prev ? { ...prev, digestFrequency: value } : prev));
      mutation.mutate({ digestFrequency: value });
    },
    [mutation]
  );

  const handleQuietHoursChange = useCallback(
    (field: "quietHoursStart" | "quietHoursEnd", value: dayjs.Dayjs | null) => {
      const timeStr = value ? value.format("HH:mm") : null;
      setSettings(prev => (prev ? { ...prev, [field]: timeStr } : prev));

      if (quietHoursTimerRef.current) {
        clearTimeout(quietHoursTimerRef.current);
      }
      quietHoursTimerRef.current = setTimeout(() => {
        mutation.mutate({ [field]: timeStr });
      }, 500);
    },
    [mutation]
  );

  if (!settings) return null;

  return (
    <>
      {/* Section 1: Notification Channels */}
      <Section
        title={t("mySettings.notifications.channels", lang)}
        description={t("mySettings.notifications.channelsDesc", lang)}
      >
        {NOTIFICATION_CHANNELS.map(channel => {
          const isLocked = channel.locked === true;

          return (
            <div
              key={channel.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <div>
                <Text style={{ fontSize: 13, fontWeight: 500 }}>
                  {t(channel.i18nKey, lang)}
                </Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {isLocked ? (
                  <>
                    <Tooltip
                      title={t(
                        "mySettings.notifications.systemAlertsLocked",
                        lang
                      )}
                    >
                      <Switch checked={true} disabled />
                    </Tooltip>
                    <Tooltip
                      title={t(
                        "mySettings.notifications.systemAlertsLocked",
                        lang
                      )}
                    >
                      <LockOutlined
                        style={{
                          fontSize: 14,
                          color: token.colorTextQuaternary,
                        }}
                      />
                    </Tooltip>
                  </>
                ) : (
                  <Switch
                    checked={
                      settings[
                        channel.key as keyof LocalNotificationSettings
                      ] as boolean
                    }
                    onChange={val => handleToggle(channel.key, val)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </Section>

      {/* Section 2: Delivery Preferences */}
      <Section
        title={t("mySettings.notifications.delivery", lang)}
        description={t("mySettings.notifications.deliveryDesc", lang)}
      >
        {/* Email Digest Frequency */}
        <div style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: 500 }}>
            {t("mySettings.notifications.digestFrequency", lang)}
          </Text>
          <div style={{ marginTop: 8 }}>
            <Radio.Group
              value={settings.digestFrequency}
              onChange={e => handleDigestChange(e.target.value)}
            >
              <Radio value="realtime">
                {t("mySettings.notifications.realtime", lang)}
              </Radio>
              <Radio value="daily">
                {t("mySettings.notifications.daily", lang)}
              </Radio>
              <Radio value="weekly">
                {t("mySettings.notifications.weekly", lang)}
              </Radio>
            </Radio.Group>
          </div>
        </div>

        {/* Quiet Hours */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: 500 }}>
              {t("mySettings.notifications.quietHours", lang)}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              (UTC+3 AST)
            </Text>
          </div>
          <Text
            type="secondary"
            style={{ fontSize: 12, display: "block", marginBottom: 8 }}
          >
            {t("mySettings.notifications.quietHoursDesc", lang)}
          </Text>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TimePicker
              value={
                settings.quietHoursStart
                  ? dayjs(settings.quietHoursStart, "HH:mm")
                  : null
              }
              onChange={val => handleQuietHoursChange("quietHoursStart", val)}
              format="HH:mm"
              placeholder="Start"
              style={{ width: 120 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              to
            </Text>
            <TimePicker
              value={
                settings.quietHoursEnd
                  ? dayjs(settings.quietHoursEnd, "HH:mm")
                  : null
              }
              onChange={val => handleQuietHoursChange("quietHoursEnd", val)}
              format="HH:mm"
              placeholder="End"
              style={{ width: 120 }}
            />
          </div>
        </div>
      </Section>
    </>
  );
}

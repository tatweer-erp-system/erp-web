import { useAppSettings } from "@/contexts/AppSettingsContext";
import { t } from "@/i18n";
import { profileService } from "@/services/settings.service";
import type {
  UserProfile,
  UpdateProfileDto,
} from "@/services/settings.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  Form,
  Input,
  Row,
  Col,
  Button,
  Upload,
  Space,
  Typography,
  notification,
  Tooltip,
  Spin,
  theme as antTheme,
} from "antd";
import {
  CloudUploadOutlined,
  SaveOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";

const { Text } = Typography;

// ─── Section wrapper ─────────────────────────────────────────────────────────
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

// ─── ProfileTab ──────────────────────────────────────────────────────────────
export default function ProfileTab() {
  const { token } = antTheme.useToken();
  const { language } = useAppSettings();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();

  // ── Fetch profile ────────────────────────────────────────────────────────
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: [QUERY_KEYS.PROFILE],
    queryFn: profileService.get,
    staleTime: 5 * 60 * 1000,
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        fullName: `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email,
        jobTitle: profile.jobTitle ?? "",
        phone: profile.phone ?? "",
        bio: profile.bio ?? "",
      });
      setAvatarPreview(profile.avatarUrl);
    }
  }, [profile, form]);

  // ── Update profile mutation ──────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (dto: UpdateProfileDto) => profileService.update(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE] });
      notification.success({
        message: t("mySettings.profile.saved", language),
      });
    },
    onError: () => {
      notification.error({
        message: t("mySettings.profile.saveProfile", language),
      });
    },
  });

  // ── Avatar upload mutation ───────────────────────────────────────────────
  const avatarMutation = useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: data => {
      setAvatarPreview(data.avatarUrl);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE] });
      notification.success({
        message: t("mySettings.profile.avatarUploaded", language),
      });
    },
    onError: () => {
      notification.error({
        message: t("mySettings.profile.avatar", language),
      });
    },
  });

  // ── Handle save ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const nameParts = (values.fullName as string).trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "";

      updateMutation.mutate({
        firstName,
        lastName,
        jobTitle: values.jobTitle ?? undefined,
        phone: values.phone ?? undefined,
        bio: values.bio ?? undefined,
      });
    } catch {
      // validation errors shown by form
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin />
      </div>
    );
  }

  return (
    <>
      {/* Avatar Section */}
      <Section title={t("mySettings.profile.avatar", language)}>
        <div
          style={{
            display: "flex",
            alignItems: isRTL ? "center" : "center",
            gap: 24,
            flexDirection: isRTL ? "row-reverse" : "row",
          }}
        >
          <Upload
            showUploadList={false}
            beforeUpload={file => {
              avatarMutation.mutate(file);
              return false;
            }}
            accept="image/*"
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 16,
                border: `2px dashed ${token.colorBorderSecondary}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                background: avatarPreview
                  ? `url(${avatarPreview}) center/cover no-repeat`
                  : token.colorFillAlter,
                gap: 6,
                overflow: "hidden",
              }}
            >
              {!avatarPreview && (
                <>
                  <CloudUploadOutlined
                    style={{
                      fontSize: 24,
                      color: token.colorTextQuaternary,
                    }}
                  />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {t("mySettings.profile.uploadNew", language)}
                  </Text>
                </>
              )}
            </div>
          </Upload>
          <div style={{ textAlign: isRTL ? "right" : "left" }}>
            <Text strong style={{ fontSize: 13 }}>
              {t("mySettings.profile.avatar", language)}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t("mySettings.profile.avatarHint", language)}
            </Text>
            <br />
            <Space style={{ marginTop: 8 }}>
              <Upload
                showUploadList={false}
                beforeUpload={file => {
                  avatarMutation.mutate(file);
                  return false;
                }}
                accept="image/*"
              >
                <Button
                  size="small"
                  icon={<CloudUploadOutlined />}
                  loading={avatarMutation.isPending}
                >
                  {t("mySettings.profile.uploadNew", language)}
                </Button>
              </Upload>
              <Button size="small" danger>
                {t("mySettings.profile.remove", language)}
              </Button>
            </Space>
          </div>
        </div>
      </Section>

      {/* Personal Information Section */}
      <Section
        title={t("mySettings.profile.title", language)}
        description={t("mySettings.profile.subtitle", language)}
      >
        <Form form={form} layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.profile.fullName", language)}
                name="fullName"
                rules={[{ required: true }, { min: 2 }]}
                style={{ marginBottom: 16 }}
              >
                <Input
                  placeholder={t(
                    "mySettings.profile.fullNamePlaceholder",
                    language
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <Space size={4}>
                    {t("mySettings.profile.email", language)}
                    <Tooltip
                      title={t("mySettings.profile.emailReadonly", language)}
                    >
                      <InfoCircleOutlined
                        style={{
                          color: token.colorTextQuaternary,
                          fontSize: 12,
                        }}
                      />
                    </Tooltip>
                  </Space>
                }
                name="email"
                style={{ marginBottom: 16 }}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.profile.jobTitle", language)}
                name="jobTitle"
                style={{ marginBottom: 16 }}
              >
                <Input
                  placeholder={t(
                    "mySettings.profile.jobTitlePlaceholder",
                    language
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("mySettings.profile.phone", language)}
                name="phone"
                style={{ marginBottom: 16 }}
              >
                <Input
                  placeholder={t(
                    "mySettings.profile.phonePlaceholder",
                    language
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label={t("mySettings.profile.bio", language)}
                name="bio"
                style={{ marginBottom: 0 }}
              >
                <Input.TextArea
                  rows={3}
                  showCount
                  maxLength={300}
                  placeholder={t("mySettings.profile.bioPlaceholder", language)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>

      {/* Save Button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={updateMutation.isPending}
          onClick={handleSave}
        >
          {t("mySettings.profile.saveProfile", language)}
        </Button>
      </div>
    </>
  );
}

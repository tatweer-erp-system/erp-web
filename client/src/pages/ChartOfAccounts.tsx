import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { accountsService } from "@/services/accounting.service";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Tree,
  Card,
  Row,
  Col,
  Tag,
  Space,
  Typography,
  Button,
  Input,
  Drawer,
  Descriptions,
  Statistic,
  Tabs,
  Badge,
  Grid,
  Tooltip,
  Divider,
  theme as antTheme,
  Modal,
  Form,
  Select,
  Switch,
  message,
  notification,
} from "antd";
import type { TreeDataNode } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FolderOutlined,
  FileTextOutlined,
  BankOutlined,
  DollarOutlined,
  LineChartOutlined,
  PercentageOutlined,
  ApartmentOutlined,
  SettingOutlined,
  EyeOutlined,
  CloseOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  SubnodeOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// ─── Shared account data ───────────────────────────────────────────────────────

interface Account {
  id?: string;
  code: string;
  nameEn: string;
  nameAr: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  subType?: string;
  normalBalance: "debit" | "credit";
  balance?: number;
  isActive: boolean;
  allowDirectPosting?: boolean;
  description?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  openingBalance?: number;
  children?: Account[];
  version?: number;
}

// ACCOUNTS is now fetched from API inside ChartOfAccountsContent

// ─── Shared helpers ────────────────────────────────────────────────────────────

const TYPE_META: Record<
  string,
  { color: string; label: string; icon: typeof BankOutlined }
> = {
  asset: { color: "#3B82F6", label: "Asset", icon: BankOutlined },
  liability: { color: "#F59E0B", label: "Liability", icon: DollarOutlined },
  equity: { color: "#10B981", label: "Equity", icon: PercentageOutlined },
  revenue: { color: "#8B5CF6", label: "Revenue", icon: LineChartOutlined },
  expense: { color: "#EF4444", label: "Expense", icon: SettingOutlined },
};

const SUBTYPE_OPTIONS: Record<string, string[]> = {
  asset: [
    "Cash",
    "Receivable",
    "Inventory",
    "Prepaid",
    "Investment",
    "Fixed",
    "Contra",
    "Intangible",
    "Other",
  ],
  liability: ["Payable", "Accrued", "Tax", "Loan", "Other"],
  equity: ["Capital", "Retained", "Earnings", "Other"],
  revenue: ["Sales", "Service", "Other"],
  expense: [
    "COGS",
    "Payroll",
    "Overhead",
    "Marketing",
    "Non-cash",
    "Finance",
    "Services",
    "Other",
  ],
};

function fmtAmt(n: number) {
  const abs = Math.abs(n);
  const s =
    abs >= 1_000_000
      ? `$${(abs / 1_000_000).toFixed(2)}M`
      : abs >= 1_000
        ? `$${(abs / 1_000).toFixed(0)}K`
        : `$${abs}`;
  return n < 0 ? `(${s})` : s;
}

function nextChildCode(parent: Account): string {
  const existing = parent.children?.map(c => parseInt(c.code, 10)) ?? [];
  const parentNum = parseInt(parent.code, 10);
  const step = parent.code.length === 4 ? 10 : 1;
  const next =
    existing.length > 0 ? Math.max(...existing) + step : parentNum + step;
  return String(next).padStart(parent.code.length, "0");
}

// ─── Create Child Account Modal ───────────────────────────────────────────────

function CreateChildModal({
  open,
  parent,
  editAccount,
  onClose,
  acctName,
  lang,
}: {
  open: boolean;
  parent: Account | null;
  editAccount?: Account | null;
  onClose: () => void;
  acctName: (a: Account) => string;
  lang: string;
}) {
  const { token } = antTheme.useToken();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isRTL = lang === "ar";
  const isEdit = !!editAccount;

  const createMutation = useMutation({
    mutationFn: (dto: Record<string, unknown>) =>
      accountsService.create(dto as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS_TREE] });
      message.success(t("accounting.coa.childCreated", lang));
      form.resetFields();
      onClose();
    },
    onError: (err: Error) => {
      notification.error({
        message: t("mySettings.error.save", "en"),
        description: err.message,
        style: { direction: document.dir as "rtl" | "ltr" },
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (dto: Record<string, unknown>) =>
      accountsService.update(editAccount!.id!, dto as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS_TREE] });
      message.success(t("accounting.coa.accountUpdated", lang));
      form.resetFields();
      onClose();
    },
    onError: (err: Error) => {
      notification.error({
        message: t("mySettings.error.save", "en"),
        description: err.message,
        style: { direction: document.dir as "rtl" | "ltr" },
      });
    },
  });

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (isEdit) {
        updateMutation.mutate({
          ...values,
          version: editAccount!.version ?? 0,
        });
      } else {
        createMutation.mutate({
          ...values,
          parentId: parent?.id,
        });
      }
    } catch {
      // validation failed
    }
  };

  const isSaving = isEdit ? updateMutation.isPending : createMutation.isPending;

  React.useEffect(() => {
    if (isEdit && editAccount && open) {
      form.setFieldsValue({
        code: editAccount.code,
        nameEn: editAccount.nameEn,
        nameAr: editAccount.nameAr,
        type: editAccount.type,
        subType: editAccount.subType,
        normalBalance: editAccount.normalBalance,
        isActive: editAccount.isActive ?? true,
        descriptionEn: editAccount.descriptionEn ?? "",
        descriptionAr: editAccount.descriptionAr ?? "",
      });
    }
  }, [isEdit, editAccount, open, form]);

  const effectiveAccount = isEdit ? editAccount : parent;
  const typeColor = effectiveAccount
    ? TYPE_META[effectiveAccount.type]?.color
    : token.colorPrimary;
  const suggestedCode = parent ? nextChildCode(parent) : "";
  const isTopLevel = !parent && !isEdit;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      destroyOnHidden
      width={640}
      styles={{
        body: { padding: 0 },
        mask: { backdropFilter: "blur(2px)", background: "rgba(0,0,0,0.35)" },
      }}
    >
      {/* ── Gradient header ─────────────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${typeColor} 0%, ${typeColor}dd 100%)`,
            padding: "22px 24px 56px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.18)",
                borderRadius: 6,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {isEdit
                ? t("accounting.coa.editAccount", lang)
                : isTopLevel
                  ? t("accounting.coa.newAccount", lang)
                  : t("accounting.coa.newChildAccount", lang)}
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "rgba(255,255,255,0.18)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 13,
              }}
            >
              <CloseOutlined />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(255,255,255,0.22)",
                border: "2px solid rgba(255,255,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                fontWeight: 800,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {isEdit ? (
                <EditOutlined />
              ) : isTopLevel ? (
                <PlusOutlined />
              ) : (
                <SubnodeOutlined />
              )}
            </div>
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                {isEdit
                  ? t("accounting.coa.editAccount", lang)
                  : isTopLevel
                    ? t("accounting.coa.addAccount", lang)
                    : t("accounting.coa.addSubAccount", lang)}
              </div>
              {parent && (
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.72)",
                    marginTop: 3,
                  }}
                >
                  {t("accounting.coa.under", lang)} {parent.code} &middot;{" "}
                  {acctName(parent)}
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 28,
            background: token.colorBgContainer,
            borderRadius: "24px 24px 0 0",
          }}
        />
      </div>

      {/* ── Form body ───────────────────────────────────────────────── */}
      <div style={{ padding: "4px 24px 8px" }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            code: suggestedCode,
            type: parent?.type ?? undefined,
            normalBalance: parent?.normalBalance ?? "debit",
            isActive: true,
          }}
        >
          {/* Account Code */}
          <div
            style={{
              background: token.colorBgLayout,
              borderRadius: 10,
              padding: "14px 16px 4px",
              marginBottom: 10,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <Form.Item
              name="code"
              label={
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    {t("accounting.coa.accountCode", lang)}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: token.colorError,
                      background: `${token.colorError}14`,
                      borderRadius: 4,
                      padding: "1px 5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {t("accounting.coa.required", lang)}
                  </span>
                </div>
              }
              rules={[
                {
                  required: true,
                  message: t("accounting.coa.accountCodeRequired", lang),
                },
              ]}
              style={{ marginBottom: 14 }}
            >
              <Input
                placeholder={suggestedCode || "e.g. 1100"}
                style={{ fontFamily: "monospace" }}
              />
            </Form.Item>
          </div>

          {/* Account Name (English) */}
          <div
            style={{
              background: token.colorBgLayout,
              borderRadius: 10,
              padding: "14px 16px 4px",
              marginBottom: 10,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <Form.Item
              name="nameEn"
              label={
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    {t("accounting.coa.nameEn", lang)}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: token.colorError,
                      background: `${token.colorError}14`,
                      borderRadius: 4,
                      padding: "1px 5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {t("accounting.coa.required", lang)}
                  </span>
                </div>
              }
              rules={[
                {
                  required: true,
                  message: t("accounting.coa.nameEnRequired", lang),
                },
              ]}
              style={{ marginBottom: 14 }}
            >
              <Input
                placeholder={t("accounting.coa.nameEnPlaceholder", lang)}
                dir="ltr"
              />
            </Form.Item>
          </div>

          {/* Account Name (Arabic) */}
          <div
            style={{
              background: token.colorBgLayout,
              borderRadius: 10,
              padding: "14px 16px 4px",
              marginBottom: 10,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <Form.Item
              name="nameAr"
              label={
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    {t("accounting.coa.nameAr", lang)}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: token.colorError,
                      background: `${token.colorError}14`,
                      borderRadius: 4,
                      padding: "1px 5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {t("accounting.coa.required", lang)}
                  </span>
                </div>
              }
              rules={[
                {
                  required: true,
                  message: t("accounting.coa.nameArRequired", lang),
                },
              ]}
              style={{ marginBottom: 14 }}
            >
              <Input
                placeholder={
                  "\u0645\u062B\u0644: \u0635\u0646\u062F\u0648\u0642 \u0627\u0644\u0645\u0635\u0627\u0631\u064A\u0641 \u0627\u0644\u0646\u062B\u0631\u064A\u0629"
                }
                dir="rtl"
              />
            </Form.Item>
          </div>

          {/* Type + Subtype row */}
          <Row gutter={10}>
            <Col span={12}>
              <div
                style={{
                  background: token.colorBgLayout,
                  borderRadius: 10,
                  padding: "14px 16px 4px",
                  marginBottom: 10,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <Form.Item
                  name="type"
                  label={
                    <span style={{ fontSize: 12, fontWeight: 700 }}>
                      {t("accounting.coa.accountType", lang)}
                    </span>
                  }
                  rules={
                    isTopLevel || isEdit
                      ? [
                          {
                            required: true,
                            message: t("accounting.coa.typeRequired", lang),
                          },
                        ]
                      : undefined
                  }
                  style={{ marginBottom: 14 }}
                >
                  <Select
                    disabled={!isTopLevel && !isEdit}
                    placeholder={t("accounting.coa.selectPlaceholder", lang)}
                  >
                    {Object.entries(TYPE_META).map(([k, v]) => (
                      <Select.Option key={k} value={k}>
                        <Tag
                          color={v.color}
                          style={{ borderRadius: 20, marginInlineEnd: 4 }}
                        >
                          {t(
                            `accounting.coa.type${k.charAt(0).toUpperCase() + k.slice(1)}`,
                            lang
                          )}
                        </Tag>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </Col>
            <Col span={12}>
              <div
                style={{
                  background: token.colorBgLayout,
                  borderRadius: 10,
                  padding: "14px 16px 4px",
                  marginBottom: 10,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, cur) => prev.type !== cur.type}
                >
                  {({ getFieldValue }) => {
                    const selectedType =
                      getFieldValue("type") ?? parent?.type ?? "asset";
                    return (
                      <Form.Item
                        name="subType"
                        label={
                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              gap: 6,
                            }}
                          >
                            <span style={{ fontSize: 12, fontWeight: 700 }}>
                              {t("accounting.coa.subType", lang)}
                            </span>
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: token.colorError,
                                background: `${token.colorError}14`,
                                borderRadius: 4,
                                padding: "1px 5px",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {t("accounting.coa.required", lang)}
                            </span>
                          </div>
                        }
                        rules={[
                          {
                            required: true,
                            message: t("accounting.coa.subTypeRequired", lang),
                          },
                        ]}
                        style={{ marginBottom: 14 }}
                      >
                        <Select
                          placeholder={t(
                            "accounting.coa.selectPlaceholder",
                            lang
                          )}
                        >
                          {(SUBTYPE_OPTIONS[selectedType] ?? []).map(s => (
                            <Select.Option key={s} value={s}>
                              {s}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              </div>
            </Col>
          </Row>

          {/* Normal Balance */}
          <div
            style={{
              background: token.colorBgLayout,
              borderRadius: 10,
              padding: "14px 16px 4px",
              marginBottom: 10,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <Form.Item
              name="normalBalance"
              label={
                <span style={{ fontSize: 12, fontWeight: 700 }}>
                  {t("accounting.coa.normalBalance", lang)}
                </span>
              }
              style={{ marginBottom: 14 }}
            >
              <Select>
                <Select.Option value="debit">
                  {t("accounting.coa.debitDr", lang)}
                </Select.Option>
                <Select.Option value="credit">
                  {t("accounting.coa.creditCr", lang)}
                </Select.Option>
              </Select>
            </Form.Item>
          </div>

          {/* Description (English) */}
          <div
            style={{
              background: token.colorBgLayout,
              borderRadius: 10,
              padding: "14px 16px 4px",
              marginBottom: 10,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <Form.Item
              name="descriptionEn"
              label={
                <span style={{ fontSize: 12, fontWeight: 700 }}>
                  {t("accounting.coa.descriptionEn", lang)}
                </span>
              }
              style={{ marginBottom: 14 }}
            >
              <Input.TextArea
                rows={2}
                placeholder={t("accounting.coa.descriptionEnPlaceholder", lang)}
                dir="ltr"
              />
            </Form.Item>
          </div>

          {/* Description (Arabic) */}
          <div
            style={{
              background: token.colorBgLayout,
              borderRadius: 10,
              padding: "14px 16px 4px",
              marginBottom: 10,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <Form.Item
              name="descriptionAr"
              label={
                <span style={{ fontSize: 12, fontWeight: 700 }}>
                  {t("accounting.coa.descriptionAr", lang)}
                </span>
              }
              style={{ marginBottom: 14 }}
            >
              <Input.TextArea
                rows={2}
                placeholder={
                  "\u0648\u0635\u0641 \u0645\u062E\u062A\u0635\u0631 \u0644\u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628..."
                }
                dir="rtl"
              />
            </Form.Item>
          </div>

          {/* Active status card */}
          <div
            style={{
              background: token.colorBgLayout,
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 4,
              border: `1px solid ${token.colorBorderSecondary}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 2,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#10B981",
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: token.colorText,
                  }}
                >
                  {t("accounting.coa.activeStatus", lang)}
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: token.colorTextSecondary,
                  paddingInlineStart: 16,
                }}
              >
                {t("accounting.coa.activeStatusHint", lang)}
              </div>
            </div>
            <Form.Item
              name="isActive"
              valuePropName="checked"
              style={{ margin: 0 }}
            >
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div
        style={{
          background: token.colorBgContainer,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          padding: "14px 24px",
          display: "flex",
          gap: 10,
        }}
      >
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={isSaving}
          onClick={handleSave}
          size="large"
          style={{
            flex: 1,
            height: 42,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${typeColor}, ${typeColor}dd)`,
            border: "none",
            boxShadow: `0 4px 12px ${typeColor}44`,
          }}
        >
          {isEdit
            ? t("accounting.coa.saveChanges", lang)
            : t("accounting.coa.createAccount", lang)}
        </Button>
        <Button
          icon={<CloseOutlined />}
          onClick={onClose}
          size="large"
          style={{ height: 42, fontWeight: 600, minWidth: 100 }}
        >
          {t("accounting.coa.cancel", lang)}
        </Button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Chart of Accounts — Dashboard + Tree tabs with type filter
// ─────────────────────────────────────────────────────────────────────────────

function ChartOfAccountsContent() {
  const { token } = antTheme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const lang = useLangStore(s => s.lang);
  const isRTL = lang === "ar";
  const queryClient = useQueryClient();

  const { data: accountsFromApi, isLoading: accountsLoading } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS_TREE],
    queryFn: () => accountsService.tree(),
    staleTime: 5 * 60_000,
  });
  const ACCOUNTS: Account[] = (accountsFromApi ?? []) as Account[];

  const acctName = (a: Account) => getName(a);

  const acctDescription = (a: Account) =>
    lang === "ar"
      ? (a.descriptionAr ?? a.descriptionEn ?? "")
      : (a.descriptionEn ?? a.description ?? "");

  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS_TREE] });
      message.success(t("accounting.coa.accountDeleted", lang));
      setDrawerOpen(false);
      setSelected(null);
    },
    onError: (err: Error) => {
      notification.error({
        message: t("mySettings.error.save", lang),
        description: err.message,
        style: { direction: document.dir as "rtl" | "ltr" },
      });
    },
  });

  const [activeTab, setActiveTab] = useState("all");
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([
    "1000",
    "2000",
    "3000",
    "4000",
    "5000",
    "1100",
    "1200",
    "2100",
    "2200",
    "5200",
  ]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Account | null>(null);
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<Account[]>([]);
  const [childModalOpen, setChildModalOpen] = useState(false);
  const [newAccountModalOpen, setNewAccountModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const typeFilter = activeTab === "all" ? null : activeTab;
  const visibleRoots = typeFilter
    ? ACCOUNTS.filter(a => a.type === typeFilter)
    : ACCOUNTS;

  const openAccount = (acct: Account, pushHistory = true) => {
    if (pushHistory && selected) {
      setHistory(prev => [...prev, selected]);
    }
    setSelected(acct);
    setDrawerOpen(true);
  };

  const goBack = () => {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory(h => h.slice(0, -1));
      setSelected(prev);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setHistory([]);
  };

  function buildTree(accounts: Account[]): TreeDataNode[] {
    return accounts.map(a => {
      const isHeader = !!a.children?.length;
      return {
        key: a.code,
        isLeaf: !isHeader,
        children: a.children ? buildTree(a.children) : undefined,
        title: (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingInlineEnd: 12,
              paddingBlock: 2,
              width: "100%",
              borderRadius: 6,
              transition: "background 0.15s",
            }}
            onClick={() => openAccount(a, false)}
          >
            <Space size={8}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: isHeader
                    ? `${TYPE_META[a.type]?.color}14`
                    : `${token.colorTextQuaternary}10`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isHeader ? (
                  <FolderOutlined
                    style={{ color: TYPE_META[a.type]?.color, fontSize: 12 }}
                  />
                ) : (
                  <FileTextOutlined
                    style={{ color: token.colorTextTertiary, fontSize: 11 }}
                  />
                )}
              </div>
              <Tag
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  borderRadius: 4,
                  margin: 0,
                  background: `${token.colorTextQuaternary}0a`,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  color: token.colorTextSecondary,
                  fontWeight: 600,
                }}
              >
                {a.code}
              </Tag>
              <Text style={{ fontWeight: isHeader ? 600 : 400, fontSize: 13 }}>
                {acctName(a)}
              </Text>
              {!a.isActive && (
                <Tag
                  color="default"
                  style={{ borderRadius: 20, fontSize: 10, margin: 0 }}
                >
                  {t("accounting.coa.off", lang)}
                </Tag>
              )}
            </Space>
            <Space size={10}>
              <Text
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  color:
                    (a.balance ?? 0) < 0
                      ? token.colorError
                      : token.colorTextSecondary,
                }}
              >
                {a.balance ? fmtAmt(a.balance) : ""}
              </Text>
              <Tooltip title={t("accounting.coa.viewDetails", lang)}>
                <EyeOutlined
                  style={{
                    color: token.colorTextQuaternary,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                />
              </Tooltip>
            </Space>
          </div>
        ),
      };
    });
  }

  const tabItems = [
    {
      key: "all",
      label: (
        <Space>
          <ApartmentOutlined />
          {t("accounting.coa.tabAll", lang)}
        </Space>
      ),
    },
    {
      key: "asset",
      label: (
        <Space>
          <BankOutlined style={{ color: TYPE_META.asset.color }} />
          {t("accounting.coa.tabAssets", lang)}
        </Space>
      ),
    },
    {
      key: "liability",
      label: (
        <Space>
          <DollarOutlined style={{ color: TYPE_META.liability.color }} />
          {t("accounting.coa.tabLiabilities", lang)}
        </Space>
      ),
    },
    {
      key: "equity",
      label: (
        <Space>
          <PercentageOutlined style={{ color: TYPE_META.equity.color }} />
          {t("accounting.coa.tabEquity", lang)}
        </Space>
      ),
    },
    {
      key: "revenue",
      label: (
        <Space>
          <LineChartOutlined style={{ color: TYPE_META.revenue.color }} />
          {t("accounting.coa.tabRevenue", lang)}
        </Space>
      ),
    },
    {
      key: "expense",
      label: (
        <Space>
          <SettingOutlined style={{ color: TYPE_META.expense.color }} />
          {t("accounting.coa.tabExpenses", lang)}
        </Space>
      ),
    },
  ];

  const typeColor = selected
    ? TYPE_META[selected.type]?.color
    : token.colorPrimary;

  return (
    <>
      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {ACCOUNTS.map(a => {
          const meta = TYPE_META[a.type];
          const color = meta?.color ?? token.colorPrimary;
          const IconComp = meta?.icon ?? BankOutlined;
          const isActive = activeTab === a.type;
          return (
            <div
              key={a.code}
              style={{ flex: "1 1 0", minWidth: isMobile ? "100%" : 150 }}
            >
              <Card
                size="small"
                hoverable
                styles={{
                  body: { padding: "16px 18px", position: "relative", overflow: "hidden" },
                }}
                style={{
                  cursor: "pointer",
                  height: "100%",
                  borderRadius: 12,
                  border: isActive
                    ? `2px solid ${color}`
                    : `1px solid ${token.colorBorderSecondary}`,
                  boxShadow: isActive
                    ? `0 4px 16px ${color}22`
                    : "0 1px 4px rgba(0,0,0,0.04)",
                  transition: "all 0.2s ease",
                }}
                onClick={() => setActiveTab(a.type)}
              >
                {/* Top accent bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${color}, ${color}88)`,
                    borderRadius: "12px 12px 0 0",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontWeight: 600,
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {acctName(a)}
                    </Text>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color,
                        marginTop: 8,
                        fontFamily: "monospace",
                        lineHeight: 1,
                      }}
                    >
                      {fmtAmt(a.balance ?? 0)}
                    </div>
                    <Text
                      type="secondary"
                      style={{ fontSize: 11, marginTop: 6, display: "block" }}
                    >
                      {a.children?.length ?? 0}{" "}
                      {t("accounting.coa.subAccounts", lang)}
                    </Text>
                  </div>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${color}12`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginInlineStart: 8,
                    }}
                  >
                    <IconComp style={{ fontSize: 16, color }} />
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* ── Actions row ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setNewAccountModalOpen(true)}
          style={{ borderRadius: 8 }}
        >
          {t("accounting.coa.newAccount", lang)}
        </Button>
        <Space size={8}>
          <Input
            prefix={
              <SearchOutlined style={{ color: token.colorTextQuaternary }} />
            }
            placeholder={t("accounting.coa.searchPlaceholder", lang)}
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 200, borderRadius: 8 }}
          />
          <Button
            icon={<DownloadOutlined />}
            style={{ borderRadius: 8 }}
          >
            {t("accounting.coa.export", lang)}
          </Button>
        </Space>
      </div>

      {/* ── Main tree card ───────────────────────────────────────────────── */}
      <Card
        styles={{
          body: { padding: 0 },
          header: { borderBottom: "none", paddingBottom: 0 },
        }}
        style={{ borderRadius: 12, overflow: "hidden" }}
        title={
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              style={{ marginBottom: 0 }}
              size="small"
            />
          </div>
        }
      >
        <Divider style={{ margin: 0 }} />
        <div style={{ padding: "12px 16px" }}>
          <Tree
            treeData={buildTree(visibleRoots)}
            expandedKeys={expandedKeys}
            onExpand={keys => setExpandedKeys(keys)}
            blockNode
            showLine={{ showLeafIcon: false }}
            style={{ fontSize: 13 }}
          />
        </div>
      </Card>

      {/* ── Enhanced Account Detail Drawer ──────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        placement={isRTL ? "left" : "right"}
        size={isMobile ? "100%" : 480}
        title={null}
        closable={false}
        destroyOnHidden
        styles={{
          body: {
            padding: 0,
            background: token.colorBgLayout,
            display: "flex",
            flexDirection: "column",
          },
          mask: { backdropFilter: "blur(2px)", background: "rgba(0,0,0,0.35)" },
        }}
      >
        {selected && (
          <>
            {/* ── Gradient header ─────────────────────────────────────── */}
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  background: `linear-gradient(135deg, ${typeColor} 0%, ${typeColor}dd 100%)`,
                  padding: "22px 24px 60px",
                }}
              >
                {/* top bar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {history.length > 0 && (
                      <button
                        onClick={goBack}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.18)",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 13,
                        }}
                      >
                        <ArrowLeftOutlined />
                      </button>
                    )}
                    <div
                      style={{
                        background: "rgba(255,255,255,0.18)",
                        borderRadius: 6,
                        padding: "3px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#fff",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {selected.children?.length
                        ? t("accounting.coa.groupAccount", lang)
                        : t("accounting.coa.leafAccount", lang)}
                    </div>
                  </div>
                  <button
                    onClick={closeDrawer}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.18)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 13,
                    }}
                  >
                    <CloseOutlined />
                  </button>
                </div>
                {/* account info */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.22)",
                      border: "2px solid rgba(255,255,255,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#fff",
                      fontFamily: "monospace",
                      flexShrink: 0,
                    }}
                  >
                    {selected.code}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#fff",
                        lineHeight: 1.2,
                      }}
                    >
                      {acctName(selected)}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.72)",
                        marginTop: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span>
                        {t(
                          `accounting.coa.type${selected.type.charAt(0).toUpperCase() + selected.type.slice(1)}`,
                          lang
                        )}
                      </span>
                      <span>&middot;</span>
                      <span>{selected.subType}</span>
                      {!selected.isActive && (
                        <>
                          <span>&middot;</span>
                          <Tag
                            style={{
                              borderRadius: 20,
                              fontSize: 10,
                              background: "rgba(255,255,255,0.2)",
                              color: "#fff",
                              border: "none",
                              margin: 0,
                            }}
                          >
                            {t("accounting.coa.inactive", lang)}
                          </Tag>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {/* balance in header */}
                <div
                  style={{
                    marginTop: 18,
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      borderRadius: 10,
                      padding: "10px 16px",
                      flex: 1,
                      minWidth: 120,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.6)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {t("accounting.coa.balance", lang)}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#fff",
                        marginTop: 2,
                        fontFamily: "monospace",
                      }}
                    >
                      {fmtAmt(selected.balance ?? 0)}
                    </div>
                  </div>
                </div>
              </div>
              {/* curved bottom mask */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 28,
                  background: token.colorBgLayout,
                  borderRadius: "24px 24px 0 0",
                }}
              />
            </div>

            {/* ── Scrollable content ──────────────────────────────────── */}
            <div
              style={{ flex: 1, overflowY: "auto", padding: "4px 20px 20px" }}
            >
              <Space orientation="vertical" size={14} style={{ width: "100%" }}>
                {/* Account details card */}
                <div
                  style={{
                    background: token.colorBgContainer,
                    borderRadius: 10,
                    padding: "16px",
                    border: `1px solid ${token.colorBorderSecondary}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: token.colorTextSecondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 12,
                    }}
                  >
                    {t("accounting.coa.accountDetails", lang)}
                  </div>
                  <Descriptions
                    column={1}
                    size="small"
                    colon={false}
                    styles={{
                      label: {
                        fontWeight: 600,
                        color: token.colorTextSecondary,
                        fontSize: 12,
                        width: 130,
                      },
                      content: { fontSize: 13 },
                    }}
                  >
                    <Descriptions.Item label={t("accounting.coa.code", lang)}>
                      <Text
                        style={{ fontFamily: "monospace", fontWeight: 600 }}
                      >
                        {selected.code}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={t("accounting.coa.type", lang)}>
                      <Tag color={typeColor} style={{ borderRadius: 20 }}>
                        {t(
                          `accounting.coa.type${selected.type.charAt(0).toUpperCase() + selected.type.slice(1)}`,
                          lang
                        )}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={t("accounting.coa.subType", lang)}
                    >
                      {selected.subType}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={t("accounting.coa.normalBalance", lang)}
                    >
                      <Tag
                        color={
                          selected.normalBalance === "debit" ? "blue" : "green"
                        }
                        style={{ borderRadius: 20 }}
                      >
                        {selected.normalBalance === "debit"
                          ? t("accounting.coa.debitDr", lang)
                          : t("accounting.coa.creditCr", lang)}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={t("accounting.coa.status", lang)}>
                      <Badge
                        status={selected.isActive ? "success" : "default"}
                        text={
                          selected.isActive
                            ? t("accounting.coa.active", lang)
                            : t("accounting.coa.inactive", lang)
                        }
                      />
                    </Descriptions.Item>
                  </Descriptions>
                  {acctDescription(selected) && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: "10px 12px",
                        background: token.colorBgLayout,
                        borderRadius: 8,
                        fontSize: 12,
                        color: token.colorTextSecondary,
                        lineHeight: 1.6,
                      }}
                    >
                      {acctDescription(selected)}
                    </div>
                  )}
                </div>

                {/* Sub-accounts section */}
                {selected.children && selected.children.length > 0 && (
                  <div
                    style={{
                      background: token.colorBgContainer,
                      borderRadius: 10,
                      padding: "16px",
                      border: `1px solid ${token.colorBorderSecondary}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: token.colorTextSecondary,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {t("accounting.coa.subAccountsSection", lang)} (
                        {selected.children.length})
                      </div>
                      <Button
                        type="link"
                        size="small"
                        icon={<PlusOutlined />}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: typeColor,
                        }}
                        onClick={() => setChildModalOpen(true)}
                      >
                        {t("accounting.coa.add", lang)}
                      </Button>
                    </div>
                    <Space
                      orientation="vertical"
                      size={6}
                      style={{ width: "100%" }}
                    >
                      {selected.children.map(c => (
                        <div
                          key={c.code}
                          onClick={() => openAccount(c)}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 12px",
                            borderRadius: 8,
                            border: `1px solid ${token.colorBorderSecondary}`,
                            cursor: "pointer",
                            transition: "all 0.15s",
                            background: token.colorBgLayout,
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor =
                              typeColor + "60";
                            e.currentTarget.style.background = typeColor + "08";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor =
                              token.colorBorderSecondary;
                            e.currentTarget.style.background =
                              token.colorBgLayout;
                          }}
                        >
                          <Space size={8}>
                            {c.children?.length ? (
                              <FolderOutlined
                                style={{ color: typeColor, fontSize: 13 }}
                              />
                            ) : (
                              <FileTextOutlined
                                style={{
                                  color: token.colorTextTertiary,
                                  fontSize: 12,
                                }}
                              />
                            )}
                            <Text
                              style={{ fontFamily: "monospace", fontSize: 11 }}
                              type="secondary"
                            >
                              {c.code}
                            </Text>
                            <Text style={{ fontSize: 13 }}>{acctName(c)}</Text>
                            {!c.isActive && (
                              <Tag style={{ borderRadius: 20, fontSize: 10 }}>
                                Off
                              </Tag>
                            )}
                          </Space>
                          <Text
                            style={{
                              fontFamily: "monospace",
                              fontWeight: 600,
                              fontSize: 12,
                              color:
                                (c.balance ?? 0) < 0
                                  ? token.colorError
                                  : token.colorTextSecondary,
                            }}
                          >
                            {fmtAmt(c.balance ?? 0)}
                          </Text>
                        </div>
                      ))}
                    </Space>
                  </div>
                )}
              </Space>
            </div>

            {/* ── Sticky footer ───────────────────────────────────────── */}
            <div
              style={{
                background: token.colorBgContainer,
                borderTop: `1px solid ${token.colorBorderSecondary}`,
                padding: "12px 20px",
                display: "flex",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <Button
                type="primary"
                icon={<SubnodeOutlined />}
                onClick={() => setChildModalOpen(true)}
                style={{
                  flex: 1,
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${typeColor}, ${typeColor}dd)`,
                  border: "none",
                  boxShadow: `0 4px 12px ${typeColor}44`,
                }}
              >
                {t("accounting.coa.addChild", lang)}
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={() => setEditModalOpen(true)}
              >
                {t("accounting.coa.edit", lang)}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
                onClick={() => {
                  if (selected?.id) {
                    Modal.confirm({
                      title: t("accounting.coa.deleteAccount", lang),
                      content: `${t("accounting.coa.deleteConfirm", lang)} "${acctName(selected)}"?`,
                      okText: t("accounting.coa.delete", lang),
                      okType: "danger",
                      onOk: () => deleteMutation.mutate(selected.id!),
                    });
                  }
                }}
              >
                {t("accounting.coa.delete", lang)}
              </Button>
            </div>
          </>
        )}
      </Drawer>

      {/* ── Create Child Account Modal ──────────────────────────────────── */}
      <CreateChildModal
        open={childModalOpen}
        parent={selected}
        onClose={() => setChildModalOpen(false)}
        acctName={acctName}
        lang={lang}
      />
      <CreateChildModal
        open={newAccountModalOpen}
        parent={null}
        onClose={() => setNewAccountModalOpen(false)}
        acctName={acctName}
        lang={lang}
      />

      {/* ── Edit Account Modal ──────────────────────────────────────────── */}
      <CreateChildModal
        open={editModalOpen}
        parent={null}
        editAccount={selected}
        onClose={() => setEditModalOpen(false)}
        acctName={acctName}
        lang={lang}
      />
    </>
  );
}

export default function ChartOfAccounts() {
  const lang = useLangStore(s => s.lang);
  const isRTL = lang === "ar";

  return (
    <DashboardLayout
      currentPage={t("accounting.coa.title", lang)}
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        { label: t("ACCOUNTING", lang) },
        { label: t("accounting.coa.title", lang) },
      ]}
    >
      <div style={{ direction: isRTL ? "rtl" : "ltr" }}>
        <ChartOfAccountsContent />
      </div>
    </DashboardLayout>
  );
}

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme as antTheme,
  Empty,
} from "antd";
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  InboxOutlined,
  BankOutlined,
  TeamOutlined,
  ShopOutlined,
  SettingOutlined,
  CloseOutlined,
  RightOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  useNotificationsStore,
  type Notification,
  type NotifType,
  type NotifModule,
} from "@/store/notificationsStore";

const { Text } = Typography;
const { Option } = Select;

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<
  NotifType,
  { icon: React.ReactNode; color: string; label: string }
> = {
  success: {
    icon: <CheckCircleOutlined />,
    color: "#10B981",
    label: "Success",
  },
  warning: { icon: <WarningOutlined />, color: "#F59E0B", label: "Warning" },
  error: { icon: <CloseCircleOutlined />, color: "#EF4444", label: "Error" },
  info: { icon: <InfoCircleOutlined />, color: "#3B82F6", label: "Info" },
};

const MODULE_CFG: Record<
  NotifModule,
  { icon: React.ReactNode; color: string }
> = {
  Orders: { icon: <ShoppingOutlined />, color: "#6366F1" },
  Inventory: { icon: <InboxOutlined />, color: "#F59E0B" },
  Finance: { icon: <BankOutlined />, color: "#10B981" },
  HR: { icon: <TeamOutlined />, color: "#EC4899" },
  POS: { icon: <ShopOutlined />, color: "#0066CC" },
  System: { icon: <SettingOutlined />, color: "#A855F7" },
};

const MODULES: NotifModule[] = [
  "Orders",
  "Inventory",
  "Finance",
  "HR",
  "POS",
  "System",
];
const TYPES: NotifType[] = ["success", "warning", "error", "info"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Notifications() {
  const { token } = antTheme.useToken();
  const [, navigate] = useLocation();

  const { items, markRead, markAllRead, remove, clearAll } =
    useNotificationsStore();
  const unread = items.filter(n => !n.read).length;

  const [search, setSearch] = useState("");
  const [tabFilter, setTabFilter] = useState<"all" | "unread" | "read">("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = items.filter(n => {
    if (tabFilter === "unread" && n.read) return false;
    if (tabFilter === "read" && !n.read) return false;
    if (moduleFilter !== "all" && n.module !== moduleFilter) return false;
    if (typeFilter !== "all" && n.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !n.title.toLowerCase().includes(q) &&
        !n.message.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const columns: ColumnsType<Notification> = [
    {
      title: "",
      key: "unread",
      width: 6,
      render: (_, n) =>
        !n.read ? (
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: TYPE_CFG[n.type].color,
              boxShadow: `0 0 5px ${TYPE_CFG[n.type].color}80`,
            }}
          />
        ) : null,
    },
    {
      title: "Type",
      key: "type",
      width: 100,
      filters: TYPES.map(t => ({ text: TYPE_CFG[t].label, value: t })),
      onFilter: (value, n) => n.type === value,
      render: (_, n) => {
        const cfg = TYPE_CFG[n.type];
        return (
          <Tag
            style={{
              background: `${cfg.color}15`,
              color: cfg.color,
              border: `1px solid ${cfg.color}30`,
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 11,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {cfg.icon} {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "Module",
      key: "module",
      width: 110,
      filters: MODULES.map(m => ({ text: m, value: m })),
      onFilter: (value, n) => n.module === value,
      render: (_, n) => {
        const cfg = MODULE_CFG[n.module];
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              color: cfg.color,
              background: `${cfg.color}12`,
              padding: "2px 8px",
              borderRadius: 6,
            }}
          >
            <span style={{ fontSize: 11 }}>{cfg.icon}</span>
            {n.module}
          </span>
        );
      },
    },
    {
      title: "Notification",
      key: "content",
      render: (_, n) => (
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: n.read ? 500 : 700,
              color: token.colorText,
              marginBottom: 2,
            }}
          >
            {n.title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: token.colorTextSecondary,
              lineHeight: 1.5,
            }}
          >
            {n.message}
          </div>
        </div>
      ),
    },
    {
      title: "Time",
      key: "time",
      width: 110,
      sorter: (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      defaultSortOrder: "ascend",
      render: (_, n) => (
        <span
          style={{
            fontSize: 12,
            color: token.colorTextTertiary,
            whiteSpace: "nowrap",
          }}
        >
          {formatTime(n.timestamp)}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      render: (_, n) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {n.href && (
            <Tooltip title="View">
              <Button
                type="text"
                size="small"
                icon={<RightOutlined />}
                onClick={() => {
                  markRead(n.id);
                  navigate(n.href!);
                }}
                style={{ borderRadius: 6, color: token.colorPrimary }}
              />
            </Tooltip>
          )}
          {!n.read && (
            <Tooltip title="Mark as read">
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => markRead(n.id)}
                style={{ borderRadius: 6, color: "#10B981" }}
              />
            </Tooltip>
          )}
          <Tooltip title="Dismiss">
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => remove(n.id)}
              style={{ borderRadius: 6, color: token.colorTextTertiary }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // ── Summary cards ──────────────────────────────────────────────────────────
  const typeBreakdown = TYPES.map(t => ({
    type: t,
    count: items.filter(n => n.type === t).length,
    ...TYPE_CFG[t],
  }));

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimary}cc)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 16,
              }}
            >
              <BellOutlined />
            </div>
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: token.colorText,
                  lineHeight: 1.2,
                }}
              >
                Notifications
              </div>
              <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
                {items.length} total · {unread} unread
              </div>
            </div>
            {unread > 0 && (
              <Badge count={unread} style={{ background: "#EF4444" }} />
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {unread > 0 && (
              <Button
                icon={<CheckOutlined />}
                onClick={markAllRead}
                style={{ borderRadius: 8 }}
              >
                Mark all read
              </Button>
            )}
            {items.length > 0 && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={clearAll}
                style={{ borderRadius: 8 }}
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Summary row */}
        <Row gutter={[12, 12]}>
          {typeBreakdown.map(t => (
            <Col xs={12} sm={6} key={t.type}>
              <Card
                style={{
                  border: `1px solid ${t.color}25`,
                  borderRadius: token.borderRadiusLG,
                  background: `${t.color}06`,
                  cursor: "pointer",
                  outline:
                    typeFilter === t.type ? `2px solid ${t.color}` : "none",
                }}
                styles={{ body: { padding: "12px 16px" } }}
                onClick={() =>
                  setTypeFilter(typeFilter === t.type ? "all" : t.type)
                }
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18, color: t.color }}>{t.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: t.color,
                        lineHeight: 1,
                      }}
                    >
                      {t.count}
                    </div>
                    <div
                      style={{ fontSize: 11, color: token.colorTextSecondary }}
                    >
                      {t.label}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Table card */}
        <Card
          style={{
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadiusLG,
          }}
          styles={{ body: { padding: 0 } }}
        >
          {/* Filter bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 20px",
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              flexWrap: "wrap",
            }}
          >
            {/* Read/unread pills */}
            <div style={{ display: "flex", gap: 4 }}>
              {(["all", "unread", "read"] as const).map(tab => {
                const count =
                  tab === "all"
                    ? items.length
                    : tab === "unread"
                      ? items.filter(n => !n.read).length
                      : items.filter(n => n.read).length;
                const isActive = tabFilter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setTabFilter(tab)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 20,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 500,
                      background: isActive
                        ? token.colorPrimary
                        : token.colorFillAlter,
                      color: isActive ? "#fff" : token.colorTextSecondary,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "all 0.15s",
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span
                      style={{
                        fontSize: 10,
                        background: isActive
                          ? "rgba(255,255,255,0.25)"
                          : token.colorFillSecondary,
                        color: isActive ? "#fff" : token.colorTextSecondary,
                        padding: "0 5px",
                        borderRadius: 8,
                        fontWeight: 700,
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                width: 1,
                height: 20,
                background: token.colorBorderSecondary,
              }}
            />

            {/* Search */}
            <Input
              placeholder="Search notifications…"
              prefix={
                <SearchOutlined style={{ color: token.colorTextTertiary }} />
              }
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
              style={{ width: 220, borderRadius: 8 }}
            />

            {/* Module filter */}
            <Select
              value={moduleFilter}
              onChange={setModuleFilter}
              style={{ width: 130, borderRadius: 8 }}
            >
              <Option value="all">All Modules</Option>
              {MODULES.map(m => (
                <Option key={m} value={m}>
                  {m}
                </Option>
              ))}
            </Select>

            {/* Type filter */}
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 120, borderRadius: 8 }}
            >
              <Option value="all">All Types</Option>
              {TYPES.map(t => (
                <Option key={t} value={t}>
                  {TYPE_CFG[t].label}
                </Option>
              ))}
            </Select>

            <Text
              type="secondary"
              style={{ fontSize: 12, marginInlineStart: "auto" }}
            >
              {filtered.length} of {items.length} notifications
            </Text>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div style={{ padding: "48px 24px" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span
                    style={{ color: token.colorTextSecondary, fontSize: 13 }}
                  >
                    No notifications match your filters
                  </span>
                }
              />
            </div>
          ) : (
            <Table<Notification>
              dataSource={filtered}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 15,
                showSizeChanger: false,
                showTotal: (total, range) => (
                  <span
                    style={{ fontSize: 12, color: token.colorTextSecondary }}
                  >
                    {range[0]}–{range[1]} of {total}
                  </span>
                ),
              }}
              onRow={n => ({
                style: {
                  background: n.read
                    ? "transparent"
                    : `${TYPE_CFG[n.type].color}05`,
                  cursor: "default",
                },
              })}
              scroll={{ x: "max-content" }}
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

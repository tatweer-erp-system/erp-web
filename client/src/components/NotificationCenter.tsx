import { useState, useEffect } from "react";
import { Badge, Button, Popover, Tooltip, theme as antTheme } from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  CheckOutlined,
  ShoppingOutlined,
  InboxOutlined,
  BankOutlined,
  TeamOutlined,
  ShopOutlined,
  SettingOutlined,
  RightOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useLocation } from "wouter";
import {
  AlertOutlined,
} from "@ant-design/icons";
import {
  useNotificationsStore,
  type NotifType,
  type NotifModule,
  type Notification,
} from "@/store/notificationsStore";

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<NotifType, { icon: React.ReactNode; color: string }> = {
  success: { icon: <CheckCircleOutlined />,  color: "#10B981" },
  warning: { icon: <WarningOutlined />,      color: "#F59E0B" },
  error:   { icon: <CloseCircleOutlined />,  color: "#EF4444" },
  info:    { icon: <InfoCircleOutlined />,   color: "#3B82F6" },
};

const MODULE_CFG: Record<NotifModule, { icon: React.ReactNode; color: string }> = {
  Orders:    { icon: <ShoppingOutlined />,  color: "#6366F1" },
  Inventory: { icon: <InboxOutlined />,     color: "#F59E0B" },
  Finance:   { icon: <BankOutlined />,      color: "#10B981" },
  HR:        { icon: <TeamOutlined />,      color: "#EC4899" },
  POS:       { icon: <ShopOutlined />,      color: "#0066CC" },
  System:    { icon: <SettingOutlined />,   color: "#A855F7" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function groupByDate(items: Notification[]): { label: string; items: Notification[] }[] {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const today     = items.filter((n) => n.timestamp >= todayStart);
  const yesterday = items.filter((n) => n.timestamp >= yesterdayStart && n.timestamp < todayStart);
  const earlier   = items.filter((n) => n.timestamp < yesterdayStart);

  const groups: { label: string; items: Notification[] }[] = [];
  if (today.length)     groups.push({ label: "Today",     items: today });
  if (yesterday.length) groups.push({ label: "Yesterday", items: yesterday });
  if (earlier.length)   groups.push({ label: "Earlier",   items: earlier });
  return groups;
}

// ─── Bell animation ───────────────────────────────────────────────────────────

const bellKeyframes = `
@keyframes bell-ring {
  0%   { transform: rotate(0); }
  10%  { transform: rotate(14deg); }
  20%  { transform: rotate(-10deg); }
  30%  { transform: rotate(14deg); }
  40%  { transform: rotate(-8deg); }
  50%  { transform: rotate(10deg); }
  60%  { transform: rotate(0); }
  100% { transform: rotate(0); }
}
@keyframes badge-pulse {
  0%, 100% { box-shadow: 0 0 0 0 #EF444460; }
  50%       { box-shadow: 0 0 0 5px #EF444400; }
}
`;

// ─── Main component ───────────────────────────────────────────────────────────

export default function NotificationCenter() {
  const { token } = antTheme.useToken();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");
  const [bellAnimating, setBellAnimating] = useState(false);

  const { items, markRead, remove, markAllRead, clearAll } = useNotificationsStore();
  const unread = items.filter((n) => !n.read).length;

  // Animate bell on new unread
  useEffect(() => {
    if (unread > 0) {
      setBellAnimating(true);
      const id = setTimeout(() => setBellAnimating(false), 1500);
      return () => clearTimeout(id);
    }
  }, [unread]);

  const displayItems =
    activeTab === "unread" ? items.filter((n) => !n.read)
    : activeTab === "read"  ? items.filter((n) => n.read)
    : items;

  const groups = groupByDate(displayItems);

  // ── Notification item ──────────────────────────────────────────────────────
  function NotifItem({ n }: { n: Notification }) {
    const [hovered, setHovered] = useState(false);
    const typeCfg = TYPE_CFG[n.type];
    const modCfg  = MODULE_CFG[n.module];
    const isLowStock = n.meta?.notifKind === "inventory.low_stock";

    return (
      <div
        onClick={() => { markRead(n.id); if (n.href) { navigate(n.href); setOpen(false); } }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          gap: 12,
          padding: "11px 16px",
          cursor: "pointer",
          background: hovered
            ? token.colorFillAlter
            : n.read ? "transparent" : `${typeCfg.color}08`,
          borderLeft: n.read ? `3px solid transparent` : `3px solid ${typeCfg.color}`,
          transition: "background 0.15s",
          position: "relative",
        }}
      >
        {/* Icon circle */}
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: `${typeCfg.color}18`,
          border: `1.5px solid ${typeCfg.color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, color: typeCfg.color, flexShrink: 0, marginTop: 1,
        }}>
          {isLowStock ? <AlertOutlined /> : typeCfg.icon}
        </div>

        {/* Body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{
              fontSize: 13,
              fontWeight: n.read ? 500 : 700,
              color: token.colorText,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}>
              {n.title}
            </span>
            {!n.read && (
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: typeCfg.color, flexShrink: 0,
                boxShadow: `0 0 5px ${typeCfg.color}80`,
              }} />
            )}
          </div>

          <div style={{
            fontSize: 12,
            color: token.colorTextSecondary,
            lineHeight: 1.4,
            marginBottom: 6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {n.message}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Module tag */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              fontSize: 10, fontWeight: 700, color: modCfg.color,
              background: `${modCfg.color}15`, padding: "1px 6px", borderRadius: 5,
            }}>
              <span style={{ fontSize: 9 }}>{modCfg.icon}</span>
              {n.module}
            </span>
            <span style={{ fontSize: 11, color: token.colorTextTertiary }}>{formatTime(n.timestamp)}</span>
            {n.href && (
              <span style={{
                fontSize: 10, color: token.colorPrimary,
                display: "flex", alignItems: "center", gap: 2,
                marginInlineStart: "auto",
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.15s",
              }}>
                View <RightOutlined style={{ fontSize: 9 }} />
              </span>
            )}
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={(e) => { e.stopPropagation(); remove(n.id); }}
          style={{
            position: "absolute", top: 8, right: 10,
            width: 20, height: 20, border: "none", background: "transparent",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: token.colorTextTertiary, borderRadius: 4,
            opacity: hovered ? 1 : 0, transition: "opacity 0.15s, background 0.1s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = token.colorFillSecondary)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <CloseOutlined style={{ fontSize: 10 }} />
        </button>
      </div>
    );
  }

  // ── Panel ──────────────────────────────────────────────────────────────────
  const content = (
    <div style={{ width: 400 }}>
      <style>{bellKeyframes}</style>

      {/* Header */}
      <div style={{
        padding: "14px 16px 10px",
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimary}cc)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 13,
            }}>
              <BellOutlined />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: token.colorText }}>Notifications</span>
            {unread > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 800,
                background: "#EF4444", color: "#fff",
                padding: "1px 7px", borderRadius: 10, lineHeight: "18px",
              }}>
                {unread} new
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {unread > 0 && (
              <Tooltip title="Mark all as read">
                <button
                  onClick={markAllRead}
                  style={{
                    width: 28, height: 28, border: "none", borderRadius: 6,
                    background: token.colorFillAlter, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: token.colorTextSecondary, fontSize: 12,
                  }}
                >
                  <CheckOutlined />
                </button>
              </Tooltip>
            )}
            {items.length > 0 && (
              <Tooltip title="Clear all">
                <button
                  onClick={clearAll}
                  style={{
                    width: 28, height: 28, border: "none", borderRadius: 6,
                    background: token.colorFillAlter, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: token.colorTextSecondary, fontSize: 12,
                  }}
                >
                  <DeleteOutlined />
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Tab pills */}
        <div style={{ display: "flex", gap: 4 }}>
          {(["all", "unread", "read"] as const).map((tab) => {
            const count =
              tab === "all"    ? items.length
              : tab === "unread" ? items.filter((n) => !n.read).length
              : items.filter((n) => n.read).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "4px 12px", borderRadius: 20, border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: isActive ? 700 : 500,
                  background: isActive ? token.colorPrimary : token.colorFillAlter,
                  color: isActive ? "#fff" : token.colorTextSecondary,
                  display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s",
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span style={{
                  fontSize: 10,
                  background: isActive ? "rgba(255,255,255,0.25)" : token.colorFillSecondary,
                  color: isActive ? "#fff" : token.colorTextSecondary,
                  padding: "0 5px", borderRadius: 8, fontWeight: 700,
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: 420, overflowY: "auto" }}>
        {displayItems.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center" }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: token.colorFillAlter,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px", fontSize: 20, color: token.colorTextTertiary,
            }}>
              <BellOutlined />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: token.colorText, marginBottom: 4 }}>
              {activeTab === "unread" ? "You're all caught up!" : "No notifications"}
            </div>
            <div style={{ fontSize: 12, color: token.colorTextTertiary }}>
              {activeTab === "unread"
                ? "All notifications have been read."
                : "Nothing to show here yet."}
            </div>
          </div>
        ) : (
          groups.map((group, gi) => (
            <div key={group.label}>
              {/* Group label */}
              <div style={{
                padding: "6px 16px 4px",
                fontSize: 11, fontWeight: 700,
                color: token.colorTextTertiary,
                textTransform: "uppercase", letterSpacing: "0.06em",
                background: token.colorBgLayout,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                borderTop: gi > 0 ? `1px solid ${token.colorBorderSecondary}` : undefined,
              }}>
                {group.label}
              </div>

              {group.items.map((n, i) => (
                <div key={n.id}>
                  <NotifItem n={n} />
                  {i < group.items.length - 1 && (
                    <div style={{ height: 1, background: token.colorBorderSecondary, opacity: 0.4, margin: "0 16px" }} />
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div style={{
          padding: "10px 16px",
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          display: "flex",
          justifyContent: "center",
        }}>
          <button
            onClick={() => { setOpen(false); navigate("/notifications"); }}
            style={{
              border: "none", background: "transparent", cursor: "pointer",
              fontSize: 12, fontWeight: 600, color: token.colorPrimary,
              display: "flex", alignItems: "center", gap: 4,
              padding: "4px 8px", borderRadius: 6,
            }}
          >
            View all notifications <RightOutlined style={{ fontSize: 10 }} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{bellKeyframes}</style>
      <Popover
        content={content}
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="bottomRight"
        arrow={false}
        overlayInnerStyle={{ padding: 0, borderRadius: 12, overflow: "hidden" }}
        overlayStyle={{ boxShadow: "0 8px 32px rgba(0,0,0,0.14)" }}
      >
        <Badge
          count={unread}
          size="small"
          offset={[-2, 2]}
          style={{ animation: unread > 0 ? "badge-pulse 2s ease-in-out infinite" : "none" }}
        >
          <Button
            type="text"
            style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}
            icon={
              <BellOutlined
                style={{
                  fontSize: 17,
                  color: open ? token.colorPrimary : undefined,
                  display: "inline-block",
                  animation: bellAnimating ? "bell-ring 1s ease" : "none",
                  transformOrigin: "top center",
                }}
              />
            }
          />
        </Badge>
      </Popover>
    </>
  );
}

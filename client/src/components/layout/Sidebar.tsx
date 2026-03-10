import { memo, useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { Menu, Dropdown, Tooltip, theme as antTheme } from "antd";
import type { MenuProps } from "antd";
import {
  // Layout
  LogoutOutlined,
  EnvironmentOutlined,
  CheckOutlined,
  DownOutlined,
  // Navigation
  DashboardOutlined,
  // Definitions
  DatabaseOutlined,
  // Sales
  TeamOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  FileProtectOutlined,
  RollbackOutlined,
  WalletOutlined,
  LineChartOutlined,
  // Purchases
  CarOutlined,
  ShoppingOutlined,
  SnippetsOutlined,
  UndoOutlined,
  DollarOutlined,
  OrderedListOutlined,
  // Inventory
  AppstoreOutlined,
  TagsOutlined,
  ColumnWidthOutlined,
  HomeOutlined,
  InboxOutlined,
  ControlOutlined,
  SwapOutlined,
  AuditOutlined,
  StockOutlined,
  BarChartOutlined,
  // Accounting
  UnorderedListOutlined,
  BookOutlined,
  ReadOutlined,
  FundOutlined,
  CalendarOutlined,
  LockOutlined,
  FileSearchOutlined,
  CalculatorOutlined,
  ContainerOutlined,
  PieChartOutlined,
  NodeIndexOutlined,
  // Treasury
  AccountBookOutlined,
  BankOutlined,
  MoneyCollectOutlined,
  PayCircleOutlined,
  RetweetOutlined,
  CheckSquareOutlined,
  // HR
  UsergroupAddOutlined,
  ApartmentOutlined,
  SolutionOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  AreaChartOutlined,
  // Reports
  // Settings
  BellOutlined,
  PercentageOutlined,
  SettingOutlined,
  TrophyOutlined,
  TagOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { t } from "@/i18n";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useAuthContext } from "@/contexts/AuthContext";
import type React from "react";

// ─── Nav Data ─────────────────────────────────────────────────────────────────

interface NavItem {
  name: string;
  icon?: React.ReactNode;
  href?: string;
  submenu?: NavItem[];
  isHeader?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", icon: <DashboardOutlined />, href: "/" },

  { name: "POS", isHeader: true },
  { name: "Loyalty Report", icon: <TrophyOutlined />, href: "/pos/loyalty-report" },
  { name: "Vouchers Report", icon: <TagOutlined />, href: "/pos/reports/vouchers" },
  { name: "Gift Cards Report", icon: <GiftOutlined />, href: "/pos/reports/gift-cards" },
  { name: "Definitions",  icon: <DatabaseOutlined />, href: "/pos-definitions" },
  { name: "POS Settings", icon: <SettingOutlined />,  href: "/pos/settings" },

  { name: "SALES", isHeader: true },
  { name: "Customers", icon: <TeamOutlined />, submenu: [
    { name: "All Customers",   href: "/all-customers" },
    { name: "Customer Groups", href: "/customer-groups" },
  ]},
  { name: "Quotations",           icon: <FileTextOutlined />,    href: "/quotations" },
  { name: "Sales Orders",         icon: <ShoppingCartOutlined />, submenu: [
    { name: "All Orders",       href: "/all-orders" },
    { name: "Pending",          href: "/pending-orders" },
    { name: "Completed",        href: "/completed-orders" },
  ]},
  { name: "Sales Invoices",       icon: <FileProtectOutlined />, href: "/sales-invoices" },
  { name: "Sales Returns",        icon: <RollbackOutlined />,    href: "/sales-returns" },
  { name: "Customer Receipts",    icon: <WalletOutlined />,      href: "/customer-receipts" },
  { name: "Customer Statements",  icon: <LineChartOutlined />,   href: "/customer-statements" },
  { name: "Definitions",          icon: <DatabaseOutlined />,    href: "/sales-definitions" },
  { name: "Sales Settings",       icon: <SettingOutlined />,     href: "/settings/sales" },

  { name: "PURCHASES", isHeader: true },
  { name: "Vendors", icon: <CarOutlined />, submenu: [
    { name: "All Vendors",    href: "/all-vendors" },
    { name: "Vendor Groups",  href: "/vendor-groups" },
  ]},
  { name: "Purchase Orders",   icon: <ShoppingOutlined />,  href: "/purchase-orders" },
  { name: "Purchase Invoices", icon: <SnippetsOutlined />,  href: "/purchase-invoices" },
  { name: "Purchase Returns",  icon: <UndoOutlined />,      href: "/purchase-returns" },
  { name: "Vendor Payments",   icon: <DollarOutlined />,    href: "/vendor-payments" },
  { name: "Vendor Statements", icon: <OrderedListOutlined />,href: "/vendor-statements" },
  { name: "Definitions",       icon: <DatabaseOutlined />,  href: "/purchases-definitions" },
  { name: "Purchases Settings",icon: <SettingOutlined />,   href: "/settings/purchases" },

  { name: "INVENTORY", isHeader: true },
  { name: "Products", icon: <AppstoreOutlined />, submenu: [
    { name: "All Products", href: "/product-details" },
    { name: "In Stock",     href: "/product-details" },
    { name: "Low Stock",    href: "/product-details" },
  ]},
  { name: "Product Categories",    icon: <TagsOutlined />,       href: "/product-categories" },
  { name: "Units of Measure",      icon: <ColumnWidthOutlined />,href: "/units-of-measure" },
  { name: "Warehouses",            icon: <HomeOutlined />,        href: "/warehouses" },
  { name: "Opening Stock",         icon: <InboxOutlined />,       href: "/opening-stock" },
  { name: "Stock Adjustments",     icon: <ControlOutlined />,    href: "/stock-adjustments" },
  { name: "Stock Transfers",       icon: <SwapOutlined />,        href: "/stock-transfers" },
  { name: "Stock Count",           icon: <AuditOutlined />,       href: "/stock-count" },
  { name: "Inventory Valuation",   icon: <StockOutlined />,       href: "/inventory-valuation" },
  { name: "Stock Movement Report", icon: <BarChartOutlined />,   href: "/stock-movement" },
  { name: "Definitions",           icon: <DatabaseOutlined />,   href: "/inventory-definitions" },
  { name: "Inventory Settings",    icon: <SettingOutlined />,    href: "/settings/inventory" },

  { name: "ACCOUNTING", isHeader: true },
  { name: "Chart of Accounts",  icon: <UnorderedListOutlined />, href: "/chart-of-accounts" },
  { name: "Journal Entries",    icon: <BookOutlined />,          href: "/journal-entries" },
  { name: "Journal Types",      icon: <ReadOutlined />,          href: "/journal-types" },
  { name: "Opening Balances",   icon: <FundOutlined />,          href: "/opening-balances" },
  { name: "Fiscal Years",       icon: <CalendarOutlined />,      href: "/fiscal-years" },
  { name: "Period Closing",     icon: <LockOutlined />,          href: "/period-closing" },
  { name: "Account Statements", icon: <FileSearchOutlined />,    href: "/account-statements" },
  { name: "Trial Balance",      icon: <CalculatorOutlined />,    href: "/trial-balance" },
  { name: "General Ledger",     icon: <ContainerOutlined />,     href: "/general-ledger" },
  { name: "Income Statement",   icon: <LineChartOutlined />,     href: "/income-statement" },
  { name: "Balance Sheet",      icon: <PieChartOutlined />,      href: "/balance-sheet" },
  { name: "Cash Flow Statement",icon: <NodeIndexOutlined />,     href: "/cash-flow" },
  { name: "Definitions",        icon: <DatabaseOutlined />,      href: "/accounting-definitions" },
  { name: "Accounting Settings",icon: <SettingOutlined />,       href: "/settings/accounting" },

  { name: "TREASURY", isHeader: true },
  { name: "Cash Accounts",       icon: <AccountBookOutlined />,  href: "/cash-accounts" },
  { name: "Bank Accounts",       icon: <BankOutlined />,         href: "/bank-accounts" },
  { name: "Receipts",            icon: <MoneyCollectOutlined />, href: "/receipts" },
  { name: "Payments",            icon: <PayCircleOutlined />,   href: "/payments" },
  { name: "Bank Transfers",      icon: <RetweetOutlined />,      href: "/bank-transfers" },
  { name: "Bank Reconciliation", icon: <CheckSquareOutlined />,  href: "/bank-reconciliation" },
  { name: "Definitions",         icon: <DatabaseOutlined />,     href: "/treasury-definitions" },
  { name: "Treasury Settings",   icon: <SettingOutlined />,      href: "/settings/treasury" },

  { name: "HR", isHeader: true },
  { name: "Employees", icon: <UsergroupAddOutlined />, submenu: [
    { name: "All Employees",    href: "/employees" },
    { name: "Employee Details", href: "/employee-details" },
  ]},
  { name: "Departments",      icon: <ApartmentOutlined />,  href: "/departments" },
  { name: "Job Positions",    icon: <SolutionOutlined />,   href: "/job-positions" },
  { name: "Attendance",       icon: <ClockCircleOutlined />,href: "/attendance" },
  { name: "Leave Management", icon: <CalendarOutlined />,   href: "/leave-management" },
  { name: "Payroll",          icon: <DollarOutlined />,     href: "/payroll" },
  { name: "Training",         icon: <IdcardOutlined />,     href: "/training" },
  { name: "Definitions",      icon: <DatabaseOutlined />,   href: "/hr-definitions" },
  { name: "HR Settings",      icon: <SettingOutlined />,    href: "/settings/hr" },

  { name: "REPORTS", isHeader: true },
  { name: "Sales Reports",      icon: <BarChartOutlined />,  href: "/sales-reports" },
  { name: "Purchase Reports",   icon: <ShoppingOutlined />,  href: "/purchase-reports" },
  { name: "Inventory Reports",  icon: <AppstoreOutlined />,  href: "/inventory-reports" },
  { name: "Financial Reports",  icon: <AreaChartOutlined />, href: "/financial-reports" },
  { name: "Aging Reports",      icon: <BarChartOutlined />,  href: "/aging-reports" },
  { name: "Tax Reports",        icon: <PercentageOutlined />,href: "/tax-reports" },
  { name: "Definitions",        icon: <DatabaseOutlined />,  href: "/reports-definitions" },
  { name: "Reports Settings",   icon: <SettingOutlined />,   href: "/settings/reports" },

  { name: "SETTINGS", isHeader: true },
  { name: "Company Profile",       icon: <ApartmentOutlined />,    href: "/settings/company" },
  { name: "Users & Permissions",   icon: <UsergroupAddOutlined />, href: "/settings/users" },
  { name: "Notifications",         icon: <BellOutlined />,         href: "/settings/notifications" },
  { name: "Billing & Subscription",icon: <PayCircleOutlined />,   href: "/settings/billing" },
];


// ─── Menu Item Builder ────────────────────────────────────────────────────────

function buildMenuItems(
  items: NavItem[],
  lang: string,
  collapsed: boolean,
): Required<MenuProps>["items"] {
  const result: Required<MenuProps>["items"] = [];

  for (const item of items) {
    if (item.isHeader) {
      if (collapsed) {
        // Thin divider line between sections when collapsed
        result.push({ type: "divider", key: `div-${item.name}`, style: { margin: "6px 12px" } });
      } else {
        // Styled section header with flanking lines when expanded
        result.push({
          type: "group",
          key: `hdr-${item.name}`,
          label: (
            <span style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 4px 2px", userSelect: "none",
            }}>
              <span style={{ flex: 1, height: 1, background: "currentColor", opacity: 0.1 }} />
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
                textTransform: "uppercase", opacity: 0.45,
              }}>
                {t(item.name, lang)}
              </span>
              <span style={{ flex: 1, height: 1, background: "currentColor", opacity: 0.1 }} />
            </span>
          ),
        });
      }
      continue;
    }

    if (item.submenu) {
      result.push({
        key: item.name,
        icon: item.icon,
        label: t(item.name, lang),
        children: item.submenu.map((sub) => ({
          key: sub.href ?? sub.name,
          label: t(sub.name, lang),
        })),
      });
    } else {
      result.push({
        key: item.href ?? item.name,
        icon: item.icon,
        label: t(item.name, lang),
      });
    }
  }

  return result;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean;
  isRTL: boolean;
  language: string;
}

function SidebarInner({ isOpen, isRTL, language }: SidebarProps) {
  const { token } = antTheme.useToken();
  const [hovered, setHovered] = useState(false);
  const visible = isOpen || hovered;
  const collapsed = !visible;
  const [location, setLocation] = useLocation();
  const { branches, currentBranch, setBranch } = useAppSettings();
  const { logout } = useAuthContext();

  // Resolve which menu key to highlight — exact match first, then longest prefix
  // (handles /:tab sub-routes like /settings/company/profile)
  const activeMenuKey = (() => {
    const allLeaves: string[] = [];
    for (const item of NAV_ITEMS) {
      if (item.href) allLeaves.push(item.href);
      if (item.submenu) item.submenu.forEach((s) => s.href && allLeaves.push(s.href));
    }
    const exact = allLeaves.find((href) => href === location);
    if (exact) return exact;
    const prefix = allLeaves
      .filter((href) => location.startsWith(href + "/"))
      .sort((a, b) => b.length - a.length)[0];
    return prefix ?? location;
  })();

  // Auto-expand parent group of active route
  const getDefaultOpenKeys = () => {
    const keys: string[] = [];
    for (const item of NAV_ITEMS) {
      if (item.submenu?.some((s) => s.href === location)) keys.push(item.name);
    }
    return keys;
  };

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem("sidebarOpenKeys");
      return s ? JSON.parse(s) : getDefaultOpenKeys();
    } catch {
      return getDefaultOpenKeys();
    }
  });

  useEffect(() => {
    for (const item of NAV_ITEMS) {
      if (item.submenu?.some((s) => s.href === activeMenuKey) && !openKeys.includes(item.name)) {
        const next = [...openKeys, item.name];
        setOpenKeys(next);
        localStorage.setItem("sidebarOpenKeys", JSON.stringify(next));
      }
    }
  }, [activeMenuKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollRef = useRef<HTMLDivElement>(null);

  // On mount, scroll the active menu item into view
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const el = scrollRef.current?.querySelector(".ant-menu-item-selected") as HTMLElement | null;
      el?.scrollIntoView({ block: "nearest", behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleOpenChange(keys: string[]) {
    setOpenKeys(keys);
    localStorage.setItem("sidebarOpenKeys", JSON.stringify(keys));
  }

  // Derived colors
  const sidebarBg    = token.Layout?.siderBg    ?? token.colorBgContainer;
  const borderColor  = token.colorBorderSecondary;
  const primaryColor = token.colorPrimary;

  const [cardHovered, setCardHovered] = useState(false);

  const branchMenuItems: MenuProps["items"] = branches.map((branch) => {
    const isActive = branch.id === currentBranch.id;
    return {
      key: branch.id,
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 2px" }}>
          {/* Branch avatar */}
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: isActive
              ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)`
              : token.colorFillAlter,
            border: isActive ? `2px solid ${primaryColor}` : `2px solid ${token.colorBorderSecondary}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: isActive ? "#fff" : token.colorTextSecondary,
            fontWeight: 800, fontSize: 11,
            transition: "all 0.2s",
          }}>
            {branch.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? primaryColor : token.colorText }}>
              {branch.name}
            </div>
            <div style={{ fontSize: 11, color: token.colorTextTertiary, display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
              <EnvironmentOutlined style={{ fontSize: 9 }} />
              {branch.location}
            </div>
          </div>
          {isActive && (
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              background: `${primaryColor}18`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckOutlined style={{ color: primaryColor, fontSize: 11 }} />
            </div>
          )}
        </div>
      ),
    };
  });

  const menuItems = buildMenuItems(NAV_ITEMS, language, collapsed);
  const sidebarWidth = visible ? 256 : 64;

  return (
    <aside
      onMouseEnter={() => !isOpen && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        background: sidebarBg,
        borderRight: isRTL ? "none" : `1px solid ${borderColor}`,
        borderLeft:  isRTL ? `1px solid ${borderColor}` : "none",
        transition: "width 0.22s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {/* ── Brand + Branch (merged) ────────────────────────────────────── */}
      <div style={{
        padding: visible ? "10px 12px" : "10px 8px",
        borderBottom: `1px solid ${borderColor}`,
        flexShrink: 0,
        transition: "padding 0.22s",
      }}>
        {visible ? (
          /* Expanded — unified company + branch card */
          <Dropdown
            menu={{
              items: [
                {
                  key: "__company__",
                  type: "group",
                  label: (
                    <div style={{ padding: "6px 4px 10px", borderBottom: `1px solid ${borderColor}`, marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: 900, fontSize: 16,
                          boxShadow: `0 3px 10px ${primaryColor}40`,
                        }}>T</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: token.colorText, lineHeight: 1.2 }}>Tatweer</div>
                          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>Enterprise Suite · ERP</div>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "__branches_label__",
                  type: "group",
                  label: (
                    <div style={{ fontSize: 10, fontWeight: 700, color: token.colorTextTertiary, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 0 4px" }}>
                      Select Branch
                    </div>
                  ),
                },
                ...branchMenuItems,
              ],
              onClick: ({ key }) => { if (!key.startsWith("__")) setBranch(key); },
              style: { minWidth: 260, padding: "8px 6px 6px" },
            }}
            trigger={["click"]}
            placement={isRTL ? "bottomLeft" : "bottomRight"}
            disabled={branches.length <= 1}
          >
            <div
              onMouseEnter={() => setCardHovered(true)}
              onMouseLeave={() => setCardHovered(false)}
              style={{
                borderRadius: 12,
                cursor: branches.length > 1 ? "pointer" : "default",
                border: `1.5px solid ${cardHovered ? primaryColor + "70" : borderColor}`,
                background: cardHovered ? token.colorPrimaryBg : token.colorFillAlter,
                transition: "all 0.22s ease",
                transform: cardHovered ? "translateY(-1px)" : "translateY(0)",
                boxShadow: cardHovered ? `0 6px 20px ${primaryColor}22, 0 2px 8px rgba(0,0,0,0.08)` : "none",
                overflow: "hidden",
                userSelect: "none",
              }}
            >
              {/* ── Company row ───────────────────────────── */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px 8px" }}>
                {/* Logo */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 900, fontSize: 16,
                  boxShadow: `0 3px 12px ${primaryColor}50`,
                  transition: "transform 0.22s ease, box-shadow 0.22s ease",
                  transform: cardHovered ? "scale(1.08) rotate(-4deg)" : "scale(1) rotate(0deg)",
                }}>T</div>

                {/* Company name + subtitle */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: token.colorText, lineHeight: 1.2 }}>
                      Tatweer
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
                      background: cardHovered ? primaryColor : `${primaryColor}20`,
                      color: cardHovered ? "#fff" : primaryColor,
                      borderRadius: 4, padding: "1px 5px",
                      textTransform: "uppercase",
                      transition: "background 0.22s, color 0.22s",
                    }}>
                      ERP
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
                    Enterprise Suite
                  </div>
                </div>

                {/* Chevron */}
                {branches.length > 1 && (
                  <div style={{
                    color: cardHovered ? primaryColor : token.colorTextTertiary,
                    fontSize: 10, flexShrink: 0,
                    transition: "transform 0.22s ease, color 0.22s",
                    transform: cardHovered ? "translateY(1px)" : "translateY(0)",
                  }}>
                    <DownOutlined />
                  </div>
                )}
              </div>

              {/* ── Thin divider ──────────────────────────── */}
              <div style={{
                height: 1,
                background: cardHovered ? `${primaryColor}30` : borderColor,
                margin: "0 10px",
                transition: "background 0.22s",
              }} />

              {/* ── Branch row ────────────────────────────── */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px 10px" }}>
                {/* Online indicator */}
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: "#10B981",
                  boxShadow: "0 0 0 2px #10B98130",
                }} />

                {/* Branch info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 700,
                    color: cardHovered ? token.colorText : token.colorText,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    lineHeight: 1.3,
                  }}>
                    {currentBranch.name}
                  </div>
                  <div style={{ fontSize: 10, color: token.colorTextTertiary, display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                    <EnvironmentOutlined style={{ fontSize: 8 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {currentBranch.location}
                    </span>
                  </div>
                </div>

                {/* Branch initials badge */}
                <div style={{
                  width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                  background: cardHovered
                    ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}aa)`
                    : `${primaryColor}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800,
                  color: cardHovered ? "#fff" : primaryColor,
                  border: `1.5px solid ${cardHovered ? primaryColor : `${primaryColor}30`}`,
                  transition: "all 0.22s ease",
                }}>
                  {currentBranch.initials}
                </div>
              </div>
            </div>
          </Dropdown>
        ) : (
          /* Collapsed — logo only with rich tooltip */
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Tooltip
              title={
                <div style={{ minWidth: 140 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 900, fontSize: 13,
                    }}>T</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.2 }}>Tatweer</div>
                      <div style={{ fontSize: 10, opacity: 0.65 }}>Enterprise Suite</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{currentBranch.name}</div>
                      <div style={{ fontSize: 10, opacity: 0.6, display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                        <EnvironmentOutlined style={{ fontSize: 8 }} />{currentBranch.location}
                      </div>
                    </div>
                  </div>
                </div>
              }
              placement={isRTL ? "left" : "right"}
            >
              <Dropdown
                menu={{ items: branchMenuItems, onClick: ({ key }) => setBranch(key), style: { minWidth: 260 } }}
                trigger={["click"]}
                placement={isRTL ? "bottomLeft" : "bottomRight"}
                disabled={branches.length <= 1}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 11,
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 900, fontSize: 16,
                  cursor: branches.length > 1 ? "pointer" : "default",
                  boxShadow: `0 4px 14px ${primaryColor}50`,
                  position: "relative",
                  transition: "transform 0.18s, box-shadow 0.18s",
                }}>
                  T
                  {/* Branch indicator dot */}
                  <div style={{
                    position: "absolute", bottom: -1, right: -1,
                    width: 14, height: 14, borderRadius: "50%",
                    background: "#10B981",
                    border: `2px solid ${sidebarBg}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 7, color: "#fff", fontWeight: 800,
                    boxShadow: "0 0 0 2px #10B98130",
                  }}>
                    {currentBranch.initials.charAt(0)}
                  </div>
                </div>
              </Dropdown>
            </Tooltip>
          </div>
        )}
      </div>

      {/* ── Navigation Menu ────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className={[
          "flex-1 overflow-hidden",
          "[overflow-y:auto]",
          "[scrollbar-width:thin]",
          "[scrollbar-color:var(--sidebar-border)_transparent]",
          "[&::-webkit-scrollbar]:w-1",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-sidebar-border",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
        ].join(" ")}
        style={{ padding: "6px 4px" }}
      >
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[activeMenuKey]}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={handleOpenChange}
          onSelect={({ key }) => {
            if (key.startsWith("/")) setLocation(key);
          }}
          items={menuItems}
          style={{
            background: "transparent",
            border: "none",
            fontSize: 13,
            width: "100%",
          }}
        />
      </div>

      {/* ── Footer / Logout ────────────────────────────────────────────────── */}
      <div style={{
        borderTop: `1px solid ${borderColor}`,
        padding: visible ? "10px 12px" : "10px 8px",
        flexShrink: 0,
        transition: "padding 0.22s",
      }}>
        {visible ? (
          <button
            onClick={() => { logout(); window.location.href = "/login"; }}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8,
              padding: "7px 10px", borderRadius: 8, border: "none",
              background: "transparent", cursor: "pointer", fontSize: 13,
              color: token.colorTextSecondary, transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget;
              btn.style.color = "#EF4444";
              btn.style.background = "rgba(239,68,68,0.08)";
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget;
              btn.style.color = token.colorTextSecondary;
              btn.style.background = "transparent";
            }}
          >
            <LogoutOutlined style={{ fontSize: 15 }} />
            <span style={{ fontWeight: 500 }}>{t("Logout", language)}</span>
          </button>
        ) : (
          <Tooltip title={t("Logout", language)} placement={isRTL ? "left" : "right"}>
            <button
              onClick={() => { logout(); window.location.href = "/login"; }}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                padding: "8px 0", borderRadius: 8, border: "none",
                background: "transparent", cursor: "pointer",
                color: token.colorTextTertiary, transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget;
                btn.style.color = "#EF4444";
                btn.style.background = "rgba(239,68,68,0.08)";
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget;
                btn.style.color = token.colorTextTertiary;
                btn.style.background = "transparent";
              }}
            >
              <LogoutOutlined style={{ fontSize: 17 }} />
            </button>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}

export const Sidebar = memo(SidebarInner);

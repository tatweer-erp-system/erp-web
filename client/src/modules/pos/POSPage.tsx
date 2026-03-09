import { useState, useEffect, useRef, useCallback } from "react";
import { theme as antTheme, Grid, Badge, Drawer, Button, Tooltip } from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  UserOutlined,
  GiftOutlined,
  WalletOutlined,
  MonitorOutlined,
ArrowDownOutlined,
  ArrowUpOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useLocation } from "wouter";
import { AntProvider } from "@/lib/antd-provider";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { Role } from "@/types/auth";
import { ProductGrid } from "./components/ProductGrid";
import { CartPanel } from "./components/CartPanel";
import { ReceiptModal } from "./components/ReceiptModal";
import { IssueGiftCardModal } from "./components/modals/IssueGiftCardModal";
import { CheckBalanceModal } from "./components/modals/CheckBalanceModal";
import { OrderTabsBar } from "./components/orders/OrderTabsBar";
import { MergeOrdersModal } from "./components/orders/MergeOrdersModal";
import { LockScreen } from "./components/auth/LockScreen";
import type { CashierRole } from "./services/cashierAuthService";
import { CashInOutModal } from "./components/cashier/CashInOutModal";
import { OfflineBanner } from "./components/offline/OfflineBanner";
import { SyncStatusIndicator } from "./components/offline/SyncStatusIndicator";
import { POSContextProvider } from "./context/POSContext";
import { useCart } from "./hooks/useCart";
import { useCheckout } from "./hooks/useCheckout";
import { useOfflineSync } from "./hooks/useOfflineSync";
import { usePOSStore } from "./store/posStore";
import { usePOSTranslations } from "./i18n/translations";
import type { OrderTab } from "./store/posStore";

const { useBreakpoint } = Grid;

const SESSION_KEY = "pos-open-orders";
const CUSTOMER_DISPLAY_KEY = "pos-customer-display";

function Clock() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    }, 10000);
    return () => clearInterval(id);
  }, []);
  return <span>{time}</span>;
}

function POSLayout() {
  const { token } = antTheme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [, setLocation] = useLocation();
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [issueGCOpen, setIssueGCOpen] = useState(false);
  const [checkBalanceOpen, setCheckBalanceOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [cashInOpen, setCashInOpen] = useState(false);
  const [cashOutOpen, setCashOutOpen] = useState(false);
  const { addToCart, itemCount } = useCart();
  const { receiptVisible, closeReceipt, completedOrder } = useCheckout();
  useOfflineSync();
  const { currentBranch, language } = useAppSettings();
  const isRTL = language === "ar";
  const t = usePOSTranslations(language);

  const { user, isCashier, logout } = useAuthContext();

  const restoreOrders      = usePOSStore((s) => s.restoreOrders);
  const orders             = usePOSStore((s) => s.orders);
  const activeOrderIndex   = usePOSStore((s) => s.activeOrderIndex);
  const cashierSession     = usePOSStore((s) => s.cashierSession);
  const setCashierSession  = usePOSStore((s) => s.setCashierSession);
  const lockSession        = usePOSStore((s) => s.lockSession);
  const posSettings        = usePOSStore((s) => s.posSessionSettings);

  // ── Auto-init session from ERP logged-in user ─────────────────────────────
  useEffect(() => {
    if (cashierSession || !user) return;
    const roleMap: Record<string, CashierRole> = {
      [Role.SuperAdmin]: "manager",
      [Role.Admin]:      "manager",
      [Role.Manager]:    "manager",
    };
    setCashierSession({
      cashierId:   user.id,
      cashierName: user.name,
      cashierRole: roleMap[user.role] ?? "cashier",
      loginTime:   new Date(),
      isLocked:    false,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Inactivity timer ──────────────────────────────────────────────────────
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (!cashierSession || cashierSession.isLocked) return;
    const ms = posSettings.inactivityLockMinutes * 60 * 1000;
    inactivityTimer.current = setTimeout(() => {
      lockSession();
    }, ms);
  }, [cashierSession, posSettings.inactivityLockMinutes, lockSession]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [resetInactivityTimer]);

  // ── sessionStorage restore on mount ───────────────────────────────────────
  const didRestore = useRef(false);
  useEffect(() => {
    if (didRestore.current) return;
    didRestore.current = true;
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { orders: OrderTab[]; activeIndex: number };
        if (Array.isArray(parsed.orders) && parsed.orders.length > 0) {
          restoreOrders(parsed.orders, parsed.activeIndex ?? 0);
        }
      }
    } catch {
      // ignore malformed data
    }
  }, []);

  // ── sessionStorage + localStorage auto-save for customer display ──────────
  useEffect(() => {
    try {
      const payload = JSON.stringify({ orders, activeIndex: activeOrderIndex });
      sessionStorage.setItem(SESSION_KEY, payload);
      // Sync to localStorage so customer display window can read it
      const activeOrder = orders[activeOrderIndex];
      if (activeOrder) {
        localStorage.setItem(CUSTOMER_DISPLAY_KEY, JSON.stringify({
          items: activeOrder.cartItems,
          timestamp: Date.now(),
        }));
      }
    } catch {
      // ignore storage quota errors
    }
  }, [orders, activeOrderIndex]);

  function openCustomerDisplay() {
    window.open("/pos/customer-display", "customer-display",
      "width=900,height=600,menubar=no,toolbar=no,location=no,status=no"
    );
  }

  return (
    <POSContextProvider>
    <div dir={isRTL ? "rtl" : "ltr"} style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
      background: token.colorBgLayout,
    }}>

      {/* Lock screen — shows when session is locked */}
      {cashierSession?.isLocked && <LockScreen />}

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
        height: 54,
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        flexShrink: 0,
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      }}>
        {/* Back to ERP / Logout */}
        <Tooltip title={isCashier ? "Logout" : t.backToERP}>
          <Button
            icon={isCashier ? <LogoutOutlined /> : isRTL ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
            onClick={() => {
              if (isCashier) { logout(); window.location.href = "/login"; }
              else setLocation("/");
            }}
            danger={isCashier}
            style={{ borderRadius: 10, height: 36, width: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          />
        </Tooltip>

        {/* Logo + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimary}cc)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900, fontSize: 13, flexShrink: 0,
          }}>
            T
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: token.colorText, lineHeight: 1.2 }}>{t.pointOfSale}</div>
            <div style={{ fontSize: 10, color: token.colorTextSecondary, lineHeight: 1.2 }}>{currentBranch.name}</div>
          </div>
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: "0.06em",
            background: token.colorPrimaryBg, color: token.colorPrimary,
            borderRadius: 5, padding: "2px 6px", textTransform: "uppercase",
            border: `1px solid ${token.colorPrimary}30`,
          }}>
            POS
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isMobile && (
            <>
              {cashierSession && (
                <>
                  <Tooltip title={t.recordCashIn}>
                    <Button
                      icon={<ArrowDownOutlined />}
                      onClick={() => setCashInOpen(true)}
                      style={{ borderRadius: 10, height: 36, fontSize: 12, color: "#10B981", borderColor: "#10B98140" }}
                    >
                      {t.cashIn}
                    </Button>
                  </Tooltip>
                  <Tooltip title={t.recordCashOut}>
                    <Button
                      icon={<ArrowUpOutlined />}
                      onClick={() => setCashOutOpen(true)}
                      style={{ borderRadius: 10, height: 36, fontSize: 12, color: "#EF4444", borderColor: "#EF444440" }}
                    >
                      {t.cashOut}
                    </Button>
                  </Tooltip>
                  <div style={{ width: 1, height: 20, background: token.colorBorderSecondary, margin: "0 2px" }} />
                </>
              )}
              <Tooltip title={t.issueGiftCard}>
                <Button
                  icon={<GiftOutlined />}
                  onClick={() => setIssueGCOpen(true)}
                  style={{ borderRadius: 10, height: 36, fontSize: 12 }}
                >
                  {t.issueGiftCard}
                </Button>
              </Tooltip>
              <Tooltip title={t.checkBalance}>
                <Button
                  icon={<WalletOutlined />}
                  onClick={() => setCheckBalanceOpen(true)}
                  style={{ borderRadius: 10, height: 36, fontSize: 12 }}
                >
                  {t.checkBalance}
                </Button>
              </Tooltip>
<Tooltip title={t.customerDisplay}>
                <Button
                  icon={<MonitorOutlined />}
                  onClick={openCustomerDisplay}
                  style={{ borderRadius: 10, height: 36, width: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                />
              </Tooltip>
              <div style={{ width: 1, height: 20, background: token.colorBorderSecondary, margin: "0 4px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: token.colorTextSecondary, fontSize: 12 }}>
                <UserOutlined style={{ fontSize: 12 }} />
                <span>{cashierSession ? cashierSession.cashierName : t.noCashier}</span>
              </div>
              {cashierSession && (
                <Tooltip title={t.lockTerminal}>
                  <Button
                    icon={<LockOutlined />}
                    onClick={lockSession}
                    size="small"
                    style={{ borderRadius: 8, height: 28, width: 28, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", color: token.colorTextTertiary }}
                  />
                </Tooltip>
              )}
              <SyncStatusIndicator />
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: token.colorTextSecondary, fontSize: 12 }}>
                <ClockCircleOutlined style={{ fontSize: 12 }} />
                <Clock />
              </div>
            </>
          )}

          {/* Mobile action buttons */}
          {isMobile && (
            <>
              <Tooltip title={t.issueGiftCard}>
                <Button
                  icon={<GiftOutlined />}
                  onClick={() => setIssueGCOpen(true)}
                  style={{ borderRadius: 10, height: 36, width: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                />
              </Tooltip>
              <Tooltip title={t.checkBalance}>
                <Button
                  icon={<WalletOutlined />}
                  onClick={() => setCheckBalanceOpen(true)}
                  style={{ borderRadius: 10, height: 36, width: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                />
              </Tooltip>
              <Badge count={itemCount} color={token.colorPrimary}>
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => setCartDrawerOpen(true)}
                  style={{ borderRadius: 10, height: 38 }}
                >
                  {t.cart}
                </Button>
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* ── Offline Banner ──────────────────────────────────────────────────── */}
      <OfflineBanner />

      {/* ── Order Tabs Bar ──────────────────────────────────────────────────── */}
      <OrderTabsBar onMergeClick={() => setMergeOpen(true)} isMobile={isMobile} />

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 0 : 12,
        padding: isMobile ? 0 : 12,
      }}>
        {/* Left — Product Grid (60%) */}
        <div style={{
          flex: isMobile ? "1" : "0 0 60%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: token.colorBgContainer,
          borderRadius: isMobile ? 0 : 16,
          border: isMobile ? "none" : `1px solid ${token.colorBorderSecondary}`,
          padding: isMobile ? "12px 12px 0" : "16px",
        }}>
          <ProductGrid onAdd={addToCart} isMobile={isMobile} />
        </div>

        {/* Right — Cart Panel (40%) — desktop only */}
        {!isMobile && (
          <div style={{ flex: "0 0 calc(40% - 12px)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <CartPanel isMobile={false} />
          </div>
        )}
      </div>

      {/* Mobile cart drawer */}
      {isMobile && (
        <Drawer
          open={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          placement="bottom"
          height="85vh"
          title={null}
          closeIcon={null}
          styles={{
            body: { padding: 0, display: "flex", flexDirection: "column" },
            content: { borderRadius: "16px 16px 0 0" },
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 6px", flexShrink: 0 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: token.colorBorderSecondary }} />
          </div>
          <div style={{ flex: 1, overflow: "hidden", padding: "0 12px 12px" }}>
            <CartPanel isMobile={true} />
          </div>
        </Drawer>
      )}

      {/* Modals */}
      <ReceiptModal open={receiptVisible} order={completedOrder} onClose={closeReceipt} />
      <IssueGiftCardModal open={issueGCOpen} onClose={() => setIssueGCOpen(false)} />
      <CheckBalanceModal open={checkBalanceOpen} onClose={() => setCheckBalanceOpen(false)} />
      <MergeOrdersModal open={mergeOpen} onClose={() => setMergeOpen(false)} />
      <CashInOutModal type="in"  open={cashInOpen}  onClose={() => setCashInOpen(false)}  />
      <CashInOutModal type="out" open={cashOutOpen} onClose={() => setCashOutOpen(false)} />
    </div>
    </POSContextProvider>
  );
}

export default function POSPage() {
  return (
    <AntProvider>
      <POSLayout />
    </AntProvider>
  );
}

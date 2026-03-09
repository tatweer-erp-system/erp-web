import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { usePOSStore } from "@/modules/pos/store/posStore";
import { OfflineSettingsTab } from "@/modules/pos/components/offline/OfflineSettingsTab";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Switch,
  TimePicker,
  Typography,
  theme as antTheme,
  message,
} from "antd";
import {
  ClockCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  FileTextOutlined,
  LockOutlined,
  PercentageOutlined,
  PrinterOutlined,
  SaveOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TagOutlined,
  TeamOutlined,
  TrophyOutlined,
  WifiOutlined,
  ShopOutlined,
  GiftOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// ── Shared sub-components ────────────────────────────────────────────────────

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  const { token } = antTheme.useToken();
  return (
    <div style={{
      background: token.colorBgContainer,
      border: `1px solid ${token.colorBorderSecondary}`,
      borderRadius: token.borderRadiusLG,
      overflow: "hidden",
    }}>
      {title && (
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <Text strong style={{ fontSize: 13 }}>{title}</Text>
        </div>
      )}
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

function SettingRow({
  label, sublabel, control, last = false,
}: { label: string; sublabel: string; control: React.ReactNode; last?: boolean }) {
  const { token } = antTheme.useToken();
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 0",
      borderBottom: last ? "none" : `1px solid ${token.colorBorderSecondary}`,
    }}>
      <div>
        <Text strong style={{ fontSize: 13 }}>{label}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>{sublabel}</Text>
      </div>
      {control}
    </div>
  );
}

// ── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: "general",     icon: <SettingOutlined />,     label: "General"               },
  { key: "pos-session", icon: <ClockCircleOutlined />, label: "POS Session"           },
  { key: "security",    icon: <LockOutlined />,        label: "Session Security"      },
  { key: "register",    icon: <PrinterOutlined />,     label: "Register & Hardware"   },
  { key: "receipt",     icon: <FileTextOutlined />,    label: "Receipt"               },
  { key: "payment",     icon: <CreditCardOutlined />,  label: "Payment & Tax"         },
  { key: "discounts",   icon: <PercentageOutlined />,  label: "Discounts"             },
  { key: "checkout",    icon: <ShoppingOutlined />,    label: "Checkout Rules"        },
  { key: "shift",       icon: <DollarOutlined />,      label: "Shift & Cash"          },
  { key: "loyalty",     icon: <TrophyOutlined />,      label: "Loyalty"               },
  { key: "vouchers",    icon: <GiftOutlined />,        label: "Vouchers & Gift Cards" },
  { key: "customer",    icon: <TeamOutlined />,        label: "Customer & Display"    },
  { key: "offline",     icon: <WifiOutlined />,        label: "Offline Mode"          },
  { key: "restaurant",  icon: <ShopOutlined />,        label: "Restaurant"            },
  { key: "returns",     icon: <RollbackOutlined />,    label: "Returns & Refunds"     },
];

// ── Main component ───────────────────────────────────────────────────────────

export default function POSSettings() {
  const { token } = antTheme.useToken();
  const { settingsLayout } = useAppSettings();
  const [activeTab, setActiveTab] = useState("general");

  // ── Dirty / unsaved changes tracking ──────────────────────────────────────
  const [isDirty, setIsDirty] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  function mark() { setIsDirty(true); }
  function saved() { setIsDirty(false); }

  function handleTabClick(key: string) {
    if (key === activeTab) return;
    if (isDirty) {
      setPendingTab(key);
      Modal.confirm({
        title: "Unsaved Changes",
        content: "You have unsaved changes on this tab. Leave without saving?",
        okText: "Leave",
        cancelText: "Stay",
        okButtonProps: { danger: true },
        onOk() {
          setIsDirty(false);
          setActiveTab(key);
          setPendingTab(null);
        },
        onCancel() {
          setPendingTab(null);
        },
      });
    } else {
      setActiveTab(key);
    }
  }

  // ── Store-backed state ────────────────────────────────────────────────────
  const maxOrders             = usePOSStore((s) => s.maxOrders);
  const setMaxOrders          = usePOSStore((s) => s.setMaxOrders);
  const posSessionSettings    = usePOSStore((s) => s.posSessionSettings);
  const setPOSSessionSettings = usePOSStore((s) => s.setPOSSessionSettings);

  const restaurantMode             = usePOSStore((s) => s.restaurantMode);
  const setRestaurantMode          = usePOSStore((s) => s.setRestaurantMode);
  const tableManagementEnabled     = usePOSStore((s) => s.tableManagementEnabled);
  const setTableManagementEnabled  = usePOSStore((s) => s.setTableManagementEnabled);
  const courseManagementEnabled    = usePOSStore((s) => s.courseManagementEnabled);
  const setCourseManagementEnabled = usePOSStore((s) => s.setCourseManagementEnabled);
  const kitchenPrintingEnabled     = usePOSStore((s) => s.kitchenPrintingEnabled);
  const setKitchenPrintingEnabled  = usePOSStore((s) => s.setKitchenPrintingEnabled);
  const autoSendKitchen            = usePOSStore((s) => s.autoSendKitchen);
  const setAutoSendKitchen         = usePOSStore((s) => s.setAutoSendKitchen);
  const allowTakeAway              = usePOSStore((s) => s.allowTakeAway);
  const setAllowTakeAway           = usePOSStore((s) => s.setAllowTakeAway);
  const defaultGuests              = usePOSStore((s) => s.defaultGuests);
  const setDefaultGuests           = usePOSStore((s) => s.setDefaultGuests);

  // ── General tab ───────────────────────────────────────────────────────────
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [generalAutoPrint, setGeneralAutoPrint] = useState(true);
  const [generalReceiptCopies, setGeneralReceiptCopies] = useState(1);

  // ── Register & Hardware tab ───────────────────────────────────────────────
  const [autoPrintReceipt,    setAutoPrintReceipt]    = useState(true);
  const [receiptCopies,       setReceiptCopies]        = useState(1);
  const [printerPaperSize,    setPrinterPaperSize]     = useState<"80mm" | "58mm">("80mm");
  const [openDrawerOnCash,    setOpenDrawerOnCash]     = useState(true);
  const [openDrawerOnReceipt, setOpenDrawerOnReceipt]  = useState(false);
  const [soundOnScan,         setSoundOnScan]          = useState(true);
  const [soundOnPayment,      setSoundOnPayment]       = useState(true);
  const [idleScreenTimeout,   setIdleScreenTimeout]    = useState(5);
  const [scannerMode,         setScannerMode]          = useState<"keyboard" | "serial">("keyboard");

  // ── Receipt tab ───────────────────────────────────────────────────────────
  const [receiptTemplate,    setReceiptTemplate]    = useState<"full" | "compact" | "minimal">("full");
  const [showBarcodeOnReceipt, setShowBarcodeOnReceipt] = useState(true);
  const [showCustomerName,   setShowCustomerName]   = useState(true);
  const [receiptFooterMsg,   setReceiptFooterMsg]   = useState("Thank you for your business!");

  // ── Payment & Tax tab ─────────────────────────────────────────────────────
  const [defaultTaxRate,      setDefaultTaxRate]       = useState(15);
  const [taxInclusive,        setTaxInclusive]         = useState(false);
  const [showTaxBreakdown,    setShowTaxBreakdown]     = useState(true);
  const [tipsEnabled,         setTipsEnabled]          = useState(false);
  const [tipPresets,          setTipPresets]           = useState<number[]>([10, 15, 18, 20]);
  const [autoGratuityEnabled, setAutoGratuityEnabled]  = useState(false);
  const [autoGratuityPct,     setAutoGratuityPct]      = useState(18);
  const [autoGratuityPartySize, setAutoGratuityPartySize] = useState(6);
  const [roundingRule,        setRoundingRule]         = useState<"none" | "0.05" | "0.10" | "1.00">("none");
  const [cashEnabled,         setCashEnabled]          = useState(true);
  const [cardEnabled,         setCardEnabled]          = useState(true);
  const [splitEnabled,        setSplitEnabled]         = useState(true);
  const [giftCardEnabled,     setGiftCardEnabled]      = useState(true);
  const [voucherEnabled,      setVoucherEnabled]       = useState(true);
  const [allowPartialPayment, setAllowPartialPayment]  = useState(false);
  const [minCardAmount,       setMinCardAmount]        = useState(0);

  // ── Discounts tab ─────────────────────────────────────────────────────────
  const [allowItemDiscount,   setAllowItemDiscount]   = useState(true);
  const [allowOrderDiscount,  setAllowOrderDiscount]  = useState(true);
  const [maxDiscountPercent,  setMaxDiscountPercent]  = useState(50);
  const [requireManagerAbove, setRequireManagerAbove] = useState(20);

  // ── Returns & Refunds tab ─────────────────────────────────────────────────
  const [returnWindowDays,    setReturnWindowDays]     = useState(30);
  const [requireManagerRefund, setRequireManagerRefund] = useState(true);
  const [restockingFeePct,    setRestockingFeePct]     = useState(0);
  const [allowCashRefund,     setAllowCashRefund]      = useState(true);
  const [allowOriginalRefund, setAllowOriginalRefund]  = useState(true);
  const [allowCreditRefund,   setAllowCreditRefund]    = useState(true);
  const [refundNoteRequired,  setRefundNoteRequired]   = useState(true);

  // ── Checkout Rules tab ────────────────────────────────────────────────────
  const [allowPriceOverride,  setAllowPriceOverride]   = useState(false);
  const [requireVoidReason,   setRequireVoidReason]    = useState(true);
  const [requireRefundReason, setRequireRefundReason]  = useState(true);
  const [minSaleAmount,       setMinSaleAmount]        = useState(0);
  const [maxSaleAmount,       setMaxSaleAmount]        = useState(0);
  const [holdTimeout,         setHoldTimeout]          = useState(60);
  const [allowNegativeStock,  setAllowNegativeStock]   = useState(false);

  // ── Shift & Cash tab ──────────────────────────────────────────────────────
  const [requireOpeningFloat,  setRequireOpeningFloat]  = useState(true);
  const [allowCashierClose,    setAllowCashierClose]    = useState(false);
  const [autoCloseEnabled,     setAutoCloseEnabled]     = useState(false);
  const [autoCloseTime,        setAutoCloseTime]        = useState<dayjs.Dayjs>(dayjs("23:00", "HH:mm"));
  const [requireOpeningCount,  setRequireOpeningCount]  = useState(true);
  const [requireClosingCount,  setRequireClosingCount]  = useState(true);
  const [discrepancyThreshold, setDiscrepancyThreshold] = useState(5);
  const [eodFloatTarget,       setEodFloatTarget]       = useState(200);
  const [alertOnDiscrepancy,   setAlertOnDiscrepancy]   = useState(true);

  // ── Loyalty tab ───────────────────────────────────────────────────────────
  const [loyaltyEnabled,         setLoyaltyEnabled]         = useState(true);
  const [pointsExpiryDays,       setPointsExpiryDays]       = useState(365);
  const [minRedemptionPoints,    setMinRedemptionPoints]    = useState(100);
  const [allowPartialRedemption, setAllowPartialRedemption] = useState(true);
  const [showLoyaltyOnReceipt,   setShowLoyaltyOnReceipt]   = useState(true);

  // ── Vouchers & Gift Cards tab ─────────────────────────────────────────────
  const [allowVoucherRedemption,  setAllowVoucherRedemption]  = useState(true);
  const [allowGiftCardRedemption, setAllowGiftCardRedemption] = useState(true);
  const [allowGiftCardIssuance,   setAllowGiftCardIssuance]   = useState(true);
  const [giftCardExpiryDays,      setGiftCardExpiryDays]      = useState(365);
  const [allowMultipleGiftCards,  setAllowMultipleGiftCards]  = useState(true);

  // ── Customer & Display tab ────────────────────────────────────────────────
  const [autoAttachCustomer,    setAutoAttachCustomer]    = useState(false);
  const [promptAddCustomer,     setPromptAddCustomer]     = useState(false);
  const [showLoyaltyAtCheckout, setShowLoyaltyAtCheckout] = useState(true);
  const [defaultProductSort,    setDefaultProductSort]    = useState<"name" | "price_asc" | "price_desc" | "category">("name");
  const [hideOutOfStock,        setHideOutOfStock]        = useState(false);

  // ── Save helpers ──────────────────────────────────────────────────────────

  function saveAndNotify(label: string) {
    saved();
    message.success(`${label} settings saved`);
  }

  // ── Tab definitions ───────────────────────────────────────────────────────

  const GeneralTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Locale & Language">
        <SettingRow
          label="Default Currency"
          sublabel="Currency used in all POS transactions and receipts"
          control={
            <Select value={defaultCurrency} onChange={(v) => { setDefaultCurrency(v); mark(); }} style={{ width: 140 }}>
              <Option value="USD">USD – US Dollar</Option>
              <Option value="EUR">EUR – Euro</Option>
              <Option value="GBP">GBP – British Pound</Option>
              <Option value="SAR">SAR – Saudi Riyal</Option>
              <Option value="AED">AED – UAE Dirham</Option>
              <Option value="EGP">EGP – Egyptian Pound</Option>
            </Select>
          }
        />
        <SettingRow
          label="Default Language"
          sublabel="Language displayed in the POS interface"
          last
          control={
            <Select value={defaultLanguage} onChange={(v) => { setDefaultLanguage(v); mark(); }} style={{ width: 180 }}>
              <Option value="en">English</Option>
              <Option value="ar">العربية (Arabic)</Option>
              <Option value="fr">Français (French)</Option>
              <Option value="es">Español (Spanish)</Option>
            </Select>
          }
        />
      </Section>

      <Section title="Receipts">
        <SettingRow
          label="Auto-Print Receipt"
          sublabel="Automatically print a receipt after every completed sale"
          control={<Switch checked={generalAutoPrint} onChange={(v) => { setGeneralAutoPrint(v); mark(); }} />}
        />
        <SettingRow
          label="Number of Receipt Copies"
          sublabel="Copies printed per transaction"
          last
          control={
            <InputNumber
              min={1} max={5}
              value={generalReceiptCopies}
              onChange={(v) => { setGeneralReceiptCopies(v ?? 1); mark(); }}
              addonAfter="copies"
              style={{ width: 140 }}
            />
          }
        />
      </Section>

      <Section title="Orders">
        <SettingRow
          label="Maximum Open Orders (Tabs)"
          sublabel="Max simultaneous order tabs per POS session (1–10)"
          last
          control={
            <InputNumber
              min={1} max={10}
              value={maxOrders}
              onChange={(v) => { setMaxOrders(v ?? 5); mark(); }}
              addonAfter="tabs"
              style={{ width: 130 }}
            />
          }
        />
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveAndNotify("General")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  const POSSessionTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="POS Configuration">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Maximum Open Orders (Tabs)"
                style={{ marginBottom: 16 }}
                help="Max simultaneous order tabs per POS session (1–10)"
              >
                <InputNumber
                  min={1} max={10}
                  value={maxOrders}
                  onChange={(v) => { setMaxOrders(v ?? 5); mark(); }}
                  addonAfter="tabs"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveAndNotify("POS session")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  const SecurityTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Session Security">
        <SettingRow
          label="Inactivity Lock Timeout"
          sublabel="Automatically lock the terminal after a period of inactivity"
          control={
            <InputNumber
              min={1} max={60}
              value={posSessionSettings.inactivityLockMinutes}
              onChange={(v) => { setPOSSessionSettings({ inactivityLockMinutes: v ?? 5 }); mark(); }}
              addonAfter="min"
              style={{ width: 120 }}
            />
          }
        />
        <SettingRow
          label="Max PIN Attempts"
          sublabel="Lock after this many failed PIN entries"
          control={
            <InputNumber
              min={1} max={10}
              value={posSessionSettings.maxPINAttempts}
              onChange={(v) => { setPOSSessionSettings({ maxPINAttempts: v ?? 3 }); mark(); }}
              addonAfter="tries"
              style={{ width: 130 }}
            />
          }
        />
        <SettingRow
          label="Require Manager Approval for Refunds"
          sublabel="Cashier must request manager override before processing any refund"
          control={
            <Switch
              checked={posSessionSettings.requireManagerForRefunds}
              onChange={(v) => { setPOSSessionSettings({ requireManagerForRefunds: v }); mark(); }}
            />
          }
        />
        <SettingRow
          label="Manager Override Discount Threshold"
          sublabel="Discounts above this value require manager approval"
          last
          control={
            <InputNumber
              min={0} max={100}
              value={posSessionSettings.requireManagerForDiscountsAbove}
              onChange={(v) => { setPOSSessionSettings({ requireManagerForDiscountsAbove: v ?? 20 }); mark(); }}
              addonAfter="%"
              style={{ width: 120 }}
            />
          }
        />
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveAndNotify("Security")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  const RegisterTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Receipt Printer">
        <SettingRow
          label="Auto-Print Receipt"
          sublabel="Automatically print receipt after every completed sale"
          control={<Switch checked={autoPrintReceipt} onChange={(v) => { setAutoPrintReceipt(v); mark(); }} />}
        />
        <SettingRow
          label="Receipt Copies"
          sublabel="Number of copies printed per transaction"
          control={
            <InputNumber
              min={1} max={5}
              value={receiptCopies}
              onChange={(v) => { setReceiptCopies(v ?? 1); mark(); }}
              addonAfter="copies"
              style={{ width: 140 }}
            />
          }
        />
        <SettingRow
          label="Paper Size"
          sublabel="Thermal receipt printer paper width"
          last
          control={
            <Select
              value={printerPaperSize}
              onChange={(v) => { setPrinterPaperSize(v); mark(); }}
              style={{ width: 110 }}
              options={[
                { value: "80mm", label: "80 mm" },
                { value: "58mm", label: "58 mm" },
              ]}
            />
          }
        />
      </Section>

      <Section title="Cash Drawer">
        <SettingRow
          label="Open Drawer on Cash Payment"
          sublabel="Automatically trigger cash drawer when a cash sale is completed"
          control={<Switch checked={openDrawerOnCash} onChange={(v) => { setOpenDrawerOnCash(v); mark(); }} />}
        />
        <SettingRow
          label="Open Drawer on Receipt Print"
          sublabel="Trigger cash drawer whenever a receipt is printed"
          last
          control={<Switch checked={openDrawerOnReceipt} onChange={(v) => { setOpenDrawerOnReceipt(v); mark(); }} />}
        />
      </Section>

      <Section title="Barcode Scanner">
        <SettingRow
          label="Scanner Input Mode"
          sublabel="How the register receives barcode data from the scanner"
          control={
            <Select
              value={scannerMode}
              onChange={(v) => { setScannerMode(v); mark(); }}
              style={{ width: 150 }}
              options={[
                { value: "keyboard", label: "Keyboard (HID)" },
                { value: "serial",   label: "Serial / USB COM" },
              ]}
            />
          }
        />
        <SettingRow
          label="Beep on Successful Scan"
          sublabel="Play a sound when a product barcode is recognised"
          last
          control={<Switch checked={soundOnScan} onChange={(v) => { setSoundOnScan(v); mark(); }} />}
        />
      </Section>

      <Section title="Display & Sound">
        <SettingRow
          label="Idle Screen Timeout"
          sublabel="Switch to idle/screensaver display after inactivity"
          control={
            <InputNumber
              min={1} max={60}
              value={idleScreenTimeout}
              onChange={(v) => { setIdleScreenTimeout(v ?? 5); mark(); }}
              addonAfter="min"
              style={{ width: 120 }}
            />
          }
        />
        <SettingRow
          label="Sound on Payment Completion"
          sublabel="Play a confirmation sound when a payment is processed"
          last
          control={<Switch checked={soundOnPayment} onChange={(v) => { setSoundOnPayment(v); mark(); }} />}
        />
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveAndNotify("Register")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  const ReceiptTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Receipt Layout">
        <SettingRow
          label="Default Template"
          sublabel="Controls how much detail is printed on the customer receipt"
          control={
            <Select
              value={receiptTemplate}
              onChange={(v) => { setReceiptTemplate(v); mark(); }}
              style={{ width: 160 }}
              options={[
                { value: "full",    label: "Full (all details)" },
                { value: "compact", label: "Compact"            },
                { value: "minimal", label: "Minimal"            },
              ]}
            />
          }
        />
        <SettingRow
          label="Show Barcode"
          sublabel="Print a scannable barcode (order reference) on the receipt"
          control={<Switch checked={showBarcodeOnReceipt} onChange={(v) => { setShowBarcodeOnReceipt(v); mark(); }} />}
        />
        <SettingRow
          label="Show Customer Name"
          sublabel="Print the attached customer's name on the receipt"
          last
          control={<Switch checked={showCustomerName} onChange={(v) => { setShowCustomerName(v); mark(); }} />}
        />
      </Section>

      <Section title="Footer">
        <div style={{ paddingTop: 4 }}>
          <Text strong style={{ fontSize: 13 }}>Footer Message</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Text printed at the bottom of every receipt (e.g. thank-you note, return policy)
          </Text>
          <TextArea
            value={receiptFooterMsg}
            onChange={(e) => { setReceiptFooterMsg(e.target.value); mark(); }}
            rows={3}
            maxLength={200}
            showCount
            placeholder="Thank you for your business!"
            style={{ marginTop: 10, borderRadius: 8 }}
          />
        </div>
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveAndNotify("Receipt")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  const PaymentTaxTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Tax">
        <SettingRow
          label="Default Tax Rate"
          sublabel="Applied to all products unless overridden at product level"
          control={
            <InputNumber
              min={0} max={100}
              value={defaultTaxRate}
              onChange={(v) => { setDefaultTaxRate(v ?? 15); mark(); }}
              addonAfter="%"
              style={{ width: 120 }}
            />
          }
        />
        <SettingRow
          label="Tax-Inclusive Pricing"
          sublabel="Product prices already include tax — do not add tax on top"
          control={<Switch checked={taxInclusive} onChange={(v) => { setTaxInclusive(v); mark(); }} />}
        />
        <SettingRow
          label="Show Tax Breakdown on Receipt"
          sublabel="Print a separate tax line on the customer receipt"
          last
          control={<Switch checked={showTaxBreakdown} onChange={(v) => { setShowTaxBreakdown(v); mark(); }} />}
        />
      </Section>

      <Section title="Payment Options">
        <SettingRow
          label="Accept Cash"
          sublabel="Allow cash as a payment method at checkout"
          control={<Switch checked={cashEnabled} onChange={(v) => { setCashEnabled(v); mark(); }} />}
        />
        <SettingRow
          label="Accept Card"
          sublabel="Allow card (debit / credit) payments at checkout"
          control={<Switch checked={cardEnabled} onChange={(v) => { setCardEnabled(v); mark(); }} />}
        />
        <SettingRow
          label="Allow Split Payment"
          sublabel="Let customers split the total between cash and card"
          control={<Switch checked={splitEnabled} onChange={(v) => { setSplitEnabled(v); mark(); }} />}
        />
        <SettingRow
          label="Allow Partial Payment"
          sublabel="Accept partial payment and record the remaining balance as outstanding"
          control={<Switch checked={allowPartialPayment} onChange={(v) => { setAllowPartialPayment(v); mark(); }} />}
        />
        <SettingRow
          label="Accept Gift Cards"
          sublabel="Allow gift cards to be redeemed at checkout"
          control={<Switch checked={giftCardEnabled} onChange={(v) => { setGiftCardEnabled(v); mark(); }} />}
        />
        <SettingRow
          label="Accept Vouchers"
          sublabel="Allow promotional voucher codes at checkout"
          control={<Switch checked={voucherEnabled} onChange={(v) => { setVoucherEnabled(v); mark(); }} />}
        />
        <SettingRow
          label="Minimum Card Payment Amount"
          sublabel="Reject card payments below this amount (0 = no minimum)"
          last
          control={
            <InputNumber
              min={0}
              value={minCardAmount}
              onChange={(v) => { setMinCardAmount(v ?? 0); mark(); }}
              addonBefore="$"
              style={{ width: 130 }}
            />
          }
        />
      </Section>

      <Section title="Rounding & Gratuity">
        <SettingRow
          label="Cash Rounding Rule"
          sublabel="Round the total when paying by cash (useful where small coins are not in circulation)"
          control={
            <Select
              value={roundingRule}
              onChange={(v) => { setRoundingRule(v); mark(); }}
              style={{ width: 150 }}
              options={[
                { value: "none",  label: "No rounding"    },
                { value: "0.05",  label: "Nearest $0.05"  },
                { value: "0.10",  label: "Nearest $0.10"  },
                { value: "1.00",  label: "Nearest $1.00"  },
              ]}
            />
          }
        />
        <SettingRow
          label="Enable Tips / Gratuity"
          sublabel="Show a tip prompt on the customer-facing display at checkout"
          control={<Switch checked={tipsEnabled} onChange={(v) => { setTipsEnabled(v); mark(); }} />}
        />
        {tipsEnabled && (
          <>
            <SettingRow
              label="Tip Preset Percentages"
              sublabel="Percentage buttons shown to customers when prompted for a tip"
              control={
                <Select
                  mode="tags"
                  value={tipPresets.map(String)}
                  onChange={(vals) => { setTipPresets(vals.map(Number).filter((n) => n >= 0 && n <= 100)); mark(); }}
                  style={{ minWidth: 200 }}
                  tokenSeparators={[","]}
                  placeholder="e.g. 10, 15, 20"
                  options={[10, 15, 18, 20, 25].map((p) => ({ label: `${p}%`, value: String(p) }))}
                />
              }
            />
            <SettingRow
              label="Auto-Gratuity"
              sublabel="Automatically add gratuity for large parties (restaurant mode)"
              control={<Switch checked={autoGratuityEnabled} onChange={(v) => { setAutoGratuityEnabled(v); mark(); }} />}
            />
            {autoGratuityEnabled && (
              <>
                <SettingRow
                  label="Auto-Gratuity Percentage"
                  sublabel="Gratuity rate applied automatically to qualifying orders"
                  control={
                    <InputNumber
                      min={0} max={100}
                      value={autoGratuityPct}
                      onChange={(v) => { setAutoGratuityPct(v ?? 18); mark(); }}
                      addonAfter="%"
                      style={{ width: 120 }}
                    />
                  }
                />
                <SettingRow
                  label="Minimum Party Size"
                  sublabel="Auto-gratuity applies when the party has this many or more guests"
                  control={
                    <InputNumber
                      min={2} max={50}
                      value={autoGratuityPartySize}
                      onChange={(v) => { setAutoGratuityPartySize(v ?? 6); mark(); }}
                      addonAfter="guests"
                      style={{ width: 140 }}
                    />
                  }
                />
              </>
            )}
          </>
        )}
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveAndNotify("Payment & tax")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  const DiscountsTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Discount Permissions">
        <SettingRow
          label="Allow Item-Level Discount"
          sublabel="Cashiers can apply a discount to individual line items in the cart"
          control={<Switch checked={allowItemDiscount} onChange={(v) => { setAllowItemDiscount(v); mark(); }} />}
        />
        <SettingRow
          label="Allow Order-Level Discount"
          sublabel="Cashiers can apply a discount to the entire order total"
          last
          control={<Switch checked={allowOrderDiscount} onChange={(v) => { setAllowOrderDiscount(v); mark(); }} />}
        />
      </Section>

      <Section title="Discount Limits">
        <SettingRow
          label="Maximum Discount %"
          sublabel="Cashiers cannot apply a discount percentage above this limit"
          control={
            <InputNumber
              min={0} max={100}
              value={maxDiscountPercent}
              onChange={(v) => { setMaxDiscountPercent(v ?? 50); mark(); }}
              addonAfter="%"
              style={{ width: 120 }}
            />
          }
        />
        <SettingRow
          label="Require Manager Approval Above"
          sublabel="Discounts that exceed this percentage require manager override"
          last
          control={
            <InputNumber
              min={0} max={100}
              value={requireManagerAbove}
              onChange={(v) => { setRequireManagerAbove(v ?? 20); mark(); }}
              addonAfter="%"
              style={{ width: 120 }}
            />
          }
        />
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveAndNotify("Discounts")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  const CheckoutTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Price & Discount">
        <SettingRow
          label="Allow Cashier Price Override"
          sublabel="Cashiers can manually change a product's unit price at checkout"
          control={<Switch checked={allowPriceOverride} onChange={(v) => { setAllowPriceOverride(v); mark(); }} />}
        />
        <SettingRow
          label="Allow Selling Out-of-Stock Items"
          sublabel="Proceed with checkout even when product stock is zero"
          last
          control={<Switch checked={allowNegativeStock} onChange={(v) => { setAllowNegativeStock(v); mark(); }} />}
        />
      </Section>

      <Section title="Void & Refund">
        <SettingRow
          label="Require Reason for Void"
          sublabel="Cashier must select a void reason before cancelling a transaction"
          control={<Switch checked={requireVoidReason} onChange={(v) => { setRequireVoidReason(v); mark(); }} />}
        />
        <SettingRow
          label="Require Reason for Refund"
          sublabel="Cashier must select a refund reason before processing a return"
          last
          control={<Switch checked={requireRefundReason} onChange={(v) => { setRequireRefundReason(v); mark(); }} />}
        />
      </Section>

      <Section title="Transaction Limits">
        <SettingRow
          label="Minimum Sale Amount"
          sublabel="Block checkout if order total is below this value (0 = no minimum)"
          control={
            <InputNumber
              min={0}
              value={minSaleAmount}
              onChange={(v) => { setMinSaleAmount(v ?? 0); mark(); }}
              addonBefore="$"
              style={{ width: 140 }}
            />
          }
        />
        <SettingRow
          label="Maximum Sale Amount"
          sublabel="Block checkout if order total exceeds this value (0 = no limit)"
          control={
            <InputNumber
              min={0}
              value={maxSaleAmount}
              onChange={(v) => { setMaxSaleAmount(v ?? 0); mark(); }}
              addonBefore="$"
              style={{ width: 140 }}
            />
          }
        />
        <SettingRow
          label="Hold Order Expiry"
          sublabel="Automatically discard held orders after this duration"
          last
          control={
            <InputNumber
              min={5} max={480}
              value={holdTimeout}
              onChange={(v) => { setHoldTimeout(v ?? 60); mark(); }}
              addonAfter="min"
              style={{ width: 130 }}
            />
          }
        />
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveAndNotify("Checkout")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  const ShiftTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Session Control">
        <SettingRow
          label="Require Opening Float Entry"
          sublabel="Cashier must count and declare the opening cash amount before starting a shift"
          control={<Switch checked={requireOpeningFloat} onChange={(v) => { setRequireOpeningFloat(v); mark(); }} />}
        />
        <SettingRow
          label="Allow Cashier to Close Session"
          sublabel="Cashiers can close their own session without manager approval"
          control={<Switch checked={allowCashierClose} onChange={(v) => { setAllowCashierClose(v); mark(); }} />}
        />
        <SettingRow
          label="Auto Close at End of Day"
          sublabel="Automatically close all open sessions at the specified time"
          control={<Switch checked={autoCloseEnabled} onChange={(v) => { setAutoCloseEnabled(v); mark(); }} />}
        />
        <SettingRow
          label="End of Day Time"
          sublabel="Time at which open sessions are automatically closed (if Auto Close is on)"
          last
          control={
            <TimePicker
              value={autoCloseTime}
              onChange={(v) => { if (v) { setAutoCloseTime(v); mark(); } }}
              format="HH:mm"
              disabled={!autoCloseEnabled}
              style={{ width: 110 }}
            />
          }
        />
      </Section>

      <Section title="Opening & Closing Count">
        <SettingRow
          label="Require Opening Cash Count"
          sublabel="Cashier must count and enter the opening float before starting a shift"
          control={<Switch checked={requireOpeningCount} onChange={(v) => { setRequireOpeningCount(v); mark(); }} />}
        />
        <SettingRow
          label="Require Closing Cash Count"
          sublabel="Cashier must count and enter the closing cash before ending a shift"
          last
          control={<Switch checked={requireClosingCount} onChange={(v) => { setRequireClosingCount(v); mark(); }} />}
        />
      </Section>

      <Section title="Cash Discrepancy">
        <SettingRow
          label="Alert on Cash Discrepancy"
          sublabel="Notify the manager when closing cash differs from expected amount"
          control={<Switch checked={alertOnDiscrepancy} onChange={(v) => { setAlertOnDiscrepancy(v); mark(); }} />}
        />
        <SettingRow
          label="Discrepancy Alert Threshold"
          sublabel="Trigger an alert only when the difference exceeds this amount"
          last
          control={
            <InputNumber
              min={0}
              value={discrepancyThreshold}
              onChange={(v) => { setDiscrepancyThreshold(v ?? 5); mark(); }}
              addonBefore="$"
              style={{ width: 130 }}
            />
          }
        />
      </Section>

      <Section title="End of Day">
        <SettingRow
          label="End-of-Day Float Target"
          sublabel="Expected cash amount to leave in the drawer for the next shift"
          last
          control={
            <InputNumber
              min={0}
              value={eodFloatTarget}
              onChange={(v) => { setEodFloatTarget(v ?? 200); mark(); }}
              addonBefore="$"
              style={{ width: 130 }}
            />
          }
        />
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveAndNotify("Shift & cash")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  const LoyaltyTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Loyalty Program">
        <SettingRow
          label="Enable Loyalty Program"
          sublabel="Master toggle — allow customers to earn and redeem loyalty points"
          control={
            <Switch
              checked={loyaltyEnabled}
              onChange={(v) => { setLoyaltyEnabled(v); mark(); }}
              checkedChildren="ON"
              unCheckedChildren="OFF"
            />
          }
        />
        <SettingRow
          label="Points Expiry"
          sublabel="Points earned expire after this many days (0 = points never expire)"
          control={
            <InputNumber
              min={0}
              value={pointsExpiryDays}
              onChange={(v) => { setPointsExpiryDays(v ?? 365); mark(); }}
              disabled={!loyaltyEnabled}
              addonAfter="days"
              style={{ width: 140 }}
            />
          }
        />
        <SettingRow
          label="Minimum Redemption Points"
          sublabel="Customer must have at least this many points before redeeming"
          control={
            <InputNumber
              min={0}
              value={minRedemptionPoints}
              onChange={(v) => { setMinRedemptionPoints(v ?? 100); mark(); }}
              disabled={!loyaltyEnabled}
              addonAfter="pts"
              style={{ width: 140 }}
            />
          }
        />
        <SettingRow
          label="Allow Partial Redemption"
          sublabel="Customer can redeem a portion of their points (not required to redeem all)"
          control={
            <Switch
              checked={allowPartialRedemption}
              onChange={(v) => { setAllowPartialRedemption(v); mark(); }}
              disabled={!loyaltyEnabled}
            />
          }
        />
        <SettingRow
          label="Show Loyalty Points on Receipt"
          sublabel="Print the customer's current points balance and points earned on the receipt"
          last
          control={
            <Switch
              checked={showLoyaltyOnReceipt}
              onChange={(v) => { setShowLoyaltyOnReceipt(v); mark(); }}
              disabled={!loyaltyEnabled}
            />
          }
        />
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveAndNotify("Loyalty")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  const VouchersTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Voucher Redemption">
        <SettingRow
          label="Allow Voucher Redemption"
          sublabel="Customers can apply promotional voucher codes at checkout"
          control={<Switch checked={allowVoucherRedemption} onChange={(v) => { setAllowVoucherRedemption(v); mark(); }} />}
        />
        <SettingRow
          label="Allow Gift Card Redemption"
          sublabel="Customers can pay with gift cards at checkout"
          last
          control={<Switch checked={allowGiftCardRedemption} onChange={(v) => { setAllowGiftCardRedemption(v); mark(); }} />}
        />
      </Section>

      <Section title="Gift Card Issuance">
        <SettingRow
          label="Allow Gift Card Issuance"
          sublabel="Cashiers can issue new gift cards from the POS"
          control={<Switch checked={allowGiftCardIssuance} onChange={(v) => { setAllowGiftCardIssuance(v); mark(); }} />}
        />
        <SettingRow
          label="Default Gift Card Expiry"
          sublabel="Issued gift cards expire after this many days (0 = no expiry)"
          control={
            <InputNumber
              min={0}
              value={giftCardExpiryDays}
              onChange={(v) => { setGiftCardExpiryDays(v ?? 365); mark(); }}
              disabled={!allowGiftCardIssuance}
              addonAfter="days"
              style={{ width: 140 }}
            />
          }
        />
        <SettingRow
          label="Allow Multiple Gift Cards per Order"
          sublabel="Customer can apply more than one gift card to a single transaction"
          last
          control={
            <Switch
              checked={allowMultipleGiftCards}
              onChange={(v) => { setAllowMultipleGiftCards(v); mark(); }}
              disabled={!allowGiftCardRedemption}
            />
          }
        />
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveAndNotify("Vouchers & Gift Cards")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  const CustomerDisplayTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Customer Attachment">
        <SettingRow
          label="Auto-Attach Last Customer"
          sublabel="Automatically re-attach the last used customer to the next order"
          control={<Switch checked={autoAttachCustomer} onChange={(v) => { setAutoAttachCustomer(v); mark(); }} />}
        />
        <SettingRow
          label="Prompt to Add Customer on Checkout"
          sublabel="Show a reminder to attach a customer if none is selected"
          last
          control={<Switch checked={promptAddCustomer} onChange={(v) => { setPromptAddCustomer(v); mark(); }} />}
        />
      </Section>

      <Section title="Loyalty at Checkout">
        <SettingRow
          label="Show Loyalty Points Balance"
          sublabel="Display the customer's current points balance during checkout"
          last
          control={<Switch checked={showLoyaltyAtCheckout} onChange={(v) => { setShowLoyaltyAtCheckout(v); mark(); }} />}
        />
      </Section>

      <Section title="Product Grid">
        <SettingRow
          label="Default Product Sort Order"
          sublabel="How products are ordered when the grid first loads"
          control={
            <Select
              value={defaultProductSort}
              onChange={(v) => { setDefaultProductSort(v); mark(); }}
              style={{ width: 170 }}
              options={[
                { value: "name",       label: "Name (A–Z)"       },
                { value: "price_asc",  label: "Price (low–high)" },
                { value: "price_desc", label: "Price (high–low)" },
                { value: "category",   label: "Category"         },
              ]}
            />
          }
        />
        <SettingRow
          label="Hide Out-of-Stock Products"
          sublabel="Remove products with zero stock from the product grid"
          last
          control={<Switch checked={hideOutOfStock} onChange={(v) => { setHideOutOfStock(v); mark(); }} />}
        />
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveAndNotify("Customer & display")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  const RestaurantTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Restaurant Mode">
        <SettingRow
          label="Enable Restaurant Mode"
          sublabel="Master toggle — activates all restaurant features (table map, courses, kitchen printing)"
          control={
            <Switch
              checked={restaurantMode}
              onChange={(v) => { setRestaurantMode(v); mark(); }}
              checkedChildren="ON"
              unCheckedChildren="OFF"
            />
          }
        />
        <SettingRow
          label="Enable Table Management"
          sublabel="Show the Table Map page and attach tables to orders"
          control={
            <Switch
              checked={tableManagementEnabled}
              disabled={!restaurantMode}
              onChange={(v) => { setTableManagementEnabled(v); mark(); }}
            />
          }
        />
        <SettingRow
          label="Enable Course Management"
          sublabel="Assign Starter / Main / Dessert courses to cart items"
          control={
            <Switch
              checked={courseManagementEnabled}
              disabled={!restaurantMode}
              onChange={(v) => { setCourseManagementEnabled(v); mark(); }}
            />
          }
        />
        <SettingRow
          label="Enable Kitchen Printing"
          sublabel="Show Send to Kitchen button; print kitchen tickets via window.print()"
          control={
            <Switch
              checked={kitchenPrintingEnabled}
              disabled={!restaurantMode}
              onChange={(v) => { setKitchenPrintingEnabled(v); mark(); }}
            />
          }
        />
        <SettingRow
          label="Auto Send to Kitchen on Checkout"
          sublabel="Automatically send all items to kitchen when order is checked out"
          control={
            <Switch
              checked={autoSendKitchen}
              disabled={!restaurantMode || !kitchenPrintingEnabled}
              onChange={(v) => { setAutoSendKitchen(v); mark(); }}
            />
          }
        />
        <SettingRow
          label="Allow Take Away Orders"
          sublabel="Show a Take Away button on the Table Map to skip table selection"
          control={
            <Switch
              checked={allowTakeAway}
              disabled={!restaurantMode}
              onChange={(v) => { setAllowTakeAway(v); mark(); }}
            />
          }
        />
        <SettingRow
          label="Default Number of Guests"
          sublabel="Pre-filled guest count when a table is opened"
          last
          control={
            <InputNumber
              min={1} max={20}
              value={defaultGuests}
              onChange={(v) => { setDefaultGuests(v ?? 2); mark(); }}
              disabled={!restaurantMode}
              addonAfter="guests"
              style={{ width: 140 }}
            />
          }
        />
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveAndNotify("Restaurant")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  // ── Offline tab wrapper — adds Save button around the sub-component ────────

  const OfflineTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <OfflineSettingsTab onDirty={mark} />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveAndNotify("Offline mode")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  const ReturnsTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Return Policy">
        <SettingRow
          label="Return Window (days)"
          sublabel="Maximum number of days after purchase a return is accepted"
          control={
            <InputNumber
              min={0} max={365}
              value={returnWindowDays}
              onChange={(v) => { setReturnWindowDays(v ?? 30); mark(); }}
              addonAfter="days"
              style={{ width: 140 }}
            />
          }
        />
        <SettingRow
          label="Require Manager Approval"
          sublabel="All refunds must be approved by a manager before processing"
          control={<Switch checked={requireManagerRefund} onChange={(v) => { setRequireManagerRefund(v); mark(); }} />}
        />
        <SettingRow
          label="Require Refund Reason"
          sublabel="Cashiers must select a reason when processing any refund"
          control={<Switch checked={refundNoteRequired} onChange={(v) => { setRefundNoteRequired(v); mark(); }} />}
        />
        <SettingRow
          label="Restocking Fee"
          sublabel="Automatically deduct a restocking fee from the refund amount"
          last
          control={
            <InputNumber
              min={0} max={50}
              value={restockingFeePct}
              onChange={(v) => { setRestockingFeePct(v ?? 0); mark(); }}
              addonAfter="%"
              style={{ width: 120 }}
            />
          }
        />
      </Section>

      <Section title="Allowed Refund Methods">
        <SettingRow
          label="Refund to Original Payment Method"
          sublabel="Allow refund back to the card or method used at purchase"
          control={<Switch checked={allowOriginalRefund} onChange={(v) => { setAllowOriginalRefund(v); mark(); }} />}
        />
        <SettingRow
          label="Refund to Cash"
          sublabel="Allow cashier to issue a cash refund regardless of original payment"
          control={<Switch checked={allowCashRefund} onChange={(v) => { setAllowCashRefund(v); mark(); }} />}
        />
        <SettingRow
          label="Refund to Store Credit"
          sublabel="Allow issuing store credit or gift card instead of a cash/card refund"
          last
          control={<Switch checked={allowCreditRefund} onChange={(v) => { setAllowCreditRefund(v); mark(); }} />}
        />
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveAndNotify("Returns & Refunds")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  // ── Dirty indicator badge ─────────────────────────────────────────────────

  function navLabel(item: typeof NAV_ITEMS[number]) {
    const isActive = activeTab === item.key;
    const showDot  = isDirty && isActive;
    return (
      <span style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
        {item.label}
        {showDot && (
          <span style={{
            display: "inline-block", width: 6, height: 6,
            borderRadius: "50%", background: "#F59E0B",
            flexShrink: 0,
          }} />
        )}
      </span>
    );
  }

  // ── Layout helpers ─────────────────────────────────────────────────────────

  const navCard = (
    <Card
      style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadiusLG, flexShrink: 0 }}
      styles={{ body: { padding: 8 } }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => handleTabClick(item.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "10px 14px",
              border: "none",
              borderRadius: token.borderRadius,
              background: isActive ? token.colorPrimaryBg : "transparent",
              color: isActive ? token.colorPrimary : token.colorText,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              textAlign: "start",
              transition: "all 0.15s",
            }}
          >
            {item.icon}
            {navLabel(item)}
          </button>
        );
      })}
    </Card>
  );

  const contentCard = (
    <Card
      style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadiusLG, flex: 1, minWidth: 0 }}
      styles={{ body: { padding: 24 } }}
    >
      {activeTab === "general"     && GeneralTab}
      {activeTab === "pos-session" && POSSessionTab}
      {activeTab === "security"    && SecurityTab}
      {activeTab === "register"    && RegisterTab}
      {activeTab === "receipt"     && ReceiptTab}
      {activeTab === "payment"     && PaymentTaxTab}
      {activeTab === "discounts"   && DiscountsTab}
      {activeTab === "checkout"    && CheckoutTab}
      {activeTab === "shift"       && ShiftTab}
      {activeTab === "loyalty"     && LoyaltyTab}
      {activeTab === "vouchers"    && VouchersTab}
      {activeTab === "customer"    && CustomerDisplayTab}
      {activeTab === "offline"     && OfflineTab}
      {activeTab === "restaurant"  && RestaurantTab}
      {activeTab === "returns"     && ReturnsTab}
    </Card>
  );

  // ── Pending tab indicator (suppresses TS unused-var warning) ──────────────
  void pendingTab;

  if (settingsLayout === "vertical") {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ width: 230, flexShrink: 0 }}>{navCard}</div>
          <div style={{ flex: 1, minWidth: 0 }}>{contentCard}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card
          style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadiusLG }}
          styles={{ body: { padding: "4px 8px" } }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabClick(item.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px",
                    border: "none",
                    borderBottom: isActive ? `2px solid ${token.colorPrimary}` : "2px solid transparent",
                    borderRadius: token.borderRadius,
                    background: isActive ? token.colorPrimaryBg : "transparent",
                    color: isActive ? token.colorPrimary : token.colorText,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.icon}
                  {item.label}
                  {isDirty && isActive && (
                    <span style={{
                      display: "inline-block", width: 6, height: 6,
                      borderRadius: "50%", background: "#F59E0B",
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </Card>
        {contentCard}
      </div>
    </DashboardLayout>
  );
}

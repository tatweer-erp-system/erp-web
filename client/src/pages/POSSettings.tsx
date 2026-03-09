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
  InputNumber,
  Row,
  Select,
  Switch,
  Typography,
  theme as antTheme,
  message,
} from "antd";
import {
  ClockCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  LockOutlined,
  PrinterOutlined,
  SaveOutlined,
  ShoppingOutlined,
  TeamOutlined,
  WifiOutlined,
  ShopOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

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

const NAV_ITEMS = [
  { key: "pos-session", icon: <ClockCircleOutlined />, label: "POS Session"           },
  { key: "security",    icon: <LockOutlined />,        label: "Session Security"      },
  { key: "register",    icon: <PrinterOutlined />,     label: "Register & Hardware"   },
  { key: "payment",     icon: <CreditCardOutlined />,  label: "Payment & Tax"         },
  { key: "checkout",    icon: <ShoppingOutlined />,    label: "Checkout Rules"        },
  { key: "shift",       icon: <DollarOutlined />,      label: "Shift & Cash"          },
  { key: "customer",    icon: <TeamOutlined />,        label: "Customer & Display"    },
  { key: "offline",     icon: <WifiOutlined />,        label: "Offline Mode"          },
  { key: "restaurant",  icon: <ShopOutlined />,        label: "Restaurant"            },
];

export default function POSSettings() {
  const { token } = antTheme.useToken();
  const { settingsLayout } = useAppSettings();
  const [activeTab, setActiveTab] = useState("pos-session");

  const maxOrders             = usePOSStore((s) => s.maxOrders);
  const setMaxOrders          = usePOSStore((s) => s.setMaxOrders);
  const posSessionSettings    = usePOSStore((s) => s.posSessionSettings);
  const setPOSSessionSettings = usePOSStore((s) => s.setPOSSessionSettings);

  // Register hardware
  const [autoPrintReceipt,    setAutoPrintReceipt]    = useState(true);
  const [receiptCopies,       setReceiptCopies]        = useState(1);
  const [printerPaperSize,    setPrinterPaperSize]     = useState<"80mm" | "58mm">("80mm");
  const [openDrawerOnCash,    setOpenDrawerOnCash]     = useState(true);
  const [openDrawerOnReceipt, setOpenDrawerOnReceipt]  = useState(false);
  const [soundOnScan,         setSoundOnScan]          = useState(true);
  const [soundOnPayment,      setSoundOnPayment]       = useState(true);
  const [idleScreenTimeout,   setIdleScreenTimeout]    = useState(5);
  const [scannerMode,         setScannerMode]          = useState<"keyboard" | "serial">("keyboard");

  // Payment & Tax
  const [defaultTaxRate,      setDefaultTaxRate]       = useState(15);
  const [taxInclusive,        setTaxInclusive]         = useState(false);
  const [showTaxBreakdown,    setShowTaxBreakdown]     = useState(true);
  const [tipsEnabled,         setTipsEnabled]          = useState(false);
  const [roundingRule,        setRoundingRule]         = useState<"none" | "0.05" | "0.10" | "1.00">("none");
  const [cashEnabled,         setCashEnabled]          = useState(true);
  const [cardEnabled,         setCardEnabled]          = useState(true);
  const [splitEnabled,        setSplitEnabled]         = useState(true);
  const [giftCardEnabled,     setGiftCardEnabled]      = useState(true);
  const [voucherEnabled,      setVoucherEnabled]       = useState(true);

  // Checkout Rules
  const [allowPriceOverride,  setAllowPriceOverride]   = useState(false);
  const [requireVoidReason,   setRequireVoidReason]    = useState(true);
  const [requireRefundReason, setRequireRefundReason]  = useState(true);
  const [minSaleAmount,       setMinSaleAmount]        = useState(0);
  const [maxSaleAmount,       setMaxSaleAmount]        = useState(0);
  const [holdTimeout,         setHoldTimeout]          = useState(60);
  const [allowNegativeStock,  setAllowNegativeStock]   = useState(false);

  // Shift & Cash
  const [requireOpeningCount,  setRequireOpeningCount]  = useState(true);
  const [requireClosingCount,  setRequireClosingCount]  = useState(true);
  const [discrepancyThreshold, setDiscrepancyThreshold] = useState(5);
  const [eodFloatTarget,       setEodFloatTarget]       = useState(200);
  const [alertOnDiscrepancy,   setAlertOnDiscrepancy]   = useState(true);

  // Customer & Display
  const [autoAttachCustomer,   setAutoAttachCustomer]   = useState(false);
  const [promptAddCustomer,    setPromptAddCustomer]    = useState(false);
  const [showLoyaltyAtCheckout,setShowLoyaltyAtCheckout]= useState(true);
  const [defaultProductSort,   setDefaultProductSort]   = useState<"name" | "price_asc" | "price_desc" | "category">("name");
  const [hideOutOfStock,       setHideOutOfStock]       = useState(false);

  // Restaurant settings
  const restaurantMode          = usePOSStore((s) => s.restaurantMode);
  const setRestaurantMode       = usePOSStore((s) => s.setRestaurantMode);
  const tableManagementEnabled  = usePOSStore((s) => s.tableManagementEnabled);
  const setTableManagementEnabled = usePOSStore((s) => s.setTableManagementEnabled);
  const courseManagementEnabled = usePOSStore((s) => s.courseManagementEnabled);
  const setCourseManagementEnabled = usePOSStore((s) => s.setCourseManagementEnabled);
  const kitchenPrintingEnabled  = usePOSStore((s) => s.kitchenPrintingEnabled);
  const setKitchenPrintingEnabled = usePOSStore((s) => s.setKitchenPrintingEnabled);
  const autoSendKitchen         = usePOSStore((s) => s.autoSendKitchen);
  const setAutoSendKitchen      = usePOSStore((s) => s.setAutoSendKitchen);
  const allowTakeAway           = usePOSStore((s) => s.allowTakeAway);
  const setAllowTakeAway        = usePOSStore((s) => s.setAllowTakeAway);
  const defaultGuests           = usePOSStore((s) => s.defaultGuests);
  const setDefaultGuests        = usePOSStore((s) => s.setDefaultGuests);

  // ── Tab content ─────────────────────────────────────────────────────────────

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
                  onChange={(v) => setMaxOrders(v ?? 5)}
                  addonAfter="tabs"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success("POS settings saved")}>
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
              onChange={(v) => setPOSSessionSettings({ ...posSessionSettings, inactivityLockMinutes: v ?? 5 })}
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
              onChange={(v) => setPOSSessionSettings({ ...posSessionSettings, maxPINAttempts: v ?? 3 })}
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
              onChange={(v) => setPOSSessionSettings({ ...posSessionSettings, requireManagerForRefunds: v })}
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
              onChange={(v) => setPOSSessionSettings({ ...posSessionSettings, requireManagerForDiscountsAbove: v ?? 20 })}
              addonAfter="%"
              style={{ width: 120 }}
            />
          }
        />
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success("Security settings saved")}>
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
          control={<Switch checked={autoPrintReceipt} onChange={setAutoPrintReceipt} />}
        />
        <SettingRow
          label="Receipt Copies"
          sublabel="Number of copies printed per transaction"
          control={
            <InputNumber
              min={1} max={5}
              value={receiptCopies}
              onChange={(v) => setReceiptCopies(v ?? 1)}
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
              onChange={setPrinterPaperSize}
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
          control={<Switch checked={openDrawerOnCash} onChange={setOpenDrawerOnCash} />}
        />
        <SettingRow
          label="Open Drawer on Receipt Print"
          sublabel="Trigger cash drawer whenever a receipt is printed"
          last
          control={<Switch checked={openDrawerOnReceipt} onChange={setOpenDrawerOnReceipt} />}
        />
      </Section>

      <Section title="Barcode Scanner">
        <SettingRow
          label="Scanner Input Mode"
          sublabel="How the register receives barcode data from the scanner"
          control={
            <Select
              value={scannerMode}
              onChange={setScannerMode}
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
          control={<Switch checked={soundOnScan} onChange={setSoundOnScan} />}
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
              onChange={(v) => setIdleScreenTimeout(v ?? 5)}
              addonAfter="min"
              style={{ width: 120 }}
            />
          }
        />
        <SettingRow
          label="Sound on Payment Completion"
          sublabel="Play a confirmation sound when a payment is processed"
          last
          control={<Switch checked={soundOnPayment} onChange={setSoundOnPayment} />}
        />
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success("Register settings saved")}>
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
              onChange={(v) => setDefaultTaxRate(v ?? 15)}
              addonAfter="%"
              style={{ width: 120 }}
            />
          }
        />
        <SettingRow
          label="Tax-Inclusive Pricing"
          sublabel="Product prices already include tax — do not add tax on top"
          control={<Switch checked={taxInclusive} onChange={setTaxInclusive} />}
        />
        <SettingRow
          label="Show Tax Breakdown on Receipt"
          sublabel="Print a separate tax line on the customer receipt"
          last
          control={<Switch checked={showTaxBreakdown} onChange={setShowTaxBreakdown} />}
        />
      </Section>

      <Section title="Payment Options">
        <SettingRow
          label="Accept Cash"
          sublabel="Allow cash as a payment method at checkout"
          control={<Switch checked={cashEnabled} onChange={setCashEnabled} />}
        />
        <SettingRow
          label="Accept Card"
          sublabel="Allow card (debit / credit) payments at checkout"
          control={<Switch checked={cardEnabled} onChange={setCardEnabled} />}
        />
        <SettingRow
          label="Allow Split Payment"
          sublabel="Let customers split the total between cash and card"
          control={<Switch checked={splitEnabled} onChange={setSplitEnabled} />}
        />
        <SettingRow
          label="Accept Gift Cards"
          sublabel="Allow gift cards to be redeemed at checkout"
          control={<Switch checked={giftCardEnabled} onChange={setGiftCardEnabled} />}
        />
        <SettingRow
          label="Accept Vouchers"
          sublabel="Allow promotional voucher codes at checkout"
          last
          control={<Switch checked={voucherEnabled} onChange={setVoucherEnabled} />}
        />
      </Section>

      <Section title="Rounding & Gratuity">
        <SettingRow
          label="Cash Rounding Rule"
          sublabel="Round the total when paying by cash (useful where small coins are not in circulation)"
          control={
            <Select
              value={roundingRule}
              onChange={setRoundingRule}
              style={{ width: 150 }}
              options={[
                { value: "none",  label: "No rounding" },
                { value: "0.05",  label: "Nearest $0.05" },
                { value: "0.10",  label: "Nearest $0.10" },
                { value: "1.00",  label: "Nearest $1.00" },
              ]}
            />
          }
        />
        <SettingRow
          label="Enable Tips / Gratuity"
          sublabel="Show a tip prompt on the customer-facing display at checkout"
          last
          control={<Switch checked={tipsEnabled} onChange={setTipsEnabled} />}
        />
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success("Payment & tax settings saved")}>
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
          control={<Switch checked={allowPriceOverride} onChange={setAllowPriceOverride} />}
        />
        <SettingRow
          label="Allow Selling Out-of-Stock Items"
          sublabel="Proceed with checkout even when product stock is zero"
          last
          control={<Switch checked={allowNegativeStock} onChange={setAllowNegativeStock} />}
        />
      </Section>

      <Section title="Void & Refund">
        <SettingRow
          label="Require Reason for Void"
          sublabel="Cashier must select a void reason before cancelling a transaction"
          control={<Switch checked={requireVoidReason} onChange={setRequireVoidReason} />}
        />
        <SettingRow
          label="Require Reason for Refund"
          sublabel="Cashier must select a refund reason before processing a return"
          last
          control={<Switch checked={requireRefundReason} onChange={setRequireRefundReason} />}
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
              onChange={(v) => setMinSaleAmount(v ?? 0)}
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
              onChange={(v) => setMaxSaleAmount(v ?? 0)}
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
              onChange={(v) => setHoldTimeout(v ?? 60)}
              addonAfter="min"
              style={{ width: 130 }}
            />
          }
        />
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success("Checkout settings saved")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  const ShiftTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Opening & Closing Count">
        <SettingRow
          label="Require Opening Cash Count"
          sublabel="Cashier must count and enter the opening float before starting a shift"
          control={<Switch checked={requireOpeningCount} onChange={setRequireOpeningCount} />}
        />
        <SettingRow
          label="Require Closing Cash Count"
          sublabel="Cashier must count and enter the closing cash before ending a shift"
          last
          control={<Switch checked={requireClosingCount} onChange={setRequireClosingCount} />}
        />
      </Section>

      <Section title="Cash Discrepancy">
        <SettingRow
          label="Alert on Cash Discrepancy"
          sublabel="Notify the manager when closing cash differs from expected amount"
          control={<Switch checked={alertOnDiscrepancy} onChange={setAlertOnDiscrepancy} />}
        />
        <SettingRow
          label="Discrepancy Alert Threshold"
          sublabel="Trigger an alert only when the difference exceeds this amount"
          last
          control={
            <InputNumber
              min={0}
              value={discrepancyThreshold}
              onChange={(v) => setDiscrepancyThreshold(v ?? 5)}
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
              onChange={(v) => setEodFloatTarget(v ?? 200)}
              addonBefore="$"
              style={{ width: 130 }}
            />
          }
        />
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success("Shift & cash settings saved")}>
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
          control={<Switch checked={autoAttachCustomer} onChange={setAutoAttachCustomer} />}
        />
        <SettingRow
          label="Prompt to Add Customer on Checkout"
          sublabel="Show a reminder to attach a customer if none is selected"
          last
          control={<Switch checked={promptAddCustomer} onChange={setPromptAddCustomer} />}
        />
      </Section>

      <Section title="Loyalty at Checkout">
        <SettingRow
          label="Show Loyalty Points Balance"
          sublabel="Display the customer's current points balance during checkout"
          last
          control={<Switch checked={showLoyaltyAtCheckout} onChange={setShowLoyaltyAtCheckout} />}
        />
      </Section>

      <Section title="Product Grid">
        <SettingRow
          label="Default Product Sort Order"
          sublabel="How products are ordered when the grid first loads"
          control={
            <Select
              value={defaultProductSort}
              onChange={setDefaultProductSort}
              style={{ width: 170 }}
              options={[
                { value: "name",       label: "Name (A–Z)"      },
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
          control={<Switch checked={hideOutOfStock} onChange={setHideOutOfStock} />}
        />
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success("Customer & display settings saved")}>
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
              onChange={setRestaurantMode}
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
              onChange={setTableManagementEnabled}
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
              onChange={setCourseManagementEnabled}
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
              onChange={setKitchenPrintingEnabled}
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
              onChange={setAutoSendKitchen}
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
              onChange={setAllowTakeAway}
            />
          }
        />
        <SettingRow
          label="Default Number of Guests"
          sublabel="Pre-filled guest count when a table is opened"
          last
          control={
            <InputNumber
              min={1}
              max={20}
              value={defaultGuests}
              onChange={(v) => setDefaultGuests(v ?? 2)}
              disabled={!restaurantMode}
              addonAfter="guests"
              style={{ width: 140 }}
            />
          }
        />
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success("Restaurant settings saved")}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  // ── Layout helpers ───────────────────────────────────────────────────────────

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
            onClick={() => setActiveTab(item.key)}
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
            {item.label}
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
      {activeTab === "pos-session" && POSSessionTab}
      {activeTab === "security"    && SecurityTab}
      {activeTab === "register"    && RegisterTab}
      {activeTab === "payment"     && PaymentTaxTab}
      {activeTab === "checkout"    && CheckoutTab}
      {activeTab === "shift"       && ShiftTab}
      {activeTab === "customer"    && CustomerDisplayTab}
      {activeTab === "offline"     && <OfflineSettingsTab />}
      {activeTab === "restaurant"  && RestaurantTab}
    </Card>
  );

  if (settingsLayout === "vertical") {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ width: 220, flexShrink: 0 }}>{navCard}</div>
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
                  onClick={() => setActiveTab(item.key)}
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

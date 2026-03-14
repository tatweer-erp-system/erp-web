export const en: Record<string, string> = {
  // Navigation sections
  Dashboard: "Dashboard",
  SALES: "Sales",
  PURCHASES: "Purchases",
  INVENTORY: "Inventory",
  ACCOUNTING: "Accounting",
  TREASURY: "Treasury",
  REPORTS: "Reports",
  SETTINGS: "Settings",

  // Sales
  Customers: "Customers",
  "All Customers": "All Customers",
  "Customer Groups": "Customer Groups",
  Quotations: "Quotations",
  "Sales Orders": "Sales Orders",
  "All Orders": "All Orders",
  Pending: "Pending",
  Completed: "Completed",
  "Sales Invoices": "Sales Invoices",
  "Sales Returns": "Sales Returns",
  "Customer Receipts": "Customer Receipts",
  "Customer Statements": "Customer Statements",

  // Purchases
  Vendors: "Vendors",
  "All Vendors": "All Vendors",
  "Vendor Groups": "Vendor Groups",
  "Purchase Orders": "Purchase Orders",
  "Purchase Invoices": "Purchase Invoices",
  "Purchase Returns": "Purchase Returns",
  "Vendor Payments": "Vendor Payments",
  "Vendor Statements": "Vendor Statements",

  // Inventory
  Products: "Products",
  "All Products": "All Products",
  "In Stock": "In Stock",
  "Low Stock": "Low Stock",
  "Product Categories": "Product Categories",
  "Units of Measure": "Units of Measure",
  Warehouses: "Warehouses",
  "Opening Stock": "Opening Stock",
  "Stock Adjustments": "Stock Adjustments",
  "Stock Transfers": "Stock Transfers",
  "Stock Count": "Stock Count",
  "Inventory Valuation": "Inventory Valuation",
  "Stock Movement Report": "Stock Movement Report",

  // Accounting
  "Chart of Accounts": "Chart of Accounts",
  "Journal Entries": "Journal Entries",
  "Journal Types": "Journal Types",
  "Opening Balances": "Opening Balances",
  "Fiscal Years": "Fiscal Years",
  "Period Closing": "Period Closing",
  "Account Statements": "Account Statements",
  "Trial Balance": "Trial Balance",
  "General Ledger": "General Ledger",
  "Income Statement": "Income Statement",
  "Balance Sheet": "Balance Sheet",
  "Cash Flow Statement": "Cash Flow Statement",

  // Treasury
  "Cash Accounts": "Cash Accounts",
  "Bank Accounts": "Bank Accounts",
  Receipts: "Receipts",
  Payments: "Payments",
  "Bank Transfers": "Bank Transfers",
  "Bank Reconciliation": "Bank Reconciliation",

  // Reports
  "Sales Reports": "Sales Reports",
  "Purchase Reports": "Purchase Reports",
  "Inventory Reports": "Inventory Reports",
  "Financial Reports": "Financial Reports",
  "Aging Reports": "Aging Reports",
  "Tax Reports": "Tax Reports",

  // Settings
  "Company Profile": "Company Profile",
  Branches: "Branches",
  Currencies: "Currencies",
  "Exchange Rates": "Exchange Rates",
  Taxes: "Taxes",
  "Numbering Series": "Numbering Series",
  "Payment Methods": "Payment Methods",
  "Price Lists": "Price Lists",
  "Cost Centers": "Cost Centers",
  Users: "Users",
  "Roles & Permissions": "Roles & Permissions",
  "Audit Logs": "Audit Logs",

  // Definitions
  Definitions: "Definitions",

  // UI
  Logout: "Logout",
  Search: "Search",
  Settings: "Settings",
  Profile: "Profile",

  // Login
  "login.welcome": "Welcome",
  "login.subtitle": "Sign in to continue to the dashboard",
  "login.emailLabel": "Email",
  "login.emailPlaceholder": "you@company.com",
  "login.passwordLabel": "Password",
  "login.passwordPlaceholder": "Enter your password",
  "login.showPassword": "Show",
  "login.hidePassword": "Hide",
  "login.signIn": "Sign In",
  "login.signingIn": "Signing in...",
  "login.invalidCredentials": "Invalid email or password. Please try again.",
  "login.accountLocked":
    "Your account has been locked. Please contact an administrator.",
  "login.networkError":
    "Unable to connect to the server. Please try again later.",
  "login.success": "Signed in successfully!",
  "login.redirecting": "Redirecting to dashboard...",
  "login.selectBranch": "Select Branch",
  "login.selectBranchHint": "Choose the branch you want to access",
  "login.back": "Back",
  "login.footerNote": "Tatweer ERP Enterprise Suite",
  "login.vision2030": "Kingdom of Saudi Arabia  -  Vision 2030",
  "login.cashierNotAllowed":
    "Cashier accounts must use the POS terminal to log in.",

  // Branch & Order fields
  branch: "Branch",
  selectBranch: "Select Branch",
  orderNumber: "Order Number",
  employeeNumber: "Employee Number",

  // Project members
  projectMembers: "Project Members",
  addMember: "Add Member",
  memberRole: "Member Role",
  owner: "Owner",
  member: "Member",
  viewer: "Viewer",
  removeMember: "Remove Member",
  removeMemberConfirm: "Are you sure you want to remove this member?",
  selectUser: "Select User",

  // Roles
  roles: "Roles",
  assignRoles: "Assign Roles",

  // Misc
  lowStock: "Low Stock",
  sequences: "Sequences",
  save: "Save",
  cancel: "Cancel",
  confirm: "Confirm",
  actions: "Actions",
  name: "Name",
  email: "Email",
  status: "Status",
  date: "Date",
  total: "Total",
  noData: "No data available",

  // Sequence Settings
  "seq.title": "Sequence Configuration",
  "seq.subtitle": "Manage auto-numbering sequences for all document types",
  "seq.entity": "Entity",
  "seq.prefix": "Prefix",
  "seq.lastValue": "Last Value",
  "seq.padding": "Padding",
  "seq.digits": "digits",
  "seq.resetCycle": "Reset Cycle",
  "seq.scope": "Scope",
  "seq.lastNumber": "Last Number",
  "seq.branchLevel": "Branch Level",
  "seq.actions": "Actions",
  "seq.edit": "Edit",
  "seq.reset": "Reset",
  "seq.companyWide": "Company-wide",
  "seq.searchPlaceholder": "Search by entity, prefix, or scope...",
  "seq.reload": "Reload",
  "seq.dataReloaded": "Data reloaded",
  "seq.of": "of",
  "seq.sequences": "sequences",
  "seq.noData": "No sequences found. Adjust your search.",
  "seq.editTitle": "Edit Sequence",
  "seq.saveChanges": "Save Changes",
  "seq.prefixRequired": "Prefix is required",
  "seq.paddingRequired": "Padding is required",
  "seq.versionInfo": "Optimistic lock version",
  "seq.editSuccess": "Sequence updated successfully",
  "seq.resetTitle": "Reset Counter",
  "seq.confirmReset": "Reset Counter",
  "seq.resetWarning":
    "This will reset the counter to 0. This action is logged.",
  "seq.resetWarningDesc":
    "The counter for this sequence will be set back to zero. All future numbers will start from 1 again. This action cannot be undone.",
  "seq.resetReason": "Reason for reset",
  "seq.reasonRequired": "A reason is required",
  "seq.reasonMinLength": "Reason must be at least 3 characters",
  "seq.reasonPlaceholder": "Explain why this counter is being reset...",
  "seq.resetSuccess": "Counter has been reset to 0",
  "seq.branchToggleTooltip": "Enable branch-level counters",
  "seq.branchEnabled": "Branch-level counters enabled",
  "seq.branchDisabled": "Branch-level counters disabled",
  "seq.cycle.never": "Never",
  "seq.cycle.yearly": "Yearly",
  "seq.cycle.monthly": "Monthly",
  "seq.entity.sales_order": "Sales Order",
  "seq.entity.purchase_order": "Purchase Order",
  "seq.entity.employee": "Employee",
  "seq.entity.sales_invoice": "Sales Invoice",
  "seq.entity.purchase_invoice": "Purchase Invoice",
  "seq.entity.journal_entry": "Journal Entry",
  "seq.entity.stock_transfer": "Stock Transfer",
  "seq.entity.customer_receipt": "Customer Receipt",
  "seq.entity.quotation": "Quotation",
  "seq.entity.leave_request": "Leave Request",
  "Sequence Settings": "Sequence Settings",

  // Low Stock Alerts
  "inventory.lowStockAlert": "Low Stock Alert",
  "inventory.outOfStock": "Out of Stock",
  "inventory.inStock": "In Stock",
  "inventory.showLowStockOnly": "Show Low Stock Only",
  "inventory.stockStatus": "Stock Status",
  "inventory.currentQty": "Current Qty",
  "inventory.reorderPoint": "Reorder Point",
  "inventory.lowStockNotif": "Low stock alert",
  "inventory.lowStockNotifDesc":
    "has only {qty} units remaining (reorder point: {reorderPoint})",

  // ── My Settings ──────────────────────────────────────────────────────────────
  "mySettings.title": "My Settings",
  "mySettings.subtitle":
    "Manage your personal preferences and account settings",

  // Tabs
  "mySettings.tabs.general": "General",
  "mySettings.tabs.profile": "Profile",
  "mySettings.tabs.notifications": "Notifications",
  "mySettings.tabs.security": "Security",
  "mySettings.tabs.appearance": "Appearance",
  "mySettings.tabs.integrations": "Integrations",
  "mySettings.tabs.loyalty": "Loyalty Settings",
  "mySettings.tabs.vouchers": "Vouchers & Gift Cards",

  // Coming Soon
  "mySettings.comingSoon": "Coming Soon",
  "mySettings.comingSoon.tooltip": "This feature is coming soon",
  "mySettings.comingSoon.description":
    "This section is under development and will be available soon",

  // Profile tab
  "mySettings.profile.title": "Personal Information",
  "mySettings.profile.subtitle":
    "Update your personal details and profile photo",
  "mySettings.profile.avatar": "Profile Photo",
  "mySettings.profile.avatarHint": "PNG or JPG, 256×256px recommended, max 2MB",
  "mySettings.profile.uploadNew": "Upload new",
  "mySettings.profile.remove": "Remove",
  "mySettings.profile.fullName": "Full Name",
  "mySettings.profile.fullNamePlaceholder": "Enter your full name",
  "mySettings.profile.email": "Email Address",
  "mySettings.profile.emailReadonly": "Email cannot be changed here",
  "mySettings.profile.jobTitle": "Job Title",
  "mySettings.profile.jobTitlePlaceholder": "e.g. Branch Manager",
  "mySettings.profile.phone": "Phone Number",
  "mySettings.profile.phonePlaceholder": "+966 5xx xxx xxxx",
  "mySettings.profile.bio": "Bio",
  "mySettings.profile.bioPlaceholder": "Write a short bio about yourself...",
  "mySettings.profile.saveProfile": "Save Profile",
  "mySettings.profile.saved": "Profile saved successfully",
  "mySettings.profile.avatarUploaded": "Profile photo updated",

  // General tab
  "mySettings.general.regional": "Regional & Locale",
  "mySettings.general.regionalDesc":
    "Configure language, timezone, and display formats",
  "mySettings.general.language": "System Language",
  "mySettings.general.timezone": "Timezone",
  "mySettings.general.dateFormat": "Date Format",
  "mySettings.general.currency": "Currency",
  "mySettings.general.financialYear": "Financial Year",
  "mySettings.general.numberFormat": "Number Format",
  "mySettings.general.saved": "Setting saved",
  "mySettings.general.dataBackup": "Data & Backup",
  "mySettings.general.dataBackupDesc":
    "Manage data exports and backup schedules",
  "mySettings.general.posConfig": "POS Configuration",
  "mySettings.general.posConfigDesc":
    "Configure point-of-sale terminal settings",
  "mySettings.general.autoBackup": "Auto Backup",
  "mySettings.general.backupFrequency": "Backup Frequency",
  "mySettings.general.backupDaily": "Daily",
  "mySettings.general.backupWeekly": "Weekly",
  "mySettings.general.backupMonthly": "Monthly",
  "mySettings.general.retentionPeriod": "Retention Period",
  "mySettings.general.retentionDays": "{days} Days",
  "mySettings.general.retention30": "30 Days",
  "mySettings.general.retention60": "60 Days",
  "mySettings.general.retention90": "90 Days",
  "mySettings.general.retention365": "365 Days",
  "mySettings.general.exportData": "Export Data",
  "mySettings.general.defaultTaxRate": "Default Tax Rate",
  "mySettings.general.allowNegativeStock": "Allow Negative Stock",
  "mySettings.general.maxHeldOrders": "Max Held Orders",
  "mySettings.general.loyaltyEnabled": "Loyalty Enabled",

  // Notifications tab
  "mySettings.notifications.channels": "Notification Channels",
  "mySettings.notifications.channelsDesc":
    "Choose which notifications you want to receive",
  "mySettings.notifications.emailNotifications": "Email Notifications",
  "mySettings.notifications.orderUpdates": "Order Updates",
  "mySettings.notifications.inventoryAlerts": "Inventory Alerts",
  "mySettings.notifications.systemAlerts": "System Alerts",
  "mySettings.notifications.systemAlertsLocked":
    "System alerts are always enabled for security",
  "mySettings.notifications.weeklyReports": "Weekly Reports",
  "mySettings.notifications.billingReminders": "Billing Reminders",
  "mySettings.notifications.productUpdates": "Product Updates",
  "mySettings.notifications.delivery": "Delivery Preferences",
  "mySettings.notifications.deliveryDesc":
    "Configure how and when you receive notifications",
  "mySettings.notifications.digestFrequency": "Email Digest Frequency",
  "mySettings.notifications.realtime": "Real-time",
  "mySettings.notifications.daily": "Daily digest",
  "mySettings.notifications.weekly": "Weekly digest",
  "mySettings.notifications.quietHours": "Quiet Hours",
  "mySettings.notifications.quietHoursDesc":
    "No notifications will be sent during this time",
  "mySettings.notifications.saved": "Notification preferences saved",

  // Security tab
  "mySettings.security.changePassword": "Change Password",
  "mySettings.security.changePasswordDesc":
    "Update your account password regularly for security",
  "mySettings.security.currentPassword": "Current Password",
  "mySettings.security.newPassword": "New Password",
  "mySettings.security.confirmPassword": "Confirm New Password",
  "mySettings.security.updatePassword": "Update Password",
  "mySettings.security.passwordUpdated": "Password updated successfully",
  "mySettings.security.passwordMismatch": "Passwords do not match",
  "mySettings.security.twoFactor": "Two-Factor Authentication",
  "mySettings.security.twoFactorDesc":
    "Add an extra layer of security to your account",
  "mySettings.security.twoFactorNotEnabled": "2FA is not enabled",
  "mySettings.security.twoFactorNotEnabledDesc":
    "Your account is less secure without two-factor authentication",
  "mySettings.security.enable2fa": "Enable 2FA",
  "mySettings.security.disable2fa": "Disable 2FA",
  "mySettings.security.twoFactorEnabled": "2FA is enabled",
  "mySettings.security.twoFactorEnabledDesc":
    "Your account is protected with two-factor authentication",
  "mySettings.security.setup2fa": "Set Up Two-Factor Authentication",
  "mySettings.security.scanQrCode":
    "Scan this QR code with your authenticator app",
  "mySettings.security.enterCode": "Enter verification code",
  "mySettings.security.verifyAndEnable": "Verify & Enable",
  "mySettings.security.confirmDisable2fa": "Enter your password to disable 2FA",
  "mySettings.security.activeSessions": "Active Sessions",
  "mySettings.security.activeSessionsDesc":
    "Manage your active sessions across devices",
  "mySettings.security.thisDevice": "This device",
  "mySettings.security.revoke": "Revoke",
  "mySettings.security.revokeAll": "Revoke All Other Sessions",
  "mySettings.security.sessionRevoked": "Session revoked",
  "mySettings.security.allSessionsRevoked": "All other sessions revoked",
  "mySettings.security.ago": "ago",
  "mySettings.security.setup2faSubtitle":
    "Scan the QR code below with your authenticator app",
  "mySettings.security.disable2faTitle": "Disable Two-Factor Authentication",
  "mySettings.security.disable2faWarning":
    "Disabling 2FA will make your account less secure. Are you sure?",
  "mySettings.security.enterPassword": "Enter your password",
  "mySettings.security.confirmDisableBtn": "Confirm Disable",
  "mySettings.security.twoFactorEnableSuccess":
    "Two-factor authentication enabled successfully",
  "mySettings.security.twoFactorDisableSuccess":
    "Two-factor authentication disabled",
  "mySettings.security.updatePasswordError": "Failed to update password",
  "mySettings.security.twoFactorError":
    "Two-factor authentication operation failed",
  "mySettings.security.revokeError": "Failed to revoke session",
  "mySettings.security.revokeAllError": "Failed to revoke sessions",
  "mySettings.security.cancel": "Cancel",

  // Appearance tab
  "mySettings.appearance.title": "Display & Appearance",
  "mySettings.appearance.subtitle":
    "Customize how the application looks and feels",
  "mySettings.appearance.theme": "Theme",
  "mySettings.appearance.themeLight": "Light",
  "mySettings.appearance.themeDark": "Dark",
  "mySettings.appearance.themeSystem": "System",
  "mySettings.appearance.primaryColor": "Primary Color",
  "mySettings.appearance.language": "Language",
  "mySettings.appearance.density": "Display Density",
  "mySettings.appearance.densityCompact": "Compact",
  "mySettings.appearance.densityDefault": "Default",
  "mySettings.appearance.densityComfortable": "Comfortable",
  "mySettings.appearance.saved": "Appearance saved",

  // Integrations tab
  "mySettings.integrations.title": "Integrations",
  "mySettings.integrations.subtitle":
    "Connect with third-party services and tools",
  "mySettings.integrations.connected": "Connected",
  "mySettings.integrations.notConnected": "Not connected",
  "mySettings.integrations.connect": "Connect",
  "mySettings.integrations.slack": "Slack",
  "mySettings.integrations.slackDesc":
    "Send notifications and updates to your Slack workspace channels",
  "mySettings.integrations.google": "Google Workspace",
  "mySettings.integrations.googleDesc":
    "Sync calendars, contacts, and documents with Google Workspace",
  "mySettings.integrations.zapier": "Zapier",
  "mySettings.integrations.zapierDesc":
    "Automate workflows by connecting with 5,000+ apps via Zapier",

  // Loyalty tab
  "mySettings.loyalty.title": "Loyalty Settings",
  "mySettings.loyalty.subtitle":
    "Configure loyalty program rules and point settings",
  "mySettings.loyalty.programName": "Program Name",
  "mySettings.loyalty.pointsPerUnit": "Points Per Currency Unit",
  "mySettings.loyalty.redemptionRate": "Redemption Rate",
  "mySettings.loyalty.expiryDays": "Points Expiry (Days)",
  "mySettings.loyalty.enabled": "Loyalty Program Enabled",

  // Vouchers tab
  "mySettings.vouchers.title": "Vouchers & Gift Cards",
  "mySettings.vouchers.subtitle":
    "Manage voucher types and gift card configuration",
  "mySettings.vouchers.voucherTypes": "Voucher Types",
  "mySettings.vouchers.percentage": "Percentage",
  "mySettings.vouchers.fixedAmount": "Fixed Amount",
  "mySettings.vouchers.giftCardSettings": "Gift Card Settings",
  "mySettings.vouchers.minimumValue": "Minimum Value",
  "mySettings.vouchers.maximumValue": "Maximum Value",
  "mySettings.vouchers.expiryMonths": "Expiry Period (Months)",

  // Common
  "mySettings.error.network": "Connection error, please try again",
  "mySettings.error.save": "Failed to save changes",

  // Cross-Module Navigation
  "nav.relatedLeads": "Related Leads",
  "nav.relatedSalesOrders": "Related Sales Orders",
  "nav.relatedContact": "Related Contact",
  "nav.relatedVendor": "Related Vendor",
  "nav.stockMovements": "Stock Movements",
  "nav.convertToSalesOrder": "Convert to Sales Order",
  "nav.leaveRequests": "Leave Requests",
  "nav.assignedTasks": "Assigned Tasks",
  "nav.userAccount": "User Account",
  "nav.stockLevels": "Stock Levels",
  "nav.relatedOrderLines": "Related Order Lines",
  "nav.lowStockAlertStatus": "Low Stock Alert",
  "nav.projectMembers": "Members",
  "nav.projectTasks": "Tasks",
  "nav.projectTeam": "Team",
  "nav.viewAll": "View All",
  "nav.warehouse": "Warehouse",
  "nav.quantity": "Quantity",
  "nav.status": "Status",
};

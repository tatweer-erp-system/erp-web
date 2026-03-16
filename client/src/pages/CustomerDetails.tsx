import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  Edit,
  MoreVertical,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Tag,
  ShoppingCart,
  DollarSign,
  Calendar,
  MessageSquare,
  Send,
  Bell,
  Shield,
  Trash2,
  ExternalLink,
  Users,
  FileText,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { CollapsibleCard } from "@/components/common/CollapsibleCard";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { AnimatedModal } from "@/components/AnimatedModal";
import { AttachmentsTab } from "@/components/AttachmentsTab";
import { useLocation } from "wouter";
import { CustomerStatus } from "@/constants/enums";

// ── Mock customer data ────────────────────────────────────────────────────────

const CUSTOMER = {
  id: 1,
  name: "Sarah Williams",
  email: "sarah@techcorp.com",
  phone: "+1 (555) 456-7890",
  company: "Tech Corp",
  address: "123 Business Ave, San Francisco, CA 94105",
  segment: "Premium",
  status: CustomerStatus.ACTIVE,
  since: "Jan 2021",
  totalOrders: 15,
  totalSpent: "$42,100",
  avgOrderValue: "$2,807",
  lastOrder: "Feb 20, 2024",
};

const ORDER_HISTORY = [
  {
    id: "ORD-2024-001",
    date: "Feb 20, 2024",
    items: 3,
    amount: "$3,117",
    status: "In Transit",
  },
  {
    id: "ORD-2024-002",
    date: "Feb 15, 2024",
    items: 1,
    amount: "$1,245",
    status: "Delivered",
  },
  {
    id: "ORD-2024-003",
    date: "Feb 10, 2024",
    items: 5,
    amount: "$2,890",
    status: "Delivered",
  },
  {
    id: "ORD-2024-004",
    date: "Jan 28, 2024",
    items: 2,
    amount: "$5,600",
    status: "Delivered",
  },
  {
    id: "ORD-2024-005",
    date: "Jan 15, 2024",
    items: 4,
    amount: "$4,100",
    status: "Delivered",
  },
];

const COMMS_LOG = [
  {
    type: "Email",
    Icon: Mail,
    message: "Order confirmation sent",
    date: "Feb 20, 2024",
    agent: "System",
  },
  {
    type: "Phone",
    Icon: Phone,
    message: "Customer called regarding shipping",
    date: "Feb 19, 2024",
    agent: "John (Sales)",
  },
  {
    type: "Email",
    Icon: Mail,
    message: "Promotional offer sent",
    date: "Feb 15, 2024",
    agent: "Marketing",
  },
  {
    type: "Note",
    Icon: MessageSquare,
    message: "Customer requested priority shipping for next order",
    date: "Feb 10, 2024",
    agent: "Jane (Support)",
  },
];

const ORDER_STATUS_STYLES: Record<string, string> = {
  "In Transit":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Delivered:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Pending:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Cancelled: "bg-secondary text-muted-foreground",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CustomerDetails() {
  const [, navigate] = useLocation();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: CUSTOMER.name,
    email: CUSTOMER.email,
    phone: CUSTOMER.phone,
    address: CUSTOMER.address,
    company: CUSTOMER.company,
  });

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Sales", href: "#" },
    { label: "Customers", href: "/customers" },
    { label: CUSTOMER.name },
  ];

  return (
    <DashboardLayout currentPage="Customer Details" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* 1. Page Header */}
        <PageHeader
          title={CUSTOMER.name}
          subtitle={`${CUSTOMER.company} · Customer since ${CUSTOMER.since}`}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/customers")}
                className="gap-2"
              >
                <ChevronLeft size={15} />
                Back
              </Button>
              <Button
                onClick={() => setEditOpen(true)}
                className="gap-2 bg-primary hover:bg-primary/90 text-white"
              >
                <Edit size={15} />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical size={15} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Send Email</DropdownMenuItem>
                  <DropdownMenuItem>Export Data</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    Delete Customer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        />

        {/* 2. Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Orders"
            value={CUSTOMER.totalOrders}
            icon={<ShoppingCart size={18} className="text-primary" />}
            iconBg="bg-primary/10"
          />
          <StatCard
            title="Total Spent"
            value={CUSTOMER.totalSpent}
            icon={<DollarSign size={18} className="text-green-500" />}
            iconBg="bg-green-100 dark:bg-green-900/30"
            change={12.5}
          />
          <StatCard
            title="Avg Order Value"
            value={CUSTOMER.avgOrderValue}
            icon={<Tag size={18} className="text-orange-500" />}
            iconBg="bg-orange-100 dark:bg-orange-900/30"
          />
          <StatCard
            title="Last Order"
            value={CUSTOMER.lastOrder}
            icon={<Calendar size={18} className="text-muted-foreground" />}
            iconBg="bg-secondary"
          />
        </div>

        {/* 3. Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview" className="gap-1.5">
              <User size={14} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5">
              <ShoppingCart size={14} />
              Orders
            </TabsTrigger>
            <TabsTrigger value="communications" className="gap-1.5">
              <MessageSquare size={14} />
              Communications
            </TabsTrigger>
            <TabsTrigger value="attachments" className="gap-1.5">
              <Tag size={14} />
              Attachments
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5">
              <Shield size={14} />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <CollapsibleCard
              title="Contact Information"
              icon={<User size={15} />}
            >
              <div className="flex items-start gap-6">
                <Avatar className="h-16 w-16 text-lg">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {CUSTOMER.name
                      .split(" ")
                      .map(n => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  <InfoRow
                    icon={<User size={14} />}
                    label="Full Name"
                    value={CUSTOMER.name}
                  />
                  <InfoRow
                    icon={<Mail size={14} />}
                    label="Email"
                    value={CUSTOMER.email}
                  />
                  <InfoRow
                    icon={<Phone size={14} />}
                    label="Phone"
                    value={CUSTOMER.phone}
                  />
                  <InfoRow
                    icon={<Building2 size={14} />}
                    label="Company"
                    value={CUSTOMER.company}
                  />
                  <InfoRow
                    icon={<MapPin size={14} />}
                    label="Address"
                    value={CUSTOMER.address}
                    className="sm:col-span-2"
                  />
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard title="Account Details" icon={<Tag size={15} />}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InfoRow label="Customer ID" value={`#${CUSTOMER.id}`} />
                <InfoRow label="Segment" value={CUSTOMER.segment} />
                <InfoRow
                  label="Status"
                  value={
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </span>
                  }
                />
                <InfoRow label="Customer Since" value={CUSTOMER.since} />
              </div>
            </CollapsibleCard>

            {/* Cross-Module Navigation Links */}
            <CollapsibleCard
              title="Related Modules"
              icon={<ExternalLink size={15} />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    navigate(`/all-orders?customerId=${CUSTOMER.id}`)
                  }
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <ShoppingCart size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Related Sales Orders
                    </p>
                    <p className="text-xs text-muted-foreground">
                      View orders placed by this customer
                    </p>
                  </div>
                  <ExternalLink
                    size={14}
                    className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
                <button
                  onClick={() =>
                    navigate(`/all-customers?relatedLeads=${CUSTOMER.id}`)
                  }
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left group"
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <Users size={16} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Related Leads
                    </p>
                    <p className="text-xs text-muted-foreground">
                      View leads linked to this contact
                    </p>
                  </div>
                  <ExternalLink
                    size={14}
                    className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              </div>
            </CollapsibleCard>
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders" className="space-y-4 mt-4">
            <CollapsibleCard
              title="Order History"
              subtitle={`${CUSTOMER.totalOrders} orders total`}
              icon={<ShoppingCart size={15} />}
            >
              <div className="divide-y divide-border">
                {ORDER_HISTORY.map(order => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground font-mono">
                        {order.id}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {order.date} · {order.items} item
                        {order.items !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${ORDER_STATUS_STYLES[order.status] ?? ""}`}
                      >
                        {order.status}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {order.amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleCard>
          </TabsContent>

          {/* Communications */}
          <TabsContent value="communications" className="space-y-4 mt-4">
            <CollapsibleCard
              title="Communication Log"
              icon={<MessageSquare size={15} />}
              actions={
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                >
                  <Send size={12} /> Send Email
                </Button>
              }
            >
              <div className="space-y-4">
                {COMMS_LOG.map((entry, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="mt-0.5 w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <entry.Icon size={13} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{entry.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {entry.date} · {entry.agent}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground self-start">
                      {entry.type}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="Notification Preferences"
              icon={<Bell size={15} />}
              defaultOpen={false}
            >
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  · Order confirmations:{" "}
                  <span className="text-green-600 font-medium">Enabled</span>
                </p>
                <p>
                  · Promotional emails:{" "}
                  <span className="text-green-600 font-medium">Enabled</span>
                </p>
                <p>
                  · SMS notifications:{" "}
                  <span className="text-muted-foreground font-medium">
                    Disabled
                  </span>
                </p>
              </div>
            </CollapsibleCard>
          </TabsContent>

          {/* Attachments */}
          <TabsContent value="attachments" className="mt-4">
            <AttachmentsTab entityName={`Customer: ${CUSTOMER.name}`} />
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-4 mt-4">
            <CollapsibleCard
              title="Account Settings"
              icon={<Shield size={15} />}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Account Status
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Activate or deactivate this customer account
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-300"
                  >
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Customer Segment
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Currently: {CUSTOMER.segment}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="Danger Zone"
              icon={<Trash2 size={15} />}
              defaultOpen={false}
            >
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Permanently delete this customer and all associated data. This
                  cannot be undone.
                </p>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white gap-2"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 size={14} />
                  Delete Customer
                </Button>
              </div>
            </CollapsibleCard>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Modal */}
      <AnimatedModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Customer"
        onSubmit={() => setEditOpen(false)}
        submitLabel="Save Changes"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                value={editForm.name}
                onChange={e =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input
                value={editForm.company}
                onChange={e =>
                  setEditForm({ ...editForm, company: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={editForm.email}
              onChange={e =>
                setEditForm({ ...editForm, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={editForm.phone}
              onChange={e =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input
              value={editForm.address}
              onChange={e =>
                setEditForm({ ...editForm, address: e.target.value })
              }
            />
          </div>
        </div>
      </AnimatedModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={v => !v && setDeleteOpen(false)}
        title="Delete Customer"
        description={`"${CUSTOMER.name}" and all their data will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete Customer"
        onConfirm={() => setDeleteOpen(false)}
      />
    </DashboardLayout>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

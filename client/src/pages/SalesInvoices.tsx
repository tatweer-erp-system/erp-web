/**
 * REFERENCE: List Page Standard
 * ─────────────────────────────
 * Structure:
 *   PageHeader  (title + subtitle + primary CTA)
 *   Stats Row   (StatCard × N)
 *   DataTable   (search + filters + export + view-toggle built-in)
 *   AnimatedModal  for Create / Edit
 *   ConfirmDialog  for Delete
 */

import { useState, useMemo } from "react";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  DollarSign,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { AnimatedModal } from "@/components/AnimatedModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ColumnDef,
  PaginationState,
} from "@/components/common/DataTable/types";
import { InvoiceStatus } from "@/constants/enums";

// ── Types ────────────────────────────────────────────────────────────────────

interface Invoice {
  id: number;
  invoiceNo: string;
  customer: string;
  amount: string;
  status: InvoiceStatus;
  date: string;
  dueDate: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const DATA: Invoice[] = [
  {
    id: 1,
    invoiceNo: "SI-2024-001",
    customer: "Tech Corp",
    amount: "$5,000",
    status: InvoiceStatus.PAID,
    date: "2024-02-20",
    dueDate: "2024-03-20",
  },
  {
    id: 2,
    invoiceNo: "SI-2024-002",
    customer: "Global Industries",
    amount: "$12,500",
    status: InvoiceStatus.PENDING,
    date: "2024-02-19",
    dueDate: "2024-03-19",
  },
  {
    id: 3,
    invoiceNo: "SI-2024-003",
    customer: "Local Business",
    amount: "$3,200",
    status: InvoiceStatus.OVERDUE,
    date: "2024-02-18",
    dueDate: "2024-03-18",
  },
  {
    id: 4,
    invoiceNo: "SI-2024-004",
    customer: "Enterprise Ltd",
    amount: "$25,000",
    status: InvoiceStatus.PAID,
    date: "2024-02-17",
    dueDate: "2024-03-17",
  },
  {
    id: 5,
    invoiceNo: "SI-2024-005",
    customer: "Startup Inc",
    amount: "$8,750",
    status: InvoiceStatus.PENDING,
    date: "2024-02-16",
    dueDate: "2024-03-16",
  },
  {
    id: 6,
    invoiceNo: "SI-2024-006",
    customer: "Mega Corp",
    amount: "$19,200",
    status: InvoiceStatus.PAID,
    date: "2024-02-15",
    dueDate: "2024-03-15",
  },
  {
    id: 7,
    invoiceNo: "SI-2024-007",
    customer: "Alpha LLC",
    amount: "$6,400",
    status: InvoiceStatus.OVERDUE,
    date: "2024-02-14",
    dueDate: "2024-03-14",
  },
  {
    id: 8,
    invoiceNo: "SI-2024-008",
    customer: "Beta Solutions",
    amount: "$2,900",
    status: InvoiceStatus.CANCELLED,
    date: "2024-02-13",
    dueDate: "2024-03-13",
  },
];

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  [InvoiceStatus.PAID]:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  [InvoiceStatus.PENDING]:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  [InvoiceStatus.OVERDUE]:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  [InvoiceStatus.CANCELLED]: "bg-secondary text-muted-foreground",
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── Empty form state ──────────────────────────────────────────────────────────

const EMPTY_FORM: {
  invoiceNo: string;
  customer: string;
  amount: string;
  status: InvoiceStatus;
  date: string;
  dueDate: string;
} = {
  invoiceNo: "",
  customer: "",
  amount: "",
  status: InvoiceStatus.PENDING,
  date: "",
  dueDate: "",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SalesInvoices() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Invoice | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // ── Filtering + pagination ────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return DATA.filter(
      r =>
        r.invoiceNo.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q)
    );
  }, [search]);

  const start = pagination.pageIndex * pagination.pageSize;
  const pageData = filtered.slice(start, start + pagination.pageSize);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination(p => ({ ...p, pageIndex: 0 }));
  };

  // ── Export ────────────────────────────────────────────────────────────────

  const handleExport = () => {
    const csv = [
      ["Invoice No", "Customer", "Amount", "Status", "Date", "Due Date"],
      ...filtered.map(r => [
        r.invoiceNo,
        r.customer,
        r.amount,
        r.status,
        r.date,
        r.dueDate,
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sales-invoices.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setCreateOpen(true);
  };

  const openEdit = (item: Invoice) => {
    setForm({
      invoiceNo: item.invoiceNo,
      customer: item.customer,
      amount: item.amount,
      status: item.status,
      date: item.date,
      dueDate: item.dueDate,
    });
    setEditItem(item);
  };

  const handleCreateSubmit = () => {
    // TODO(ERP-XXX): implement create sales invoice API call
    setCreateOpen(false);
  };

  const handleEditSubmit = () => {
    // TODO(ERP-XXX): implement update sales invoice API call
    setEditItem(null);
  };

  const handleDelete = () => {
    // TODO(ERP-XXX): implement delete sales invoice API call
    setDeleteId(null);
  };

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceNo",
      header: "Invoice No",
      cell: ({ row }) => (
        <span className="font-mono font-medium text-primary">
          {row.original.invoiceNo}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.customer}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.amount}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      enableSorting: false,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.date}</span>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.dueDate}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
            onClick={() => openEdit(row.original)}
          >
            <Edit size={15} />
          </button>
          <button
            className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Sales", href: "#" },
    { label: "Sales Invoices" },
  ];

  return (
    <DashboardLayout currentPage="Sales Invoices" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* 1. Page Header */}
        <PageHeader
          title="Sales Invoices"
          subtitle="Manage and track all your sales invoices"
          actions={
            <Button
              onClick={openCreate}
              className="bg-primary hover:bg-primary/90 text-white gap-2"
            >
              <Plus size={16} />
              New Invoice
            </Button>
          }
        />

        {/* 2. Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Invoices"
            value="1,542"
            change={8.2}
            icon={<FileText size={18} className="text-primary" />}
            iconBg="bg-primary/10"
          />
          <StatCard
            title="Pending"
            value="34"
            change={-3.1}
            icon={<Clock size={18} className="text-orange-500" />}
            iconBg="bg-orange-100 dark:bg-orange-900/30"
          />
          <StatCard
            title="Paid"
            value="1,487"
            change={12.5}
            icon={<CheckCircle size={18} className="text-green-500" />}
            iconBg="bg-green-100 dark:bg-green-900/30"
          />
          <StatCard
            title="Total Revenue"
            value="$4.2M"
            change={5.9}
            icon={<DollarSign size={18} className="text-primary" />}
            iconBg="bg-primary/10"
          />
        </div>

        {/* 3. Data Table */}
        <DataTable
          columns={columns}
          data={pageData}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalRows={filtered.length}
          onSearchChange={handleSearch}
          onExportCSV={handleExport}
          selectable
          emptyTitle="No invoices found"
          emptyDescription="Try adjusting your search or create a new invoice."
        />
      </div>

      {/* 4. Create Modal */}
      <AnimatedModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Invoice"
        onSubmit={handleCreateSubmit}
        submitLabel="Create Invoice"
        size="md"
      >
        <InvoiceForm form={form} onChange={setForm} />
      </AnimatedModal>

      {/* 5. Edit Modal */}
      <AnimatedModal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        title="Edit Invoice"
        onSubmit={handleEditSubmit}
        submitLabel="Save Changes"
        size="md"
      >
        <InvoiceForm form={form} onChange={setForm} />
      </AnimatedModal>

      {/* 6. Delete Confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={v => !v && setDeleteId(null)}
        title="Delete Invoice"
        description="This invoice will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete Invoice"
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}

// ── Shared form ────────────────────────────────────────────────────────────────

function InvoiceForm({
  form,
  onChange,
}: {
  form: typeof EMPTY_FORM;
  onChange: (f: typeof EMPTY_FORM) => void;
}) {
  const set = (key: keyof typeof EMPTY_FORM) => (val: string) =>
    onChange({ ...form, [key]: val });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Invoice No</Label>
          <Input
            placeholder="SI-2024-XXX"
            value={form.invoiceNo}
            onChange={e => set("invoiceNo")(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => set("status")(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={InvoiceStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
              <SelectItem value={InvoiceStatus.OVERDUE}>Overdue</SelectItem>
              <SelectItem value={InvoiceStatus.CANCELLED}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Customer</Label>
        <Input
          placeholder="Customer name"
          value={form.customer}
          onChange={e => set("customer")(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Amount</Label>
        <Input
          placeholder="$0.00"
          value={form.amount}
          onChange={e => set("amount")(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input
            type="date"
            value={form.date}
            onChange={e => set("date")(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Due Date</Label>
          <Input
            type="date"
            value={form.dueDate}
            onChange={e => set("dueDate")(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

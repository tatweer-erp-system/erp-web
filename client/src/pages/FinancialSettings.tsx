import { useState } from "react";
import { Pencil, Trash2, Plus, X, Save, CreditCard, Percent, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TaxRate {
  id: number;
  name: string;
  rate: number;
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
function Modal({
  children,
  onClose,
  size = "md",
}: {
  children: React.ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg";
}) {
  const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={[
          "bg-card rounded-2xl shadow-[0_25px_60px_-10px_rgba(0,0,0,0.35)] border border-border/60",
          "w-full animate-in fade-in zoom-in-95 duration-200",
          widths[size],
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FinancialSettings() {
  type Section = "payment-gateway" | "tax-rates";
  const [activeSection, setActiveSection] = useState<Section>("tax-rates");

  // ── Tax Rates state ──
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    { id: 1, name: "VAT", rate: 16 },
    { id: 2, name: "GST", rate: 14 },
    { id: 3, name: "HST", rate: 12 },
  ]);
  const [nextId, setNextId] = useState(4);

  // ── Delete confirmation ──
  const [deleteTarget, setDeleteTarget] = useState<TaxRate | null>(null);

  // ── Edit / Add modal ──
  const [modal, setModal] = useState<{ open: boolean; editing: TaxRate | null }>({
    open: false,
    editing: null,
  });
  const [formName, setFormName] = useState("");
  const [formRate, setFormRate] = useState("");
  const [formError, setFormError] = useState("");

  function openAdd() {
    setFormName("");
    setFormRate("");
    setFormError("");
    setModal({ open: true, editing: null });
  }

  function openEdit(item: TaxRate) {
    setFormName(item.name);
    setFormRate(String(item.rate));
    setFormError("");
    setModal({ open: true, editing: item });
  }

  function closeModal() {
    setModal({ open: false, editing: null });
  }

  function handleSaveModal() {
    if (!formName.trim()) {
      setFormError("Tax name is required.");
      return;
    }
    const rateNum = parseFloat(formRate);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      setFormError("Enter a valid rate between 0 and 100.");
      return;
    }
    if (modal.editing) {
      setTaxRates((prev) =>
        prev.map((r) =>
          r.id === modal.editing!.id
            ? { ...r, name: formName.trim(), rate: rateNum }
            : r
        )
      );
    } else {
      setTaxRates((prev) => [
        ...prev,
        { id: nextId, name: formName.trim(), rate: rateNum },
      ]);
      setNextId((n) => n + 1);
    }
    closeModal();
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setTaxRates((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  // Build rows of 3 for the grid display
  const taxRows: TaxRate[][] = [];
  for (let i = 0; i < taxRates.length; i += 3) {
    taxRows.push(taxRates.slice(i, i + 3));
  }

  const navItems: { id: Section; label: string; icon: typeof CreditCard }[] = [
    { id: "payment-gateway", label: "Payment Gateway", icon: CreditCard },
    { id: "tax-rates",       label: "Tax Rates",       icon: Percent },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">Financial Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage tax rates, payment gateways, and financial configurations</p>
      </div>

      {/* ── Settings shell ── */}
      <div className="flex flex-col lg:flex-row bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[360px]">

        {/* Left sub-nav */}
        <div className="w-full lg:w-52 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-border">
          <nav className="flex flex-row lg:flex-col">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={[
                  "flex items-center gap-2.5 px-5 py-3.5 text-sm transition-colors text-left w-full",
                  "border-b border-border lg:border-b-0",
                  activeSection === id
                    ? "bg-primary/8 text-primary font-semibold border-s-2 border-s-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                <Icon size={15} className="flex-shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 p-6">

          {/* ── Tax Rates ── */}
          {activeSection === "tax-rates" && (
            <>
              {/* Section header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-base text-foreground">Tax Rates</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Tax Rates Configuration</p>
                </div>
                <button
                  onClick={openAdd}
                  className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                  title="Add Tax Rate"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Tax Rates display — horizontal columns matching the design */}
              {taxRates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                  <Percent size={32} className="opacity-30" />
                  <p className="text-sm">No tax rates configured.</p>
                  <Button size="sm" variant="outline" onClick={openAdd} className="gap-1.5 text-xs">
                    <Plus size={13} /> Add Tax Rate
                  </Button>
                </div>
              ) : (
                <div className="border border-border rounded-xl overflow-hidden">
                  {taxRows.map((row, rowIdx) => (
                    <div
                      key={rowIdx}
                      className={[
                        "grid divide-x divide-border",
                        rowIdx > 0 ? "border-t border-border" : "",
                      ].join(" ")}
                      style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}
                    >
                      {row.map((tax) => (
                        <div
                          key={tax.id}
                          className="flex items-center justify-between px-4 py-2.5 bg-background hover:bg-muted/30 transition-colors"
                        >
                          {/* Name + Rate */}
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-foreground min-w-[2.5rem]">
                              {tax.name}
                            </span>
                            <span className="text-sm text-muted-foreground">{tax.rate}%</span>
                          </div>

                          {/* Actions — always visible */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(tax)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(tax)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Payment Gateway ── */}
          {activeSection === "payment-gateway" && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <CreditCard size={36} className="opacity-25" />
              <p className="text-sm">Payment Gateway configuration coming soon.</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)} size="sm">
          <div className="p-6 flex flex-col items-center text-center gap-4">

            {/* Icon */}
            <div className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center">
              <Trash2 size={22} className="text-foreground/60" strokeWidth={1.5} />
            </div>

            {/* Copy */}
            <div className="space-y-1.5">
              <h4 className="font-semibold text-foreground text-base">Delete Tax Rate</h4>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  {deleteTarget.name} ({deleteTarget.rate}%)
                </span>
                ? This cannot be undone.
              </p>
            </div>

            {/* Actions — stacked full width */}
            <div className="w-full flex flex-col gap-2 pt-1">
              <Button
                onClick={confirmDelete}
                className="w-full h-10 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
              >
                <Trash2 size={14} />
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                className="w-full h-10 text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── EDIT / ADD MODAL ── */}
      {modal.open && (
        <Modal onClose={closeModal} size="md">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h4 className="font-semibold text-foreground text-sm">
              {modal.editing ? "Edit Tax Rate" : "Add Tax Rate"}
            </h4>
            <button
              onClick={closeModal}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">

            {/* Fields — side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Tax Name
                </label>
                <Input
                  value={formName}
                  onChange={(e) => { setFormName(e.target.value); setFormError(""); }}
                  placeholder="e.g. VAT, GST"
                  className="h-9 text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSaveModal()}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Rate (%)
                </label>
                <div className="relative">
                  <Input
                    value={formRate}
                    onChange={(e) => { setFormRate(e.target.value); setFormError(""); }}
                    placeholder="0.00"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="h-9 text-sm pr-9"
                    onKeyDown={(e) => e.key === "Enter" && handleSaveModal()}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium pointer-events-none select-none">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Error */}
            {formError && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle size={12} className="flex-shrink-0" />
                {formError}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2.5 justify-end pt-1 border-t border-border">
              <Button variant="outline" onClick={closeModal} className="h-9 px-5 text-sm mt-4">
                Cancel
              </Button>
              <Button
                onClick={handleSaveModal}
                className="h-9 px-5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 mt-4"
              >
                <Save size={13} />
                {modal.editing ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

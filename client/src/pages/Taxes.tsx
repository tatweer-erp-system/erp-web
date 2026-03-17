import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, RefreshCw } from "lucide-react";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";

interface Tax {
  id: string;
  name: string;
  code: string;
  rate: number;
}

export default function Taxes() {
  const lang = useLangStore(s => s.lang);
  const isRTL = lang === "ar";

  const [taxes, setTaxes] = useState<Tax[]>([
    { id: "1", name: "VAT", code: "465456", rate: 0 },
    { id: "2", name: "GST", code: "", rate: 14 },
    { id: "3", name: "HST", code: "", rate: 12 },
  ]);

  const [selectedTab, setSelectedTab] = useState("tax-rates");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, unknown>>({});

  const menuItems = [
    {
      id: "tax-rates",
      label: t("accounting.taxes.title", lang),
    },
    {
      id: "payment-gateway",
      label: t("accounting.taxes.paymentGateway", lang),
    },
  ];

  const handleEdit = (tax: Tax) => {
    setEditingId(tax.id);
    setEditValues({ ...tax });
  };

  const handleDelete = (id: string) => {
    setTaxes(taxes.filter(t => t.id !== id));
  };

  const handleAddTax = () => {
    const newTax: Tax = {
      id: Date.now().toString(),
      name: "",
      code: "",
      rate: 0,
    };
    setTaxes([...taxes, newTax]);
    handleEdit(newTax);
  };

  const handleSave = () => {
    if (editingId) {
      setTaxes(
        taxes.map(t => (t.id === editingId ? { ...t, ...editValues } : t))
      );
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  return (
    <DashboardLayout
      currentPage={t("Taxes", lang)}
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        {
          label: t("Settings", lang),
          href: "/settings",
        },
        { label: t("Taxes", lang) },
      ]}
    >
      <div
        className={`flex gap-6`}
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      >
        {/* Left Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <div className="space-y-2">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedTab(item.id)}
                  className={`w-full ${isRTL ? "text-right" : "text-left"} px-4 py-3 rounded-lg transition-all ${
                    selectedTab === item.id
                      ? "bg-gray-200 dark:bg-gray-700 text-primary font-medium"
                      : "hover:dark:bg-secondary bg-secondary dark:hover:bg-gray-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Card className="p-6 dark:bg-card bg-card shadow-sm border-0">
            {/* Header with Title and Actions */}
            <div className={`flex justify-between items-start mb-6`}>
              <div>
                <h2
                  className={`text-2xl font-bold text-foreground mb-1 ${isRTL ? "text-right" : ""}`}
                >
                  {t("accounting.taxes.title", lang)}
                </h2>
                <p
                  className={`text-sm text-muted-foreground ${isRTL ? "text-right" : ""}`}
                >
                  {t("accounting.taxes.subtitle", lang)}
                </p>
              </div>
              <div className={`flex gap-2`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-0 hover:dark:bg-secondary bg-secondary"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={handleAddTax}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tax Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {taxes.map(tax => (
                <div
                  key={tax.id}
                  className="border border-border rounded-lg p-4 dark:bg-secondary bg-secondary dark:bg-gray-900"
                >
                  {editingId === tax.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          {t("accounting.taxes.name", lang)}
                        </label>
                        <Input
                          value={(editValues.name as string) ?? ""}
                          onChange={e =>
                            setEditValues({
                              ...editValues,
                              name: e.target.value,
                            })
                          }
                          className="mt-1 border-0 dark:bg-card bg-card h-9"
                          placeholder={t("accounting.taxes.name", lang)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          {t("accounting.taxes.code", lang)}
                        </label>
                        <Input
                          value={(editValues.code as string) ?? ""}
                          onChange={e =>
                            setEditValues({
                              ...editValues,
                              code: e.target.value,
                            })
                          }
                          className="mt-1 border-0 dark:bg-card bg-card h-9"
                          placeholder={t("accounting.taxes.code", lang)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          {t("accounting.taxes.rate", lang)}
                        </label>
                        <Input
                          type="number"
                          value={(editValues.rate as number) ?? 0}
                          onChange={e =>
                            setEditValues({
                              ...editValues,
                              rate: parseFloat(e.target.value),
                            })
                          }
                          className="mt-1 border-0 dark:bg-card bg-card h-9"
                          placeholder="0"
                        />
                      </div>
                      <div className={`flex gap-2`}>
                        <Button
                          size="sm"
                          className="flex-1 bg-primary hover:bg-primary/90 text-white"
                          onClick={handleSave}
                        >
                          {t("accounting.taxes.save", lang)}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-0 hover:bg-gray-200"
                          onClick={handleCancel}
                        >
                          {t("accounting.taxes.cancel", lang)}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-foreground mb-3">
                        {tax.name}
                      </h3>
                      <div className="space-y-2 mb-4">
                        {tax.code && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              {t("accounting.taxes.codeLabel", lang)}
                            </span>
                            <span className="font-medium text-foreground">
                              {tax.code}
                            </span>
                          </div>
                        )}
                        {tax.rate > 0 && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              {t("accounting.taxes.rateLabel", lang)}
                            </span>
                            <span className="font-medium text-foreground">
                              {tax.rate}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={`flex gap-2 justify-end`}>
                        <button
                          onClick={() => handleEdit(tax)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                          title={t("accounting.taxes.edit", lang)}
                        >
                          <Pencil className="w-4 h-4 text-primary" />
                        </button>
                        <button
                          onClick={() => handleDelete(tax.id)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                          title={t("accounting.taxes.delete", lang)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className={`flex gap-3 justify-end`}>
              <Button
                variant="outline"
                className="border-0 hover:dark:bg-secondary bg-secondary"
              >
                {t("accounting.taxes.cancel", lang)}
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                {t("accounting.taxes.save", lang)}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Printer, Download, Send, Eye } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export default function Invoice() {
  const { language } = useSettings();
  const isRTL = language === "ar";

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Orders", href: "/orders" },
    { label: "Invoice INV-2024-001" },
  ];

  const invoiceItems = [
    { description: "Laptop Pro 15\" - Silver", qty: 2, unitPrice: "$1,299", amount: "$2,598" },
    { description: "Wireless Mouse - Black", qty: 5, unitPrice: "$29", amount: "$145" },
    { description: "USB-C Cable (2m)", qty: 10, unitPrice: "$12", amount: "$120" },
  ];

  return (
    <DashboardLayout currentPage="Invoice" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className={`flex items-center justify-between`}>
          <div className={`flex items-center gap-4`}>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <ChevronLeft size={20} className="text-foreground" />
            </button>
            <div className={isRTL ? "text-right" : ""}>
              <h2 className="font-display font-bold text-2xl text-foreground">Invoice INV-2024-001</h2>
              <p className="text-sm text-muted-foreground">Order #ORD-2024-001</p>
            </div>
          </div>
          <div className={`flex gap-2`}>
            <Button variant="outline" className="border-border">
              <Eye size={16} className="mr-2" />
              Preview
            </Button>
            <Button variant="outline" className="border-border" onClick={() => window.print()}>
              <Printer size={16} className="mr-2" />
              Print
            </Button>
            <Button variant="outline" className="border-border">
              <Download size={16} className="mr-2" />
              Download
            </Button>
            <Button className="bg-primary hover:bg-blue-700 text-white">
              <Send size={16} className="mr-2" />
              Send
            </Button>
          </div>
        </div>

        {/* Invoice Document */}
        <Card className="dark:bg-card bg-card shadow-sm border-0 p-12">
          {/* Header Section */}
          <div className={`flex justify-between items-start mb-12 pb-8 border-b-2 border-border`}>
            <div className={isRTL ? "text-right" : ""}>
              <div className="text-3xl font-bold text-primary mb-2">INVOICE</div>
              <p className="text-sm text-muted-foreground">Invoice #: INV-2024-001</p>
              <p className="text-sm text-muted-foreground">Invoice Date: February 20, 2024</p>
              <p className="text-sm text-muted-foreground">Due Date: March 5, 2024</p>
            </div>
            <div className={`text-right ${isRTL ? "text-left" : ""}`}>
              <div className="text-2xl font-bold text-foreground mb-4">Your Company</div>
              <p className="text-sm text-muted-foreground">123 Business Street</p>
              <p className="text-sm text-muted-foreground">New York, NY 10001</p>
              <p className="text-sm text-muted-foreground">contact@company.com</p>
            </div>
          </div>

          {/* Bill To Section */}
          <div className={`grid grid-cols-2 gap-12 mb-12`}>
            <div className={isRTL ? "text-right" : ""}>
              <h3 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wide">Bill To</h3>
              <p className="font-semibold text-foreground">John Doe</p>
              <p className="text-sm text-muted-foreground">123 Main Street</p>
              <p className="text-sm text-muted-foreground">New York, NY 10001</p>
              <p className="text-sm text-muted-foreground">United States</p>
              <p className="text-sm text-muted-foreground mt-2">john@example.com</p>
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <h3 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wide">Ship To</h3>
              <p className="font-semibold text-foreground">John Doe</p>
              <p className="text-sm text-muted-foreground">123 Main Street</p>
              <p className="text-sm text-muted-foreground">New York, NY 10001</p>
              <p className="text-sm text-muted-foreground">United States</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-12">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className={`px-4 py-3 text-left text-sm font-semibold text-foreground ${isRTL ? "text-right" : ""}`}>Description</th>
                  <th className={`px-4 py-3 text-center text-sm font-semibold text-foreground`}>Quantity</th>
                  <th className={`px-4 py-3 text-right text-sm font-semibold text-foreground ${isRTL ? "text-left" : ""}`}>Unit Price</th>
                  <th className={`px-4 py-3 text-right text-sm font-semibold text-foreground ${isRTL ? "text-left" : ""}`}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className={`px-4 py-4 text-sm text-foreground ${isRTL ? "text-right" : ""}`}>{item.description}</td>
                    <td className="px-4 py-4 text-sm text-foreground text-center">{item.qty}</td>
                    <td className={`px-4 py-4 text-sm text-foreground text-right ${isRTL ? "text-left" : ""}`}>{item.unitPrice}</td>
                    <td className={`px-4 py-4 text-sm font-semibold text-foreground text-right ${isRTL ? "text-left" : ""}`}>{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className={`flex justify-end mb-12`}>
            <div className="w-80">
              <div className={`flex justify-between py-2 border-b border-border`}>
                <span className="text-sm text-muted-foreground">Subtotal:</span>
                <span className="text-sm font-medium text-foreground">$2,863</span>
              </div>
              <div className={`flex justify-between py-2 border-b border-border`}>
                <span className="text-sm text-muted-foreground">Shipping:</span>
                <span className="text-sm font-medium text-foreground">$25</span>
              </div>
              <div className={`flex justify-between py-2 border-b border-border`}>
                <span className="text-sm text-muted-foreground">Tax (8%):</span>
                <span className="text-sm font-medium text-foreground">$229</span>
              </div>
              <div className={`flex justify-between py-3 border-t-2 border-border`}>
                <span className="font-bold text-foreground">Total Due:</span>
                <span className="text-2xl font-bold text-primary">$3,117</span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className={`border-t-2 border-border pt-8 ${isRTL ? "text-right" : ""}`}>
            <h3 className="font-bold text-foreground mb-2 text-sm uppercase tracking-wide">Notes</h3>
            <p className="text-sm text-muted-foreground">Thank you for your business! Payment is due within 15 days. Please make checks payable to Your Company.</p>
          </div>

          {/* Footer */}
          <div className={`mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground ${isRTL ? "text-right" : ""}`}>
            <p>This is an electronically generated invoice. No signature is required.</p>
            <p className="mt-2">For questions, please contact: billing@company.com | Phone: +1 (555) 123-4567</p>
          </div>
        </Card>

        {/* Payment Status */}
        <Card className="bg-green-50 border border-green-200 p-6">
          <div className={`flex items-center justify-between`}>
            <div className={isRTL ? "text-right" : ""}>
              <h3 className="font-semibold text-green-900">Payment Received</h3>
              <p className="text-sm text-green-700 mt-1">Payment of $3,117 was received on February 20, 2024</p>
            </div>
            <div className="text-3xl">✓</div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

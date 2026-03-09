import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";

export default function VendorPayments() {
  return (
    <DashboardLayout
      currentPage="VendorPayments"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Purchases", href: "#" },
        { label: "VendorPayments" },
      ]}
    >
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">VendorPayments</h2>
        <p className="text-muted-foreground">This page is coming soon. Content will be added here.</p>
      </Card>
    </DashboardLayout>
  );
}

import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";

export default function ExchangeRates() {
  return (
    <DashboardLayout
      currentPage="ExchangeRates"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Settings", href: "#" },
        { label: "ExchangeRates" },
      ]}
    >
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">ExchangeRates</h2>
        <p className="text-muted-foreground">This page is coming soon. Content will be added here.</p>
      </Card>
    </DashboardLayout>
  );
}

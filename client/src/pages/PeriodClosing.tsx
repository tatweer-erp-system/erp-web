import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";

export default function PeriodClosing() {
  return (
    <DashboardLayout
      currentPage="PeriodClosing"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "#" },
        { label: "PeriodClosing" },
      ]}
    >
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">PeriodClosing</h2>
        <p className="text-muted-foreground">This page is coming soon. Content will be added here.</p>
      </Card>
    </DashboardLayout>
  );
}

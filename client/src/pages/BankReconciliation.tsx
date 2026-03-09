import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";

export default function BankReconciliation() {
  return (
    <DashboardLayout
      currentPage="BankReconciliation"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Treasury", href: "#" },
        { label: "BankReconciliation" },
      ]}
    >
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">BankReconciliation</h2>
        <p className="text-muted-foreground">This page is coming soon. Content will be added here.</p>
      </Card>
    </DashboardLayout>
  );
}

import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";

export default function UnitsOfMeasure() {
  return (
    <DashboardLayout
      currentPage="UnitsOfMeasure"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Inventory", href: "#" },
        { label: "UnitsOfMeasure" },
      ]}
    >
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">UnitsOfMeasure</h2>
        <p className="text-muted-foreground">This page is coming soon. Content will be added here.</p>
      </Card>
    </DashboardLayout>
  );
}

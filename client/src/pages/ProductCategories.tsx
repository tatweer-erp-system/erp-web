import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";

export default function ProductCategories() {
  return (
    <DashboardLayout
      currentPage="ProductCategories"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Inventory", href: "#" },
        { label: "ProductCategories" },
      ]}
    >
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">ProductCategories</h2>
        <p className="text-muted-foreground">This page is coming soon. Content will be added here.</p>
      </Card>
    </DashboardLayout>
  );
}

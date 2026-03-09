import Breadcrumb from "@/components/Breadcrumb";
import DashboardLayout from "@/components/DashboardLayout";

export default function AllVendors() {
  return (
    <DashboardLayout currentPage="AllVendors">
      <div className="space-y-6">
        <Breadcrumb items={[]} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">AllVendors</h1>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

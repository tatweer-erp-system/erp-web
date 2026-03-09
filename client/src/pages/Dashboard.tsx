import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

const lineChartData = [
  { name: "Jan", sales: 4000, revenue: 2400 },
  { name: "Feb", sales: 3000, revenue: 1398 },
  { name: "Mar", sales: 2000, revenue: 9800 },
  { name: "Apr", sales: 2780, revenue: 3908 },
  { name: "May", sales: 1890, revenue: 4800 },
  { name: "Jun", sales: 2390, revenue: 3800 },
];

const barChartData = [
  { name: "Product A", value: 4000 },
  { name: "Product B", value: 3000 },
  { name: "Product C", value: 2000 },
  { name: "Product D", value: 2780 },
  { name: "Product E", value: 1890 },
];

const pieChartData = [
  { name: "In Stock", value: 65 },
  { name: "Low Stock", value: 20 },
  { name: "Out of Stock", value: 15 },
];

const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

export default function Dashboard() {
  const { language } = useSettings();
  const isRTL = language === "ar";

  const breadcrumbs = [
    { label: "Dashboard" },
  ];

  return (
    <DashboardLayout currentPage="Dashboard" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <Card className="p-6 dark:bg-card bg-card shadow-sm hover:shadow-md transition-shadow border-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold text-foreground mt-2">$125,430</h3>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp size={16} className="text-accent" />
                  <span className="text-xs font-medium text-accent">+12.5% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign size={24} className="text-primary" />
              </div>
            </div>
          </Card>

          {/* Total Orders */}
          <Card className="p-6 dark:bg-card bg-card shadow-sm hover:shadow-md transition-shadow border-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold text-foreground mt-2">1,234</h3>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp size={16} className="text-accent" />
                  <span className="text-xs font-medium text-accent">+8.2% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <ShoppingCart size={24} className="text-accent" />
              </div>
            </div>
          </Card>

          {/* Total Products */}
          <Card className="p-6 dark:bg-card bg-card shadow-sm hover:shadow-md transition-shadow border-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <h3 className="text-2xl font-bold text-foreground mt-2">856</h3>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown size={16} className="text-orange-500" />
                  <span className="text-xs font-medium text-orange-500">-2.1% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Package size={24} className="text-orange-500" />
              </div>
            </div>
          </Card>

          {/* Active Customers */}
          <Card className="p-6 dark:bg-card bg-card shadow-sm hover:shadow-md transition-shadow border-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                <h3 className="text-2xl font-bold text-foreground mt-2">542</h3>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp size={16} className="text-accent" />
                  <span className="text-xs font-medium text-accent">+5.3% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Users size={24} className="text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trend */}
          <Card className="lg:col-span-2 p-6 dark:bg-card bg-card shadow-sm border-0">
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg text-foreground">Revenue Trend</h3>
              <p className="text-sm text-muted-foreground mt-1">Sales and revenue over the last 6 months</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#0066CC" strokeWidth={2} dot={{ fill: "#0066CC" }} />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981" }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Inventory Status */}
          <Card className="p-6 dark:bg-card bg-card shadow-sm border-0">
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg text-foreground">Inventory Status</h3>
              <p className="text-sm text-muted-foreground mt-1">Current stock levels</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieChartData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top Products */}
        <Card className="p-6 dark:bg-card bg-card shadow-sm border-0">
          <div className="mb-6">
            <h3 className="font-display font-bold text-lg text-foreground">Top Selling Products</h3>
            <p className="text-sm text-muted-foreground mt-1">Performance metrics for top 5 products</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" fill="#0066CC" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </DashboardLayout>
  );
}

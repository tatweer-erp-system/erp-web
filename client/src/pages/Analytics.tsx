import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";
import { Download, Calendar } from "lucide-react";

const monthlyData = [
  { month: "Jan", orders: 400, revenue: 24000, customers: 240 },
  { month: "Feb", orders: 300, revenue: 13980, customers: 221 },
  { month: "Mar", orders: 200, revenue: 98000, customers: 229 },
  { month: "Apr", orders: 278, revenue: 39080, customers: 200 },
  { month: "May", orders: 189, revenue: 48000, customers: 218 },
  { month: "Jun", orders: 239, revenue: 38000, customers: 250 },
  { month: "Jul", orders: 349, revenue: 43000, customers: 210 },
  { month: "Aug", orders: 290, revenue: 54000, customers: 290 },
];

const categoryData = [
  { category: "Electronics", sales: 4000, growth: 12 },
  { category: "Accessories", sales: 3000, growth: 8 },
  { category: "Software", sales: 2000, growth: 15 },
  { category: "Services", sales: 2780, growth: 5 },
  { category: "Licenses", sales: 1890, growth: 20 },
];

const customerData = [
  { month: "Jan", newCustomers: 120, retention: 85 },
  { month: "Feb", newCustomers: 95, retention: 82 },
  { month: "Mar", newCustomers: 150, retention: 88 },
  { month: "Apr", newCustomers: 110, retention: 86 },
  { month: "May", newCustomers: 130, retention: 89 },
  { month: "Jun", newCustomers: 160, retention: 91 },
];

export default function Analytics() {
  const { language } = useSettings();
  const isRTL = language === "ar";

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Analytics" },
  ];

  return (
    <DashboardLayout currentPage="Analytics" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
          <div className="flex gap-2">
            <Button variant="outline" className="border-border flex items-center gap-2">
              <Calendar size={18} />
              Date Range
            </Button>
            <Button className="bg-primary hover:bg-blue-700 text-white flex items-center gap-2">
              <Download size={18} />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Revenue</p>
            <h3 className="text-2xl font-bold text-foreground mt-2">$485,230</h3>
            <p className="text-xs text-accent mt-2">↑ 18.5% vs last period</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Order Value</p>
            <h3 className="text-2xl font-bold text-foreground mt-2">$385</h3>
            <p className="text-xs text-accent mt-2">↑ 5.2% vs last period</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Conversion Rate</p>
            <h3 className="text-2xl font-bold text-foreground mt-2">3.24%</h3>
            <p className="text-xs text-orange-600 mt-2">↓ 0.8% vs last period</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer LTV</p>
            <h3 className="text-2xl font-bold text-foreground mt-2">$2,840</h3>
            <p className="text-xs text-accent mt-2">↑ 12.3% vs last period</p>
          </Card>
        </div>

        {/* Revenue and Orders Trend */}
        <Card className="p-6 dark:bg-card bg-card shadow-sm border-0">
          <div className="mb-6">
            <h3 className="font-display font-bold text-lg text-foreground">Revenue & Orders Trend</h3>
            <p className="text-sm text-muted-foreground mt-1">Monthly performance overview</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066CC" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0066CC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#0066CC" fillOpacity={1} fill="url(#colorRevenue)" />
              <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Sales by Category and Customer Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales by Category */}
          <Card className="p-6 dark:bg-card bg-card shadow-sm border-0">
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg text-foreground">Sales by Category</h3>
              <p className="text-sm text-muted-foreground mt-1">Performance by product category</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="category" stroke="#6B7280" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="sales" fill="#0066CC" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Customer Acquisition & Retention */}
          <Card className="p-6 dark:bg-card bg-card shadow-sm border-0">
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg text-foreground">Customer Metrics</h3>
              <p className="text-sm text-muted-foreground mt-1">New customers and retention rate</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="newCustomers" stroke="#0066CC" strokeWidth={2} dot={{ fill: "#0066CC" }} />
                <Line type="monotone" dataKey="retention" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981" }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top Insights */}
        <Card className="p-6 dark:bg-card bg-card shadow-sm border-0">
          <h3 className="font-display font-bold text-lg text-foreground mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm font-medium text-foreground">Peak Sales Month</p>
              <p className="text-2xl font-bold text-primary mt-2">August</p>
              <p className="text-xs text-muted-foreground mt-2">Generated $54,000 in revenue</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm font-medium text-foreground">Best Category</p>
              <p className="text-2xl font-bold text-accent mt-2">Electronics</p>
              <p className="text-xs text-muted-foreground mt-2">12% growth rate</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-sm font-medium text-foreground">Avg Customer Lifetime</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">18 months</p>
              <p className="text-xs text-muted-foreground mt-2">With $2,840 total value</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon, Download, Calendar } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export default function FinancialDashboard() {
  const { language } = useSettings();
  const isRTL = language === "ar";

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Financial Dashboard" },
  ];

  const revenueData = [
    { month: "Jan", revenue: 45000, expenses: 28000, profit: 17000 },
    { month: "Feb", revenue: 52000, expenses: 31000, profit: 21000 },
    { month: "Mar", revenue: 48000, expenses: 29000, profit: 19000 },
    { month: "Apr", revenue: 61000, expenses: 35000, profit: 26000 },
    { month: "May", revenue: 55000, expenses: 32000, profit: 23000 },
    { month: "Jun", revenue: 67000, expenses: 38000, profit: 29000 },
  ];

  const expenseBreakdown = [
    { category: "Salaries", amount: 125000, percentage: 45 },
    { category: "Operations", amount: 65000, percentage: 23 },
    { category: "Marketing", amount: 45000, percentage: 16 },
    { category: "Technology", amount: 35000, percentage: 12 },
  ];

  const cashFlowData = [
    { week: "Week 1", inflow: 12000, outflow: 8000 },
    { week: "Week 2", inflow: 15000, outflow: 9000 },
    { week: "Week 3", inflow: 18000, outflow: 11000 },
    { week: "Week 4", inflow: 16000, outflow: 10000 },
  ];

  return (
    <DashboardLayout currentPage="Financial Dashboard" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className={`flex items-center justify-between`}>
          <div className={isRTL ? "text-right" : ""}>
            <h2 className="font-display font-bold text-2xl text-foreground">Financial Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-1">Revenue, expenses, and profit analysis</p>
          </div>
          <div className={`flex gap-2`}>
            <Button variant="outline" className="border-border">
              <Calendar size={16} className="mr-2" />
              Date Range
            </Button>
            <Button className="bg-primary hover:bg-blue-700 text-white">
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 dark:bg-card bg-card shadow-sm border-0">
            <div className={`flex items-center justify-between`}>
              <div className={isRTL ? "text-right" : ""}>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold text-foreground mt-2">$328,000</h3>
                <p className="text-xs text-accent mt-2">↑ +12.5% from last month</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign size={24} className="text-accent" />
              </div>
            </div>
          </Card>

          <Card className="p-6 dark:bg-card bg-card shadow-sm border-0">
            <div className={`flex items-center justify-between`}>
              <div className={isRTL ? "text-right" : ""}>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <h3 className="text-2xl font-bold text-foreground mt-2">$163,000</h3>
                <p className="text-xs text-orange-600 mt-2">↑ +8.2% from last month</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <TrendingDown size={24} className="text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 dark:bg-card bg-card shadow-sm border-0">
            <div className={`flex items-center justify-between`}>
              <div className={isRTL ? "text-right" : ""}>
                <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                <h3 className="text-2xl font-bold text-foreground mt-2">$165,000</h3>
                <p className="text-xs text-accent mt-2">↑ +15.3% from last month</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp size={24} className="text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 dark:bg-card bg-card shadow-sm border-0">
            <div className={`flex items-center justify-between`}>
              <div className={isRTL ? "text-right" : ""}>
                <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                <h3 className="text-2xl font-bold text-foreground mt-2">50.3%</h3>
                <p className="text-xs text-accent mt-2">↑ +2.1% from last month</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <PieChartIcon size={24} className="text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue vs Expenses */}
          <Card className="p-6 dark:bg-card bg-card shadow-sm border-0">
            <h3 className={`font-display font-bold text-lg text-foreground mb-4 ${isRTL ? "text-right" : ""}`}>
              Revenue vs Expenses
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: "#cccccc", border: "1px solid #e5e7eb" }} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
                <Line type="monotone" dataKey="expenses" stroke="#F59E0B" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Profit Trend */}
          <Card className="p-6 dark:bg-card bg-card shadow-sm border-0">
            <h3 className={`font-display font-bold text-lg text-foreground mb-4 ${isRTL ? "text-right" : ""}`}>
              Profit Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: "#cccccc", border: "1px solid #e5e7eb" }} />
                <Bar dataKey="profit" fill="#0066CC" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Expense Breakdown and Cash Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Breakdown */}
          <Card className="p-6 dark:bg-card bg-card shadow-sm border-0">
            <h3 className={`font-display font-bold text-lg text-foreground mb-4 ${isRTL ? "text-right" : ""}`}>
              Expense Breakdown
            </h3>
            <div className="space-y-4">
              {expenseBreakdown.map((expense, idx) => (
                <div key={idx} className={`${isRTL ? "text-right" : ""}`}>
                  <div className={`flex justify-between mb-2`}>
                    <span className="text-sm font-medium text-foreground">{expense.category}</span>
                    <span className="text-sm font-semibold text-foreground">${expense.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full"
                      style={{ width: `${expense.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{expense.percentage}% of total</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Cash Flow */}
          <Card className="p-6 dark:bg-card bg-card shadow-sm border-0">
            <h3 className={`font-display font-bold text-lg text-foreground mb-4 ${isRTL ? "text-right" : ""}`}>
              Weekly Cash Flow
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="week" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: "#cccccc", border: "1px solid #e5e7eb" }} />
                <Legend />
                <Bar dataKey="inflow" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="outflow" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card className="p-6 dark:bg-card bg-card shadow-sm border-0">
          <h3 className={`font-display font-bold text-lg text-foreground mb-4 ${isRTL ? "text-right" : ""}`}>
            Financial Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-4 bg-green-50 rounded-lg border border-green-200 ${isRTL ? "text-right" : ""}`}>
              <p className="text-sm font-medium text-green-900">YTD Revenue</p>
              <p className="text-2xl font-bold text-green-700 mt-2">$328,000</p>
              <p className="text-xs text-green-600 mt-1">↑ 18% vs last year</p>
            </div>
            <div className={`p-4 bg-orange-50 rounded-lg border border-orange-200 ${isRTL ? "text-right" : ""}`}>
              <p className="text-sm font-medium text-orange-900">YTD Expenses</p>
              <p className="text-2xl font-bold text-orange-700 mt-2">$163,000</p>
              <p className="text-xs text-orange-600 mt-1">↑ 12% vs last year</p>
            </div>
            <div className={`p-4 bg-blue-50 rounded-lg border border-blue-200 ${isRTL ? "text-right" : ""}`}>
              <p className="text-sm font-medium text-blue-900">YTD Net Profit</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">$165,000</p>
              <p className="text-xs text-blue-600 mt-1">↑ 22% vs last year</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

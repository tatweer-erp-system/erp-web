import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Download, Eye, Trash2, Calendar, Filter, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/contexts/SettingsContext";

export default function ReportsGenerator() {
  const { language } = useSettings();
  const isRTL = language === "ar";
  const [activeTab, setActiveTab] = useState("saved");

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Reports Generator" },
  ];

  const reportTemplates = [
    {
      id: 1,
      name: "Sales Summary",
      description: "Monthly sales overview with trends",
      category: "Sales",
      icon: "📊",
    },
    {
      id: 2,
      name: "Inventory Report",
      description: "Current stock levels and movements",
      category: "Inventory",
      icon: "📦",
    },
    {
      id: 3,
      name: "Customer Analysis",
      description: "Customer acquisition and retention metrics",
      category: "Customers",
      icon: "👥",
    },
    {
      id: 4,
      name: "Financial Summary",
      description: "Revenue, expenses, and profit analysis",
      category: "Finance",
      icon: "💰",
    },
    {
      id: 5,
      name: "Product Performance",
      description: "Top products and sales by category",
      category: "Products",
      icon: "⭐",
    },
    {
      id: 6,
      name: "Employee Report",
      description: "Team performance and attendance",
      category: "HR",
      icon: "👤",
    },
  ];

  const savedReports = [
    {
      id: 1,
      name: "February 2024 Sales Report",
      type: "Sales Summary",
      created: "Feb 25, 2024",
      lastModified: "Feb 25, 2024",
      format: "PDF",
    },
    {
      id: 2,
      name: "Q1 Financial Analysis",
      type: "Financial Summary",
      created: "Feb 20, 2024",
      lastModified: "Feb 25, 2024",
      format: "Excel",
    },
    {
      id: 3,
      name: "Monthly Inventory Check",
      type: "Inventory Report",
      created: "Feb 15, 2024",
      lastModified: "Feb 22, 2024",
      format: "PDF",
    },
  ];

  return (
    <DashboardLayout currentPage="Reports Generator" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className={`flex items-center justify-between`}>
          <div className={isRTL ? "text-right" : ""}>
            <h2 className="font-display font-bold text-2xl text-foreground">Reports Generator</h2>
            <p className="text-sm text-muted-foreground mt-1">Create and manage custom business reports</p>
          </div>
          <Button className="bg-primary hover:bg-blue-700 text-white">
            <Plus size={16} className="mr-2" />
            Create Report
          </Button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-4 border-b border-border`}>
          {["saved", "templates"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "saved" ? "Saved Reports" : "Templates"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "saved" && (
          <div className="space-y-4">
            {savedReports.length > 0 ? (
              savedReports.map((report) => (
                <Card key={report.id} className="dark:bg-card bg-card shadow-sm border-0 p-6 hover:shadow-md transition-shadow">
                  <div className={`flex items-center justify-between`}>
                    <div className={`flex-1 ${isRTL ? "text-right" : ""}`}>
                      <h3 className="font-semibold text-foreground text-lg">{report.name}</h3>
                      <div className={`flex items-center gap-4 mt-2 text-sm text-muted-foregroundjustify-end`}>
                        <span>Type: {report.type}</span>
                        <span>Format: {report.format}</span>
                        <span>Modified: {report.lastModified}</span>
                      </div>
                    </div>
                    <div className={`flex gap-2`}>
                      <Button variant="outline" size="sm" className="border-border">
                        <Eye size={16} />
                      </Button>
                      <Button variant="outline" size="sm" className="border-border">
                        <Download size={16} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="border-border">
                            ⋮
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRTL ? "start" : "end"}>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>Schedule</DropdownMenuItem>
                          <DropdownMenuItem>Share</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="bg-secondary p-12 text-center">
                <p className="text-muted-foreground">No saved reports yet. Create one to get started!</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === "templates" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="dark:bg-card bg-card shadow-sm border-0 p-6 hover:shadow-md transition-shadow cursor-pointer group">
                <div className={`flex items-start justify-between mb-4`}>
                  <div className="text-4xl">{template.icon}</div>
                  <span className="text-xs font-semibold px-2 py-1 bg-secondary rounded text-foreground">
                    {template.category}
                  </span>
                </div>
                <h3 className={`font-semibold text-foreground text-lg mb-2 ${isRTL ? "text-right" : ""}`}>
                  {template.name}
                </h3>
                <p className={`text-sm text-muted-foreground mb-4 ${isRTL ? "text-right" : ""}`}>
                  {template.description}
                </p>
                <Button className="w-full bg-primary hover:bg-blue-700 text-white group-hover:shadow-lg transition-shadow">
                  <Plus size={16} className="mr-2" />
                  Use Template
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Report Builder Preview */}
        <Card className="dark:bg-card bg-card shadow-sm border-0 p-6">
          <h3 className={`font-display font-bold text-lg text-foreground mb-6 ${isRTL ? "text-right" : ""}`}>
            Quick Report Builder
          </h3>
          <div className="space-y-6">
            {/* Report Type */}
            <div>
              <label className={`text-sm font-medium text-foreground block mb-2 ${isRTL ? "text-right" : ""}`}>
                Report Type
              </label>
              <select className="w-full px-4 py-2 border border-border rounded-lg dark:bg-card bg-card text-foreground">
                <option>Sales Report</option>
                <option>Inventory Report</option>
                <option>Financial Report</option>
                <option>Customer Report</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`text-sm font-medium text-foreground block mb-2 ${isRTL ? "text-right" : ""}`}>
                  From Date
                </label>
                <Input type="date" className="bg-secondary border-0" />
              </div>
              <div>
                <label className={`text-sm font-medium text-foreground block mb-2 ${isRTL ? "text-right" : ""}`}>
                  To Date
                </label>
                <Input type="date" className="bg-secondary border-0" />
              </div>
            </div>

            {/* Columns Selection */}
            <div>
              <label className={`text-sm font-medium text-foreground block mb-2 ${isRTL ? "text-right" : ""}`}>
                Include Columns
              </label>
              <div className={`grid grid-cols-2 gap-3 ${isRTL ? "text-right" : ""}`}>
                {["Order ID", "Date", "Amount", "Status", "Customer", "Region"].map((col) => (
                  <label key={col} className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-foreground">{col}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Format */}
            <div>
              <label className={`text-sm font-medium text-foreground block mb-2 ${isRTL ? "text-right" : ""}`}>
                Export Format
              </label>
              <div className={`flex gap-3`}>
                {["PDF", "Excel", "CSV"].map((format) => (
                  <label key={format} className="flex items-center gap-2">
                    <input type="radio" name="format" defaultChecked={format === "PDF"} />
                    <span className="text-sm text-foreground">{format}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className={`flex gap-3 pt-4`}>
              <Button className="flex-1 bg-primary hover:bg-blue-700 text-white">
                <Eye size={16} className="mr-2" />
                Preview
              </Button>
              <Button className="flex-1 bg-accent hover:bg-green-700 text-white">
                <Download size={16} className="mr-2" />
                Generate & Download
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useState } from "react";
import { ChevronRight, Check, BarChart3, Users, Package, Zap, Eye, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { month: "Jan", value: 4000 },
  { month: "Feb", value: 3000 },
  { month: "Mar", value: 2000 },
  { month: "Apr", value: 2780 },
  { month: "May", value: 1890 },
  { month: "Jun", value: 2390 },
];

export default function Showcase() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="dark:bg-card bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
              E
            </div>
            <span className="font-display font-bold text-xl text-foreground">ERP Dashboard</span>
          </div>
          <div className="flex gap-4">
            <a href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              View Dashboard
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%230066CC"/><circle cx="80" cy="80" r="2" fill="%230066CC"/><path d="M20 20 L80 80" stroke="%230066CC" stroke-width="0.5"/></svg>')`,
            backgroundSize: "50px 50px",
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="font-display font-bold text-5xl md:text-6xl text-foreground mb-6">
            Modern ERP Admin Dashboard
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            A professional, minimalist dashboard design built with the latest technologies. Featuring intuitive navigation, real-time data visualization, and a modern aesthetic that enhances user experience and productivity.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button className="bg-primary hover:bg-blue-700 text-white px-8 py-6 text-lg">
              Explore Dashboard
            </Button>
            <Button variant="outline" className="border-border px-8 py-6 text-lg">
              View Features
            </Button>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 px-6 dark:bg-card bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-bold text-4xl text-foreground text-center mb-16">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                <BarChart3 size={24} className="text-white" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">Real-Time Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Interactive charts and visualizations that update in real-time, providing instant insights into your business metrics and performance indicators.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check size={16} className="text-accent" /> Revenue tracking
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check size={16} className="text-accent" /> Sales trends
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check size={16} className="text-accent" /> Custom reports
                </li>
              </ul>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 bg-gradient-to-br from-green-50 to-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-6">
                <Package size={24} className="text-white" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">Inventory Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                Comprehensive inventory tracking with stock level monitoring, reorder alerts, and detailed product information management.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check size={16} className="text-accent" /> Stock tracking
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check size={16} className="text-accent" /> Reorder alerts
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check size={16} className="text-accent" /> Product details
                </li>
              </ul>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 bg-gradient-to-br from-purple-50 to-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <Users size={24} className="text-white" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">User Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                Intuitive user interface with role-based access control, activity monitoring, and comprehensive user administration tools.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check size={16} className="text-accent" /> Role management
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check size={16} className="text-accent" /> Activity logs
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check size={16} className="text-accent" /> Permissions
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Design System */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-bold text-4xl text-foreground text-center mb-16">
            Design Philosophy
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-display font-bold text-2xl text-foreground mb-6">Modern Minimalist Approach</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our design philosophy emphasizes clarity, efficiency, and professionalism. We use a carefully curated color palette with cool blues for trust, semantic accent colors for status indication, and generous whitespace for visual breathing room.
              </p>
              <div className="space-y-3 mt-6">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Color Palette</p>
                    <p className="text-sm text-muted-foreground">Primary blue (#0066CC), accent green (#10B981), warning amber (#F59E0B)</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Typography</p>
                    <p className="text-sm text-muted-foreground">Geist for headings, Inter for body, Fira Code for data</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Interactions</p>
                    <p className="text-sm text-muted-foreground">Smooth transitions, subtle shadows, responsive hover states</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="p-8 dark:bg-card bg-card shadow-sm border-0">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <div className="w-6 h-6 bg-primary rounded"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Primary Color</p>
                    <p className="text-xs text-muted-foreground">#0066CC</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                    <div className="w-6 h-6 bg-accent rounded"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Success Color</p>
                    <p className="text-xs text-muted-foreground">#10B981</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                    <div className="w-6 h-6 bg-orange-500 rounded"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Warning Color</p>
                    <p className="text-xs text-muted-foreground">#F59E0B</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                    <div className="w-6 h-6 bg-destructive rounded"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Destructive Color</p>
                    <p className="text-xs text-muted-foreground">#EF4444</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pages Overview */}
      <section className="py-20 px-6 dark:bg-card bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-bold text-4xl text-foreground text-center mb-16">
            Three Example Pages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dashboard Page */}
            <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-shadow">
              <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <BarChart3 size={48} className="text-primary opacity-30" />
              </div>
              <div className="p-6">
                <h3 className="font-display font-bold text-xl text-foreground mb-2">Dashboard</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Executive overview with KPI cards, revenue trends, inventory status, and top-selling products visualization.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-primary" /> KPI metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-primary" /> Revenue charts
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-primary" /> Inventory pie chart
                  </li>
                </ul>
              </div>
            </Card>

            {/* Inventory Page */}
            <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-shadow">
              <div className="h-40 bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                <Package size={48} className="text-accent opacity-30" />
              </div>
              <div className="p-6">
                <h3 className="font-display font-bold text-xl text-foreground mb-2">Inventory</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete product management with stock levels, reorder tracking, status indicators, and bulk actions.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-primary" /> Product table
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-primary" /> Stock status
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-primary" /> Search & filter
                  </li>
                </ul>
              </div>
            </Card>

            {/* Analytics Page */}
            <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-shadow">
              <div className="h-40 bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                <Zap size={48} className="text-purple-600 opacity-30" />
              </div>
              <div className="p-6">
                <h3 className="font-display font-bold text-xl text-foreground mb-2">Analytics</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Advanced reporting with revenue trends, category performance, customer metrics, and key insights.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-primary" /> Revenue trends
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-primary" /> Category analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-primary" /> Customer insights
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-bold text-4xl text-foreground text-center mb-16">
            Why Choose This Dashboard?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-foreground mb-2">Explore Data More Intuitively</h4>
                  <p className="text-muted-foreground">
                    Interactive visualizations and intuitive layouts make it easy to understand complex business data at a glance, reducing cognitive load and improving decision-making speed.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-foreground mb-2">Understand Trends Better</h4>
                  <p className="text-muted-foreground">
                    Real-time charts and comprehensive analytics reveal patterns and trends in your business metrics, enabling data-driven strategies and proactive management.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Share2 size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-foreground mb-2">Easily Save or Share</h4>
                  <p className="text-muted-foreground">
                    Export reports, share dashboards with team members, and maintain audit trails—all with built-in functionality for seamless collaboration and compliance.
                  </p>
                </div>
              </div>
            </div>
            <Card className="p-8 dark:bg-card bg-card shadow-sm border-0">
              <h4 className="font-display font-bold text-xl text-foreground mb-6">Dashboard Capabilities</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-accent" />
                  <span className="text-foreground">Real-time data updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-accent" />
                  <span className="text-foreground">Responsive design</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-accent" />
                  <span className="text-foreground">Advanced filtering</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-accent" />
                  <span className="text-foreground">Export functionality</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-accent" />
                  <span className="text-foreground">Mobile optimized</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-accent" />
                  <span className="text-foreground">Accessibility compliant</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-accent" />
                  <span className="text-foreground">Custom notifications</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-accent" />
                  <span className="text-foreground">Role-based access</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 dark:bg-card bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-4xl text-foreground mb-6">
            Ready to Transform Your ERP System?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Experience the modern dashboard design with intuitive navigation, real-time analytics, and professional aesthetics.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button className="bg-primary hover:bg-blue-700 text-white px-8 py-6 text-lg">
              View Live Dashboard
            </Button>
            <Button variant="outline" className="border-border px-8 py-6 text-lg flex items-center gap-2">
              <Download size={18} />
              Download Design Assets
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-display font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100 transition-opacity">Dashboard</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Inventory</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4">Design</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100 transition-opacity">Color System</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Typography</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Components</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100 transition-opacity">Documentation</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Support</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4">About</h4>
              <p className="text-sm opacity-80">
                Modern ERP Admin Dashboard built with React, Tailwind CSS, and Recharts for superior data visualization.
              </p>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-sm opacity-80">
            <p>&copy; 2026 ERP Admin Dashboard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

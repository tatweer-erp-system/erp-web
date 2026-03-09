import { ReactNode, useState, useEffect, useRef, createContext, useContext } from "react";
import { Link, useLocation } from "wouter";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";
import { AntProvider } from "@/lib/antd-provider";
import { Breadcrumb, Grid } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { theme as antTheme } from "antd";
import { PinLockProvider } from "@/contexts/PinLockContext";
import { PinLockOverlay } from "./PinLockOverlay";

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

const InsideLayoutCtx = createContext(false);
export const useInsideLayout = () => useContext(InsideLayoutCtx);

export default function DashboardLayout({
  children,
  currentPage = "Dashboard",
  breadcrumbs,
}: DashboardLayoutProps) {
  const isNested = useContext(InsideLayoutCtx);
  if (isNested) return <>{children}</>;

  return (
    <InsideLayoutCtx.Provider value={true}>
      <AntProvider>
        <PinLockProvider>
          <LayoutShell currentPage={currentPage} breadcrumbs={breadcrumbs}>
            {children}
          </LayoutShell>
        </PinLockProvider>
      </AntProvider>
    </InsideLayoutCtx.Provider>
  );
}

function BreadcrumbBar({ currentPage, breadcrumbs }: Pick<DashboardLayoutProps, "currentPage" | "breadcrumbs">) {
  const { token } = antTheme.useToken();

  const items = [
    {
      title: (
        <Link href="/" style={{ color: token.colorTextSecondary, fontSize: 13 }}>
          <HomeOutlined />
        </Link>
      ),
    },
    ...(breadcrumbs
      ? breadcrumbs.map((b, i) => ({
          title:
            i < breadcrumbs.length - 1 && b.href ? (
              <Link href={b.href} style={{ color: token.colorTextSecondary, fontSize: 13 }}>
                {b.label}
              </Link>
            ) : (
              <span style={{ color: token.colorText, fontSize: 13, fontWeight: 500 }}>{b.label}</span>
            ),
        }))
      : [
          {
            title: (
              <span style={{ color: token.colorText, fontSize: 13, fontWeight: 500 }}>
                {currentPage}
              </span>
            ),
          },
        ]),
  ];

  return (
    <div
      style={{
        padding: "8px 24px",
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        flexShrink: 0,
      }}
    >
      <Breadcrumb items={items} />
    </div>
  );
}

const { useBreakpoint } = Grid;

function LayoutShell({ children, currentPage = "Dashboard", breadcrumbs }: DashboardLayoutProps) {
  const { language } = useAppSettings();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );
  const [animating, setAnimating] = useState(false);
  const prevLang = useRef(language);
  const isRTL = language === "ar";
  const [location] = useLocation();

  // Auto-close/open sidebar on breakpoint change
  useEffect(() => {
    if (screens.md === undefined) return; // not yet resolved
    setSidebarOpen(!!screens.md);
  }, [screens.md]);

  // Close mobile sidebar on navigation
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (prevLang.current === language) return;
    prevLang.current = language;
    setAnimating(true);
    const t = setTimeout(() => setAnimating(false), 400);
    return () => clearTimeout(t);
  }, [language]);

  return (
    <div
      className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}${animating ? " dir-animating" : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ overflow: "hidden" }}
    >
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 999,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Sidebar — fixed overlay on mobile, inline on desktop */}
      <div style={{
        display: "flex",
        flexShrink: 0,
        ...(isMobile ? {
          position: "fixed",
          top: 0,
          bottom: 0,
          [isRTL ? "right" : "left"]: 0,
          zIndex: 1000,
          height: "100vh",
          transform: sidebarOpen
            ? "translateX(0)"
            : `translateX(${isRTL ? "100%" : "-100%"})`,
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        } : {}),
      }}>
        <Sidebar isOpen={sidebarOpen} isRTL={isRTL} language={language} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isRTL={isRTL} />
        <BreadcrumbBar currentPage={currentPage} breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
      <ThemeCustomizer />
      <PinLockOverlay />
    </div>
  );
}

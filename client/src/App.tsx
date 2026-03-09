import { Suspense, lazy } from "react";
import { Route, Switch, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
import { AuthProvider, useAuthContext } from "./contexts/AuthContext";
import { PageSkeleton } from "./components/common/LoadingSkeleton";
import { routes } from "./lib/routes";
import DashboardLayout from "./components/layout/DashboardLayout";

const NotFound = lazy(() => import("@/pages/NotFound"));
const Login = lazy(() => import("@/pages/Login"));
const POSPage = lazy(() => import("@/modules/pos/POSPage"));
const CustomerDisplayScreen = lazy(() => import("@/modules/pos/pages/CustomerDisplayScreen"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function Router() {
  const [location] = useLocation();
  const { user, isAuthenticated, isCashier } = useAuthContext();

  // ── Unauthenticated ───────────────────────────────────────────────────────
  if (!isAuthenticated && location !== "/login") {
    return <Redirect to="/login" />;
  }

  // ── Login page ────────────────────────────────────────────────────────────
  if (location === "/login") {
    // Already logged in → redirect to their home
    if (user) return <Redirect to={isCashier ? "/pos" : "/"} />;
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Login />
      </Suspense>
    );
  }

  // ── Cashier role — POS only ───────────────────────────────────────────────
  if (isCashier && location !== "/pos" && location !== "/pos/customer-display") {
    return <Redirect to="/pos" />;
  }

  // ── POS full-screen ───────────────────────────────────────────────────────
  if (location === "/pos") {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <POSPage />
      </Suspense>
    );
  }

  if (location === "/pos/customer-display") {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <CustomerDisplayScreen />
      </Suspense>
    );
  }

  // ── ERP Dashboard layout ──────────────────────────────────────────────────
  const currentRoute = routes.find((r) => r.path === location);
  const breadcrumbs = currentRoute
    ? [
        { label: "Dashboard", href: "/" },
        ...currentRoute.breadcrumb.map((label) => ({ label, href: undefined })),
      ]
    : [{ label: "Dashboard" }];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <Suspense fallback={<PageSkeleton />}>
        <Switch>
          {routes.map(({ path, component: Page }) => (
            <Route key={path} path={path} component={Page} />
          ))}
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppSettingsProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AppSettingsProvider>
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

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
  const { user, isAuthenticated } = useAuthContext();

  // ── Unauthenticated ───────────────────────────────────────────────────────
  if (!isAuthenticated && location !== "/login") {
    return <Redirect to="/login" />;
  }

  // ── Login page ────────────────────────────────────────────────────────────
  if (location === "/login") {
    if (user) return <Redirect to="/" />;
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Login />
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

import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageErrorBoundary } from "@/components/common/PageErrorBoundary";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
import { AuthProvider, useAuthContext } from "./contexts/AuthContext";
import { Role, deriveRole } from "@/types/auth";
import { PageSkeleton } from "./components/common/LoadingSkeleton";
import { routes } from "./lib/routes";
import { DashboardLayout } from "./components/layout/DashboardLayout";

import Login from "@/pages/Login";
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function AuthGuard() {
  const { user, isAuthenticated, isReady } = useAuthContext();

  // Wait for hydration to finish before making any decision
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="w-8 h-8 animate-spin text-[#006C35]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || deriveRole(user) === Role.Cashier) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function LoginGuard() {
  // Login page never auto-redirects.
  // Redirection happens inside <Login /> via navigate("/") after successful branch selection.
  return <Login />;
}

function LayoutWrapper() {
  const location = useLocation();

  const currentRoute = routes.find(r => {
    if (r.path.includes(":")) {
      const pattern = r.path.replace(/:[^/]+/g, "[^/]+");
      return new RegExp(`^${pattern}$`).test(location.pathname);
    }
    return r.path === location.pathname;
  });

  const breadcrumbs = currentRoute
    ? [
        { label: "Dashboard", href: "/" },
        ...currentRoute.breadcrumb.map((label, i) => {
          // Last segment is the current page — not clickable
          if (i === currentRoute.breadcrumb.length - 1) {
            return { label, href: undefined };
          }
          // Find a route whose breadcrumb matches the prefix up to this segment
          const prefix = currentRoute.breadcrumb.slice(0, i + 1);
          // Try exact match first, then fall back to first route under this section
          const exact = routes.find(
            r =>
              r.breadcrumb.length === prefix.length &&
              r.breadcrumb.every((b, j) => b === prefix[j])
          );
          const match =
            exact ??
            routes.find(
              r =>
                r.breadcrumb.length > prefix.length &&
                !r.path.includes(":") &&
                prefix.every((b, j) => r.breadcrumb[j] === b)
            );
          return { label, href: match?.path };
        }),
      ]
    : [{ label: "Dashboard" }];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
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
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginGuard />} />
                <Route element={<AuthGuard />}>
                  <Route element={<LayoutWrapper />}>
                    {routes.map(({ path, component: Page }) => (
                      <Route
                        key={path}
                        path={path}
                        element={
                          <PageErrorBoundary>
                            <Page />
                          </PageErrorBoundary>
                        }
                      />
                    ))}
                    <Route
                      path="/404"
                      element={
                        <Suspense fallback={<PageSkeleton />}>
                          <NotFound />
                        </Suspense>
                      }
                    />
                    <Route
                      path="*"
                      element={
                        <Suspense fallback={<PageSkeleton />}>
                          <NotFound />
                        </Suspense>
                      }
                    />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </AppSettingsProvider>
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

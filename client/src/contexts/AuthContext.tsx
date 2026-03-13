import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { type User, type Tenant, type Branch, Role } from "@/types/auth";
import * as authService from "@/services/auth.service";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/lib/token";

const USER_STORAGE_KEY = "web_user";
const TENANT_STORAGE_KEY = "web_tenant";
const BRANCHES_STORAGE_KEY = "web_branches";
const SELECTED_BRANCH_KEY = "web_selected_branch";

export const ROLE_DISPLAY: Record<
  Role,
  { label: string; color: string; bg: string }
> = {
  [Role.SuperAdmin]: { label: "Super Admin", color: "#7C3AED", bg: "#F5F3FF" },
  [Role.Admin]: { label: "Admin", color: "#1D4ED8", bg: "#EFF6FF" },
  [Role.Manager]: { label: "Manager", color: "#047857", bg: "#ECFDF5" },
  [Role.Accountant]: { label: "Accountant", color: "#B45309", bg: "#FFFBEB" },
  [Role.Viewer]: { label: "Viewer", color: "#6B7280", bg: "#F9FAFB" },
  [Role.Cashier]: { label: "Cashier", color: "#C2410C", bg: "#FFF7ED" },
};

interface AuthContextValue {
  user: User | null;
  tenant: Tenant | null;
  branches: Branch[];
  selectedBranch: Branch | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCashier: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  selectBranch: (branch: Branch) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadFromStorage<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    loadFromStorage<User>(USER_STORAGE_KEY)
  );
  const [tenant, setTenant] = useState<Tenant | null>(() =>
    loadFromStorage<Tenant>(TENANT_STORAGE_KEY)
  );
  const [branches, setBranches] = useState<Branch[]>(
    () => loadFromStorage<Branch[]>(BRANCHES_STORAGE_KEY) ?? []
  );
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(() =>
    loadFromStorage<Branch>(SELECTED_BRANCH_KEY)
  );
  const [isLoading, setIsLoading] = useState(() => !!getAccessToken());

  const clearAuth = useCallback(() => {
    clearTokens();
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TENANT_STORAGE_KEY);
    localStorage.removeItem(BRANCHES_STORAGE_KEY);
    localStorage.removeItem(SELECTED_BRANCH_KEY);
    setUser(null);
    setTenant(null);
    setBranches([]);
    setSelectedBranch(null);
  }, []);

  // On mount: validate existing session by trying to refresh
  useEffect(() => {
    const token = getAccessToken();
    const refresh = getRefreshToken();

    if (!token || !refresh) {
      setIsLoading(false);
      if (!token) clearAuth();
      return;
    }

    // Try to refresh the token to validate the session
    authService
      .refresh(refresh)
      .then(res => {
        setTokens(res.accessToken, res.refreshToken);
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [clearAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login(email, password);
    setTokens(res.accessToken, res.refreshToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
    localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(res.tenant));
    localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(res.branches));
    setUser(res.user);
    setTenant(res.tenant);
    setBranches(res.branches);

    // Auto-select default branch if there's only one
    if (res.branches.length === 1) {
      const branch = res.branches[0];
      localStorage.setItem(SELECTED_BRANCH_KEY, JSON.stringify(branch));
      setSelectedBranch(branch);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Proceed with local logout even if API call fails
    }
    clearAuth();
  }, [clearAuth]);

  const selectBranch = useCallback((branch: Branch) => {
    localStorage.setItem(SELECTED_BRANCH_KEY, JSON.stringify(branch));
    setSelectedBranch(branch);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        branches,
        selectedBranch,
        isAuthenticated: !!user && !!getAccessToken(),
        isLoading,
        isCashier:
          user?.role === Role.Cashier ||
          (user?.roles ?? []).some(r => r.name.toLowerCase() === "cashier"),
        login,
        logout,
        selectBranch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { type User, type Tenant, type Branch, Role } from "@/types/auth";
import {
  login as authLogin,
  logout as authLogout,
  refresh as authRefresh,
} from "@/services/auth.service";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/lib/token";
import {
  getStorageJSON,
  setStorageJSON,
  removeStorageItem,
  STORAGE_KEYS,
} from "@/lib/storage";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    getStorageJSON<User>(STORAGE_KEYS.USER)
  );
  const [tenant, setTenant] = useState<Tenant | null>(() =>
    getStorageJSON<Tenant>(STORAGE_KEYS.TENANT)
  );
  const [branches, setBranches] = useState<Branch[]>(
    () => getStorageJSON<Branch[]>(STORAGE_KEYS.BRANCHES) ?? []
  );
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(() =>
    getStorageJSON<Branch>(STORAGE_KEYS.SELECTED_BRANCH)
  );
  const [isLoading, setIsLoading] = useState(() => !!getAccessToken());

  const clearAuth = useCallback(() => {
    clearTokens();
    removeStorageItem(STORAGE_KEYS.USER);
    removeStorageItem(STORAGE_KEYS.TENANT);
    removeStorageItem(STORAGE_KEYS.BRANCHES);
    removeStorageItem(STORAGE_KEYS.SELECTED_BRANCH);
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
    authRefresh(refresh)
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
    const res = await authLogin(email, password);
    setTokens(res.accessToken, res.refreshToken);
    setStorageJSON(STORAGE_KEYS.USER, res.user);
    setStorageJSON(STORAGE_KEYS.TENANT, res.tenant);
    setStorageJSON(STORAGE_KEYS.BRANCHES, res.branches);
    setUser(res.user);
    setTenant(res.tenant);
    setBranches(res.branches);

    // Auto-select default branch if there's only one
    if (res.branches.length === 1) {
      const branch = res.branches[0];
      setStorageJSON(STORAGE_KEYS.SELECTED_BRANCH, branch);
      setSelectedBranch(branch);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authLogout();
    } catch {
      // Proceed with local logout even if API call fails
    }
    clearAuth();
  }, [clearAuth]);

  const selectBranch = useCallback((branch: Branch) => {
    setStorageJSON(STORAGE_KEYS.SELECTED_BRANCH, branch);
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

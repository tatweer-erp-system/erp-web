import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  type User,
  type Tenant,
  type Branch,
  Role,
  deriveRole,
 LoginResponse } from "@/types/auth";
import {
  login as authLogin,
  logout as authLogout,
  refresh as authRefresh,
  selectBranch as apiSelectBranch,
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
import { useBranchStore } from "@/stores/branch.store";

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
  /** true while validating session on mount */
  isLoading: boolean;
  /** true after hydration completed (ready to make guard decisions) */
  isReady: boolean;
  isCashier: boolean;
  /** Calls POST /auth/login. Does NOT set user — returns branches for selection. */
  login: (email: string, password: string) => Promise<Branch[]>;
  /** Calls POST /auth/select-branch, sets user + branch, completes auth. */
  selectBranch: (branch: Branch) => Promise<void>;
  logout: () => Promise<void>;
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
  const [isReady, setIsReady] = useState(false);

  // Hold login response until branch is selected
  const pendingLoginRef = useRef<LoginResponse | null>(null);

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
    pendingLoginRef.current = null;
    // Clear branch store so X-Branch-Id header is removed
    useBranchStore.getState().clearBranch();
  }, []);

  // On mount: validate existing session + sync branch store from localStorage
  useEffect(() => {
    // Sync branch store from persisted selectedBranch
    const storedBranch = getStorageJSON<Branch>(STORAGE_KEYS.SELECTED_BRANCH);
    if (storedBranch) {
      useBranchStore.getState().setActiveBranch({
        id: storedBranch.id,
        nameEn: storedBranch.nameEn,
        nameAr: storedBranch.nameAr,
        code: storedBranch.code,
        isActive: storedBranch.isActive,
      });
    }

    const token = getAccessToken();
    const refresh = getRefreshToken();

    if (!token || !refresh) {
      if (!token) clearAuth();
      setIsLoading(false);
      setIsReady(true);
      return;
    }

    authRefresh(refresh)
      .then(res => {
        setTokens(res.accessToken, res.refreshToken);
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setIsLoading(false);
        setIsReady(true);
      });
  }, [clearAuth]);

  /**
   * Step 1: Authenticate credentials.
   * Stores tokens but does NOT set user in state — user stays null.
   * Returns branches so the caller can show branch picker or auto-select.
   */
  const login = useCallback(
    async (email: string, password: string): Promise<Branch[]> => {
      // Clear any previous session state
      clearAuth();

      const res = await authLogin(email, password);
      setTokens(res.accessToken, res.refreshToken);

      // Hold the full response — don't commit user to state yet
      pendingLoginRef.current = res;

      return res.branches;
    },
    [clearAuth]
  );

  /**
   * Step 2: Select branch.
   * Calls backend to get tokens with branchId, then commits full auth state.
   * Works both during initial login (from pendingLoginRef) and post-login branch switching.
   */
  const selectBranch = useCallback(async (branch: Branch) => {
    const branchRes = await apiSelectBranch(branch.id);
    setTokens(branchRes.accessToken, branchRes.refreshToken);

    // Commit full auth state from pending login (first time) or keep existing state (branch switch)
    const loginData = pendingLoginRef.current;
    if (loginData) {
      setStorageJSON(STORAGE_KEYS.USER, loginData.user);
      setStorageJSON(STORAGE_KEYS.TENANT, loginData.tenant);
      setStorageJSON(STORAGE_KEYS.BRANCHES, loginData.branches);
      setUser(loginData.user);
      setTenant(loginData.tenant);
      setBranches(loginData.branches);
      pendingLoginRef.current = null;
    }

    // Save selected branch
    setStorageJSON(STORAGE_KEYS.SELECTED_BRANCH, branch);
    setSelectedBranch(branch);

    // Sync branch store so API interceptor sets X-Branch-Id header
    useBranchStore.getState().setActiveBranch({
      id: branch.id,
      nameEn: branch.nameEn,
      nameAr: branch.nameAr,
      code: branch.code,
      isActive: branch.isActive,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authLogout();
    } catch {
      // Proceed with local logout even if API call fails
    }
    clearAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        branches,
        selectedBranch,
        isAuthenticated: !!user && !!getAccessToken(),
        isLoading,
        isReady,
        isCashier: deriveRole(user) === Role.Cashier,
        login,
        selectBranch,
        logout,
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

import { create } from "zustand";
import { persist } from "zustand/middleware";
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
import {
  type User,
  type Tenant,
  type Branch,
  type Permission,
  Role,
} from "@/types/auth";

type AuthState = {
  user: User | null;
  token: string | null;
  permissions: Permission[];
  tenant: Tenant | null;
  branches: Branch[];
  selectedBranch: Branch | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCashier: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setPermissions: (permissions: Permission[]) => void;
  refreshToken: () => Promise<void>;
  selectBranch: (branch: Branch) => void;
  /** Validates the existing session on app mount. Call once in the root. */
  hydrate: () => Promise<void>;
};

function deriveIsCashier(user: User | null): boolean {
  if (!user) return false;
  return (
    user.role === Role.Cashier ||
    user.roles.some(r => r.name.toLowerCase() === "cashier")
  );
}

function clearPersistedAuth(): void {
  clearTokens();
  removeStorageItem(STORAGE_KEYS.USER);
  removeStorageItem(STORAGE_KEYS.TENANT);
  removeStorageItem(STORAGE_KEYS.BRANCHES);
  removeStorageItem(STORAGE_KEYS.SELECTED_BRANCH);
}

const RESET_STATE = {
  user: null,
  token: null,
  permissions: [] as Permission[],
  tenant: null,
  branches: [] as Branch[],
  selectedBranch: null,
  isAuthenticated: false,
  isLoading: false,
  isCashier: false,
} as const;

/**
 * Zustand auth store — single source of truth for authentication state.
 *
 * Uses selector pattern: `const user = useAuthStore(s => s.user);`
 *
 * Only `token` is persisted via Zustand `persist` middleware. Other auth data
 * (user, tenant, branches) is persisted through the existing `storage.ts`
 * helpers for backward compatibility with the axios interceptor.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: getStorageJSON<User>(STORAGE_KEYS.USER),
      token: getAccessToken(),
      permissions:
        (getStorageJSON<User>(STORAGE_KEYS.USER)
          ?.permissions as Permission[]) ?? [],
      tenant: getStorageJSON<Tenant>(STORAGE_KEYS.TENANT),
      branches: getStorageJSON<Branch[]>(STORAGE_KEYS.BRANCHES) ?? [],
      selectedBranch: getStorageJSON<Branch>(STORAGE_KEYS.SELECTED_BRANCH),
      isAuthenticated:
        !!getStorageJSON<User>(STORAGE_KEYS.USER) && !!getAccessToken(),
      isLoading: !!getAccessToken(),
      isCashier: deriveIsCashier(getStorageJSON<User>(STORAGE_KEYS.USER)),

      login: async (email, password) => {
        const res = await authLogin(email, password);
        setTokens(res.accessToken, res.refreshToken);
        setStorageJSON(STORAGE_KEYS.USER, res.user);
        setStorageJSON(STORAGE_KEYS.TENANT, res.tenant);
        setStorageJSON(STORAGE_KEYS.BRANCHES, res.branches);

        const autoSelectedBranch =
          res.branches.length === 1 ? res.branches[0] : null;
        if (autoSelectedBranch) {
          setStorageJSON(STORAGE_KEYS.SELECTED_BRANCH, autoSelectedBranch);
        }

        set({
          user: res.user,
          token: res.accessToken,
          permissions: res.user.permissions as Permission[],
          tenant: res.tenant,
          branches: res.branches,
          selectedBranch: autoSelectedBranch ?? get().selectedBranch,
          isAuthenticated: true,
          isLoading: false,
          isCashier: deriveIsCashier(res.user),
        });
      },

      logout: async () => {
        try {
          await authLogout();
        } catch {
          /* proceed with local cleanup */
        }
        clearPersistedAuth();
        set({ ...RESET_STATE });
      },

      setUser: user => {
        if (user) setStorageJSON(STORAGE_KEYS.USER, user);
        else removeStorageItem(STORAGE_KEYS.USER);
        set({
          user,
          permissions: (user?.permissions as Permission[]) ?? [],
          isAuthenticated: !!user && !!get().token,
          isCashier: deriveIsCashier(user),
        });
      },

      setToken: token => {
        if (token) setTokens(token, getRefreshToken() ?? "");
        else clearTokens();
        set({ token, isAuthenticated: !!get().user && !!token });
      },

      setPermissions: permissions => set({ permissions }),

      refreshToken: async () => {
        const refresh = getRefreshToken();
        if (!refresh) {
          await get().logout();
          return;
        }
        try {
          const res = await authRefresh(refresh);
          setTokens(res.accessToken, res.refreshToken);
          set({ token: res.accessToken });
        } catch {
          await get().logout();
        }
      },

      selectBranch: branch => {
        setStorageJSON(STORAGE_KEYS.SELECTED_BRANCH, branch);
        set({ selectedBranch: branch });
      },

      hydrate: async () => {
        const accessToken = getAccessToken();
        const refresh = getRefreshToken();
        if (!accessToken || !refresh) {
          if (!accessToken) clearPersistedAuth();
          set({ isLoading: false });
          return;
        }
        try {
          const res = await authRefresh(refresh);
          setTokens(res.accessToken, res.refreshToken);
          set({ token: res.accessToken, isLoading: false });
        } catch {
          clearPersistedAuth();
          set({ ...RESET_STATE });
        }
      },
    }),
    {
      name: STORAGE_KEYS.ACCESS_TOKEN,
      partialize: state => ({ token: state.token }),
    }
  )
);

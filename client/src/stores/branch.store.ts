import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ───────────────────────────────────────────────────────────────────

type Branch = {
  id: number;
  nameEn: string;
  nameAr: string;
  code: string;
  isActive: boolean;
};

type BranchState = {
  activeBranch: Branch | null;
  allowedBranches: Branch[];
};

type BranchActions = {
  setActiveBranch: (branch: Branch) => void;
  setAllowedBranches: (branches: Branch[]) => void;
  clearBranch: () => void;
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useBranchStore = create<BranchState & BranchActions>()(
  persist(
    set => ({
      activeBranch: null,
      allowedBranches: [],

      setActiveBranch: branch => set({ activeBranch: branch }),

      setAllowedBranches: branches => set({ allowedBranches: branches }),

      clearBranch: () => set({ activeBranch: null }),
    }),
    {
      name: "erp-branch",
      partialize: state => ({ activeBranch: state.activeBranch }),
    }
  )
);

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectActiveBranch = (state: BranchState & BranchActions) =>
  state.activeBranch;
export const selectAllowedBranches = (state: BranchState & BranchActions) =>
  state.allowedBranches;
export const selectSetActiveBranch = (state: BranchState & BranchActions) =>
  state.setActiveBranch;
export const selectSetAllowedBranches = (state: BranchState & BranchActions) =>
  state.setAllowedBranches;
export const selectClearBranch = (state: BranchState & BranchActions) =>
  state.clearBranch;

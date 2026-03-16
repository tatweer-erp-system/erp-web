import {
  useBranchStore,
  selectActiveBranch,
  selectAllowedBranches,
  selectSetActiveBranch,
  selectClearBranch,
} from "@/stores/branch.store";

/**
 * Convenience wrapper around the branch store.
 *
 * Returns the active branch, allowed branches, and branch actions
 * without requiring components to import the store directly.
 */
export function useBranchScope() {
  const activeBranch = useBranchStore(selectActiveBranch);
  const allowedBranches = useBranchStore(selectAllowedBranches);
  const setActiveBranch = useBranchStore(selectSetActiveBranch);
  const clearBranch = useBranchStore(selectClearBranch);

  return {
    activeBranch,
    allowedBranches,
    setActiveBranch,
    clearBranch,
    hasBranch: activeBranch !== null,
  };
}

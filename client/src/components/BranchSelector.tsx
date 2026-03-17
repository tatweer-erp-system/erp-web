import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { branchesService } from "@/services/branches.service";
import { useLangStore } from "@/stores/lang.store";
import { useAuthStore } from "@/stores/auth.store";
import { t } from "@/i18n";
import type { Branch } from "@/types/auth";

interface BranchSelectorProps {
  value?: string;
  onChange: (branchId: string) => void;
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
}

export function BranchSelector({
  value,
  onChange,
  defaultValue,
  disabled = false,
  className = "",
}: BranchSelectorProps) {
  const language = useLangStore(s => s.lang);
  const selectedBranch = useAuthStore(s => s.selectedBranch);
  const authBranches = useAuthStore(s => s.branches);

  // Try fetching from API; fall back to auth context branches
  const { data: apiBranches } = useQuery({
    queryKey: [QUERY_KEYS.BRANCHES],
    queryFn: () => branchesService.list(),
    staleTime: 5 * 60 * 1000,
  });

  const branches = apiBranches?.data ?? authBranches ?? [];

  // Auto-select default branch on mount
  useEffect(() => {
    if (!value && !defaultValue && selectedBranch) {
      onChange(selectedBranch.id);
    } else if (!value && defaultValue) {
      onChange(defaultValue);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-foreground mb-2">
        {t("branch", language)}
      </label>
      <select
        value={value ?? defaultValue ?? ""}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-border rounded-lg text-sm dark:bg-card bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{t("selectBranch", language)}</option>
        {branches.map(branch => (
          <option key={branch.id} value={branch.id}>
            {branch.name} ({branch.code})
          </option>
        ))}
      </select>
    </div>
  );
}

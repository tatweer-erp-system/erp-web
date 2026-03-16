import { useQuery } from "@tanstack/react-query";

import { hrApi } from "@/api/endpoints/hr.api";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { TableParams } from "@/types/api";

/** Paginated employee list */
export function useEmployees(params?: Partial<TableParams>) {
  return useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEES, params],
    queryFn: () => hrApi.employees(params),
  });
}

/** Single employee by ID */
export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEES, id],
    queryFn: () => hrApi.employee(id!),
    enabled: !!id,
  });
}

/** All departments */
export function useDepartments() {
  return useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENTS],
    queryFn: () => hrApi.departments(),
    staleTime: 5 * 60 * 1000,
  });
}

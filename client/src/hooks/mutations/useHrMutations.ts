import { useMutation, useQueryClient } from "@tanstack/react-query";

import { hrApi } from "@/api/endpoints/hr.api";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

type CreateEmployeeDto = {
  nameEn: string;
  nameAr: string;
  email: string;
  phone?: string;
  departmentId: string;
  jobTitleId?: string;
  joinDate: string;
};

type UpdateEmployeeDto = Partial<CreateEmployeeDto> & { version: number };

/** Create a new employee */
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateEmployeeDto) => hrApi.createEmployee(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEES] });
    },
  });
}

/** Update an existing employee */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateEmployeeDto }) =>
      hrApi.updateEmployee(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEES] });
    },
  });
}

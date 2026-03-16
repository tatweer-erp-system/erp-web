import { apiClient } from "@/api/client";
import type { ApiResponse, PaginatedResponse, TableParams } from "@/types/api";

type Department = {
  id: string;
  nameEn: string;
  nameAr: string;
  managerId?: string;
  isActive: boolean;
};

type Employee = {
  id: string;
  employeeNumber: string;
  nameEn: string;
  nameAr: string;
  email: string;
  phone?: string;
  departmentId?: string;
  jobTitle?: string;
  nationality?: string;
  joinDate: string;
  isActive: boolean;
  createdAt?: string;
};

type CreateEmployeeDto = {
  nameEn: string;
  nameAr: string;
  email: string;
  phone?: string;
  departmentId?: string;
  jobTitle?: string;
  nationality?: string;
  joinDate: string;
  isActive?: boolean;
};

type UpdateEmployeeDto = Partial<CreateEmployeeDto> & {
  version: number;
};

/** Fetch a paginated list of employees */
export function getEmployees(params?: Partial<TableParams>) {
  return apiClient
    .get<PaginatedResponse<Employee>>("/hr/employees", { params })
    .then(r => r.data);
}

/** Fetch a single employee by ID */
export function getEmployee(id: string) {
  return apiClient
    .get<ApiResponse<Employee>>(`/hr/employees/${id}`)
    .then(r => r.data);
}

/** Create a new employee */
export function createEmployee(dto: CreateEmployeeDto) {
  return apiClient
    .post<ApiResponse<Employee>>("/hr/employees", dto)
    .then(r => r.data);
}

/** Update an existing employee */
export function updateEmployee(id: string, dto: UpdateEmployeeDto) {
  return apiClient
    .patch<ApiResponse<Employee>>(`/hr/employees/${id}`, dto)
    .then(r => r.data);
}

/** Fetch all departments */
export function getDepartments(params?: Partial<TableParams>) {
  return apiClient
    .get<PaginatedResponse<Department>>("/hr/departments", { params })
    .then(r => r.data);
}

/** Namespace for hooks that prefer object-style access */
export const hrApi = {
  employees: getEmployees,
  employee: getEmployee,
  createEmployee,
  updateEmployee,
  departments: getDepartments,
};

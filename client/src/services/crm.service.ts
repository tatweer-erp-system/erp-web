import apiClient from "@/lib/api";
import type { ApiResponse, PaginatedResponse, TableParams } from "@/types/api";
import type {
  CrmStage,
  CreateCrmStageDto,
  UpdateCrmStageDto,
  Lead,
  CreateLeadDto,
  UpdateLeadDto,
  PipelineStage,
  ConversionReport,
  Delivery,
  CreateDeliveryDto,
} from "@/types/modules/crm";

// ─── CRM Stages ─────────────────────────────────────────────────────────────

export const crmStagesService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<CrmStage>>("/crm-stages", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<CrmStage>>(`/crm-stages/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateCrmStageDto) =>
    apiClient
      .post<ApiResponse<CrmStage>>("/crm-stages", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateCrmStageDto) =>
    apiClient
      .put<ApiResponse<CrmStage>>(`/crm-stages/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/crm-stages/${id}`).then(r => r.data),
};

// ─── Leads ──────────────────────────────────────────────────────────────────

export const leadsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<Lead>>("/crm/leads", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Lead>>(`/crm/leads/${id}`).then(r => r.data.data),

  create: (dto: CreateLeadDto) =>
    apiClient.post<ApiResponse<Lead>>("/crm/leads", dto).then(r => r.data.data),

  update: (id: string, dto: UpdateLeadDto) =>
    apiClient
      .put<ApiResponse<Lead>>(`/crm/leads/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/crm/leads/${id}`).then(r => r.data),

  changeStage: (id: string, stageId: string) =>
    apiClient
      .post<ApiResponse<Lead>>(`/crm/leads/${id}/stage`, { stageId })
      .then(r => r.data.data),

  convert: (id: string) =>
    apiClient
      .post<ApiResponse<Lead>>(`/crm/leads/${id}/convert`)
      .then(r => r.data.data),

  markWon: (id: string) =>
    apiClient
      .post<ApiResponse<Lead>>(`/crm/leads/${id}/won`)
      .then(r => r.data.data),

  markLost: (id: string, reason: string) =>
    apiClient
      .post<ApiResponse<Lead>>(`/crm/leads/${id}/lost`, { reason })
      .then(r => r.data.data),

  dropdown: (params?: { search?: string; limit?: number }) =>
    apiClient
      .get<ApiResponse<{ id: string; title: string }[]>>(
        "/crm/leads/dropdown",
        {
          params,
        }
      )
      .then(r => r.data.data),
};

// ─── Pipeline ───────────────────────────────────────────────────────────────

export const pipelineService = {
  get: () =>
    apiClient
      .get<ApiResponse<PipelineStage[]>>("/crm/pipeline")
      .then(r => r.data.data),

  getConversionReport: () =>
    apiClient
      .get<ApiResponse<ConversionReport>>("/crm/reports/conversion")
      .then(r => r.data.data),
};

// ─── Deliveries ─────────────────────────────────────────────────────────────

export const deliveriesService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<Delivery>>("/deliveries", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<Delivery>>(`/deliveries/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateDeliveryDto) =>
    apiClient
      .post<ApiResponse<Delivery>>("/deliveries", dto)
      .then(r => r.data.data),

  update: (id: string, dto: Partial<CreateDeliveryDto> & { version: number }) =>
    apiClient
      .put<ApiResponse<Delivery>>(`/deliveries/${id}`, dto)
      .then(r => r.data.data),

  validate: (id: string) =>
    apiClient
      .post<ApiResponse<Delivery>>(`/deliveries/${id}/validate`)
      .then(r => r.data.data),

  cancel: (id: string) =>
    apiClient
      .post<ApiResponse<Delivery>>(`/deliveries/${id}/cancel`)
      .then(r => r.data.data),
};

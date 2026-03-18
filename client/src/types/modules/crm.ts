// ─── CRM Stage ──────────────────────────────────────────────────────────────

export interface CrmStage {
  id: string;
  nameEn: string;
  nameAr: string;
  sequence: number;
  probability: number;
  isWon: boolean;
  isFolded: boolean;
  version?: number;
  createdAt?: string;
}

export interface CreateCrmStageDto {
  nameEn: string;
  nameAr: string;
  sequence?: number;
  probability?: number;
  isWon?: boolean;
  isFolded?: boolean;
}

export interface UpdateCrmStageDto extends Partial<CreateCrmStageDto> {
  version: number;
}

// ─── Lead ───────────────────────────────────────────────────────────────────

export interface Lead {
  id: string;
  title: string;
  stageId?: string;
  partnerId?: string;
  type: string;
  probability?: number;
  expectedRevenue?: number;
  currencyId?: string;
  expectedRevenueBase?: number;
  priority: string;
  assignedTo?: string;
  expectedCloseDate?: string;
  source?: string;
  campaign?: string;
  medium?: string;
  tags?: string[];
  notes?: string;
  isWon: boolean;
  isLost: boolean;
  lostReason?: string;
  wonAt?: string;
  lostAt?: string;
  saleOrderId?: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  // JOINed fields
  stageNameEn?: string;
  stageNameAr?: string;
  partnerNameEn?: string;
  partnerNameAr?: string;
  assignedToNameEn?: string;
  assignedToNameAr?: string;
  activities?: LeadActivity[];
}

export interface CreateLeadDto {
  title: string;
  stageId?: string;
  partnerId?: string;
  type?: string;
  assignedTo?: string;
  expectedRevenue?: number;
  priority?: string;
  source?: string;
  campaign?: string;
  medium?: string;
  expectedCloseDate?: string;
  tags?: string[];
  notes?: string;
  probability?: number;
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> {
  version: number;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  userId?: string;
  activityType: string;
  fromStageId?: string;
  toStageId?: string;
  notes?: string;
  createdAt?: string;
  fromStageNameEn?: string;
  fromStageNameAr?: string;
  toStageNameEn?: string;
  toStageNameAr?: string;
  userNameEn?: string;
  userNameAr?: string;
}

// ─── Pipeline ───────────────────────────────────────────────────────────────

export interface PipelineStage {
  stageId: string;
  nameEn: string;
  nameAr: string;
  sequence: number;
  stageProbability: number;
  isWon: boolean;
  isFolded: boolean;
  count: number;
  totalValue: number;
  leads: PipelineLead[];
}

export interface PipelineLead {
  id: string;
  title: string;
  partnerId?: string;
  partnerNameEn?: string;
  partnerNameAr?: string;
  expectedRevenue?: number;
  currencyId?: string;
  expectedRevenueBase?: number;
  priority: string;
  assignedTo?: string;
  expectedCloseDate?: string;
  stageId?: string;
  type: string;
  probability?: number;
  isWon: boolean;
}

// ─── Conversion Report ──────────────────────────────────────────────────────

export interface ConversionReport {
  winRate: number;
  wonCount: number;
  lostCount: number;
  avgDealSize: number;
  avgDaysToClose: number;
}

// ─── Delivery ───────────────────────────────────────────────────────────────

export interface Delivery {
  id: string;
  branchId: string;
  partnerId: string;
  saleOrderId?: string;
  scheduledDate?: string;
  responsibleId?: string;
  notes?: string;
  status: string;
  version?: number;
  createdAt?: string;
  partnerNameEn?: string;
  partnerNameAr?: string;
  saleOrderNumber?: string;
  responsibleNameEn?: string;
  responsibleNameAr?: string;
  branchNameEn?: string;
  branchNameAr?: string;
  lines?: DeliveryLine[];
}

export interface DeliveryLine {
  id: string;
  productId: string;
  saleOrderLineId?: string;
  productVariantId?: string;
  qtyDemand: number;
  qtyDone: number;
  productNameEn?: string;
  productNameAr?: string;
  productSku?: string;
}

export interface CreateDeliveryDto {
  branchId: string;
  partnerId: string;
  saleOrderId?: string;
  scheduledDate?: string;
  responsibleId?: string;
  notes?: string;
  lines: CreateDeliveryLineDto[];
}

export interface CreateDeliveryLineDto {
  productId: string;
  saleOrderLineId?: string;
  productVariantId?: string;
  qtyDemand: number;
  qtyDone?: number;
}

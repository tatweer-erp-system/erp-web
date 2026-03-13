import {
  DiscountType,
  VoucherStatus,
  VoucherTypeStatus,
} from "@/constants/enums";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VoucherType {
  id: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  validForDays: number;
  maxUses: number; // 0 = unlimited
  status: VoucherTypeStatus;
}

export interface Voucher {
  id: string;
  code: string;
  typeId: string;
  typeName: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  usedBy?: string; // customer name
  usedDate?: string;
  orderRef?: string;
  issuedDate: string;
  expiryDate?: string;
  status: VoucherStatus;
}

export interface VoucherValidationResult {
  valid: boolean;
  voucher?: Voucher;
  discountAmount?: number; // computed against cart subtotal
  message?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const mockVoucherTypes: VoucherType[] = [
  {
    id: "VT001",
    name: "Welcome Discount",
    discountType: DiscountType.FIXED,
    discountValue: 5,
    minOrderAmount: 0,
    validForDays: 30,
    maxUses: 0,
    status: VoucherTypeStatus.ACTIVE,
  },
  {
    id: "VT002",
    name: "Summer Sale 10%",
    discountType: DiscountType.PERCENT,
    discountValue: 10,
    minOrderAmount: 0,
    validForDays: 60,
    maxUses: 500,
    status: VoucherTypeStatus.ACTIVE,
  },
  {
    id: "VT003",
    name: "Flat $20 Off",
    discountType: DiscountType.FIXED,
    discountValue: 20,
    minOrderAmount: 50,
    validForDays: 90,
    maxUses: 200,
    status: VoucherTypeStatus.ACTIVE,
  },
  {
    id: "VT004",
    name: "Summer 15%",
    discountType: DiscountType.PERCENT,
    discountValue: 15,
    minOrderAmount: 100,
    validForDays: 45,
    maxUses: 100,
    status: VoucherTypeStatus.ACTIVE,
  },
  {
    id: "VT005",
    name: "Clearance Fixed",
    discountType: DiscountType.FIXED,
    discountValue: 50,
    minOrderAmount: 200,
    validForDays: 14,
    maxUses: 50,
    status: VoucherTypeStatus.INACTIVE,
  },
];

let mockVouchers: Voucher[] = [
  {
    id: "V001",
    code: "WELCOME",
    typeId: "VT001",
    typeName: "Welcome Discount",
    discountType: DiscountType.FIXED,
    discountValue: 5,
    minOrderAmount: 0,
    issuedDate: "2026-01-01",
    status: VoucherStatus.ACTIVE,
  },
  {
    id: "V002",
    code: "SAVE10",
    typeId: "VT002",
    typeName: "Summer Sale 10%",
    discountType: DiscountType.PERCENT,
    discountValue: 10,
    minOrderAmount: 0,
    issuedDate: "2026-02-01",
    status: VoucherStatus.ACTIVE,
  },
  {
    id: "V003",
    code: "FLAT20",
    typeId: "VT003",
    typeName: "Flat $20 Off",
    discountType: DiscountType.FIXED,
    discountValue: 20,
    minOrderAmount: 50,
    issuedDate: "2026-02-15",
    status: VoucherStatus.ACTIVE,
  },
  {
    id: "V004",
    code: "SUMMER15",
    typeId: "VT004",
    typeName: "Summer 15%",
    discountType: DiscountType.PERCENT,
    discountValue: 15,
    minOrderAmount: 100,
    issuedDate: "2026-03-01",
    status: VoucherStatus.ACTIVE,
  },
  {
    id: "V005",
    code: "USED20OFF",
    typeId: "VT003",
    typeName: "Flat $20 Off",
    discountType: DiscountType.FIXED,
    discountValue: 20,
    minOrderAmount: 50,
    issuedDate: "2026-01-10",
    usedBy: "Sarah Johnson",
    usedDate: "2026-01-15",
    orderRef: "POS-123456",
    status: VoucherStatus.USED,
  },
  {
    id: "V006",
    code: "EXPIRED10",
    typeId: "VT002",
    typeName: "Summer Sale 10%",
    discountType: DiscountType.PERCENT,
    discountValue: 10,
    minOrderAmount: 0,
    issuedDate: "2025-12-01",
    expiryDate: "2025-12-31",
    status: VoucherStatus.EXPIRED,
  },
];

// ─── Service functions ────────────────────────────────────────────────────────

export async function validateVoucher(
  code: string,
  cartSubtotal: number
): Promise<VoucherValidationResult> {
  await new Promise(r => setTimeout(r, 300));

  const voucher = mockVouchers.find(
    v => v.code.toUpperCase() === code.trim().toUpperCase()
  );

  if (!voucher) {
    return { valid: false, message: "Voucher code not found" };
  }
  if (voucher.status === VoucherStatus.USED) {
    return { valid: false, message: "This voucher has already been used" };
  }
  if (voucher.status === VoucherStatus.EXPIRED) {
    return { valid: false, message: "This voucher has expired" };
  }
  if (cartSubtotal < voucher.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount is $${voucher.minOrderAmount.toFixed(2)}`,
    };
  }

  const discountAmount =
    voucher.discountType === DiscountType.PERCENT
      ? (cartSubtotal * voucher.discountValue) / 100
      : Math.min(voucher.discountValue, cartSubtotal);

  return { valid: true, voucher, discountAmount };
}

export async function redeemVoucher(
  code: string,
  orderRef: string,
  usedBy?: string
): Promise<void> {
  await new Promise(r => setTimeout(r, 150));
  mockVouchers = mockVouchers.map(v =>
    v.code.toUpperCase() === code.toUpperCase()
      ? {
          ...v,
          status: VoucherStatus.USED,
          usedBy: usedBy ?? "Walk-in Customer",
          usedDate: new Date().toISOString().split("T")[0],
          orderRef,
        }
      : v
  );
}

export async function getAllVouchers(): Promise<Voucher[]> {
  await new Promise(r => setTimeout(r, 200));
  return [...mockVouchers];
}

export async function getVoucherTypes(): Promise<VoucherType[]> {
  await new Promise(r => setTimeout(r, 150));
  return [...mockVoucherTypes];
}

export async function createVoucherType(
  payload: Omit<VoucherType, "id">
): Promise<VoucherType> {
  await new Promise(r => setTimeout(r, 250));
  const newType: VoucherType = {
    ...payload,
    id: `VT${String(mockVoucherTypes.length + 1).padStart(3, "0")}`,
  };
  mockVoucherTypes.push(newType);
  return newType;
}

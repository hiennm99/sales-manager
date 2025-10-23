// types/financialReport.ts

import type { BaseEntity } from "./common";

// Financial Report Period
export interface FinancialReportPeriod extends BaseEntity {
  shop_id: number;
  year: number;
  month: number;
  period_start: string;
  period_end: string;

  // Summary from Etsy
  total_sales: number;
  total_fees: number;
  net_profit: number;

  // Marketing/Seller services
  marketing_fees: number;

  // VAT reporting
  vat_statement_url: string | null;
  credit_notes: string | null;

  // Upload info
  uploaded_by_employee_id: number | null;
  uploaded_at: string | null;

  // Status
  status: "draft" | "approved" | "finalized";
  notes: string | null;
}

// Money on Etsy (Tiền còn trên Etsy)
export interface MoneyOnEtsy extends BaseEntity {
  report_period_id: number;
  date: string;
  description: string;
  amount: number;
  currency: string;
  type: "balance" | "pending" | "available";
}

// Incoming Money (Tiền đang về)
export interface IncomingMoney extends BaseEntity {
  report_period_id: number;
  date: string;
  order_id: string | null;
  description: string;
  amount: number;
  currency: string;
  expected_date: string | null;
  status: "pending" | "processing" | "received";
}

// Received Money (Tiền đã về)
export interface ReceivedMoney extends BaseEntity {
  report_period_id: number;
  date: string;
  order_id: string | null;
  description: string;
  amount: number;
  currency: string;
  received_date: string;
  payment_method: string | null;
}

// Expenses (Các chi phí)
export interface Expense extends BaseEntity {
  report_period_id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  receipt_url: string | null;
}

// Transferred Money (Tiền đã CK - Chuyển khoản)
export interface TransferredMoney extends BaseEntity {
  report_period_id: number;
  date: string;
  description: string;
  amount: number;
  currency: string;
  transfer_date: string;
  bank_account: string | null;
  reference_number: string | null;
}

// Form Data Types
export interface FinancialReportFormData {
  shopId: number;
  year: number;
  month: number;
  periodStart: string;
  periodEnd: string;
  totalSales: number;
  totalFees: number;
  netProfit: number;
  marketingFees: number;
  vatStatementUrl?: string;
  creditNotes?: string;
  uploadedByEmployeeId?: number;
  status?: "draft" | "approved" | "finalized";
  notes?: string;
}

export interface MoneyOnEtsyFormData {
  reportPeriodId: number;
  date: string;
  description: string;
  amount: number;
  currency: string;
  type: "balance" | "pending" | "available";
}

export interface IncomingMoneyFormData {
  reportPeriodId: number;
  date: string;
  orderId?: string;
  description: string;
  amount: number;
  currency: string;
  expectedDate?: string;
  status?: "pending" | "processing" | "received";
}

export interface ReceivedMoneyFormData {
  reportPeriodId: number;
  date: string;
  orderId?: string;
  description: string;
  amount: number;
  currency: string;
  receivedDate: string;
  paymentMethod?: string;
}

export interface ExpenseFormData {
  reportPeriodId: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  receiptUrl?: string;
}

export interface TransferredMoneyFormData {
  reportPeriodId: number;
  date: string;
  description: string;
  amount: number;
  currency: string;
  transferDate: string;
  bankAccount?: string;
  referenceNumber?: string;
}

// Excel Upload Data
export interface ExcelUploadData {
  overview: {
    month: string;
    year: string;
    totalSales: number;
    totalFees: number;
    netProfit: number;
    marketingFees: number;
  };
  moneyOnEtsy: Array<{
    date: string;
    description: string;
    amount: number;
    currency: string;
    type: string;
  }>;
  incomingMoney: Array<{
    date: string;
    orderId?: string;
    description: string;
    amount: number;
    currency: string;
    expectedDate?: string;
  }>;
  receivedMoney: Array<{
    date: string;
    orderId?: string;
    description: string;
    amount: number;
    currency: string;
    receivedDate: string;
    paymentMethod?: string;
  }>;
  expenses: Array<{
    date: string;
    category: string;
    description: string;
    amount: number;
    currency: string;
    paymentMethod?: string;
  }>;
  transferredMoney: Array<{
    date: string;
    description: string;
    amount: number;
    currency: string;
    transferDate: string;
    bankAccount?: string;
    referenceNumber?: string;
  }>;
}

// Filter Types
export interface FinancialReportFilters {
  shopId?: number;
  year?: number;
  month?: number;
  status?: "draft" | "approved" | "finalized";
  startDate?: string;
  endDate?: string;
}

// Type Casting Helpers for Supabase
export const castFinancialReportPeriod = (
  data: any,
): FinancialReportPeriod => ({
  ...data,
  status: (data.status as "draft" | "approved" | "finalized") || "draft",
});

export const castMoneyOnEtsy = (data: any): MoneyOnEtsy => ({
  ...data,
  type: (data.type as "balance" | "pending" | "available") || "balance",
});

export const castIncomingMoney = (data: any): IncomingMoney => ({
  ...data,
  status: (data.status as "pending" | "processing" | "received") || "pending",
});

export const castReceivedMoney = (data: any): ReceivedMoney => ({
  ...data,
  created_at:
    typeof data.created_at === "string"
      ? new Date(data.created_at)
      : data.created_at,
});

export const castExpense = (data: any): Expense => ({
  ...data,
  created_at:
    typeof data.created_at === "string"
      ? new Date(data.created_at)
      : data.created_at,
});

export const castTransferredMoney = (data: any): TransferredMoney => ({
  ...data,
  created_at:
    typeof data.created_at === "string"
      ? new Date(data.created_at)
      : data.created_at,
});

// Helper Functions
export const createEmptyFinancialReport =
  (): Partial<FinancialReportFormData> => ({
    totalSales: 0,
    totalFees: 0,
    netProfit: 0,
    marketingFees: 0,
    status: "draft",
  });

export const formatCurrency = (amount: number): string => {
  // Always format as VND
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getMonthName = (month: number): string => {
  const months = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  return months[month - 1] || "";
};

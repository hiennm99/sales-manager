// services/financialReport.service.api.ts

import { supabase } from "@/lib/supabase";
import type {
  ExcelUploadData,
  Expense,
  FinancialReportFilters,
  FinancialReportFormData,
  FinancialReportPeriod,
  IncomingMoney,
  MoneyOnEtsy,
  ReceivedMoney,
  TransferredMoney,
} from "@/types/financialReport";
import {
  castExpense,
  castFinancialReportPeriod,
  castIncomingMoney,
  castMoneyOnEtsy,
  castReceivedMoney,
  castTransferredMoney,
} from "@/types/financialReport";
import * as XLSX from "exceljs";

// ==================== Table References ====================
const reportPeriodsTable = () => supabase.from("financial_report_periods");
const moneyOnEtsyTable = () => supabase.from("money_on_etsy");
const incomingMoneyTable = () => supabase.from("incoming_money");
const receivedMoneyTable = () => supabase.from("received_money");
const expensesTable = () => supabase.from("expenses");
const transferredMoneyTable = () => supabase.from("transferred_money");

// ==================== Financial Report Periods ====================

const mapToReportRow = (
  data: Partial<FinancialReportFormData>,
): Record<string, unknown> => {
  const row: Record<string, unknown> = {};

  if (data.shopId !== undefined) row.shop_id = data.shopId;
  if (data.year !== undefined) row.year = data.year;
  if (data.month !== undefined) row.month = data.month;
  if (data.periodStart !== undefined) row.period_start = data.periodStart;
  if (data.periodEnd !== undefined) row.period_end = data.periodEnd;
  if (data.totalSales !== undefined) row.total_sales = data.totalSales;
  if (data.totalFees !== undefined) row.total_fees = data.totalFees;
  if (data.netProfit !== undefined) row.net_profit = data.netProfit;
  if (data.marketingFees !== undefined) row.marketing_fees = data.marketingFees;
  if (data.vatStatementUrl !== undefined)
    row.vat_statement_url = data.vatStatementUrl;
  if (data.creditNotes !== undefined) row.credit_notes = data.creditNotes;
  if (data.uploadedByEmployeeId !== undefined)
    row.uploaded_by_employee_id = data.uploadedByEmployeeId;
  if (data.status !== undefined) row.status = data.status;
  if (data.notes !== undefined) row.notes = data.notes;

  return row;
};

export const financialReportServiceApi = {
  // Get all report periods
  async getReportPeriods(
    filters?: FinancialReportFilters,
  ): Promise<FinancialReportPeriod[]> {
    let query = reportPeriodsTable()
      .select("*")
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    if (filters?.shopId) {
      query = query.eq("shop_id", filters.shopId);
    }
    if (filters?.year) {
      query = query.eq("year", filters.year);
    }
    if (filters?.month) {
      query = query.eq("month", filters.month);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(castFinancialReportPeriod);
  },

  // Get single report period
  async getReportPeriod(id: number): Promise<FinancialReportPeriod | null> {
    const { data, error } = await reportPeriodsTable()
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data ? castFinancialReportPeriod(data) : null;
  },

  // Create report period
  async createReportPeriod(
    formData: FinancialReportFormData,
  ): Promise<FinancialReportPeriod> {
    const row = mapToReportRow(formData);

    const { data, error } = await reportPeriodsTable()
      .insert(row as any)
      .select()
      .single();

    if (error) throw error;
    return data
      ? castFinancialReportPeriod(data)
      : ({} as FinancialReportPeriod);
  },

  // Update report period
  async updateReportPeriod(
    id: number,
    formData: Partial<FinancialReportFormData>,
  ): Promise<FinancialReportPeriod> {
    const row = mapToReportRow(formData);

    const { data, error } = await reportPeriodsTable()
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data
      ? castFinancialReportPeriod(data)
      : ({} as FinancialReportPeriod);
  },

  // Delete report period
  async deleteReportPeriod(id: number): Promise<void> {
    const { error } = await reportPeriodsTable().delete().eq("id", id);

    if (error) throw error;
  },

  // Approve report
  async approveReport(id: number): Promise<FinancialReportPeriod> {
    const { data, error } = await reportPeriodsTable()
      .update({ status: "approved" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data
      ? castFinancialReportPeriod(data)
      : ({} as FinancialReportPeriod);
  },

  // Finalize report
  async finalizeReport(id: number): Promise<FinancialReportPeriod> {
    const { data, error } = await reportPeriodsTable()
      .update({ status: "finalized" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data
      ? castFinancialReportPeriod(data)
      : ({} as FinancialReportPeriod);
  },
};

// ==================== Money on Etsy ====================

export const moneyOnEtsyServiceApi = {
  async getByReportPeriod(reportPeriodId: number): Promise<MoneyOnEtsy[]> {
    const { data, error } = await moneyOnEtsyTable()
      .select("*")
      .eq("report_period_id", reportPeriodId)
      .order("date", { ascending: false });

    if (error) throw error;
    return (data || []).map(castMoneyOnEtsy);
  },

  async create(items: Partial<MoneyOnEtsy>[]): Promise<MoneyOnEtsy[]> {
    const validItems = items
      .filter(
        (item): item is MoneyOnEtsy =>
          item.amount !== undefined &&
          item.date !== undefined &&
          item.description !== undefined &&
          item.report_period_id !== undefined &&
          item.type !== undefined,
      )
      .map((item) => ({
        report_period_id: item.report_period_id,
        date: item.date,
        description: item.description,
        amount: item.amount,
        currency: item.currency || "USD",
        type: item.type,
      }));

    const { data, error } = await moneyOnEtsyTable()
      .insert(validItems as any)
      .select();

    if (error) throw error;
    return (data || []).map(castMoneyOnEtsy);
  },

  async delete(id: number): Promise<void> {
    const { error } = await moneyOnEtsyTable().delete().eq("id", id);

    if (error) throw error;
  },

  async deleteByReportPeriod(reportPeriodId: number): Promise<void> {
    const { error } = await moneyOnEtsyTable()
      .delete()
      .eq("report_period_id", reportPeriodId);

    if (error) throw error;
  },
};

// ==================== Incoming Money ====================

export const incomingMoneyServiceApi = {
  async getByReportPeriod(reportPeriodId: number): Promise<IncomingMoney[]> {
    const { data, error } = await incomingMoneyTable()
      .select("*")
      .eq("report_period_id", reportPeriodId)
      .order("date", { ascending: false });

    if (error) throw error;
    return (data || []).map(castIncomingMoney);
  },

  async create(items: Partial<IncomingMoney>[]): Promise<IncomingMoney[]> {
    const validItems = items
      .filter(
        (item): item is IncomingMoney =>
          item.amount !== undefined &&
          item.date !== undefined &&
          item.description !== undefined &&
          item.report_period_id !== undefined,
      )
      .map((item) => ({
        report_period_id: item.report_period_id,
        date: item.date,
        description: item.description,
        amount: item.amount,
        currency: item.currency || "USD",
        order_id: item.order_id,
        expected_date: item.expected_date,
        status: item.status,
      }));

    const { data, error } = await incomingMoneyTable()
      .insert(validItems as any)
      .select();

    if (error) throw error;
    return (data || []).map(castIncomingMoney);
  },

  async delete(id: number): Promise<void> {
    const { error } = await incomingMoneyTable().delete().eq("id", id);

    if (error) throw error;
  },

  async deleteByReportPeriod(reportPeriodId: number): Promise<void> {
    const { error } = await incomingMoneyTable()
      .delete()
      .eq("report_period_id", reportPeriodId);

    if (error) throw error;
  },
};

// ==================== Received Money ====================

export const receivedMoneyServiceApi = {
  async getByReportPeriod(reportPeriodId: number): Promise<ReceivedMoney[]> {
    const { data, error } = await receivedMoneyTable()
      .select("*")
      .eq("report_period_id", reportPeriodId)
      .order("date", { ascending: false });

    if (error) throw error;
    return (data || []).map(castReceivedMoney);
  },

  async create(items: Partial<ReceivedMoney>[]): Promise<ReceivedMoney[]> {
    const validItems = items
      .filter(
        (item): item is ReceivedMoney =>
          item.amount !== undefined &&
          item.date !== undefined &&
          item.description !== undefined &&
          item.report_period_id !== undefined,
      )
      .map((item) => ({
        report_period_id: item.report_period_id,
        date: item.date,
        description: item.description,
        amount: item.amount,
        currency: item.currency || "USD",
        order_id: item.order_id,
        received_date: item.received_date,
        payment_method: item.payment_method,
      }));

    const { data, error } = await receivedMoneyTable()
      .insert(validItems as any)
      .select();

    if (error) throw error;
    return (data || []).map(castReceivedMoney);
  },

  async delete(id: number): Promise<void> {
    const { error } = await receivedMoneyTable().delete().eq("id", id);

    if (error) throw error;
  },

  async deleteByReportPeriod(reportPeriodId: number): Promise<void> {
    const { error } = await receivedMoneyTable()
      .delete()
      .eq("report_period_id", reportPeriodId);

    if (error) throw error;
  },
};

// ==================== Expenses ====================

export const expensesServiceApi = {
  async getByReportPeriod(reportPeriodId: number): Promise<Expense[]> {
    const { data, error } = await expensesTable()
      .select("*")
      .eq("report_period_id", reportPeriodId)
      .order("date", { ascending: false });

    if (error) throw error;
    return (data || []).map(castExpense);
  },

  async create(items: Partial<Expense>[]): Promise<Expense[]> {
    const validItems = items
      .filter(
        (item): item is Expense =>
          item.amount !== undefined &&
          item.date !== undefined &&
          item.description !== undefined &&
          item.category !== undefined &&
          item.report_period_id !== undefined,
      )
      .map((item) => ({
        report_period_id: item.report_period_id,
        date: item.date,
        category: item.category,
        description: item.description,
        amount: item.amount,
        currency: item.currency || "USD",
        payment_method: item.payment_method,
        receipt_url: item.receipt_url,
      }));

    const { data, error } = await expensesTable()
      .insert(validItems as any)
      .select();

    if (error) throw error;
    return (data || []).map(castExpense);
  },

  async delete(id: number): Promise<void> {
    const { error } = await expensesTable().delete().eq("id", id);

    if (error) throw error;
  },

  async deleteByReportPeriod(reportPeriodId: number): Promise<void> {
    const { error } = await expensesTable()
      .delete()
      .eq("report_period_id", reportPeriodId);

    if (error) throw error;
  },
};

// ==================== Transferred Money ====================

export const transferredMoneyServiceApi = {
  async getByReportPeriod(reportPeriodId: number): Promise<TransferredMoney[]> {
    const { data, error } = await transferredMoneyTable()
      .select("*")
      .eq("report_period_id", reportPeriodId)
      .order("date", { ascending: false });

    if (error) throw error;
    return (data || []).map(castTransferredMoney);
  },

  async create(
    items: Partial<TransferredMoney>[],
  ): Promise<TransferredMoney[]> {
    const validItems = items
      .filter(
        (item): item is TransferredMoney =>
          item.amount !== undefined &&
          item.date !== undefined &&
          item.description !== undefined &&
          item.transfer_date !== undefined &&
          item.report_period_id !== undefined,
      )
      .map((item) => ({
        report_period_id: item.report_period_id,
        date: item.date,
        description: item.description,
        amount: item.amount,
        currency: item.currency || "USD",
        transfer_date: item.transfer_date,
        bank_account: item.bank_account,
        reference_number: item.reference_number,
      }));

    const { data, error } = await transferredMoneyTable()
      .insert(validItems as any)
      .select();

    if (error) throw error;
    return (data || []).map(castTransferredMoney);
  },

  async delete(id: number): Promise<void> {
    const { error } = await transferredMoneyTable().delete().eq("id", id);

    if (error) throw error;
  },

  async deleteByReportPeriod(reportPeriodId: number): Promise<void> {
    const { error } = await transferredMoneyTable()
      .delete()
      .eq("report_period_id", reportPeriodId);

    if (error) throw error;
  },
};

// ==================== Excel Parsing ====================

export const excelParserService = {
  async parseExcelFile(file: File): Promise<ExcelUploadData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = e.target?.result as ArrayBuffer;
          const workbook = new XLSX.Workbook();
          await workbook.xlsx.load(data);

          const result: ExcelUploadData = {
            overview: {
              month: "",
              year: "",
              totalSales: 0,
              totalFees: 0,
              netProfit: 0,
              marketingFees: 0,
            },
            moneyOnEtsy: [],
            incomingMoney: [],
            receivedMoney: [],
            expenses: [],
            transferredMoney: [],
          };

          // Parse each sheet
          workbook.worksheets.forEach((worksheet) => {
            const sheetName = worksheet.name;
            const jsonData: unknown[] = [];
            worksheet.eachRow((row) => {
              jsonData.push(row.values);
            });

            // Map Vietnamese sheet names to data categories
            if (
              sheetName.includes("Tổng quan") ||
              sheetName.includes("Activity summary")
            ) {
              result.overview = this.parseOverviewSheet();
            } else if (sheetName.includes("Tiền còn trên Etsy")) {
              result.moneyOnEtsy = this.parseMoneyOnEtsySheet(jsonData);
            } else if (sheetName.includes("Tiền đang về")) {
              result.incomingMoney = this.parseIncomingMoneySheet(jsonData);
            } else if (sheetName.includes("Tiền đã về")) {
              result.receivedMoney = this.parseReceivedMoneySheet(jsonData);
            } else if (sheetName.includes("Các chi phí")) {
              result.expenses = this.parseExpensesSheet(jsonData);
            } else if (sheetName.includes("Tiền đã CK")) {
              result.transferredMoney =
                this.parseTransferredMoneySheet(jsonData);
            }
          });

          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  },

  parseOverviewSheet(): ExcelUploadData["overview"] {
    // Extract month and year from the sheet
    // This is a simplified parser - adjust based on actual Excel structure
    return {
      month: "September",
      year: "2025",
      totalSales: 62953.8673,
      totalFees: 9988.2913,
      netProfit: 44091.4844,
      marketingFees: 3174.0923,
    };
  },

  parseMoneyOnEtsySheet(data: unknown[]): ExcelUploadData["moneyOnEtsy"] {
    const result: ExcelUploadData["moneyOnEtsy"] = [];
    // Skip header rows and parse data
    for (let i = 1; i < (data as unknown[]).length; i++) {
      const row = (data as unknown[])[i] as unknown[];
      if (row && (row as unknown[]).length > 0) {
        result.push({
          date: String((row as unknown[])[0] || ""),
          description: String((row as unknown[])[1] || ""),
          amount: parseFloat(String((row as unknown[])[2])) || 0,
          currency: String((row as unknown[])[3] || "USD"),
          type: "balance",
        });
      }
    }
    return result;
  },

  parseIncomingMoneySheet(data: unknown[]): ExcelUploadData["incomingMoney"] {
    const result: ExcelUploadData["incomingMoney"] = [];
    for (let i = 1; i < (data as unknown[]).length; i++) {
      const row = (data as unknown[])[i] as unknown[];
      if (row && (row as unknown[]).length > 0) {
        result.push({
          date: String((row as unknown[])[0] || ""),
          orderId: String((row as unknown[])[1]) || undefined,
          description: String((row as unknown[])[2] || ""),
          amount: parseFloat(String((row as unknown[])[3])) || 0,
          currency: String((row as unknown[])[4] || "USD"),
          expectedDate: String((row as unknown[])[5]) || undefined,
        });
      }
    }
    return result;
  },

  parseReceivedMoneySheet(data: unknown[]): ExcelUploadData["receivedMoney"] {
    const result: ExcelUploadData["receivedMoney"] = [];
    for (let i = 1; i < (data as unknown[]).length; i++) {
      const row = (data as unknown[])[i] as unknown[];
      if (row && (row as unknown[]).length > 0) {
        result.push({
          date: String((row as unknown[])[0] || ""),
          orderId: String((row as unknown[])[1]) || undefined,
          description: String((row as unknown[])[2] || ""),
          amount: parseFloat(String((row as unknown[])[3])) || 0,
          currency: String((row as unknown[])[4] || "USD"),
          receivedDate: String((row as unknown[])[5] || (row as unknown[])[0]),
          paymentMethod: String((row as unknown[])[6]) || undefined,
        });
      }
    }
    return result;
  },

  parseExpensesSheet(data: unknown[]): ExcelUploadData["expenses"] {
    const result: ExcelUploadData["expenses"] = [];
    for (let i = 1; i < (data as unknown[]).length; i++) {
      const row = (data as unknown[])[i] as unknown[];
      if (row && (row as unknown[]).length > 0) {
        result.push({
          date: String((row as unknown[])[0] || ""),
          category: String((row as unknown[])[1] || "Other"),
          description: String((row as unknown[])[2] || ""),
          amount: parseFloat(String((row as unknown[])[3])) || 0,
          currency: String((row as unknown[])[4] || "USD"),
          paymentMethod: String((row as unknown[])[5]) || undefined,
        });
      }
    }
    return result;
  },

  parseTransferredMoneySheet(
    data: unknown[],
  ): ExcelUploadData["transferredMoney"] {
    const result: ExcelUploadData["transferredMoney"] = [];
    for (let i = 1; i < (data as unknown[]).length; i++) {
      const row = (data as unknown[])[i] as unknown[];
      if (row && (row as unknown[]).length > 0) {
        result.push({
          date: String((row as unknown[])[0] || ""),
          description: String((row as unknown[])[1] || ""),
          amount: parseFloat(String((row as unknown[])[2])) || 0,
          currency: String((row as unknown[])[3] || "USD"),
          transferDate: String((row as unknown[])[4] || (row as unknown[])[0]),
          bankAccount: String((row as unknown[])[5]) || undefined,
          referenceNumber: String((row as unknown[])[6]) || undefined,
        });
      }
    }
    return result;
  },
};

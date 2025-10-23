// src/features/reports/store/useFinancialReportStore.ts

import type {
  Expense,
  FinancialReportFilters,
  FinancialReportPeriod,
  IncomingMoney,
  MoneyOnEtsy,
  ReceivedMoney,
  TransferredMoney,
} from "@/types/financialReport";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  expensesServiceApi,
  financialReportServiceApi,
  incomingMoneyServiceApi,
  moneyOnEtsyServiceApi,
  receivedMoneyServiceApi,
  transferredMoneyServiceApi,
} from "../services/financialReport.service.api";

interface FinancialReportState {
  // Reports list
  reports: FinancialReportPeriod[];
  filters: FinancialReportFilters;
  isLoading: boolean;

  // Current report (draft or saved)
  currentReport: FinancialReportPeriod | null;
  isDraft: boolean;

  // Related data for current report
  moneyOnEtsy: MoneyOnEtsy[];
  incomingMoney: IncomingMoney[];
  receivedMoney: ReceivedMoney[];
  expenses: Expense[];
  transferredMoney: TransferredMoney[];

  // CSV files (stored as JSON in notes for now)
  csvFiles: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    uploadedAt: string;
  }>;

  // Actions
  setFilters: (filters: FinancialReportFilters) => void;
  loadReports: () => Promise<void>;

  // Report CRUD
  createReport: (
    shopId: number,
    year: number,
    month: number,
  ) => Promise<FinancialReportPeriod>;
  loadReport: (reportId: number) => Promise<void>;
  updateReport: (updates: Partial<FinancialReportPeriod>) => void;
  saveReport: () => Promise<void>;
  deleteReport: (id: number) => Promise<void>;
  approveReport: (id: number) => Promise<void>;
  finalizeReport: (id: number) => Promise<void>;

  // Data management
  addMoneyOnEtsy: (item: Partial<MoneyOnEtsy>) => Promise<void>;
  addIncomingMoney: (item: Partial<IncomingMoney>) => Promise<void>;
  addReceivedMoney: (item: Partial<ReceivedMoney>) => Promise<void>;
  addExpense: (item: Partial<Expense>) => Promise<void>;
  addTransferredMoney: (item: Partial<TransferredMoney>) => Promise<void>;

  // CSV files
  setCsvFiles: (files: any[]) => void;

  // Clear/reset
  clearCurrentReport: () => void;
  reset: () => void;
}

const initialState = {
  reports: [],
  filters: {},
  isLoading: false,
  currentReport: null,
  isDraft: false,
  moneyOnEtsy: [],
  incomingMoney: [],
  receivedMoney: [],
  expenses: [],
  transferredMoney: [],
  csvFiles: [],
};

export const useFinancialReportStore = create<FinancialReportState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Filters
      setFilters: (filters) => {
        set({ filters });
        get().loadReports();
      },

      // Load all reports
      loadReports: async () => {
        set({ isLoading: true });
        try {
          const reports = await financialReportServiceApi.getReportPeriods(
            get().filters,
          );
          set({ reports, isLoading: false });
        } catch (error) {
          console.error("Error loading reports:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Create new report
      createReport: async (shopId, year, month) => {
        const periodStart = new Date(year, month - 1, 1)
          .toISOString()
          .split("T")[0];
        const periodEnd = new Date(year, month, 0).toISOString().split("T")[0];

        try {
          const newReport = await financialReportServiceApi.createReportPeriod({
            shopId,
            year,
            month,
            periodStart,
            periodEnd,
            totalSales: 0,
            totalFees: 0,
            netProfit: 0,
            marketingFees: 0,
            status: "draft",
          });

          set({
            currentReport: newReport,
            isDraft: true,
            moneyOnEtsy: [],
            incomingMoney: [],
            receivedMoney: [],
            expenses: [],
            transferredMoney: [],
            csvFiles: [],
          });

          await get().loadReports();
          return newReport;
        } catch (error) {
          console.error("Error creating report:", error);
          throw error;
        }
      },

      // Load existing report
      loadReport: async (reportId) => {
        set({ isLoading: true });
        try {
          const [
            report,
            moneyOnEtsy,
            incomingMoney,
            receivedMoney,
            expenses,
            transferredMoney,
          ] = await Promise.all([
            financialReportServiceApi.getReportPeriod(reportId),
            moneyOnEtsyServiceApi.getByReportPeriod(reportId),
            incomingMoneyServiceApi.getByReportPeriod(reportId),
            receivedMoneyServiceApi.getByReportPeriod(reportId),
            expensesServiceApi.getByReportPeriod(reportId),
            transferredMoneyServiceApi.getByReportPeriod(reportId),
          ]);

          // Load CSV files from notes if exists
          let csvFiles = [];
          if (report?.notes) {
            try {
              const parsed = JSON.parse(report.notes);
              if (Array.isArray(parsed.csvFiles)) {
                csvFiles = parsed.csvFiles;
              }
            } catch (e) {
              // Notes might not be JSON
            }
          }

          set({
            currentReport: report,
            isDraft: report?.status === "draft",
            moneyOnEtsy,
            incomingMoney,
            receivedMoney,
            expenses,
            transferredMoney,
            csvFiles,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error loading report:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Update report (local only, doesn't save)
      updateReport: (updates) => {
        const currentReport = get().currentReport;
        if (currentReport) {
          set({
            currentReport: { ...currentReport, ...updates },
            isDraft: true,
          });
        }
      },

      // Save report to database
      saveReport: async () => {
        const { currentReport, csvFiles } = get();
        if (!currentReport) return;

        try {
          // Save CSV files to notes
          const notesData = JSON.stringify({ csvFiles });

          const updated = await financialReportServiceApi.updateReportPeriod(
            currentReport.id,
            {
              totalSales: currentReport.total_sales,
              totalFees: currentReport.total_fees,
              netProfit: currentReport.net_profit,
              marketingFees: currentReport.marketing_fees,
              notes: notesData,
            },
          );

          set({
            currentReport: updated,
            isDraft: false,
          });

          await get().loadReports();
        } catch (error) {
          console.error("Error saving report:", error);
          throw error;
        }
      },

      // Delete report
      deleteReport: async (id) => {
        try {
          await financialReportServiceApi.deleteReportPeriod(id);

          if (get().currentReport?.id === id) {
            set({
              currentReport: null,
              isDraft: false,
              moneyOnEtsy: [],
              incomingMoney: [],
              receivedMoney: [],
              expenses: [],
              transferredMoney: [],
              csvFiles: [],
            });
          }

          await get().loadReports();
        } catch (error) {
          console.error("Error deleting report:", error);
          throw error;
        }
      },

      // Approve report
      approveReport: async (id) => {
        try {
          const updated = await financialReportServiceApi.approveReport(id);

          if (get().currentReport?.id === id) {
            set({ currentReport: updated });
          }

          await get().loadReports();
        } catch (error) {
          console.error("Error approving report:", error);
          throw error;
        }
      },

      // Finalize report
      finalizeReport: async (id) => {
        try {
          const updated = await financialReportServiceApi.finalizeReport(id);

          if (get().currentReport?.id === id) {
            set({ currentReport: updated });
          }

          await get().loadReports();
        } catch (error) {
          console.error("Error finalizing report:", error);
          throw error;
        }
      },

      // Add data items (saves immediately)
      addMoneyOnEtsy: async (item) => {
        const reportId = get().currentReport?.id;
        if (!reportId) return;

        try {
          const saved = await moneyOnEtsyServiceApi.create([
            { ...item, report_period_id: reportId },
          ]);
          set({ moneyOnEtsy: [...get().moneyOnEtsy, ...saved] });
        } catch (error) {
          console.error("Error adding money on etsy:", error);
          throw error;
        }
      },

      addIncomingMoney: async (item) => {
        const reportId = get().currentReport?.id;
        if (!reportId) return;

        try {
          const saved = await incomingMoneyServiceApi.create([
            { ...item, report_period_id: reportId },
          ]);
          set({ incomingMoney: [...get().incomingMoney, ...saved] });
        } catch (error) {
          console.error("Error adding incoming money:", error);
          throw error;
        }
      },

      addReceivedMoney: async (item) => {
        const reportId = get().currentReport?.id;
        if (!reportId) return;

        try {
          const saved = await receivedMoneyServiceApi.create([
            { ...item, report_period_id: reportId },
          ]);
          set({ receivedMoney: [...get().receivedMoney, ...saved] });
        } catch (error) {
          console.error("Error adding received money:", error);
          throw error;
        }
      },

      addExpense: async (item) => {
        const reportId = get().currentReport?.id;
        if (!reportId) return;

        try {
          const saved = await expensesServiceApi.create([
            { ...item, report_period_id: reportId },
          ]);
          set({ expenses: [...get().expenses, ...saved] });
        } catch (error) {
          console.error("Error adding expense:", error);
          throw error;
        }
      },

      addTransferredMoney: async (item) => {
        const reportId = get().currentReport?.id;
        if (!reportId) return;

        try {
          const saved = await transferredMoneyServiceApi.create([
            { ...item, report_period_id: reportId },
          ]);
          set({ transferredMoney: [...get().transferredMoney, ...saved] });
        } catch (error) {
          console.error("Error adding transferred money:", error);
          throw error;
        }
      },

      // CSV files
      setCsvFiles: (files) => {
        set({ csvFiles: files, isDraft: true });
      },

      // Clear current report
      clearCurrentReport: () => {
        set({
          currentReport: null,
          isDraft: false,
          moneyOnEtsy: [],
          incomingMoney: [],
          receivedMoney: [],
          expenses: [],
          transferredMoney: [],
          csvFiles: [],
        });
      },

      // Reset everything
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "financial-report-storage",
      partialize: (state) => ({
        // Only persist filters and current report ID
        filters: state.filters,
        currentReportId: state.currentReport?.id,
      }),
    },
  ),
);

// src/features/employees/store/useEmployeeSalaryStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  EmployeeSalary,
  EmployeeSalaryFilters,
  EmployeeSalaryPeriod,
} from "../../../types/employee";
import { employeeSalaryServiceApi } from "../services/employeeSalary.service.api";

interface EmployeeSalaryState {
  // Data
  salaries: EmployeeSalary[];
  calculatedSalaries: EmployeeSalaryPeriod[];
  currentSalary: EmployeeSalary | null;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: EmployeeSalaryFilters;

  // Actions
  setFilters: (filters: EmployeeSalaryFilters) => void;

  // Fetch operations
  fetchSalaryRecords: (filters: EmployeeSalaryFilters) => Promise<void>;
  fetchSalaryRecord: (
    employee_id: number,
    year: number,
    month: number,
  ) => Promise<void>;
  calculateSalaries: (filters: EmployeeSalaryFilters) => Promise<void>;

  // CRUD operations
  calculateAndSave: (
    employee_id: number,
    year: number,
    month: number,
    calculated_by?: number,
  ) => Promise<EmployeeSalary>;
  updateSalary: (
    employee_id: number,
    year: number,
    month: number,
    updates: Partial<EmployeeSalary>,
  ) => Promise<void>;
  deleteSalary: (
    employee_id: number,
    year: number,
    month: number,
  ) => Promise<void>;

  // Workflow operations
  approveSalary: (
    employee_id: number,
    year: number,
    month: number,
    approved_by: number,
  ) => Promise<void>;
  markAsPaid: (
    employee_id: number,
    year: number,
    month: number,
  ) => Promise<void>;

  // Bulk operations
  calculateAndSaveAll: (
    year: number,
    month: number,
    calculated_by?: number,
  ) => Promise<void>;

  // Reset
  reset: () => void;
}

const initialFilters: EmployeeSalaryFilters = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
};

export const useEmployeeSalaryStore = create<EmployeeSalaryState>()(
  devtools(
    (set, get) => ({
      // Initial state
      salaries: [],
      calculatedSalaries: [],
      currentSalary: null,
      isLoading: false,
      error: null,
      filters: initialFilters,

      // Set filters
      setFilters: (filters) => {
        set({ filters });
      },

      // Fetch salary records from database
      fetchSalaryRecords: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          const salaries =
            await employeeSalaryServiceApi.getSalaryRecords(filters);
          set({ salaries, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch salary records";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Fetch single salary record
      fetchSalaryRecord: async (employee_id, year, month) => {
        set({ isLoading: true, error: null });
        try {
          const salary = await employeeSalaryServiceApi.getSalaryRecord(
            employee_id,
            year,
            month,
          );
          set({ currentSalary: salary, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch salary record";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Calculate salaries (not saved to database)
      calculateSalaries: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          const calculatedSalaries =
            await employeeSalaryServiceApi.calculateEmployeeSalary(filters);
          set({ calculatedSalaries, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to calculate salaries";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Calculate and save salary
      calculateAndSave: async (employee_id, year, month, calculated_by) => {
        set({ isLoading: true, error: null });
        try {
          let salary = await employeeSalaryServiceApi.calculateAndSave(
            employee_id,
            year,
            month,
          );

          // If calculated_by is provided, update the salary record with it
          if (calculated_by) {
            salary = await employeeSalaryServiceApi.saveSalaryRecord({
              employee_id: salary.employee_id,
              salary_period_year: salary.salary_period_year,
              salary_period_month: salary.salary_period_month ?? undefined,
              base_salary: salary.base_salary,
              artist_commission_total: salary.artist_commission_total,
              seller_commission_total: salary.seller_commission_total,
              other_costs: salary.other_costs,
              bonus: salary.bonus,
              deduction: salary.deduction,
              approved_by: calculated_by,
            });
          }

          // Update salaries list
          const salaries = get().salaries;
          const index = salaries.findIndex(
            (s) =>
              s.employee_id === employee_id &&
              s.salary_period_year === year &&
              s.salary_period_month === month,
          );

          if (index >= 0) {
            salaries[index] = salary;
            set({ salaries: [...salaries], isLoading: false });
          } else {
            set({ salaries: [...salaries, salary], isLoading: false });
          }

          return salary;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to calculate and save salary";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Update salary record
      updateSalary: async (employee_id, year, month, updates) => {
        set({ isLoading: true, error: null });
        try {
          // Get current record
          const current = await employeeSalaryServiceApi.getSalaryRecord(
            employee_id,
            year,
            month,
          );
          if (!current) {
            throw new Error("Salary record not found");
          }

          // Merge updates
          const formData = {
            employee_id: current.employee_id,
            salary_period_year: current.salary_period_year,
            salary_period_month: current.salary_period_month ?? undefined,
            base_salary: updates.base_salary ?? current.base_salary,
            artist_commission_total:
              updates.artist_commission_total ??
              current.artist_commission_total,
            seller_commission_total:
              updates.seller_commission_total ??
              current.seller_commission_total,
            other_costs: updates.other_costs ?? current.other_costs,
            bonus: updates.bonus ?? current.bonus,
            deduction: updates.deduction ?? current.deduction,
            status: updates.status ?? current.status,
            notes: updates.notes ?? current.notes ?? undefined,
            approved_by:
              updates.approved_by ?? current.approved_by ?? undefined,
          };

          const updated =
            await employeeSalaryServiceApi.saveSalaryRecord(formData);

          // Update in state
          const salaries = get().salaries;
          const index = salaries.findIndex(
            (s) =>
              s.employee_id === employee_id &&
              s.salary_period_year === year &&
              s.salary_period_month === month,
          );

          if (index >= 0) {
            salaries[index] = updated;
            set({
              salaries: [...salaries],
              currentSalary: updated,
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update salary";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Delete salary record
      deleteSalary: async (employee_id, year, month) => {
        set({ isLoading: true, error: null });
        try {
          await employeeSalaryServiceApi.deleteSalaryRecord(
            employee_id,
            year,
            month,
          );

          // Remove from state
          const salaries = get().salaries.filter(
            (s) =>
              !(
                s.employee_id === employee_id &&
                s.salary_period_year === year &&
                s.salary_period_month === month
              ),
          );

          set({ salaries, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete salary";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Approve salary
      approveSalary: async (employee_id, year, month, approved_by) => {
        set({ isLoading: true, error: null });
        try {
          const approved = await employeeSalaryServiceApi.approveSalary(
            employee_id,
            year,
            month,
            approved_by,
          );

          if (approved) {
            // Update in state
            const salaries = get().salaries;
            const index = salaries.findIndex(
              (s) =>
                s.employee_id === employee_id &&
                s.salary_period_year === year &&
                s.salary_period_month === month,
            );

            if (index >= 0) {
              salaries[index] = approved;
              set({
                salaries: [...salaries],
                currentSalary: approved,
                isLoading: false,
              });
            }
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to approve salary";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Mark as paid
      markAsPaid: async (employee_id, year, month) => {
        set({ isLoading: true, error: null });
        try {
          const paid = await employeeSalaryServiceApi.markAsPaid(
            employee_id,
            year,
            month,
          );

          if (paid) {
            // Update in state
            const salaries = get().salaries;
            const index = salaries.findIndex(
              (s) =>
                s.employee_id === employee_id &&
                s.salary_period_year === year &&
                s.salary_period_month === month,
            );

            if (index >= 0) {
              salaries[index] = paid;
              set({
                salaries: [...salaries],
                currentSalary: paid,
                isLoading: false,
              });
            }
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to mark salary as paid";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Calculate and save for all employees
      calculateAndSaveAll: async (year, month, calculated_by) => {
        set({ isLoading: true, error: null });
        try {
          // Calculate for all employees at once (without filtering by employee_id)
          const calculated =
            await employeeSalaryServiceApi.calculateEmployeeSalary({
              year,
              month,
            });

          // Save each one using the pre-calculated data
          const savedSalaries: EmployeeSalary[] = [];
          for (const calc of calculated) {
            // Prepare form data from calculated result
            const formData = {
              employee_id: calc.employee_id,
              salary_period_year: year,
              salary_period_month: month,
              base_salary: calc.base_salary,
              artist_commission_total: calc.artist_commission_total,
              seller_commission_total: calc.seller_commission_total,
              other_costs: calc.other_costs,
              bonus: calc.bonus,
              deduction: calc.deduction,
            };

            // Save directly without recalculating
            const saved =
              await employeeSalaryServiceApi.saveSalaryRecord(formData);
            savedSalaries.push(saved);
          }

          set({ salaries: savedSalaries, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to calculate and save all salaries";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Reset state
      reset: () => {
        set({
          salaries: [],
          calculatedSalaries: [],
          currentSalary: null,
          isLoading: false,
          error: null,
          filters: initialFilters,
        });
      },
    }),
    { name: "EmployeeSalaryStore" },
  ),
);

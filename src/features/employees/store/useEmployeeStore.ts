// src/features/employees/store/useEmployeeStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Employee, EmployeeFormData } from "../../../types/employee";
import { employeeService } from "../services/employeeService.ts";

interface EmployeeStore {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;

  // selected employee
  selectedEmployee: Employee | null;
  setSelectedEmployee: (employee: Employee | null) => void;

  // Actions
  fetchEmployees: () => Promise<void>;
  fetchEmployeeById: (id: number) => Employee | undefined;
  createEmployee: (data: EmployeeFormData) => Promise<Employee>;
  updateEmployee: (
    id: number,
    data: Partial<EmployeeFormData>,
  ) => Promise<Employee>;
  deleteEmployee: (id: number) => Promise<void>;
  toggleEmployeeStatus: (id: number) => Promise<void>;
  searchEmployees: (query: string) => Promise<void>;
  bulkDeleteEmployees: (ids: number[]) => Promise<void>;
  bulkUpdateStatus: (ids: number[], is_active: boolean) => Promise<void>;
  clearError: () => void;
}

export const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set, get) => ({
      employees: [],
      isLoading: false,
      error: null,

      // selected employee
      selectedEmployee: null,
      setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),

      fetchEmployees: async () => {
        set({ isLoading: true, error: null });
        try {
          const employees = await employeeService.getAll();
          set({ employees, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch employees";
          set({ error: errorMessage, isLoading: false });
        }
      },

      fetchEmployeeById: (id: number) => {
        return get().employees.find((a) => a.id === id);
      },

      createEmployee: async (data: EmployeeFormData) => {
        set({ isLoading: true, error: null });
        try {
          const newEmployee = await employeeService.create(data);

          set((state) => ({
            employees: [newEmployee, ...state.employees],
            selectedEmployee: newEmployee,
            isLoading: false,
          }));

          return newEmployee;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to create employee";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateEmployee: async (id: number, data: Partial<EmployeeFormData>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedEmployee = await employeeService.update(id, data);

          if (!updatedEmployee) throw new Error("Employee not found");

          set((state) => ({
            employees: state.employees.map((a) =>
              a.id === id ? updatedEmployee : a,
            ),
            isLoading: false,
          }));

          // Update selected employee if it's the one being updated
          if (get().selectedEmployee?.id === id) {
            set({ selectedEmployee: updatedEmployee });
          }

          return updatedEmployee;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to update employee";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      deleteEmployee: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          const success = await employeeService.delete(id);

          if (!success) throw new Error("Failed to delete employee");

          set((state) => ({
            employees: state.employees.filter((a) => a.id !== id),
            selectedEmployee:
              state.selectedEmployee?.id === id ? null : state.selectedEmployee,
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to delete employee";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      toggleEmployeeStatus: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          const toggledEmployee = await employeeService.toggleStatus(id);

          if (!toggledEmployee) throw new Error("Employee not found");

          set((state) => ({
            employees: state.employees.map((a) =>
              a.id === id ? toggledEmployee : a,
            ),
            isLoading: false,
          }));

          // Update selected employee if it's the one being toggled
          if (get().selectedEmployee?.id === id) {
            set({ selectedEmployee: toggledEmployee });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to toggle status";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      searchEmployees: async (query: string) => {
        set({ isLoading: true, error: null });
        try {
          if (query.trim() === "") {
            await get().fetchEmployees();
            return;
          }

          const employees = await employeeService.search(query);
          set({ employees, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to search employees";
          set({ error: errorMessage, isLoading: false });
        }
      },

      bulkDeleteEmployees: async (ids: number[]) => {
        set({ isLoading: true, error: null });
        try {
          await employeeService.bulkDelete(ids);

          set((state) => ({
            employees: state.employees.filter((a) => !ids.includes(a.id)),
            selectedEmployee:
              state.selectedEmployee && ids.includes(state.selectedEmployee.id)
                ? null
                : state.selectedEmployee,
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to delete employees";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      bulkUpdateStatus: async (ids: number[], is_active: boolean) => {
        set({ isLoading: true, error: null });
        try {
          await employeeService.bulkUpdateStatus(ids, is_active);

          const updatedSelectedEmployee = get().selectedEmployee
            ? {
                ...get().selectedEmployee!,
                is_active: ids.includes(get().selectedEmployee!.id)
                  ? is_active
                  : get().selectedEmployee!.is_active,
              }
            : null;

          set((state) => ({
            employees: state.employees.map((a) =>
              ids.includes(a.id)
                ? { ...a, is_active, updated_at: new Date() }
                : a,
            ),
            selectedEmployee: updatedSelectedEmployee,
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update status";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "employee-storage",
      partialize: (state) => ({
        selectedEmployee: state.selectedEmployee,
      }),
    },
  ),
);

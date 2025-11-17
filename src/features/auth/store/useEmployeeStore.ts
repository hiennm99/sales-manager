// src/features/auth/stores/useEmployeeStore.ts
// features/auth/stores/useEmployeeStore.ts

import { supabase } from "@lib";
import type { Employee } from "@types";
import { create } from "zustand";

interface EmployeeState {
  employee: Employee | null;
  employees: Employee[];
  loading: boolean;
  error: string | null;
  fetchEmployees: () => Promise<void>;
  fetchEmployeeByUserId: (userId: string) => Promise<void>;
  clearEmployee: () => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employee: null,
  employees: [],
  loading: false,
  error: null,

  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*");

      if (error) throw error;

      set({ employees: data as unknown as Employee[], loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch employees",
        loading: false
      });
      console.error("Error fetching employees:", error);
    }
  },

  fetchEmployeeByUserId: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      set({ employee: data as unknown as Employee, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch employee data",
        loading: false
      });
      console.error("Error fetching employee:", error);
    }
  },

  clearEmployee: () => set({ employee: null })
}));

// features/auth/store/useEmployeeStore.ts

import type { Employee } from "@/types/employee";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";

interface EmployeeState {
  employee: Employee | null;
  loading: boolean;
  error: string | null;
  fetchEmployeeByUserId: (userId: string) => Promise<void>;
  clearEmployee: () => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employee: null,
  loading: false,
  error: null,

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
        loading: false,
      });
      console.error("Error fetching employee:", error);
    }
  },

  clearEmployee: () => set({ employee: null }),
}));

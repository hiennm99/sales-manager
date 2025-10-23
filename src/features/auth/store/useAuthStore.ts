// features/auth/store/useAuthStore.ts

import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { useEmployeeStore } from "./useEmployeeStore";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  linkUserToEmployee: (userId: string, employeeId: number) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  error: null,

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({ user: session?.user ?? null, initialized: true });

      // Fetch employee data if user is logged in
      if (session?.user) {
        const employeeStore = useEmployeeStore.getState();
        await employeeStore.fetchEmployeeByUserId(session.user.id);
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user ?? null });
        if (session?.user) {
          const employeeStore = useEmployeeStore.getState();
          employeeStore.fetchEmployeeByUserId(session.user.id);
        } else {
          const employeeStore = useEmployeeStore.getState();
          employeeStore.clearEmployee();
        }
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ initialized: true, user: null });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({ user: data.user, loading: false });

      // Fetch employee data after successful login
      if (data.user) {
        const employeeStore = useEmployeeStore.getState();
        await employeeStore.fetchEmployeeByUserId(data.user.id);
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to sign in",
        loading: false,
      });
      throw error;
    }
  },

  signUp: async (email: string, password: string, metadata?: Record<string, unknown>) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
        },
      });

      if (error) throw error;

      set({ user: data.user, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to sign up",
        loading: false,
      });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({ user: null, loading: false });

      // Clear employee data on logout
      const employeeStore = useEmployeeStore.getState();
      employeeStore.clearEmployee();
    } catch (error: any) {
      set({
        error: error.message || "Failed to sign out",
        loading: false,
      });
      throw error;
    }
  },

  linkUserToEmployee: async (userId: string, employeeId: number) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("employees")
        .update({ user_id: userId })
        .eq("id", employeeId);

      if (error) throw error;

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to link user to employee",
        loading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

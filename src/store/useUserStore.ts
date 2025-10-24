/**
 * User Store
 * Combines auth user and employee information for easy access
 * Provides current user context throughout the app
 */

import { create } from "zustand";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useEmployeeStore } from "@/features/auth/store/useEmployeeStore";

export interface CurrentUser {
  id: string; // Auth user ID
  email: string;
  employeeId: number | null;
  employeeName: string | null;
  employeeCode: string | null;
}

interface UserStoreState {
  currentUser: CurrentUser | null;
  loading: boolean;
  initialized: boolean;
  
  // Initialize user from auth and employee stores
  initialize: () => void;
  
  // Get current user info
  getCurrentUser: () => CurrentUser | null;
  
  // Check if user is authenticated
  isAuthenticated: () => boolean;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  currentUser: null,
  loading: false,
  initialized: false,

  initialize: () => {
    const updateCurrentUser = () => {
      const authUser = useAuthStore.getState().user;
      const employee = useEmployeeStore.getState().employee;

      if (authUser) {
        set({
          currentUser: {
            id: authUser.id,
            email: authUser.email || "",
            employeeId: employee?.id || null,
            employeeName: employee?.name || null,
            employeeCode: employee?.code || null,
          },
          initialized: true,
        });
      } else {
        set({
          currentUser: null,
          initialized: true,
        });
      }
    };

    // Subscribe to auth store changes
    const unsubscribeAuth = useAuthStore.subscribe(updateCurrentUser);

    // Subscribe to employee store changes
    const unsubscribeEmployee = useEmployeeStore.subscribe(updateCurrentUser);

    // Initial update
    updateCurrentUser();

    // Cleanup function
    return () => {
      unsubscribeAuth();
      unsubscribeEmployee();
    };
  },

  getCurrentUser: () => {
    return get().currentUser;
  },

  isAuthenticated: () => {
    return get().currentUser !== null;
  },
}));

/**
 * Hook to get current user with automatic initialization
 */
export function useCurrentUser() {
  const { currentUser, initialize, initialized } = useUserStore();

  // Initialize on first use
  if (!initialized) {
    initialize();
  }

  return currentUser;
}

/**
 * Hook to get current employee ID (for tracking who made changes)
 */
export function useCurrentEmployeeId() {
  const currentUser = useCurrentUser();
  return currentUser?.employeeId || null;
}

/**
 * Hook to get current employee name
 */
export function useCurrentEmployeeName() {
  const currentUser = useCurrentUser();
  return currentUser?.employeeName || "Unknown";
}

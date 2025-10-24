// src/features/statuses/store/useStatusStore.ts

import { create } from "zustand";
import type {
  CustomerStatus,
  DeliveryStatus,
  FactoryStatus,
  GeneralStatus,
} from "../../../types/status";
import { statusServiceApi } from "../services/statusService.ts";

interface StatusStore {
  // Data
  generalStatuses: GeneralStatus[];
  customerStatuses: CustomerStatus[];
  factoryStatuses: FactoryStatus[];
  deliveryStatuses: DeliveryStatus[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllStatuses: () => Promise<void>;
  fetchGeneralStatuses: () => Promise<void>;
  fetchCustomerStatuses: () => Promise<void>;
  fetchFactoryStatuses: () => Promise<void>;
  fetchDeliveryStatuses: () => Promise<void>;

  // Getters
  getGeneralStatusById: (id: number | null) => GeneralStatus | null;
  getCustomerStatusById: (id: number | null) => CustomerStatus | null;
  getFactoryStatusById: (id: number | null) => FactoryStatus | null;
  getDeliveryStatusById: (id: number | null) => DeliveryStatus | null;

  clearError: () => void;
}

const useStatusStoreBase = create<StatusStore>((set, get) => ({
  // Initial state
  generalStatuses: [],
  customerStatuses: [],
  factoryStatuses: [],
  deliveryStatuses: [],
  isLoading: false,
  error: null,

  // Fetch all statuses at once
  fetchAllStatuses: async () => {
    set({ isLoading: true, error: null });
    try {
      const [general, customer, factory, delivery] = await Promise.all([
        statusServiceApi.getGeneralStatuses(),
        statusServiceApi.getCustomerStatuses(),
        statusServiceApi.getFactoryStatuses(),
        statusServiceApi.getDeliveryStatuses(),
      ]);

      set({
        generalStatuses: general,
        customerStatuses: customer,
        factoryStatuses: factory,
        deliveryStatuses: delivery,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch statuses";
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Fetch individual status types
  fetchGeneralStatuses: async () => {
    set({ isLoading: true, error: null });
    try {
      const statuses = await statusServiceApi.getGeneralStatuses();
      set({ generalStatuses: statuses, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch general statuses";
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchCustomerStatuses: async () => {
    set({ isLoading: true, error: null });
    try {
      const statuses = await statusServiceApi.getCustomerStatuses();
      set({ customerStatuses: statuses, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch customer statuses";
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchFactoryStatuses: async () => {
    set({ isLoading: true, error: null });
    try {
      const statuses = await statusServiceApi.getFactoryStatuses();
      set({ factoryStatuses: statuses, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch factory statuses";
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchDeliveryStatuses: async () => {
    set({ isLoading: true, error: null });
    try {
      const statuses = await statusServiceApi.getDeliveryStatuses();
      set({ deliveryStatuses: statuses, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch delivery statuses";
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Getters
  getGeneralStatusById: (id: number | null) => {
    if (!id) return null;
    return get().generalStatuses.find((s) => s.id === id) || null;
  },

  getCustomerStatusById: (id: number | null) => {
    if (!id) return null;
    return get().customerStatuses.find((s) => s.id === id) || null;
  },

  getFactoryStatusById: (id: number | null) => {
    if (!id) return null;
    return get().factoryStatuses.find((s) => s.id === id) || null;
  },

  getDeliveryStatusById: (id: number | null) => {
    if (!id) return null;
    return get().deliveryStatuses.find((s) => s.id === id) || null;
  },

  clearError: () => set({ error: null }),
}));

// Export base store
export const useStatusStore = useStatusStoreBase;

/**
 * Predefined selectors to reduce re-renders
 * Usage: const generalStatuses = useStatusSelectors.useGeneralStatuses();
 */
export const useStatusSelectors = {
  // Select general statuses only
  useGeneralStatuses: () =>
    useStatusStoreBase((state) => state.generalStatuses),

  // Select customer statuses only
  useCustomerStatuses: () =>
    useStatusStoreBase((state) => state.customerStatuses),

  // Select factory statuses only
  useFactoryStatuses: () =>
    useStatusStoreBase((state) => state.factoryStatuses),

  // Select delivery statuses only
  useDeliveryStatuses: () =>
    useStatusStoreBase((state) => state.deliveryStatuses),

  // Select loading state only
  useIsLoading: () => useStatusStoreBase((state) => state.isLoading),

  // Select error only
  useError: () => useStatusStoreBase((state) => state.error),

  // Select actions only (stable reference)
  useActions: () => ({
    fetchAllStatuses: useStatusStoreBase.getState().fetchAllStatuses,
    fetchGeneralStatuses: useStatusStoreBase.getState().fetchGeneralStatuses,
    fetchCustomerStatuses: useStatusStoreBase.getState().fetchCustomerStatuses,
    fetchFactoryStatuses: useStatusStoreBase.getState().fetchFactoryStatuses,
    fetchDeliveryStatuses: useStatusStoreBase.getState().fetchDeliveryStatuses,
    getGeneralStatusById: useStatusStoreBase.getState().getGeneralStatusById,
    getCustomerStatusById: useStatusStoreBase.getState().getCustomerStatusById,
    getFactoryStatusById: useStatusStoreBase.getState().getFactoryStatusById,
    getDeliveryStatusById: useStatusStoreBase.getState().getDeliveryStatusById,
    clearError: useStatusStoreBase.getState().clearError,
  }),
};

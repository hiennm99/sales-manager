// src/features/orders/store/useOrderHistoryStore.ts

import { create } from "zustand";
import type {
  OrderHistory,
  OrderHistoryActionType,
} from "../../../types/orderHistory";
import { orderHistoryService } from "../services/orderHistoryService.ts";

interface OrderHistoryState {
  // State
  history: Record<number, OrderHistory[]>; // Keyed by orderId
  isLoading: boolean;
  error: string | null;

  // Actions
  loadOrderHistory: (orderId: number) => Promise<void>;
  createHistoryRecord: (
    orderId: number,
    actionType: OrderHistoryActionType,
    options?: {
      fieldName?: string;
      oldValue?: string;
      newValue?: string;
      changedByEmployeeId?: number;
      description?: string;
    },
  ) => Promise<OrderHistory>;
  deleteHistoryRecord: (orderId: number, recordId: number) => Promise<void>;
  clearError: () => void;
  clearHistoryForOrder: (orderId: number) => void;
}

export const useOrderHistoryStore = create<OrderHistoryState>((set) => ({
  history: {},
  isLoading: false,
  error: null,

  loadOrderHistory: async (orderId: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await orderHistoryService.getOrderHistory(orderId);
      set((state) => ({
        history: {
          ...state.history,
          [orderId]: data,
        },
        isLoading: false,
      }));
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to load order history";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  createHistoryRecord: async (
    orderId: number,
    actionType: OrderHistoryActionType,
    options,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const record = await orderHistoryService.createHistoryRecord(
        orderId,
        actionType,
        options,
      );

      set((state) => ({
        history: {
          ...state.history,
          [orderId]: [record, ...(state.history[orderId] || [])],
        },
        isLoading: false,
      }));

      return record;
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to create history record";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  deleteHistoryRecord: async (orderId: number, recordId: number) => {
    set({ isLoading: true, error: null });
    try {
      await orderHistoryService.deleteHistoryRecord(recordId);

      set((state) => ({
        history: {
          ...state.history,
          [orderId]: (state.history[orderId] || []).filter(
            (h) => h.id !== recordId,
          ),
        },
        isLoading: false,
      }));
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to delete history record";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  clearHistoryForOrder: (orderId: number) => {
    set((state) => {
      const newHistory = { ...state.history };
      delete newHistory[orderId];
      return { history: newHistory };
    });
  },
}));

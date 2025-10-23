// src/features/orders/store/useOrderPreviewStore.ts

import { create } from "zustand";
import type { OrderPreviewPicture } from "../../../types/orderPreview";
import { orderPreviewServiceApi } from "../services/orderPreview.service.api";

interface OrderPreviewState {
  // State
  pictures: Record<number, OrderPreviewPicture[]>; // Keyed by orderId
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPreviewPictures: (orderId: number) => Promise<void>;
  uploadPreviewPicture: (
    orderId: number,
    file: File,
    employeeId?: number,
    description?: string,
  ) => Promise<OrderPreviewPicture>;
  deletePreviewPicture: (orderId: number, pictureId: number) => Promise<void>;
  clearError: () => void;
  clearPicturesForOrder: (orderId: number) => void;
}

export const useOrderPreviewStore = create<OrderPreviewState>((set) => ({
  pictures: {},
  isLoading: false,
  error: null,

  loadPreviewPictures: async (orderId: number) => {
    set({ isLoading: true, error: null });
    try {
      const data =
        await orderPreviewServiceApi.getPreviewPicturesByOrderId(orderId);
      set((state) => ({
        pictures: {
          ...state.pictures,
          [orderId]: data,
        },
        isLoading: false,
      }));
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to load preview pictures";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  uploadPreviewPicture: async (
    orderId: number,
    file: File,
    employeeId?: number,
    description?: string,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const picture = await orderPreviewServiceApi.uploadPreviewPicture(
        orderId,
        file,
        employeeId,
        description,
      );

      set((state) => ({
        pictures: {
          ...state.pictures,
          [orderId]: [picture, ...(state.pictures[orderId] || [])],
        },
        isLoading: false,
      }));

      return picture;
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to upload preview picture";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  deletePreviewPicture: async (orderId: number, pictureId: number) => {
    set({ isLoading: true, error: null });
    try {
      await orderPreviewServiceApi.deletePreviewPicture(pictureId);

      set((state) => ({
        pictures: {
          ...state.pictures,
          [orderId]: (state.pictures[orderId] || []).filter(
            (p) => p.id !== pictureId,
          ),
        },
        isLoading: false,
      }));
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to delete preview picture";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  clearPicturesForOrder: (orderId: number) => {
    set((state) => {
      const newPictures = { ...state.pictures };
      delete newPictures[orderId];
      return { pictures: newPictures };
    });
  },
}));

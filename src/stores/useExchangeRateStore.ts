// src/stores/useExchangeRateStore.ts

import { DEFAULTS } from "@constants";
import { exchangeRateService } from "@services";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ExchangeRateState {
  // State
  exchangeRate: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;

  // Actions
  setExchangeRate: (rate: number) => void;
  fetchExchangeRate: () => Promise<void>;
  clearError: () => void;
  resetToDefault: () => void;
}

export const useExchangeRateStore = create<ExchangeRateState>()(
  persist(
    (set) => {
      console.log(
        "[Store] Initial DEFAULTS.EXCHANGE_RATE:",
        DEFAULTS.EXCHANGE_RATE
      );
      return {
        // Initial state
        exchangeRate: DEFAULTS.EXCHANGE_RATE,
        isLoading: false,
        error: null,
        lastUpdated: null,

        // Set exchange rate directly
        setExchangeRate: (rate: number) =>
          set({ exchangeRate: rate, lastUpdated: Date.now() }),

        // Fetch from API
        fetchExchangeRate: async () => {
          console.log("[Store] fetchExchangeRate called");
          set({ isLoading: true, error: null });
          try {
            const rate = await exchangeRateService.getExchangeRate();
            console.log("[Store] Exchange rate fetched:", rate);
            set({
              exchangeRate: rate,
              lastUpdated: Date.now(),
              isLoading: false
            });
          } catch (err) {
            const errorMessage =
              err instanceof Error
                ? err.message
                : "Failed to fetch exchange rate";
            set({ error: errorMessage, isLoading: false });
            console.error("Exchange rate fetch error:", err);
          }
        },

        // Clear error
        clearError: () => set({ error: null }),

        // Reset to default
        resetToDefault: () =>
          set({ exchangeRate: DEFAULTS.EXCHANGE_RATE, error: null })
      };
    },
    {
      name: "exchange-rate-storage",
      partialize: (state) => ({
        exchangeRate: state.exchangeRate,
        lastUpdated: state.lastUpdated
      }),
      onRehydrateStorage: () => (state) => {
        console.log(
          "[Store] Rehydrated from localStorage:",
          state?.exchangeRate
        );
      }
    }
  )
);

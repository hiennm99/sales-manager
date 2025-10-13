// store/useAppStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Shop } from '../types/shop';

interface AppState {
    // Sidebar state
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;

    // Current shop
    currentShop: Shop | null;
    setCurrentShop: (shop: Shop | null) => void;

    // Theme
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Sidebar
            isSidebarCollapsed: false,
            toggleSidebar: () =>
                set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
            setSidebarCollapsed: (collapsed) =>
                set({ isSidebarCollapsed: collapsed }),

            // Current shop
            currentShop: null,
            setCurrentShop: (shop) => set({ currentShop: shop }),

            // Theme
            theme: 'light',
            toggleTheme: () =>
                set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
        }),
        {
            name: 'app-storage',
            partialize: (state) => ({
                currentShop: state.currentShop,
                theme: state.theme,
            }),
        }
    )
);
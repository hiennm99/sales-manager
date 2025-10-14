// store/useAppStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    // Sidebar state
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;

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

            // Theme
            theme: 'light',
            toggleTheme: () =>
                set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
        }),
        {
            name: 'app-storage',
            partialize: (state) => ({
                theme: state.theme,
                collapsed: state.isSidebarCollapsed,
            }),
        }
    )
);
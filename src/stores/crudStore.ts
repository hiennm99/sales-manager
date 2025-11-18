// src/stores/crudStore.ts
/**
 * CRUD Store Factory
 * Generic factory for creating Zustand stores with consistent CRUD patterns
 * Reduces code duplication across feature stores
 *
 * Updated: Added predefined selectors to reduce re-renders
 */

import type { CRUDService } from "@services";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

export interface CRUDStoreState<T, FormData> {
  // Data
  items: T[];
  selectedItem: T | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedItem: (item: T | null) => void;
  fetchItems: () => Promise<void>;
  getItemById: (id: string | number) => T | undefined;
  createItem: (data: FormData) => Promise<T>;
  updateItem: (id: string | number, data: Partial<FormData>) => Promise<T>;
  deleteItem: (id: string | number) => Promise<void>;
  searchItems: (query: string) => Promise<void>;
  bulkDeleteItems: (ids: (string | number)[]) => Promise<void>;
  bulkUpdateStatus: (
    ids: (string | number)[],
    is_active: boolean
  ) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export interface CRUDStoreOptions {
  storeName: string;
  persistKey?: string;
}

/**
 * Create a CRUD stores with consistent patterns
 * @param service CRUD service instance
 * @param options Store configuration
 * @returns Zustand stores hook
 */
export function createCRUDStore<T extends { id: string | number }, FormData>(
  service: CRUDService<T, FormData>,
  options: CRUDStoreOptions
) {
  const { storeName, persistKey = storeName } = options;

  return create<CRUDStoreState<T, FormData>>()(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        selectedItem: null,
        isLoading: false,
        error: null,

        // Set selected item
        setSelectedItem: (item) => set({ selectedItem: item }),

        // Fetch all items
        fetchItems: async () => {
          set({ isLoading: true, error: null });
          try {
            const items = await service.getAll();
            set({ items, isLoading: false });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : `Failed to fetch ${storeName}`;
            console.error(`❌ Store: Error fetching items:`, errorMessage);
            set({ error: errorMessage, isLoading: false });
          }
        },

        // Get item by ID (from local state)
        getItemById: (id: string | number) => {
          return get().items.find((item) => item.id === id);
        },

        // Create item
        createItem: async (data: FormData) => {
          set({ isLoading: true, error: null });
          try {
            const newItem = await service.create(data);

            set((state) => ({
              items: [newItem, ...state.items],
              selectedItem: newItem,
              isLoading: false
            }));

            return newItem;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : `Failed to create ${storeName}`;
            console.error(`❌ Store: Error creating item:`, errorMessage);
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Update item
        updateItem: async (id: string | number, data: Partial<FormData>) => {
          set({ isLoading: true, error: null });
          try {
            const updatedItem = await service.update(id, data);

            if (!updatedItem) throw new Error(`${storeName} not found`);

            set((state) => ({
              items: state.items.map((item) =>
                item.id === id ? updatedItem : item
              ),
              selectedItem:
                state.selectedItem?.id === id
                  ? updatedItem
                  : state.selectedItem,
              isLoading: false
            }));

            return updatedItem;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : `Failed to update ${storeName}`;
            console.error(`❌ Store: Error updating item:`, errorMessage);
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Delete item
        deleteItem: async (id: string | number) => {
          set({ isLoading: true, error: null });
          try {
            await service.delete(id);

            set((state) => ({
              items: state.items.filter((item) => item.id !== id),
              selectedItem:
                state.selectedItem?.id === id ? null : state.selectedItem,
              isLoading: false
            }));

          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : `Failed to delete ${storeName}`;
            console.error(`❌ Store: Error deleting item:`, errorMessage);
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Search items
        searchItems: async (query: string) => {
          set({ isLoading: true, error: null });
          try {
            const items = await service.search(query);
            set({ items, isLoading: false });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : `Failed to search ${storeName}`;
            console.error(`❌ Store: Error searching items:`, errorMessage);
            set({ error: errorMessage, isLoading: false });
          }
        },

        // Bulk delete items
        bulkDeleteItems: async (ids: (string | number)[]) => {
          set({ isLoading: true, error: null });
          try {
            await service.bulkDelete(ids);

            set((state) => ({
              items: state.items.filter((item) => !ids.includes(item.id)),
              selectedItem:
                state.selectedItem && ids.includes(state.selectedItem.id)
                  ? null
                  : state.selectedItem,
              isLoading: false
            }));

          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : `Failed to bulk delete ${storeName}`;
            console.error(`❌ Store: Error bulk deleting items:`, errorMessage);
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Bulk update status
        bulkUpdateStatus: async (
          ids: (string | number)[],
          is_active: boolean
        ) => {
          set({ isLoading: true, error: null });
          try {

            await service.bulkUpdateStatus(ids, is_active);

            set((state) => ({
              items: state.items.map((item) =>
                ids.includes(item.id) ? { ...item, is_active } : item
              ),
              isLoading: false
            }));

          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : `Failed to update status`;
            console.error(
              `❌ Store: Error bulk updating status:`,
              errorMessage
            );
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Clear error
        clearError: () => set({ error: null }),

        // Reset stores
        reset: () =>
          set({
            items: [],
            selectedItem: null,
            isLoading: false,
            error: null
          })
      }),
      {
        name: persistKey,
        partialize: (state) => ({
          items: state.items,
          selectedItem: state.selectedItem
        })
      }
    )
  );
}

/**
 * Create predefined selectors for a CRUD stores
 * Reduces re-renders by only subscribing to specific state slices
 *
 * Usage:
 * const selectors = createCRUDStoreSelectors(useProductStore);
 * const items = selectors.useItems();
 * const { items, isLoading } = selectors.useItemsWithLoading();
 */
export function createCRUDStoreSelectors<T extends { id: string | number }, FormData>(
  useStore: ReturnType<typeof createCRUDStore<T, FormData>>
) {
  return {
    // Select items only (most common use case)
    useItems: () => useStore((state) => state.items),

    // Select items with loading state
    useItemsWithLoading: () =>
      useStore(
        useShallow((state) => ({
          items: state.items,
          isLoading: state.isLoading
        }))
      ),

    // Select items with error
    useItemsWithError: () =>
      useStore(
        useShallow((state) => ({
          items: state.items,
          error: state.error
        }))
      ),

    // Select complete data state
    useDataState: () =>
      useStore(
        useShallow((state) => ({
          items: state.items,
          isLoading: state.isLoading,
          error: state.error
        }))
      ),

    // Select selected item only
    useSelectedItem: () => useStore((state) => state.selectedItem),

    // Select loading state only
    useIsLoading: () => useStore((state) => state.isLoading),

    // Select error state only
    useError: () => useStore((state) => state.error),

    // Select actions only (never triggers re-render)
    useActions: () =>
      useStore(
        useShallow((state) => ({
          setSelectedItem: state.setSelectedItem,
          fetchItems: state.fetchItems,
          getItemById: state.getItemById,
          createItem: state.createItem,
          updateItem: state.updateItem,
          deleteItem: state.deleteItem,
          searchItems: state.searchItems,
          bulkDeleteItems: state.bulkDeleteItems,
          bulkUpdateStatus: state.bulkUpdateStatus,
          clearError: state.clearError,
          reset: state.reset
        }))
      ),

    // Custom selector with shallow compare
    useSelector: <TSelected>(
      selector: (state: CRUDStoreState<T, FormData>) => TSelected
    ) => useStore(useShallow(selector))
  };
}

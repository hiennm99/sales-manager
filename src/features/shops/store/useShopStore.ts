// src/features/shops/store/useShopStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Shop, ShopFormData } from '../../../types/shop';
import { shopServiceApi } from '../services/shop.service.api';

interface ShopStore {
    shops: Shop[];
    isLoading: boolean;
    error: string | null;

    // selected shop
    selectedShop: Shop | null;
    setSelectedShop: (shop: Shop | null) => void;

    // Actions
    fetchShops: () => Promise<void>;
    fetchShopById: (id: number) => Shop | undefined;
    createShop: (data: ShopFormData) => Promise<Shop>;
    updateShop: (id: number, data: Partial<ShopFormData>) => Promise<Shop>;
    deleteShop: (id: number) => Promise<void>;
    toggleShopStatus: (id: number) => Promise<void>;
    searchShops: (query: string) => Promise<void>;
    bulkDeleteShops: (ids: number[]) => Promise<void>;
    bulkUpdateStatus: (ids: number[], is_active: boolean) => Promise<void>;
    clearError: () => void;
}

export const useShopStore = create<ShopStore>()(
    persist(
        (set, get) => ({
            shops: [],
            isLoading: false,
            error: null,

            // selected shop
            selectedShop: null,
            setSelectedShop: (shop) => set({ selectedShop: shop }),

            fetchShops: async () => {
                set({ isLoading: true, error: null });
                try {
                    const shops = await shopServiceApi.getAll();
                    set({ shops, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch shops';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            fetchShopById: (id: number) => {
                return get().shops.find(s => s.id === id);
            },

            createShop: async (data: ShopFormData) => {
                set({ isLoading: true, error: null });
                try {
                    const newShop = await shopServiceApi.create(data);

                    set(state => ({
                        shops: [newShop, ...state.shops],
                        selectedShop: newShop,
                        isLoading: false,
                    }));

                    return newShop;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to create shop';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            updateShop: async (id: number, data: Partial<ShopFormData>) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedShop = await shopServiceApi.update(id, data);

                    if (!updatedShop) throw new Error('Shop not found');

                    set(state => ({
                        shops: state.shops.map(s =>
                            s.id === id ? updatedShop : s
                        ),
                        isLoading: false,
                    }));

                    // Update selected shop if it's the one being updated
                    if (get().selectedShop?.id === id) {
                        set({ selectedShop: updatedShop });
                    }

                    return updatedShop;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to update shop';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            deleteShop: async (id: number) => {
                set({ isLoading: true, error: null });
                try {
                    const success = await shopServiceApi.delete(id);

                    if (!success) throw new Error('Failed to delete shop');

                    set(state => ({
                        shops: state.shops.filter(s => s.id !== id),
                        selectedShop: state.selectedShop?.id === id ? null : state.selectedShop,
                        isLoading: false,
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to delete shop';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            toggleShopStatus: async (id: number) => {
                set({ isLoading: true, error: null });
                try {
                    const toggledShop = await shopServiceApi.toggleStatus(id);

                    if (!toggledShop) throw new Error('Shop not found');

                    set(state => ({
                        shops: state.shops.map(s =>
                            s.id === id ? toggledShop : s
                        ),
                        isLoading: false,
                    }));

                    // Update selected shop if it's the one being toggled
                    if (get().selectedShop?.id === id) {
                        set({ selectedShop: toggledShop });
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to toggle status';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            searchShops: async (query: string) => {
                set({ isLoading: true, error: null });
                try {
                    if (query.trim() === '') {
                        await get().fetchShops();
                        return;
                    }

                    const shops = await shopServiceApi.search(query);
                    set({ shops, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to search shops';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            bulkDeleteShops: async (ids: number[]) => {
                set({ isLoading: true, error: null });
                try {
                    await shopServiceApi.bulkDelete(ids);

                    set(state => ({
                        shops: state.shops.filter(s => !ids.includes(s.id)),
                        selectedShop: ids.includes(state.selectedShop?.id ?? '') ? null : state.selectedShop,
                        isLoading: false,
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to delete shops';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            bulkUpdateStatus: async (ids: number[], is_active: boolean) => {
                set({ isLoading: true, error: null });
                try {
                    await shopServiceApi.bulkUpdateStatus(ids, is_active);

                    const updatedSelectedShop = get().selectedShop
                        ? {
                            ...get().selectedShop!,
                            is_active: ids.includes(get().selectedShop!.id) ? is_active : get().selectedShop!.is_active,
                        }
                        : null;

                    set(state => ({
                        shops: state.shops.map(s =>
                            ids.includes(s.id)
                                ? { ...s, is_active, updated_at: new Date() }
                                : s
                        ),
                        selectedShop: updatedSelectedShop,
                        isLoading: false,
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'shop-storage',
            partialize: (state) => ({
                selectedShop: state.selectedShop,
            }),
        }
    )
);
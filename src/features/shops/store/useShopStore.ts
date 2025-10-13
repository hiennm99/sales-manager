// features/shops/store/useShopStore.ts

import { create } from 'zustand';
import type { Shop } from '../../../types/shop';
import { shopServiceApi } from "../services/shop.api.ts";

interface ShopState {
    shops: Shop[];
    selectedShop: Shop | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchShops: () => Promise<void>;
    fetchShopById: (id: string) => Promise<void>;
    createShop: (data: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateShop: (id: string, data: Partial<Shop>) => Promise<void>;
    deleteShop: (id: string) => Promise<void>;
    setSelectedShop: (shop: Shop | null) => void;
    clearError: () => void;
}

export const useShopStore = create<ShopState>((set) => ({
    shops: [],
    selectedShop: null,
    isLoading: false,
    error: null,

    fetchShops: async () => {
        set({ isLoading: true, error: null });
        try {
            const shops = await shopServiceApi.getAll();
            set({ shops, isLoading: false });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            set({
                error: 'Không thể tải danh sách cửa hàng',
                isLoading: false
            });
        }
    },

    fetchShopById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const shop = await shopServiceApi.getById(id);
            if (shop) {
                set({ selectedShop: shop, isLoading: false });
            } else {
                set({
                    error: 'Không tìm thấy cửa hàng',
                    isLoading: false
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            set({
                error: 'Không thể tải thông tin cửa hàng',
                isLoading: false
            });
        }
    },

    createShop: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const newShop = await shopServiceApi.create(data);
            set((state) => ({
                shops: [...state.shops, newShop],
                isLoading: false
            }));
        } catch (error) {
            set({
                error: 'Không thể tạo cửa hàng mới',
                isLoading: false
            });
            throw error;
        }
    },

    updateShop: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const updatedShop = await shopServiceApi.update(id, data);
            if (updatedShop) {
                set((state) => ({
                    shops: state.shops.map(shop =>
                        shop.id === id ? updatedShop : shop
                    ),
                    selectedShop: state.selectedShop?.id === id ? updatedShop : state.selectedShop,
                    isLoading: false,
                }));
            }
        } catch (error) {
            set({
                error: 'Không thể cập nhật cửa hàng',
                isLoading: false
            });
            throw error;
        }
    },

    deleteShop: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await shopServiceApi.delete(id);
            set((state) => ({
                shops: state.shops.filter(shop => shop.id !== id),
                selectedShop: state.selectedShop?.id === id ? null : state.selectedShop,
                isLoading: false,
            }));
        } catch (error) {
            set({
                error: 'Không thể xóa cửa hàng',
                isLoading: false
            });
            throw error;
        }
    },

    setSelectedShop: (shop) => set({ selectedShop: shop }),

    clearError: () => set({ error: null }),
}));
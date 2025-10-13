// features/shops/services/shop.api.ts

import type { Shop } from '../../../types/shop';
import { mockShops } from "../data/mockShops.ts";

// Helper function để simulate API delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const shopServiceApi = {
    getAll: async (): Promise<Shop[]> => {
        await delay(500);
        return mockShops;
    },

    getById: async (id: string): Promise<Shop | undefined> => {
        await delay(300);
        return mockShops.find(shop => shop.id === id);
    },

    create: async (data: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shop> => {
        await delay(800);
        const newShop: Shop = {
            ...data,
            id: String(mockShops.length + 1),
            created_at: new Date(),
            updated_at: new Date(),
        };
        mockShops.push(newShop);
        return newShop;
    },

    update: async (id: string, data: Partial<Shop>): Promise<Shop | undefined> => {
        await delay(600);
        const index = mockShops.findIndex(shop => shop.id === id);
        if (index === -1) return undefined;

        mockShops[index] = {
            ...mockShops[index],
            ...data,
            updated_at: new Date(),
        };
        return mockShops[index];
    },

    delete: async (id: string): Promise<boolean> => {
        await delay(400);
        const index = mockShops.findIndex(shop => shop.id === id);
        if (index === -1) return false;

        mockShops.splice(index, 1);
        return true;
    },
};
// src/features/products/store/useProductStore.ts

import { create } from 'zustand';
import type { Product, ProductFormData } from '../../../types/product';
import { mockProducts } from '../data/mockProducts';

interface ProductStore {
    products: Product[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchProducts: () => Promise<void>;
    getProductById: (id: string) => Product | undefined;
    createProduct: (data: ProductFormData) => Promise<Product>;
    updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<Product>;
    deleteProduct: (id: string) => Promise<void>;
    toggleProductStatus: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
    products: [],
    isLoading: false,
    error: null,

    fetchProducts: async () => {
        set({ isLoading: true, error: null });
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            set({ products: mockProducts, isLoading: false });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            set({ error: 'Failed to fetch products', isLoading: false });
        }
    },

    getProductById: (id: string) => {
        return get().products.find(p => p.id === id);
    },

    createProduct: async (data: ProductFormData) => {
        set({ isLoading: true, error: null });
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            const newProduct: Product = {
                id: Date.now().toString(),
                ...data,
                status: 'active',
                created_at: new Date(),
                updated_at: new Date(),
            };

            set(state => ({
                products: [newProduct, ...state.products],
                isLoading: false,
            }));

            return newProduct;
        } catch (error) {
            set({ error: 'Failed to create product', isLoading: false });
            throw error;
        }
    },

    updateProduct: async (id: string, data: Partial<ProductFormData>) => {
        set({ isLoading: true, error: null });
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            set(state => ({
                products: state.products.map(p =>
                    p.id === id
                        ? { ...p, ...data, updated_at: new Date() }
                        : p
                ),
                isLoading: false,
            }));

            const updatedProduct = get().products.find(p => p.id === id);
            if (!updatedProduct) throw new Error('Product not found');

            return updatedProduct;
        } catch (error) {
            set({ error: 'Failed to update product', isLoading: false });
            throw error;
        }
    },

    deleteProduct: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            set(state => ({
                products: state.products.filter(p => p.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: 'Failed to delete product', isLoading: false });
            throw error;
        }
    },

    toggleProductStatus: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await new Promise(resolve => setTimeout(resolve, 300));

            set(state => ({
                products: state.products.map(p =>
                    p.id === id
                        ? {
                            ...p,
                            status: p.status === 'active' ? 'inactive' : 'active',
                            updated_at: new Date(),
                        }
                        : p
                ),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: 'Failed to toggle status', isLoading: false });
            throw error;
        }
    },
}));
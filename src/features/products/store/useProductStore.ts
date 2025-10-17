// src/features/products/store/useProductStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ProductFormData } from '../../../types/product';
import { productServiceApi } from '../services/product.service.api';

interface ProductStore {
    products: Product[];
    isLoading: boolean;
    error: string | null;

    // selected product
    selectedProduct: Product | null;
    setSelectedProduct: (product: Product | null) => void;

    // Actions
    fetchProducts: () => Promise<void>;
    getProductById: (id: string | number) => Product | undefined;
    getProductBySku: (sku: string) => Product | undefined;
    createProduct: (data: ProductFormData, imageFile?: File) => Promise<Product>;
    updateProduct: (id: string, data: Partial<ProductFormData>, imageFile?: File) => Promise<Product>;
    deleteProduct: (id: string) => Promise<void>;
    toggleProductStatus: (id: string) => Promise<void>;
    searchProducts: (query: string) => Promise<void>;
    bulkDeleteProducts: (ids: number[]) => Promise<void>;
    bulkUpdateStatus: (ids: number[], is_active: boolean) => Promise<void>;
    clearError: () => void;
}

export const useProductStore = create<ProductStore>()(
    persist(
        (set, get) => ({
            products: [],
            isLoading: false,
            error: null,

            // selected product
            selectedProduct: null,
            setSelectedProduct: (product) => set({ selectedProduct: product }),

            fetchProducts: async () => {
                set({ isLoading: true, error: null });
                try {
                    const products = await productServiceApi.getProducts();
                    set({ products, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            getProductById: (id: string | number) => {
            const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
            return get().products.find(p => p.id === numericId);
            },

    getProductBySku: (sku: string) => {
        return get().products.find(p => p.sku === sku);
    },

            createProduct: async (data: ProductFormData, imageFile?: File) => {
                set({ isLoading: true, error: null });
                try {
                    const newProduct = await productServiceApi.createProduct(data, imageFile);

                    set(state => ({
                        products: [newProduct, ...state.products],
                        selectedProduct: newProduct,
                        isLoading: false,
                    }));

                    return newProduct;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            updateProduct: async (id: string, data: Partial<ProductFormData>, imageFile?: File) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedProduct = await productServiceApi.updateProduct(id, data, imageFile);
                    const numericId = parseInt(id, 10);

                    set(state => ({
                        products: state.products.map(p =>
                            p.id === numericId ? updatedProduct : p
                        ),
                        isLoading: false,
                    }));

                    // Update selected product if it's the one being updated
                    if (get().selectedProduct?.id === numericId) {
                        set({ selectedProduct: updatedProduct });
                    }

                    return updatedProduct;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            deleteProduct: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    await productServiceApi.deleteProduct(id);
                    const numericId = parseInt(id, 10);

                    set(state => ({
                        products: state.products.filter(p => p.id !== numericId),
                        selectedProduct: state.selectedProduct?.id === numericId ? null : state.selectedProduct,
                        isLoading: false,
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            toggleProductStatus: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    const toggledProduct = await productServiceApi.toggleProductStatus(id);
                    const numericId = parseInt(id, 10);

                    set(state => ({
                        products: state.products.map(p =>
                            p.id === numericId ? toggledProduct : p
                        ),
                        isLoading: false,
                    }));

                    // Update selected product if it's the one being toggled
                    if (get().selectedProduct?.id === numericId) {
                        set({ selectedProduct: toggledProduct });
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to toggle status';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            searchProducts: async (query: string) => {
                set({ isLoading: true, error: null });
                try {
                    if (query.trim() === '') {
                        await get().fetchProducts();
                        return;
                    }

                    const products = await productServiceApi.searchProducts(query);
                    set({ products, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to search products';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            bulkDeleteProducts: async (ids: number[]) => {
                set({ isLoading: true, error: null });
                try {
                    await productServiceApi.bulkDeleteProducts(ids);

                    set(state => ({
                        products: state.products.filter(p => !ids.includes(p.id)),
                        selectedProduct: ids.includes(state.selectedProduct?.id ?? -1) ? null : state.selectedProduct,
                        isLoading: false,
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to delete products';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            bulkUpdateStatus: async (ids: number[], is_active: boolean) => {
                set({ isLoading: true, error: null });
                try {
                    await productServiceApi.bulkUpdateStatus(ids, is_active);

                    const updatedSelectedProduct = get().selectedProduct
                        ? {
                            ...get().selectedProduct!,
                            is_active: ids.includes(get().selectedProduct!.id) ? is_active : get().selectedProduct!.is_active,
                        }
                        : null;

                    set(state => ({
                        products: state.products.map(p =>
                            ids.includes(p.id)
                                ? { ...p, is_active, updated_at: new Date() }
                                : p
                        ),
                        selectedProduct: updatedSelectedProduct,
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
            name: 'product-storage',
            partialize: (state) => ({
                selectedProduct: state.selectedProduct,
            }),
        }
    )
);
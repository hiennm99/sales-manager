// src/features/products/services/product.api.ts

import type { Product, ProductFormData } from '../../../types/product';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Product API Service
 * Handles all HTTP requests related to products
 */
export const productServiceApi = {
    /**
     * Fetch all products
     */
    async getProducts(): Promise<Product[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error('Failed to fetch products');
        }
    },

    /**
     * Fetch a single product by ID
     */
    async getProductById(id: string): Promise<Product> {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Product not found');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    },

    /**
     * Create a new product
     */
    async createProduct(data: ProductFormData): Promise<Product> {
        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const product = await response.json();
            return product;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

    /**
     * Update an existing product
     */
    async updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const product = await response.json();
            return product;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    /**
     * Delete a product
     */
    async deleteProduct(id: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },

    /**
     * Toggle product status (active/inactive)
     */
    async toggleProductStatus(id: string): Promise<Product> {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const product = await response.json();
            return product;
        } catch (error) {
            console.error('Error toggling product status:', error);
            throw error;
        }
    },

    /**
     * Search products
     */
    async searchProducts(query: string): Promise<Product[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error searching products:', error);
            throw new Error('Failed to search products');
        }
    },

    /**
     * Bulk delete products
     */
    async bulkDeleteProducts(ids: string[]): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/products/bulk-delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error bulk deleting products:', error);
            throw error;
        }
    },

    /**
     * Bulk update product status
     */
    async bulkUpdateStatus(ids: string[], status: 'active' | 'inactive'): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/products/bulk-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids, status }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error bulk updating status:', error);
            throw error;
        }
    },

    /**
     * Export products to CSV
     */
    async exportProducts(): Promise<Blob> {
        try {
            const response = await fetch(`${API_BASE_URL}/products/export`, {
                method: 'GET',
                headers: {
                    'Accept': 'text/csv',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            return blob;
        } catch (error) {
            console.error('Error exporting products:', error);
            throw new Error('Failed to export products');
        }
    },

    /**
     * Import products from CSV
     */
    async importProducts(file: File): Promise<{ success: number; failed: number }> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/products/import`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error importing products:', error);
            throw error;
        }
    },
};

/**
 * Helper function to download exported CSV
 */
export const downloadProductsCSV = async () => {
    try {
        const blob = await productServiceApi.exportProducts();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading CSV:', error);
        throw error;
    }
};

/**
 * Type guard to check if error is a fetch error
 */
export const isFetchError = (error: unknown): error is Error => {
    return error instanceof Error;
};

/**
 * Error handler utility
 */
export const handleApiError = (error: unknown): string => {
    if (isFetchError(error)) {
        return error.message;
    }
    return 'An unexpected error occurred';
};
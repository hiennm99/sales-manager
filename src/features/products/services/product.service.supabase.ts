// src/features/products/services/product.service.supabase.ts

import { supabase, handleSupabaseError } from '../../../lib/supabase';
import type { Product, ProductFormData } from '../../../types/product';

/**
 * Product Supabase Service
 * Handles all database operations related to products using Supabase
 */
export const productServiceSupabase = {
    /**
     * Fetch all products
     */
    async getProducts(): Promise<Product[]> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!data) return [];

            return data.map(item => ({
                id: item.id,
                sku: item.sku,
                title: item.title,
                etsy_url: item.etsy_url,
                image_url: item.image_url,
                status: item.status,
                logo: item.logo,
                created_at: new Date(item.created_at),
                updated_at: new Date(item.updated_at),
            }));
        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Fetch a single product by ID
     */
    async getProductById(id: string): Promise<Product> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error('Product not found');
                }
                throw error;
            }

            if (!data) throw new Error('Product not found');

            return {
                id: data.id,
                sku: data.sku,
                title: data.title,
                etsy_url: data.etsy_url,
                image_url: data.image_url,
                status: data.status,
                logo: data.logo,
                created_at: new Date(data.created_at),
                updated_at: new Date(data.updated_at),
            };
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error instanceof Error ? error : new Error(handleSupabaseError(error));
        }
    },

    /**
     * Create a new product
     */
    async createProduct(formData: ProductFormData): Promise<Product> {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([{
                    sku: formData.sku,
                    title: formData.title,
                    etsy_url: formData.etsy_url,
                    image_url: formData.image_url,
                    status: 'active',
                }])
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error('Failed to create product');

            return {
                id: data.id,
                sku: data.sku,
                title: data.title,
                etsy_url: data.etsy_url,
                image_url: data.image_url,
                status: data.status,
                logo: data.logo,
                created_at: new Date(data.created_at),
                updated_at: new Date(data.updated_at),
            };
        } catch (error) {
            console.error('Error creating product:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Update an existing product
     */
    async updateProduct(id: string, formData: Partial<ProductFormData>): Promise<Product> {
        try {
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
            };

            if (formData.sku !== undefined) updateData.sku = formData.sku;
            if (formData.title !== undefined) updateData.title = formData.title;
            if (formData.etsy_url !== undefined) updateData.etsy_url = formData.etsy_url;
            if (formData.image_url !== undefined) updateData.image_url = formData.image_url;

            const { data, error } = await supabase
                .from('products')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error('Failed to update product');

            return {
                id: data.id,
                sku: data.sku,
                title: data.title,
                etsy_url: data.etsy_url,
                image_url: data.image_url,
                status: data.status,
                logo: data.logo,
                created_at: new Date(data.created_at),
                updated_at: new Date(data.updated_at),
            };
        } catch (error) {
            console.error('Error updating product:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Delete a product
     */
    async deleteProduct(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Toggle product status (active/inactive)
     */
    async toggleProductStatus(id: string): Promise<Product> {
        try {
            // Get current product
            const { data: currentProduct, error: fetchError } = await supabase
                .from('products')
                .select('status')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;
            if (!currentProduct) throw new Error('Product not found');

            // Toggle status
            const newStatus = currentProduct.status === 'active' ? 'inactive' : 'active';

            const { data, error } = await supabase
                .from('products')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error('Failed to toggle status');

            return {
                id: data.id,
                sku: data.sku,
                title: data.title,
                etsy_url: data.etsy_url,
                image_url: data.image_url,
                status: data.status,
                logo: data.logo,
                created_at: new Date(data.created_at),
                updated_at: new Date(data.updated_at),
            };
        } catch (error) {
            console.error('Error toggling product status:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Search products
     */
    async searchProducts(query: string): Promise<Product[]> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .or(`title.ilike.%${query}%,sku.ilike.%${query}%`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!data) return [];

            return data.map(item => ({
                id: item.id,
                sku: item.sku,
                title: item.title,
                etsy_url: item.etsy_url,
                image_url: item.image_url,
                status: item.status,
                logo: item.logo,
                created_at: new Date(item.created_at),
                updated_at: new Date(item.updated_at),
            }));
        } catch (error) {
            console.error('Error searching products:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Bulk delete products
     */
    async bulkDeleteProducts(ids: string[]): Promise<void> {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .in('id', ids);

            if (error) throw error;
        } catch (error) {
            console.error('Error bulk deleting products:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Bulk update product status
     */
    async bulkUpdateStatus(ids: string[], status: 'active' | 'inactive'): Promise<void> {
        try {
            const { error } = await supabase
                .from('products')
                .update({
                    status,
                    updated_at: new Date().toISOString(),
                })
                .in('id', ids);

            if (error) throw error;
        } catch (error) {
            console.error('Error bulk updating status:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Export products to CSV (get all data for client-side export)
     */
    async exportProducts(): Promise<Product[]> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!data) return [];

            return data.map(item => ({
                id: item.id,
                sku: item.sku,
                title: item.title,
                etsy_url: item.etsy_url,
                image_url: item.image_url,
                status: item.status,
                logo: item.logo,
                created_at: new Date(item.created_at),
                updated_at: new Date(item.updated_at),
            }));
        } catch (error) {
            console.error('Error exporting products:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Import products from array
     */
    async importProducts(products: ProductFormData[]): Promise<{ success: number; failed: number }> {
        let success = 0;
        let failed = 0;

        for (const product of products) {
            try {
                await this.createProduct(product);
                success++;
            } catch (error) {
                console.error('Failed to import product:', product, error);
                failed++;
            }
        }

        return { success, failed };
    },
};

/**
 * Helper function to download products as CSV
 */
export const downloadProductsCSV = async () => {
    try {
        const products = await productServiceSupabase.exportProducts();

        // Create CSV content
        const headers = ['ID', 'SKU', 'Title', 'Etsy URL', 'Image URL', 'Status', 'Created At', 'Updated At'];
        const rows = products.map(p => [
            p.id,
            p.sku,
            p.title,
            p.etsy_url,
            p.image_url,
            p.status,
            p.created_at.toISOString(),
            p.updated_at.toISOString(),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv' });
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
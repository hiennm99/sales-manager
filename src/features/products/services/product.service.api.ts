// src/features/products/services/product.service.supabase.ts

import { supabase, handleSupabaseError } from '../../../lib/supabase';
import type { Product, ProductFormData } from '../../../types/product';
import type { Database } from '../../../types/supabase';

/**
 * Helper function to map database row to Product type
 */
const mapToRow = (data: Database['public']['Tables']['products']['Row']): Product => {
    return {
        id: data.id,
        shop_code: data.shop_code,
        sku: data.sku,
        title: data.title,
        etsy_url: data.etsy_url,
        image_url: data.image_url,
        is_active: data.is_active,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
    };
};
/**
 * Product Supabase Service
 * Handles all database operations related to products using Supabase
 */
export const productServiceApi = {
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
            if (!data || data.length === 0) return [];

            return data.map(mapToRow)
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

            return mapToRow(data);
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
            const insertData: Database['public']['Tables']['products']['Insert'] = {
                shop_code: formData.shop_code,
                sku: formData.sku,
                title: formData.title,
                etsy_url: formData.etsy_url,
                image_url: formData.image_url,
                is_active: true,
            };

            const { data, error } = await supabase
                .from('products')
                .insert([insertData])
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error('Failed to create product');

            return mapToRow(data);
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

            return mapToRow(data);
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
                .select('is_active')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;
            if (!currentProduct) throw new Error('Product not found');

            // Toggle status
            const newStatus = currentProduct.is_active === true ? false : true;

            const { data, error } = await supabase
                .from('products')
                .update({
                    is_active: newStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error('Failed to toggle status');

            return mapToRow(data);
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
            if (!data || data.length === 0) return [];

            return data.map(mapToRow);
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
            if (ids.length === 0) return;

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
    async bulkUpdateStatus(ids: string[], is_active: boolean): Promise<void> {
        try {
            if (ids.length === 0) return;

            const { error } = await supabase
                .from('products')
                .update({
                    is_active,
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
            if (!data || data.length === 0) return [];

            return data.map(mapToRow);
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
                // eslint-disable-next-line no-await-in-loop
                await this.createProduct(product);
                success += 1;
            } catch (error) {
                console.error('Failed to import product:', product, error);
                failed += 1;
            }
        }

        return { success, failed };
    },
};

/**
 * Helper function to download products as CSV
 */
export const downloadProductsCSV = async (): Promise<void> => {
    try {
        const products = await productServiceApi.exportProducts();

        if (products.length === 0) {
            console.warn('No products to export');
            return;
        }

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
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `products-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading CSV:', error);
        throw error;
    }
};
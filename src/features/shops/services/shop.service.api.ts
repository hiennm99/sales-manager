// src/features/shops/services/shop.service.supabase.ts

import { supabase, handleSupabaseError } from '../../../lib/supabase';
import type { Shop, ShopFormData } from '../../../types/shop';
import type { Database } from "../../../types/supabase.ts";

/**
 * Helper function to map database row to Shop type
 */
const mapToRow = (data: Database['public']['Tables']['shops']['Row']): Shop => {
    return {
        id: data.id,
        name: data.name,
        code: data.code,
        is_active: data.is_active,
        logo: data.logo,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
    };
};

/**
 * Shop Supabase Service
 * Handles all database operations related to shops using Supabase
 */
export const shopServiceApi = {
    /**
     * Get all shops
     */
    async getAll(): Promise<Shop[]> {
        const { data, error } = await supabase
            .from('shops')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching shops:', error);
            throw new Error(handleSupabaseError(error));
        }

        if (!data) return [];

        return data.map(mapToRow);
    },

    /**
     * Get shop by ID
     */
    async getById(id: number): Promise<Shop | undefined> {
        const { data, error } = await supabase
            .from('shops')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return undefined;
            }
            console.error('Error fetching shop:', error);
            throw new Error(handleSupabaseError(error));
        }

        if (!data) return undefined;

        return mapToRow(data);
    },

    /**
     * Create a new shop
     */
    async create(formData: ShopFormData): Promise<Shop> {
        const insertData = {
            name: formData.name,
            code: formData.code,
            logo: formData.logo
        };

        const { data, error } = await supabase
            .from('shops')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            console.error('Error creating shop:', error);
            throw new Error(handleSupabaseError(error));
        }

        if (!data) throw new Error('Failed to create shop');

        return mapToRow(data);
    },

    /**
     * Update an existing shop
     */
    async update(id: number, formData: Partial<ShopFormData>): Promise<Shop | undefined> {
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (formData.name !== undefined) updateData.name = formData.name;
        if (formData.code !== undefined) updateData.code = formData.code;
        if (formData.logo !== undefined) updateData.logo = formData.logo;

        const { data, error } = await supabase
            .from('shops')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return undefined;
            }
            console.error('Error updating shop:', error);
            throw new Error(handleSupabaseError(error));
        }

        if (!data) return undefined;

        return mapToRow(data);
    },

    /**
     * Delete a shop
     */
    async delete(id: number): Promise<boolean> {
        const { error } = await supabase
            .from('shops')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting shop:', error);
            return false;
        }

        return true;
    },

    /**
     * Toggle shop status
     */
    async toggleStatus(id: number): Promise<Shop | undefined> {
        // Get current shop
        const { data: currentShop, error: fetchError } = await supabase
            .from('shops')
            .select('is_active')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Error toggling shop status:', fetchError);
            throw new Error(handleSupabaseError(fetchError));
        }

        if (!currentShop) return undefined;

        // Toggle status
        const newStatus = !currentShop.is_active;

        const { data, error } = await supabase
            .from('shops')
            .update({
                is_active: newStatus,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error toggling shop status:', error);
            throw new Error(handleSupabaseError(error));
        }

        if (!data) return undefined;

        return mapToRow(data);
    },

    /**
     * Search shops
     */
    async search(query: string): Promise<Shop[]> {
        const { data, error } = await supabase
            .from('shops')
            .select('*')
            .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error searching shops:', error);
            throw new Error(handleSupabaseError(error));
        }

        if (!data) return [];

        return data.map(mapToRow);
    },

    /**
     * Bulk delete shops
     */
    async bulkDelete(ids: number[]): Promise<void> {
        if (!ids || ids.length === 0) return;

        const { error } = await supabase
            .from('shops')
            .delete()
            .in('id', ids);

        if (error) {
            console.error('Error bulk deleting shops:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Bulk update shop status
     */
    async bulkUpdateStatus(ids: number[], is_active: boolean): Promise<void> {
        if (!ids || ids.length === 0) return;

        const { error } = await supabase
            .from('shops')
            .update({
                is_active,
                updated_at: new Date().toISOString(),
            })
            .in('id', ids);

        if (error) {
            console.error('Error bulk updating status:', error);
            throw new Error(handleSupabaseError(error));
        }
    },
};
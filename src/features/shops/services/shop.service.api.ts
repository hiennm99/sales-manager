// src/features/shops/services/shop.service.supabase.ts

import { supabase, handleSupabaseError } from '../../../lib/supabase';
import type { Shop, ShopFormData } from '../../../types/shop';
import type { Database } from "../../../types/supabase.ts";
/**
 * Shop Supabase Service
 * Handles all database operations related to shops using Supabase
 */
// Helper function ở ngoài object
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

export const shopServiceApi = {
    /**
     * Get all shops
     */
    async getAll(): Promise<Shop[]> {
        try {
            const { data, error } = await supabase
                .from('shops')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (!data) return [];

            return data.map(mapToRow);
        } catch (error) {
            console.error('Error fetching shops:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Get shop by ID
     */
    async getById(id: string): Promise<Shop | undefined> {
        try {
            const { data, error } = await supabase
                .from('shops')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return undefined;
                }
                throw error;
            }

            if (!data) return undefined;

            return mapToRow(data);
        } catch (error) {
            console.error('Error fetching shop:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Create a new shop
     */
    async create(formData: ShopFormData): Promise<Shop> {
        try {
            const { data, error } = await supabase
                .from('shops')
                .insert({
                    name: formData.name,
                    code: formData.code,
                    logo: formData.logo
                })
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error('Failed to create shop');

            return mapToRow(data);
        } catch (error) {
            console.error('Error creating shop:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Update an existing shop
     */
    async update(id: string, formData: Partial<ShopFormData>): Promise<Shop | undefined> {
        try {
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
                throw error;
            }

            if (!data) return undefined;

            return mapToRow(data);
        } catch (error) {
            console.error('Error updating shop:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Delete a shop
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('shops')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Error deleting shop:', error);
            return false;
        }
    },

    /**
     * Toggle shop status
     */
    async toggleStatus(id: string): Promise<Shop | undefined> {
        try {
            // Get current shop
            const { data: currentShop, error: fetchError } = await supabase
                .from('shops')
                .select('is_active')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;
            if (!currentShop) return undefined;

            // Toggle status
            const newStatus = currentShop.is_active === true ? false : true;

            const { data, error } = await supabase
                .from('shops')
                .update({
                    is_active: newStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            if (!data) return undefined;

            return mapToRow(data);
        } catch (error) {
            console.error('Error toggling shop status:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Search shops
     */
    async search(query: string): Promise<Shop[]> {
        try {
            const { data, error } = await supabase
                .from('shops')
                .select('*')
                .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!data) return [];

            return data.map(mapToRow);
        } catch (error) {
            console.error('Error searching shops:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Bulk delete shops
     */
    async bulkDelete(ids: string[]): Promise<void> {
        try {
            const { error } = await supabase
                .from('shops')
                .delete()
                .in('id', ids);

            if (error) throw error;
        } catch (error) {
            console.error('Error bulk deleting shops:', error);
            throw new Error(handleSupabaseError(error));
        }
    },

    /**
     * Bulk update shop status
     */
    async bulkUpdateStatus(ids: string[], is_active: boolean): Promise<void> {
        try {
            const { error } = await supabase
                .from('shops')
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
};
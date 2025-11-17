// src/services/crudService.ts
/**
 * CRUD Service Factory
 * Generic factory for creating CRUD services with consistent patterns
 * Reduces code duplication across feature services
 */

import { supabase } from "@lib";
import { PostgrestError } from "@supabase/supabase-js";

export interface CRUDServiceOptions {
  tableName: string;
  idColumn?: string; // default: 'id'
  searchColumns?: string[]; // columns to search in
}

export interface CRUDServiceMappers<T, FormData> {
  toRow: (data: FormData) => Partial<T>;
  toFormData: (row: T) => FormData;
}

export interface CRUDService<T, FormData> {
  getAll: () => Promise<T[]>;
  getById: (id: string | number) => Promise<T | null>;
  create: (data: FormData) => Promise<T>;
  update: (id: string | number, data: Partial<FormData>) => Promise<T>;
  delete: (id: string | number) => Promise<void>;
  search: (query: string) => Promise<T[]>;
  bulkDelete: (ids: (string | number)[]) => Promise<void>;
  bulkUpdateStatus: (
    ids: (string | number)[],
    is_active: boolean
  ) => Promise<void>;
  exists: (id: string | number) => Promise<boolean>;
  count: () => Promise<number>;
}

/**
 * Create a CRUD service with consistent patterns
 * @param options Configuration for the service
 * @param mappers Functions to map between database rows and form data
 * @returns CRUD service instance
 */
export function createCRUDService<T extends { id: string | number }, FormData>(
  options: CRUDServiceOptions,
  mappers: CRUDServiceMappers<T, FormData>
): CRUDService<T, FormData> {
  const { tableName, idColumn = "id", searchColumns = [] } = options;

  const handleError = (
    error: PostgrestError | null,
    context: string
  ): never => {
    if (error) {
      console.error(`CRUD Service error in ${context}:`, error);
      throw new Error(error.message || `Operation failed: ${context}`);
    }
    throw new Error(`Unexpected error in ${context}`);
  };

  return {
    /**
     * Get all records
     */
    async getAll(): Promise<T[]> {
      try {
        console.log(`📖 Fetching all records from ${tableName}`);
        const { data, error } = await supabase
          .from(tableName as any)
          .select("*")
          .order(idColumn, { ascending: true });

        if (error) handleError(error, `${tableName}.getAll()`);

        console.log(
          `✅ Fetched ${data?.length || 0} records from ${tableName}`
        );
        return (data || []) as unknown as T[];
      } catch (error) {
        console.error(`Error in getAll:`, error);
        throw error;
      }
    },

    /**
     * Get record by ID
     */
    async getById(id: string | number): Promise<T | null> {
      try {
        console.log(`🔍 Fetching ${tableName} with ${idColumn}=${id}`);
        const { data, error } = await supabase
          .from(tableName as any)
          .select("*")
          .eq(idColumn, id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            // No rows found
            console.log(`ℹ️ No record found with ${idColumn}=${id}`);
            return null;
          }
          handleError(error, `${tableName}.getById(${id})`);
        }

        console.log(`✅ Record found:`, data);
        return (data || null) as unknown as T | null;
      } catch (error) {
        console.error(`Error in getById:`, error);
        throw error;
      }
    },

    /**
     * Create new record
     */
    async create(data: FormData): Promise<T> {
      try {
        console.log(`➕ Creating new ${tableName} record:`, data);
        const row = mappers.toRow(data);

        const { data: created, error } = await supabase
          .from(tableName as any)
          .insert([row])
          .select()
          .single();

        if (error) handleError(error, `${tableName}.create()`);

        console.log(`✅ Record created:`, created);
        return created as unknown as T;
      } catch (error) {
        console.error(`Error in create:`, error);
        throw error;
      }
    },

    /**
     * Update record
     */
    async update(id: string | number, data: Partial<FormData>): Promise<T> {
      try {
        console.log(`✏️ Updating ${tableName} with ${idColumn}=${id}:`, data);
        const row = mappers.toRow(data as FormData);

        const { data: updated, error } = await supabase
          .from(tableName as any)
          .update(row)
          .eq(idColumn, id)
          .select()
          .single();

        if (error) handleError(error, `${tableName}.update(${id})`);

        console.log(`✅ Record updated:`, updated);
        return updated as unknown as T;
      } catch (error) {
        console.error(`Error in update:`, error);
        throw error;
      }
    },

    /**
     * Delete record
     */
    async delete(id: string | number): Promise<void> {
      try {
        console.log(`🗑️ Deleting ${tableName} with ${idColumn}=${id}`);
        const { error } = await supabase.from(tableName as any).delete().eq(idColumn, id);

        if (error) handleError(error, `${tableName}.delete(${id})`);

        console.log(`✅ Record deleted`);
      } catch (error) {
        console.error(`Error in delete:`, error);
        throw error;
      }
    },

    /**
     * Search records by query
     */
    async search(query: string): Promise<T[]> {
      try {
        if (!searchColumns.length) {
          console.warn(`⚠️ No search columns configured for ${tableName}`);
          return [];
        }

        console.log(`🔎 Searching ${tableName} for: "${query}"`);

        // Build OR conditions for all search columns
        let queryBuilder = supabase.from(tableName as any).select("*");

        // Use the first search column for filtering
        const firstColumn = searchColumns[0];
        queryBuilder = queryBuilder.ilike(firstColumn, `%${query}%`);

        // Add OR conditions for other columns
        for (let i = 1; i < searchColumns.length; i++) {
          queryBuilder = queryBuilder.or(
            `${searchColumns[i]}.ilike.%${query}%`
          );
        }

        const { data, error } = await queryBuilder;

        if (error) handleError(error, `${tableName}.search("${query}")`);

        console.log(`✅ Found ${data?.length || 0} records`);
        return (data || []) as unknown as T[];
      } catch (error) {
        console.error(`Error in search:`, error);
        throw error;
      }
    },

    /**
     * Bulk delete records
     */
    async bulkDelete(ids: (string | number)[]): Promise<void> {
      try {
        console.log(`🗑️ Bulk deleting ${ids.length} records from ${tableName}`);
        const { error } = await supabase.from(tableName as any).delete().in(idColumn, ids);

        if (error) handleError(error, `${tableName}.bulkDelete()`);

        console.log(`✅ Bulk delete completed`);
      } catch (error) {
        console.error(`Error in bulkDelete:`, error);
        throw error;
      }
    },

    /**
     * Bulk update status
     */
    async bulkUpdateStatus(
      ids: (string | number)[],
      is_active: boolean
    ): Promise<void> {
      try {
        console.log(
          `🔄 Bulk updating status for ${ids.length} records in ${tableName}`
        );
        const { error } = await supabase
          .from(tableName as any)
          .update({ is_active })
          .in(idColumn, ids);

        if (error) handleError(error, `${tableName}.bulkUpdateStatus()`);

        console.log(`✅ Bulk status update completed`);
      } catch (error) {
        console.error(`Error in bulkUpdateStatus:`, error);
        throw error;
      }
    },

    /**
     * Check if record exists
     */
    async exists(id: string | number): Promise<boolean> {
      try {
        const { data, error } = await supabase
          .from(tableName as any)
          .select(idColumn)
          .eq(idColumn, id)
          .single();

        if (error && error.code !== "PGRST116") {
          handleError(error, `${tableName}.exists(${id})`);
        }

        return !!data;
      } catch (error) {
        console.error(`Error in exists:`, error);
        return false;
      }
    },

    /**
     * Get total record count
     */
    async count(): Promise<number> {
      try {
        console.log(`📊 Counting records in ${tableName}`);
        const { count, error } = await supabase
          .from(tableName as any)
          .select("*", { count: "exact", head: true });

        if (error) handleError(error, `${tableName}.count()`);

        console.log(`✅ Total records: ${count}`);
        return count || 0;
      } catch (error) {
        console.error(`Error in count:`, error);
        throw error;
      }
    }
  };
}

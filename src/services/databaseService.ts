// src/services/databaseService.ts
/**
 * General Database Service
 * Handles common database operations like getting latest IDs, sequences, etc.
 */

import { handleSupabaseError, supabase } from "@lib";
import { PostgrestError } from "@supabase/supabase-js";
import type { Database } from "@types";

// Custom error class for database operations
class DatabaseError extends Error {
  readonly originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = "DatabaseError";
    this.originalError = originalError;
  }
}

// Type for table names - extracted from Supabase Database schema
type TableName = keyof Database["public"]["Tables"];

export interface TableInfo {
  tableName: string;
  idColumn?: string; // default: 'id'
}

/**
 * Database Service for common database operations
 */
// Helper function to handle Supabase errors
const handleDatabaseError = (
  error: PostgrestError | null,
  context: string
): never => {
  if (error) {
    console.error(`Database error in ${context}:`, error);
    throw new DatabaseError(
      error.message || `Database operation failed: ${context}`,
      error
    );
  }
  throw new DatabaseError(`Unexpected error in ${context}`);
};

export const databaseService = {
  /**
   * Get the latest ID from a table
   */
  async getLatestId<T extends TableName>(
    tableName: T,
    idColumn: string = "id"
  ): Promise<number | null> {
    try {

      const { data, error } = await supabase
        .from(tableName)
        .select(idColumn)
        .order(idColumn, { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows found
          return null;
        }
        handleDatabaseError(error, `getLatestId(${tableName}, ${idColumn})`);
      }

      const latestId = data?.[idColumn as keyof typeof data] as number | null;
      return latestId;
    } catch (error) {
      console.error("Error in getLatestId:", error);
      throw error;
    }
  },

  /**
   * Get the next ID (latest + 1)
   */
  async getNextId<T extends TableName>(
    tableName: T,
    idColumn: string = "id"
  ): Promise<number> {
    try {
      const latestId = await this.getLatestId(tableName, idColumn);
      const nextId = (latestId ?? 0) + 1;
      return nextId;
    } catch (error) {
      console.error("Error in getNextId:", error);
      throw error;
    }
  },

  /**
   * Get count of records in a table
   */
  async getRecordCount<T extends TableName>(
    tableName: T,
    filter?: Record<string, unknown>
  ): Promise<number> {
    try {
      let query = supabase
        .from(tableName)
        .select("*", { count: "exact", head: true });

      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query = query.eq(key as any, value as any);
        });
      }

      const { count, error } = await query;

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      return count ?? 0;
    } catch (error) {
      console.error("Error in getRecordCount:", error);
      throw error;
    }
  },

  /**
   * Check if record exists
   */
  async recordExists<T extends TableName>(
    tableName: T,
    filter: Record<string, unknown>
  ): Promise<boolean> {
    try {

      let query = supabase
        .from(tableName)
        .select("id", { count: "exact", head: true });

      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key as any, value as any);
      });

      const { count, error } = await query;

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      const exists = (count ?? 0) > 0;
      return exists;
    } catch (error) {
      console.error("Error in recordExists:", error);
      throw error;
    }
  },

  /**
   * Get max value of a numeric column with optional filtering
   * @param tableName - Name of the table
   * @param columnName - Name of the column to get max value from
   * @param filter - Optional filter object (e.g., { shop_code: 'ABC' })
   */
  async getMaxColumnValue<T extends TableName>(
    tableName: T,
    columnName: string,
    filter?: Record<string, unknown>
  ): Promise<number | null> {
    try {
      let query = supabase
        .from(tableName)
        .select(columnName)
        .order(columnName as any, { ascending: false })
        .limit(1);

      // Apply filters if provided
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query = (query as any).eq(key, value);
        });
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw new Error(handleSupabaseError(error));
      }

      const maxValue = data?.[columnName as keyof typeof data] as number | null;
      return maxValue;
    } catch (error) {
      console.error(`Error in getMaxColumnValue:`, error);
      throw error;
    }
  },

  /**
   * Get min value of a numeric column with optional filtering
   * @param tableName - Name of the table
   * @param columnName - Name of the column to get min value from
   * @param filter - Optional filter object (e.g., { shop_code: 'ABC' })
   */
  async getMinColumnValue<T extends TableName>(
    tableName: T,
    columnName: string,
    filter?: Record<string, unknown>
  ): Promise<number | null> {
    try {

      let query = supabase
        .from(tableName)
        .select(columnName)
        .order(columnName as any, { ascending: true })
        .limit(1);

      // Apply filters if provided
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query = (query as any).eq(key, value);
        });
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw new Error(handleSupabaseError(error));
      }

      const minValue = data?.[columnName as keyof typeof data] as number | null;
      return minValue;
    } catch (error) {
      console.error("Error in getMinColumnValue:", error);
      throw error;
    }
  },

  /**
   * Get distinct values from a column
   */
  async getDistinctValues<T extends TableName>(
    tableName: T,
    columnName: string,
    limit?: number
  ): Promise<unknown[]> {
    try {

      let query = supabase
        .from(tableName)
        .select(columnName)
        .order(columnName as any);

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      const distinctValues =
        data
          ?.map((row) => row[columnName as keyof typeof row])
          .filter((value, index, self) => self.indexOf(value) === index) ?? [];

      return distinctValues;
    } catch (error) {
      console.error("Error in getDistinctValues:", error);
      throw error;
    }
  },

  /**
   * Batch insert records
   */
  async batchInsert<N extends TableName>(
    tableName: N,
    records: Database["public"]["Tables"][N]["Insert"][]
  ): Promise<Database["public"]["Tables"][N]["Row"][]> {
    try {
      if (records.length === 0) {
        return [];
      }



      const { data, error } = await supabase
        .from(tableName)
        .insert(records as unknown as any)
        .select();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      return (data as unknown as Database["public"]["Tables"][N]["Row"][]) ?? [];
    } catch (error) {
      console.error("Error in batchInsert:", error);
      throw error;
    }
  },

  /**
   * Batch update records
   */
  async batchUpdate<N extends TableName>(
    tableName: N,
    records: (Database["public"]["Tables"][N]["Insert"] & { id: number | string })[]
  ): Promise<Database["public"]["Tables"][N]["Row"][]> {
    try {
      if (records.length === 0) {
        return [];
      }

      const updates = records.map((record) => {
        const { id, ...data } = record;
        return { id, ...data };
      });

      const { data, error } = await supabase
        .from(tableName)
        .upsert(updates as any)
        .select();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      return (data as unknown as Database["public"]["Tables"][N]["Row"][]) ?? [];
    } catch (error) {
      console.error("Error in batchUpdate:", error);
      throw error;
    }
  },

  /**
   * Batch delete records
   */
  async batchDelete<T extends TableName>(
    tableName: T,
    ids: number[]
  ): Promise<void> {
    try {
      if (ids.length === 0) {
        return;
      }

      const { error } = await supabase.from(tableName).delete().in("id" as any, ids);

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

    } catch (error) {
      console.error("Error in batchDelete:", error);
      throw error;
    }
  },

  /**
   * Truncate table (delete all records)
   */
  async truncateTable<T extends TableName>(tableName: T): Promise<void> {
    try {

      const { error } = await supabase.from(tableName).delete().gt("id", 0);

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

    } catch (error) {
      console.error("Error in truncateTable:", error);
      throw error;
    }
  }
};

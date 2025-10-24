/**
 * General Database Service
 * Handles common database operations like getting latest IDs, sequences, etc.
 */

import { PostgrestError } from "@supabase/supabase-js";
import { handleSupabaseError, supabase } from "../lib/supabase";
import type { Database } from "../types/supabase";

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
  context: string,
): never => {
  if (error) {
    console.error(`Database error in ${context}:`, error);
    throw new DatabaseError(
      error.message || `Database operation failed: ${context}`,
      error,
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
    idColumn: string = "id",
  ): Promise<number | null> {
    try {
      console.log("🔍 Getting latest ID:", { tableName, idColumn });

      const { data, error } = await supabase
        .from(tableName)
        .select(idColumn)
        .order(idColumn, { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows found
          console.log(`ℹ️ No records found in table ${tableName}`);
          return null;
        }
        handleDatabaseError(error, `getLatestId(${tableName}, ${idColumn})`);
      }

      const latestId = data?.[idColumn as keyof typeof data] as number | null;
      console.log("✅ Latest ID retrieved:", latestId);
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
    idColumn: string = "id",
  ): Promise<number> {
    try {
      const latestId = await this.getLatestId(tableName, idColumn);
      const nextId = (latestId ?? 0) + 1;
      console.log("✅ Next ID calculated:", nextId);
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
    filter?: Record<string, unknown>,
  ): Promise<number> {
    try {
      console.log("🔍 Getting record count:", { tableName, filter });

      let query = supabase
        .from(tableName)
        .select("*", { count: "exact", head: true });

      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query = query.eq(key as any, value);
        });
      }

      const { count, error } = await query;

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      console.log("✅ Record count retrieved:", count);
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
    filter: Record<string, unknown>,
  ): Promise<boolean> {
    try {
      console.log("🔍 Checking if record exists:", { tableName, filter });

      let query = supabase
        .from(tableName)
        .select("id", { count: "exact", head: true });

      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key as any, value);
      });

      const { count, error } = await query;

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      const exists = (count ?? 0) > 0;
      console.log("✅ Record existence check:", exists);
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
    filter?: Record<string, unknown>,
  ): Promise<number | null> {
    try {
      console.log(`🔍 Getting max ${columnName} from ${tableName}`, { filter });

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
      console.log("✅ Max column value retrieved:", maxValue);
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
    filter?: Record<string, unknown>,
  ): Promise<number | null> {
    try {
      console.log(`🔍 Getting min ${columnName} from ${tableName}`, { filter });

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
      console.log("✅ Min column value retrieved:", minValue);
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
    limit?: number,
  ): Promise<unknown[]> {
    try {
      console.log("🔍 Getting distinct values:", {
        tableName,
        columnName,
        limit,
      });

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

      console.log("✅ Distinct values retrieved:", distinctValues.length);
      return distinctValues;
    } catch (error) {
      console.error("Error in getDistinctValues:", error);
      throw error;
    }
  },

  /**
   * Batch insert records
   */
  async batchInsert<T, N extends TableName>(
    tableName: N,
    records: T[],
  ): Promise<T[]> {
    try {
      if (records.length === 0) {
        return [];
      }

      console.log("📝 Batch inserting records:", {
        tableName,
        count: records.length,
      });

      const { data, error } = await supabase
        .from(tableName)
        .insert(records)
        .select();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      console.log("✅ Batch insert completed:", data?.length);
      return (data as T[]) ?? [];
    } catch (error) {
      console.error("Error in batchInsert:", error);
      throw error;
    }
  },

  /**
   * Batch update records
   */
  async batchUpdate<T, N extends TableName>(
    tableName: N,
    records: (T & { id: number | string })[],
  ): Promise<T[]> {
    try {
      if (records.length === 0) {
        return [];
      }

      console.log("✏️ Batch updating records:", {
        tableName,
        count: records.length,
      });

      const updates = records.map((record) => {
        const { id, ...data } = record;
        return { id, ...data };
      });

      const { data, error } = await supabase
        .from(tableName)
        .upsert(updates)
        .select();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      console.log("✅ Batch update completed:", data?.length);
      return (data as T[]) ?? [];
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
    ids: (number | string)[],
  ): Promise<void> {
    try {
      if (ids.length === 0) {
        return;
      }

      console.log("🗑️ Batch deleting records:", {
        tableName,
        count: ids.length,
      });

      const { error } = await supabase.from(tableName).delete().in("id", ids);

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      console.log("✅ Batch delete completed");
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
      console.log("⚠️ Truncating table:", tableName);

      const { error } = await supabase.from(tableName).delete().neq("id", -1);

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      console.log("✅ Table truncated");
    } catch (error) {
      console.error("Error in truncateTable:", error);
      throw error;
    }
  },
};

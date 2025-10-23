// src/lib/supabase.ts

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase.ts";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Helper function to handle Supabase errors
 */
export const handleSupabaseError = (error: unknown): string => {
  if (error && typeof error === "object") {
    if ("message" in error) {
      return (error as { message: string }).message;
    }
    if ("error_description" in error) {
      return (error as { error_description: string }).error_description;
    }
  }
  return "An unexpected error occurred";
};

/**
 * Clean insert data by removing auto-generated fields and converting dates to ISO strings
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cleanInsertData = <T extends Record<string, any>>(
  data: T,
): Record<string, any> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleaned: Record<string, any> = { ...data };

  // Remove auto-generated fields
  delete cleaned.id;
  delete cleaned.created_at;
  delete cleaned.updated_at;

  // Remove undefined values and convert empty strings to null for optional fields
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    } else if (cleaned[key] === "") {
      // Convert empty strings to null for optional fields
      cleaned[key] = null;
    } else if (cleaned[key] instanceof Date) {
      cleaned[key] = cleaned[key].toISOString();
    }
  });

  return cleaned;
};

/**
 * Clean update data by removing id and converting dates to ISO strings
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cleanUpdateData = <T extends Record<string, any>>(
  data: T,
): Record<string, any> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleaned: Record<string, any> = { ...data };

  // Remove id field
  delete cleaned.id;

  // Remove undefined values and convert empty strings to null for optional fields
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    } else if (cleaned[key] === "") {
      // Convert empty strings to null for optional fields
      cleaned[key] = null;
    } else if (key !== "updated_at" && cleaned[key] instanceof Date) {
      cleaned[key] = cleaned[key].toISOString();
    }
  });

  // Always set updated_at to current time
  cleaned.updated_at = new Date().toISOString();

  return cleaned;
};

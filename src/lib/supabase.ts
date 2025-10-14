// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase.ts';

const supabaseUrl = "https://qyxrztqdvskdmaycdaig.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5eHJ6dHFkdnNrZG1heWNkYWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDgxNjksImV4cCI6MjA3NTkyNDE2OX0.QWsEjmfKuFuCrzF6Cy-sG7tPkCUDb4RpMTZir_lVWxA";

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Helper function to handle Supabase errors
 */
export const handleSupabaseError = (error: unknown): string => {
    if (error && typeof error === 'object') {
        if ('message' in error) {
            return (error as { message: string }).message;
        }
        if ('error_description' in error) {
            return (error as { error_description: string }).error_description;
        }
    }
    return 'An unexpected error occurred';
};
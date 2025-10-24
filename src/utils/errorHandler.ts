// src/utils/errorHandler.ts
/**
 * Error Handler Utilities
 * Provides centralized error handling and formatting
 */

import type { PostgrestError } from "@supabase/supabase-js";
import {
  DEFAULT_LANGUAGE,
  ERROR_MESSAGES,
  type ErrorMessageParams,
  type Language,
} from "../constants/error-messages";

/**
 * Get error message by key
 * @param errorKey - Dot-notation path to error message (e.g., 'ORDERS.CREATE_FAILED')
 * @param params - Optional parameters for template strings
 * @param lang - Language code (default: 'vi')
 * @returns Formatted error message
 */
export function getErrorMessage(
  errorKey: string,
  params?: ErrorMessageParams,
  lang: Language = DEFAULT_LANGUAGE,
): string {
  // Navigate through nested object using dot notation
  const keys = errorKey.split(".");
  let message: any = ERROR_MESSAGES;

  for (const key of keys) {
    message = message?.[key];
    if (!message) {
      console.warn(`Error message key not found: ${errorKey}`);
      return ERROR_MESSAGES.GENERAL.UNKNOWN[lang];
    }
  }

  // Get message in selected language
  let finalMessage = message[lang] || message.vi;

  // Replace template parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      finalMessage = finalMessage.replace(`{${key}}`, String(value));
    });
  }

  return finalMessage;
}

/**
 * Format Supabase/PostgreSQL error to user-friendly message
 * @param error - Supabase PostgrestError
 * @param lang - Language code
 * @returns User-friendly error message
 */
export function formatSupabaseError(
  error: PostgrestError | Error | unknown,
  lang: Language = DEFAULT_LANGUAGE,
): string {
  // Handle PostgrestError from Supabase
  if (error && typeof error === "object" && "code" in error) {
    const pgError = error as PostgrestError;

    // Map common PostgreSQL error codes
    switch (pgError.code) {
      case "23505": // unique_violation
        return getErrorMessage("VALIDATION.DUPLICATE", undefined, lang);

      case "23503": // foreign_key_violation
        return lang === "vi"
          ? "Không thể xóa do có dữ liệu liên quan"
          : "Cannot delete due to related data";

      case "23502": // not_null_violation
        return getErrorMessage("VALIDATION.REQUIRED", undefined, lang);

      case "PGRST116": // Not found
        return getErrorMessage("API.NOT_FOUND", undefined, lang);

      case "42501": // insufficient_privilege
        return getErrorMessage("GENERAL.PERMISSION_DENIED", undefined, lang);

      default:
        // Return the error message from Supabase if available
        if (pgError.message) {
          return pgError.message;
        }
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback to unknown error
  return getErrorMessage("GENERAL.UNKNOWN", undefined, lang);
}

/**
 * Format validation error
 * @param field - Field name that failed validation
 * @param rule - Validation rule that failed (e.g., 'REQUIRED', 'MIN_LENGTH')
 * @param params - Optional parameters for the validation rule
 * @param lang - Language code
 * @returns Formatted validation error message
 */
export function formatValidationError(
  field: string,
  rule: string,
  params?: ErrorMessageParams,
  lang: Language = DEFAULT_LANGUAGE,
): string {
  const message = getErrorMessage(`VALIDATION.${rule}`, params, lang);

  // Add field name for clarity
  return `${field}: ${message}`;
}

/**
 * Get entity-specific error message
 * @param entity - Entity name (e.g., 'ORDERS', 'PRODUCTS', 'SHOPS')
 * @param operation - Operation type (e.g., 'FETCH_FAILED', 'CREATE_FAILED')
 * @param lang - Language code
 * @returns Entity-specific error message
 */
export function getEntityError(
  entity: string,
  operation: string,
  lang: Language = DEFAULT_LANGUAGE,
): string {
  return getErrorMessage(`${entity}.${operation}`, undefined, lang);
}

/**
 * Handle and log error with consistent formatting
 * @param error - Error object
 * @param context - Context description (e.g., 'Creating order', 'Fetching products')
 * @param lang - Language code
 * @returns Formatted error message
 */
export function handleError(
  error: unknown,
  context?: string,
  lang: Language = DEFAULT_LANGUAGE,
): string {
  const errorMessage = formatSupabaseError(error, lang);

  // Log to console for debugging
  if (context) {
    console.error(`❌ Error in ${context}:`, error);
  } else {
    console.error("❌ Error:", error);
  }

  return errorMessage;
}

/**
 * Create error toast configuration
 * @param error - Error object or message
 * @param title - Optional custom title
 * @param lang - Language code
 * @returns Error configuration for toast notifications
 */
export function createErrorToast(
  error: unknown,
  title?: string,
  lang: Language = DEFAULT_LANGUAGE,
) {
  const message =
    typeof error === "string" ? error : formatSupabaseError(error, lang);

  return {
    title: title || (lang === "vi" ? "Lỗi" : "Error"),
    message,
    variant: "error" as const,
    duration: 5000,
  };
}

/**
 * Type guard to check if error is a Supabase error
 */
export function isSupabaseError(error: unknown): error is PostgrestError {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error &&
    "details" in error
  );
}

/**
 * Extract error message from various error types
 */
export function extractErrorMessage(
  error: unknown,
  lang: Language = DEFAULT_LANGUAGE,
): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (isSupabaseError(error)) {
    return formatSupabaseError(error, lang);
  }

  return getErrorMessage("GENERAL.UNKNOWN", undefined, lang);
}

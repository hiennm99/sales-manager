// src/hooks/useFormValidation.ts
/**
 * Custom Hook for Form Validation
 * Provides consistent validation logic across forms
 */

import { useCallback, useState } from "react";
import { formatValidationError } from "@/utils/errorHandler.ts";

export interface ValidationRule {
  /** Validation rule name (e.g., 'REQUIRED', 'MIN_LENGTH') */
  rule: string;
  /** Parameters for the rule (e.g., { min: 5 }) */
  params?: Record<string, string | number>;
  /** Custom error message (overrides default) */
  message?: string;
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule[];
}

export interface ValidationErrors {
  [fieldName: string]: string;
}

/**
 * Custom hook for form validation
 * @param validationRules - Object mapping field names to validation rules
 * @returns Object with validation state and methods
 */
export function useFormValidation(validationRules: FieldValidation) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (fieldName: string, value: any): string | undefined => {
      const rules = validationRules[fieldName];
      if (!rules || rules.length === 0) return undefined;

      for (const rule of rules) {
        let isValid = true;
        let errorMessage = rule.message;

        switch (rule.rule) {
          case "REQUIRED":
            isValid = value !== null && value !== undefined && value !== "";
            if (!errorMessage && !isValid) {
              errorMessage = formatValidationError(fieldName, "REQUIRED");
            }
            break;

          case "MIN_LENGTH":
            isValid = String(value).length >= (rule.params?.min || 0);
            if (!errorMessage && !isValid) {
              errorMessage = formatValidationError(
                fieldName,
                "MIN_LENGTH",
                rule.params,
              );
            }
            break;

          case "MAX_LENGTH":
            isValid = String(value).length <= (rule.params?.max || Infinity);
            if (!errorMessage && !isValid) {
              errorMessage = formatValidationError(
                fieldName,
                "MAX_LENGTH",
                rule.params,
              );
            }
            break;

          case "MIN_VALUE":
            isValid = Number(value) >= (rule.params?.min || 0);
            if (!errorMessage && !isValid) {
              errorMessage = formatValidationError(
                fieldName,
                "MIN_VALUE",
                rule.params,
              );
            }
            break;

          case "MAX_VALUE":
            isValid = Number(value) <= (rule.params?.max || Infinity);
            if (!errorMessage && !isValid) {
              errorMessage = formatValidationError(
                fieldName,
                "MAX_VALUE",
                rule.params,
              );
            }
            break;

          case "EMAIL":
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
            if (!errorMessage && !isValid) {
              errorMessage = formatValidationError(fieldName, "INVALID_EMAIL");
            }
            break;

          case "PHONE":
            isValid =
              /^[\d\s\-\+\(\)]+$/.test(String(value)) &&
              String(value).length >= 10;
            if (!errorMessage && !isValid) {
              errorMessage = formatValidationError(fieldName, "INVALID_PHONE");
            }
            break;

          case "URL":
            try {
              new URL(String(value));
              isValid = true;
            } catch {
              isValid = false;
              if (!errorMessage) {
                errorMessage = formatValidationError(fieldName, "INVALID_URL");
              }
            }
            break;

          case "PATTERN":
            if (rule.params?.pattern) {
              const pattern = new RegExp(String(rule.params.pattern));
              isValid = pattern.test(String(value));
              if (!errorMessage && !isValid) {
                errorMessage = `${fieldName}: Invalid format`;
              }
            }
            break;

          case "CUSTOM":
            if (rule.params?.validator) {
              isValid = (rule.params.validator as (value: any) => boolean)(
                value,
              );
              if (!errorMessage && !isValid) {
                errorMessage = `${fieldName}: Validation failed`;
              }
            }
            break;
        }

        if (!isValid) {
          return errorMessage;
        }
      }

      return undefined;
    },
    [validationRules],
  );

  /**
   * Validate all fields
   */
  const validateAll = useCallback(
    (formData: Record<string, any>): ValidationErrors => {
      const newErrors: ValidationErrors = {};

      Object.keys(validationRules).forEach((fieldName) => {
        const error = validateField(fieldName, formData[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
        }
      });

      setErrors(newErrors);
      return newErrors;
    },
    [validationRules, validateField],
  );

  /**
   * Validate single field and update errors
   */
  const validateAndSetError = useCallback(
    (fieldName: string, value: any) => {
      const error = validateField(fieldName, value);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error || "",
      }));
      return !error;
    },
    [validateField],
  );

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Clear specific field error
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Check if form has errors
   */
  const hasErrors = Object.values(errors).some((error) => error);

  return {
    errors,
    validateField,
    validateAll,
    validateAndSetError,
    clearErrors,
    clearFieldError,
    hasErrors,
    setErrors,
  };
}

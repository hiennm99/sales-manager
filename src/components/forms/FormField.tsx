// src/components/forms/FormField.tsx
/**
 * Reusable FormField Component
 * Provides consistent form field styling and error handling
 */

import { FiAlertCircle } from "react-icons/fi";
import React, { type ReactNode } from "react";

export interface FormFieldProps {
  /** Field label */
  label: string;
  /** Field name/id */
  name: string;
  /** Error message if validation failed */
  error?: string;
  /** Whether field is required */
  required?: boolean;
  /** Helper text below the field */
  helperText?: string;
  /** Input element */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether field is disabled */
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  error,
  required = false,
  helperText,
  children,
  className = "",
  disabled = false,
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label
        htmlFor={name}
        className={`block text-sm font-medium ${
          disabled ? "text-gray-400" : "text-gray-700"
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">{children}</div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

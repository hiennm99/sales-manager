// src/components/forms/FormGroup.tsx
/**
 * FormGroup Component
 * Groups related form fields together with consistent spacing
 */

import React, { type ReactNode } from "react";

export interface FormGroupProps {
  /** Group title */
  title?: string;
  /** Group description */
  description?: string;
  /** Form fields */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Show border and background */
  bordered?: boolean;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  title,
  description,
  children,
  className = "",
  bordered = false,
}) => {
  return (
    <div
      className={`
        ${bordered ? "bg-gray-50 border border-gray-200 rounded-lg p-6" : ""}
        ${className}
      `}
    >
      {/* Header */}
      {(title || description) && (
        <div className={bordered ? "mb-6" : "mb-4"}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}

      {/* Fields */}
      <div className="space-y-4">{children}</div>
    </div>
  );
};

// src/components/ui/forms/FormSelect.tsx
/**
 * FormSelect - Unified select component
 * Consolidates OptionBox and Selector functionality
 * Supports multiple modes: view and edit
 */

import React, { useEffect, useRef } from "react";
import { cn } from "../../../lib/utils";
import { theme } from "../../../styles/theme";

export interface FormSelectOption {
  value: string | number;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

interface FormSelectProps {
  label: string;
  value: string | number;
  name: string;
  options: FormSelectOption[];
  mode?: "view" | "edit";
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  icon?: React.ReactNode;
  displayFormat?: (option: FormSelectOption | undefined) => React.ReactNode;
  onChange?: (name: string, value: string | number) => void;
  onBlur?: () => void;
}

/**
 * FormSelect Component
 *
 * Modes:
 * - 'view': Display-only mode, shows selected option as text
 * - 'edit': Editable select dropdown
 */
export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  name,
  options,
  mode = "edit",
  required = false,
  disabled = false,
  error,
  helperText,
  className = "",
  icon,
  displayFormat,
  onChange,
  onBlur,
}) => {
  const originalValueRef = useRef(value);
  const hasChangedRef = useRef(false);

  useEffect(() => {
    originalValueRef.current = value;
    hasChangedRef.current = false;
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      // Try to parse as number if possible
      const parsedValue = isNaN(Number(newValue)) ? newValue : Number(newValue);
      hasChangedRef.current = parsedValue !== originalValueRef.current;
      onChange(name, parsedValue);
    }
  };

  const handleBlur = () => {
    if (hasChangedRef.current && onBlur) {
      onBlur();
    }
    hasChangedRef.current = false;
  };

  const selectedOption = options.find((opt) => opt.value === value);

  // View mode - display only
  if (mode === "view") {
    return (
      <div className={className}>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          {icon && <span className="text-gray-500">{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="text-lg font-semibold text-gray-900 px-3 py-2 flex items-center gap-2">
          {selectedOption?.icon && <span>{selectedOption.icon}</span>}
          {displayFormat && selectedOption
            ? displayFormat(selectedOption)
            : selectedOption?.label || "Chưa chọn"}
          {selectedOption?.color && (
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedOption.color }}
            />
          )}
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className={className}>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
        {icon && <span className="text-gray-500">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={cn(
            theme.components.input.base,
            "appearance-none pr-10",
            error
              ? theme.components.input.error
              : theme.components.input.border,
          )}
        >
          <option value="">-- Chọn --</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {(error || helperText) && (
        <p
          className={cn(
            "mt-1 text-sm flex items-center gap-1",
            error ? "text-red-600" : "text-gray-500",
          )}
        >
          {error && (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {error || helperText}
        </p>
      )}
    </div>
  );
};

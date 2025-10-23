// src/components/common/OptionBox.tsx
/**
 * OptionBox - Reusable select/dropdown component
 * Supports both static display and editable modes
 */

import React, { useEffect, useRef } from "react";

export interface Option {
  value: string | number;
  label: string;
  color?: string; // For colored options (e.g., status)
}

interface OptionBoxProps {
  label: string;
  value: string | number;
  name: string;
  options: Option[];
  editable?: boolean;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  icon?: React.ReactNode;
  displayFormat?: (option: Option | undefined) => React.ReactNode;
  // Support both onChange signatures for flexibility
  onChange?:
    | ((name: string, value: string | number) => void)
    | ((value: string | number) => void);
  onBlur?: () => void;
}

export const OptionBox: React.FC<OptionBoxProps> = ({
  label,
  value,
  name,
  options,
  editable = false,
  required = false,
  disabled = false,
  error,
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

      // Track if value changed
      hasChangedRef.current = parsedValue !== originalValueRef.current;

      // Check function signature by length
      if (onChange.length === 1) {
        // Single parameter callback - just pass value
        (onChange as (value: string | number) => void)(parsedValue);
      } else {
        // Two parameter callback - pass name and value
        (onChange as (name: string, value: string | number) => void)(
          name,
          parsedValue,
        );
      }
    }
  };

  const handleBlur = () => {
    // Only call onBlur if value actually changed
    if (hasChangedRef.current && onBlur) {
      onBlur();
    }
    hasChangedRef.current = false;
  };

  const selectedOption = options.find((opt) => opt.value === value);

  // View mode - display only
  if (!editable) {
    return (
      <div className={className}>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          {icon && <span className="text-gray-500">{icon}</span>}
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="text-lg font-semibold text-gray-900 px-3 py-2">
          {displayFormat && selectedOption
            ? displayFormat(selectedOption)
            : selectedOption?.label || "Chưa chọn"}
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className={className}>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
        {icon && <span className="text-gray-500">{icon}</span>}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"
        } ${error ? "border-red-500" : "border-gray-300"}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

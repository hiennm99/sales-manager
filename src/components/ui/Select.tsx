// src/components/ui/Select.tsx
/**
 * Reusable Select Component
 * Provides consistent select styling across the application
 */

import React from "react";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  /** Select options */
  options: SelectOption[];
  /** Current value */
  value?: string | number;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether select is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Show empty option */
  showEmpty?: boolean;
  /** Empty option label */
  emptyLabel?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  className = "",
  showEmpty = false,
  emptyLabel = "Chọn...",
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={`
        w-full px-3 py-2.5 text-sm
        bg-gray-50 border border-gray-300 rounded-lg
        focus:ring-2 focus:ring-blue-500 focus:border-transparent
        disabled:bg-gray-100 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {showEmpty && <option value="">{placeholder || emptyLabel}</option>}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

/**
 * SelectField - Combination of FormField + Select
 * For easier usage with labels and errors
 */
export interface SelectFieldProps extends SelectProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  error,
  required = false,
  helperText,
  ...selectProps
}) => {
  return (
    <div className="space-y-2">
      {/* Label */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Select */}
      <Select id={name} name={name} {...selectProps} />

      {/* Error Message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

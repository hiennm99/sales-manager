// src/components/ui/DatePicker.tsx
/**
 * Reusable DatePicker Component
 * Provides consistent date input styling across the application
 */

import { FiCalendar } from "react-icons/fi";
import React from "react";

export interface DatePickerProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "type"
  > {
  /** Current date value (YYYY-MM-DD format) */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Minimum date (YYYY-MM-DD format) */
  min?: string;
  /** Maximum date (YYYY-MM-DD format) */
  max?: string;
  /** Whether date picker is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  min,
  max,
  disabled = false,
  className = "",
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        disabled={disabled}
        className={`
          w-full px-3 py-2 pl-10
          border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-colors
          ${className}
        `}
        {...props}
      />
      <FiCalendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
    </div>
  );
};

/**
 * DateField - Combination of FormField + DatePicker
 * For easier usage with labels and errors
 */
export interface DateFieldProps extends DatePickerProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const DateField: React.FC<DateFieldProps> = ({
  label,
  name,
  error,
  required = false,
  helperText,
  ...datePickerProps
}) => {
  return (
    <div className="space-y-2">
      {/* Label */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* DatePicker */}
      <DatePicker id={name} name={name} {...datePickerProps} />

      {/* Error Message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

/**
 * DateRangePickerProps - For date range selection
 */
export interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (value: string) => void;
  onEndDateChange?: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * DateRangePicker - Select date range
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`flex gap-4 ${className}`}>
      {/* Start Date */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Từ ngày
        </label>
        <DatePicker
          value={startDate}
          onChange={onStartDateChange}
          min={minDate}
          max={endDate || maxDate}
          disabled={disabled}
        />
      </div>

      {/* End Date */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Đến ngày
        </label>
        <DatePicker
          value={endDate}
          onChange={onEndDateChange}
          min={startDate || minDate}
          max={maxDate}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

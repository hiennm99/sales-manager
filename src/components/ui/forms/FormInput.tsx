/**
 * FormInput - Unified input component
 * Consolidates Input, InputField, and TextBox functionality
 * Supports multiple modes: view, edit, search, and inline editing
 */

import React, { forwardRef, useEffect, useRef, useState } from "react";
import { PenLine, Search, AlertCircle } from "lucide-react";
import { cn } from "../../../lib/utils";
import { theme } from "../../../styles/theme";

interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  value: string | number | undefined;
  displayValue?: React.ReactNode;
  name: string;
  type?: "text" | "date" | "number" | "email" | "tel" | "textarea" | "search";
  mode?: "view" | "edit" | "search" | "inline";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: string;
  icon?: React.ReactNode;
  onChange?: (name: string, value: string | number) => void;
  onBlur?: () => void;
  rows?: number;
}

/**
 * FormInput Component
 *
 * Modes:
 * - 'view': Display-only mode, shows value as text
 * - 'edit': Always editable input field
 * - 'search': Search input with icon
 * - 'inline': Click to edit, displays as text until clicked
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      value,
      displayValue,
      name,
      type = "text",
      mode = "edit",
      placeholder = "Chưa có thông tin",
      required = false,
      disabled = false,
      error,
      helperText,
      className = "",
      min,
      max,
      step,
      icon,
      onChange,
      onBlur,
      rows = 3,
      ...props
    },
    ref,
  ) => {
    const [isEditing, setIsEditing] = useState(
      mode === "edit" || mode === "search",
    );
    const [localValue, setLocalValue] = useState(value);
    const originalValueRef = useRef(value);
    const hasChangedRef = useRef(false);

    useEffect(() => {
      setLocalValue(value);
      originalValueRef.current = value;
      hasChangedRef.current = false;
    }, [value]);

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      const rawValue = e.target.value;
      const newValue =
        type === "number" && rawValue !== "" ? Number(rawValue) : rawValue;
      setLocalValue(newValue);
      hasChangedRef.current = newValue !== originalValueRef.current;

      if (onChange) {
        onChange(name, newValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && type !== "textarea") {
        e.preventDefault();
        handleBlur();
      }
      if (e.key === "Escape") {
        setLocalValue(originalValueRef.current);
        hasChangedRef.current = false;
        setIsEditing(false);
      }
    };

    const handleBlur = () => {
      setIsEditing(false);
      if (hasChangedRef.current && onBlur) {
        onBlur();
      }
      hasChangedRef.current = false;
    };

    const handleEditClick = () => {
      if (!disabled) {
        setIsEditing(true);
        originalValueRef.current = value;
        hasChangedRef.current = false;
      }
    };

    // Determine final display value
    let finalDisplayValue = displayValue;
    if (!finalDisplayValue) {
      if (value !== undefined && value !== null && value !== "") {
        finalDisplayValue = value.toString();
      } else {
        finalDisplayValue = placeholder;
      }
    }

    // View mode - display only
    if (mode === "view") {
      return (
        <div className={className}>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            {icon && <span className="text-gray-400">{icon}</span>}
            <span>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </label>
          <p className="text-lg font-semibold text-gray-900 px-3 py-2">
            {finalDisplayValue}
          </p>
        </div>
      );
    }

    // Inline mode - click to edit
    if (mode === "inline" && !isEditing) {
      return (
        <div className={className}>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            {icon && <span className="text-gray-400">{icon}</span>}
            <span>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </label>
          <button
            onClick={handleEditClick}
            disabled={disabled}
            className="w-full text-left text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex-1">{finalDisplayValue}</span>
            <PenLine className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      );
    }

    // Edit/Search/Inline edit mode - input field
    const inputClassName = cn(
      theme.components.input.base,
      error ? theme.components.input.error : theme.components.input.border,
      mode === "search" && "pl-10",
      icon && "pl-10",
      className,
    );

    return (
      <div className={className}>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
          {icon && <span className="text-gray-400">{icon}</span>}
          <span>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>

        <div className="relative">
          {(icon || mode === "search") && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {mode === "search" ? (
                <Search className="w-5 h-5" />
              ) : (
                icon
              )}
            </div>
          )}

          {type === "textarea" ? (
            <textarea
              name={name}
              value={localValue ?? ""}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={onBlur ? handleBlur : undefined}
              disabled={disabled}
              placeholder={placeholder}
              className={inputClassName}
              rows={rows}
              autoFocus={isEditing}
            />
          ) : (
            <input
              ref={ref}
              type={type}
              name={name}
              value={localValue ?? ""}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={onBlur ? handleBlur : undefined}
              disabled={disabled}
              placeholder={placeholder}
              className={inputClassName}
              autoFocus={isEditing}
              min={min}
              max={max}
              step={step}
              {...props}
            />
          )}
        </div>

        {(error || helperText) && (
          <p
            className={cn(
              "mt-1 text-sm flex items-center gap-1",
              error ? "text-red-600" : "text-gray-500",
            )}
          >
            {error && (
              <AlertCircle className="w-4 h-4" />
            )}
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";

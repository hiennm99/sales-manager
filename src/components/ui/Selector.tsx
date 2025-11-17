// src/components/ui/Selector.tsx
// components/ui/Selector.tsx

import { cn } from "@lib";
import type { SelectOption } from "@types";
import React, { forwardRef } from "react";

interface SelectorProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export const Selector = forwardRef<HTMLSelectElement, SelectorProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      onChange,
      className,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <select
          ref={ref}
          onChange={handleChange}
          className={cn(
            "w-full px-3 py-2 border rounded-lg transition-colors appearance-none bg-white pr-10",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            error ? "border-red-500" : "border-gray-300",
            className
          )}
          {...props}
        >
          <optgroup label="" style={{ pointerEvents: "none" }}>
            <option disabled hidden>
              {placeholder}
            </option>
          </optgroup>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {(error || helperText) && (
          <p
            className={cn(
              "mt-1 text-sm",
              error ? "text-red-500" : "text-gray-500"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Selector.displayName = "Selector";

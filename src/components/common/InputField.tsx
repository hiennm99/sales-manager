// src/components/common/InputField.tsx
/**
 * InputField - Simple controlled input for forms
 * Unlike TextBox, this always renders an editable input field
 */

import React from "react";

interface InputFieldProps {
  label: string;
  value: string | number | undefined;
  name: string;
  type?: "text" | "date" | "number" | "email" | "tel" | "textarea";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: string;
  onChange?: (name: string, value: string | number) => void;
  icon?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  name,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  error,
  className = "",
  min,
  max,
  step,
  onChange,
  icon,
}) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const rawValue = e.target.value;
    // Convert to number for number inputs, keep as string for others
    const newValue =
      type === "number" && rawValue !== "" ? Number(rawValue) : rawValue;
    if (onChange) {
      onChange(name, newValue);
    }
  };

  const inputClassName = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
    disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"
  } ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`;

  return (
    <div className={className}>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value ?? ""}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClassName}
          rows={3}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClassName}
          min={min}
          max={max}
          step={step}
        />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

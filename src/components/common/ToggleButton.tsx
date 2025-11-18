// src/components/common/ToggleButton.tsx
/**
 * Checkbox - Reusable checkbox component
 * Used for boolean state toggling with visual feedback
 */

import React from "react";
import { FiCheck } from "react-icons/fi";

interface CheckboxProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ToggleButton: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = "md",
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  return (
    <label className={`flex items-center gap-2 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="hidden"
      />
      <div
        className={`
          inline-flex items-center justify-center rounded border-2 transition-colors
          ${sizeClasses[size]}
          ${checked
            ? "bg-blue-600 border-blue-600"
            : "bg-white border-gray-300 hover:border-blue-400"
          }
          ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {checked && (
          <FiCheck className={`${iconSizes[size]} text-white font-bold`} />
        )}
      </div>
      {label && (
        <span className="text-sm text-gray-700 select-none">
          {label}
        </span>
      )}
    </label>
  );
};

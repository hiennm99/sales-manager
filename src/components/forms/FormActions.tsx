// src/components/forms/FormActions.tsx
/**
 * FormActions Component
 * Consistent action buttons for forms (Submit, Cancel, Delete)
 */

import { Check, Trash2, X } from "lucide-react";
import React from "react";

export interface FormActionsProps {
  /** Submit button text */
  submitText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Delete button text */
  deleteText?: string;
  /** Whether form is loading */
  isLoading?: boolean;
  /** Whether to show delete button */
  showDelete?: boolean;
  /** Whether to show cancel button */
  showCancel?: boolean;
  /** Submit button callback */
  onSubmit?: () => void;
  /** Cancel button callback */
  onCancel?: () => void;
  /** Delete button callback */
  onDelete?: () => void;
  /** Whether submit button is disabled */
  submitDisabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Button layout direction */
  layout?: "horizontal" | "vertical";
}

export const FormActions: React.FC<FormActionsProps> = ({
  submitText = "Lưu",
  cancelText = "Hủy",
  deleteText = "Xóa",
  isLoading = false,
  showDelete = false,
  showCancel = true,
  onSubmit,
  onCancel,
  onDelete,
  submitDisabled = false,
  className = "",
  layout = "horizontal",
}) => {
  const containerClass =
    layout === "horizontal" ? "flex items-center gap-3" : "flex flex-col gap-3";

  const buttonClass = layout === "horizontal" ? "flex-1" : "w-full";

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Submit Button */}
      <button
        type="submit"
        onClick={onSubmit}
        disabled={isLoading || submitDisabled}
        className={`
          ${buttonClass}
          px-4 py-2 bg-blue-600 text-white rounded-lg
          hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
          transition-colors font-medium flex items-center justify-center gap-2
        `}
      >
        <Check className="w-4 h-4" />
        {isLoading ? "Đang xử lý..." : submitText}
      </button>

      {/* Cancel Button */}
      {showCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={`
            ${buttonClass}
            px-4 py-2 bg-gray-200 text-gray-700 rounded-lg
            hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-colors font-medium flex items-center justify-center gap-2
          `}
        >
          <X className="w-4 h-4" />
          {cancelText}
        </button>
      )}

      {/* Delete Button */}
      {showDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={isLoading}
          className={`
            ${buttonClass}
            px-4 py-2 bg-red-600 text-white rounded-lg
            hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed
            transition-colors font-medium flex items-center justify-center gap-2
          `}
        >
          <Trash2 className="w-4 h-4" />
          {deleteText}
        </button>
      )}
    </div>
  );
};

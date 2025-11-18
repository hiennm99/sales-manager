// src/features/orders/components/sections/PreviewSection.tsx
/**
 * PreviewSection - Quản lý preview của đơn hàng
 * Displays upload and gallery for order preview pictures
 */

import {
    PreviewPictureUpload
} from "@features/orders";
import { PreviewsList } from "@features/orders/components";
import React, { useState } from "react";
import { FiImage } from "react-icons/fi";

interface PreviewSectionProps {
  orderId: number;
  employeeId?: number;
}

const PreviewIcon = (
  <svg
    className="w-6 h-6 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  orderId,
  employeeId
}) => {
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setError(null);
    // Trigger refresh of PreviewsList
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUploadError = (error: Error) => {
    setError(error.message);
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
          {PreviewIcon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Quản lý Preview
          </h2>
          <p className="text-sm text-gray-600">
            Upload và quản lý các phiên bản preview của đơn hàng
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Upload section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiImage className="w-5 h-5" />
            Upload Preview Picture
          </h3>
          <PreviewPictureUpload
            orderId={orderId}
            employeeId={employeeId}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Preview Versions History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiImage className="w-5 h-5" />
            Preview Versions History
          </h3>
          <PreviewsList orderId={orderId} key={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

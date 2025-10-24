// src/features/orders/components/OrderDetailTabs.tsx

import { FiClock, FiImage } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import type { OrderHistory } from "../../../types/orderHistory";
import type { OrderPreviewPicture } from "../../../types/orderPreview";
import { useEmployeeStore } from "../../employees/store/useEmployeeStore";
import { orderHistoryService } from "../services/orderHistoryService.ts";
import { orderPreviewService } from "../services/orderPreviewService.ts";
import { OrderHistoryTimeline } from "./OrderHistoryTimeline";
import { PreviewPictureGallery } from "./PreviewPictureGallery";
import { PreviewPictureUpload } from "./PreviewPictureUpload";

interface OrderDetailTabsProps {
  orderId: number;
  employeeId?: number;
}

type TabType = "pictures" | "history";

export const OrderDetailTabs: React.FC<OrderDetailTabsProps> = ({
  orderId,
  employeeId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("pictures");
  const [pictures, setPictures] = useState<OrderPreviewPicture[]>([]);
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [isLoadingPictures, setIsLoadingPictures] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { employees } = useEmployeeStore();

  // Load preview pictures
  useEffect(() => {
    const loadPictures = async () => {
      setIsLoadingPictures(true);
      try {
        const data =
          await orderPreviewService.getPreviewPicturesByOrderId(orderId);
        setPictures(data);
      } catch (err) {
        console.error("Failed to load preview pictures:", err);
        setError("Failed to load preview pictures");
      } finally {
        setIsLoadingPictures(false);
      }
    };

    loadPictures();
  }, [orderId]);

  // Load order history
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const data = await orderHistoryService.getOrderHistory(orderId);
        setHistory(data);
      } catch (err) {
        console.error("Failed to load order history:", err);
        setError("Failed to load order history");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [orderId]);

  const handleUploadSuccess = (picture: OrderPreviewPicture) => {
    setPictures([picture, ...pictures]);
    setError(null);
  };

  const handleUploadError = (error: Error) => {
    setError(error.message);
  };

  const handleDeleteSuccess = (pictureId: number) => {
    setPictures(pictures.filter((p) => p.id !== pictureId));
  };

  const handleDeleteError = (error: Error) => {
    setError(error.message);
  };

  // Create employee name map
  const employeeNames = employees.reduce(
    (acc, emp) => {
      acc[emp.id] = emp.name;
      return acc;
    },
    {} as Record<number, string>,
  );

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("pictures")}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
            activeTab === "pictures"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <FiImage className="w-4 h-4" />
          Preview Pictures ({pictures.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
            activeTab === "history"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <FiClock className="w-4 h-4" />
          History ({history.length})
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "pictures" && (
          <div className="space-y-6">
            {/* Upload section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Upload Preview Picture
              </h3>
              <PreviewPictureUpload
                orderId={orderId}
                employeeId={employeeId}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </div>

            {/* Gallery section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Gallery
              </h3>
              {isLoadingPictures ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading pictures...</p>
                </div>
              ) : (
                <PreviewPictureGallery
                  pictures={pictures}
                  onDeleteSuccess={handleDeleteSuccess}
                  onDeleteError={handleDeleteError}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Update History
            </h3>
            {isLoadingHistory ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Loading history...</p>
              </div>
            ) : (
              <OrderHistoryTimeline
                history={history}
                employeeNames={employeeNames}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// src/features/orders/components/PreviewsList.tsx
/**
 * PreviewsList - Hiển thị danh sách các bản preview với feedback từ khách hàng
 * Displays preview versions side-by-side with images and customer feedback
 */

import { ConfirmModal } from "@components";
import { ToggleButton } from "@components/common";
import { orderPreviewService } from "@features/orders";
import type { OrderPreview, OrderPreviewPicture } from "@types";
import React, { useEffect, useState } from "react";
import { FiCheck, FiChevronDown, FiChevronUp, FiEdit2, FiTrash2 } from "react-icons/fi";

interface PreviewsListProps {
  orderId: number;
  onRefresh?: () => void;
}

interface PreviewWithPicture {
  preview: OrderPreview;
  picture?: OrderPreviewPicture;
}

export const PreviewsList: React.FC<PreviewsListProps> = ({
                                                            orderId
                                                          }) => {
  const [previews, setPreviews] = useState<PreviewWithPicture[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFeedback, setEditFeedback] = useState<string>("");
  const [refreshKey] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; previewId: number | null }>({
    isOpen: false,
    previewId: null
  });

  // Load previews
  useEffect(() => {
    const loadPreviews = async () => {
      setIsLoading(true);
      try {
        const data = await orderPreviewService.getPreviewsByOrderId(orderId);

        // Map previews to include picture data directly from preview object
        const previewsWithPictures = data.map((preview) => {
          // Picture data is now embedded in the preview object
          const picture: OrderPreviewPicture = {
            id: preview.id,
            order_id: preview.order_id,
            picture_url: preview.picture_url,
            picture_name: preview.picture_name,
            file_size: preview.file_size,
            mime_type: preview.mime_type,
            uploaded_by_employee_id: preview.uploaded_by_employee_id,
            description: null,
            created_at: preview.created_at,
            updated_at: preview.updated_at
          };
          return { preview, picture };
        });

        setPreviews(previewsWithPictures);

        // Auto-expand the latest preview (first one)
        if (previewsWithPictures.length > 0) {
          setExpandedId(previewsWithPictures[0].preview.id);
        }

        setError(null);
      } catch (err) {
        console.error("Failed to load previews:", err);
        setError("Failed to load previews");
      } finally {
        setIsLoading(false);
      }
    };

    loadPreviews();
  }, [orderId, refreshKey]);

  const handleConfirm = async (previewId: number) => {
    try {
      // Find current preview to toggle the state
      const currentPreview = previews.find((item) => item.preview.id === previewId)?.preview;
      if (!currentPreview) return;

      const newConfirmedState = !currentPreview.customer_confirmed;

      const updated = await orderPreviewService.updatePreview(previewId, {
        customerConfirmed: newConfirmedState,
        confirmedAt: newConfirmedState ? new Date().toISOString() : null
      });

      setPreviews(
        previews.map((item) =>
          item.preview.id === previewId
            ? { ...item, preview: updated }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to update confirmation:", err);
      setError("Failed to update confirmation");
    }
  };

  const handleUpdateFeedback = async (previewId: number) => {
    try {
      const updated = await orderPreviewService.updatePreview(previewId, {
        customerFeedback: editFeedback
      });

      setPreviews(
        previews.map((item) =>
          item.preview.id === previewId
            ? { ...item, preview: updated }
            : item
        )
      );

      setEditingId(null);
      setEditFeedback("");
    } catch (err) {
      console.error("Failed to update feedback:", err);
      setError("Failed to update feedback");
    }
  };

  const handleDeleteClick = (previewId: number) => {
    setDeleteConfirm({ isOpen: true, previewId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.previewId) return;

    try {
      await orderPreviewService.deletePreview(deleteConfirm.previewId);
      setPreviews(previews.filter((item) => item.preview.id !== deleteConfirm.previewId));
      setDeleteConfirm({ isOpen: false, previewId: null });
    } catch (err) {
      console.error("Failed to delete preview:", err);
      setError("Failed to delete preview");
      setDeleteConfirm({ isOpen: false, previewId: null });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Loading previews...</p>
      </div>
    );
  }

  if (previews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No preview versions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {previews.map((item) => {
        const { preview, picture } = item;
        const isExpanded = expandedId === preview.id;
        const isEditing = editingId === preview.id;

        return (
          <div
            key={preview.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div
              className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100"
              onClick={() => setExpandedId(isExpanded ? null : preview.id)}
            >
              <div className="flex items-center gap-3 flex-1">
                <button
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(isExpanded ? null : preview.id);
                  }}
                >
                  {isExpanded ? (
                    <FiChevronUp className="w-5 h-5" />
                  ) : (
                    <FiChevronDown className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">
                      Version {preview.version_number}
                    </h4>
                    {preview.customer_confirmed && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <FiCheck className="w-3 h-3" />
                        Confirmed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Created: {new Date(preview.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                <ToggleButton
                  checked={preview.customer_confirmed}
                  onChange={() => handleConfirm(preview.id)}
                  label="Confirmed"
                  size="md"
                />
                <button
                  onClick={() => handleDeleteClick(preview.id)}
                  className="p-2 hover:bg-red-100 rounded transition-colors text-red-600"
                  title="Delete this preview"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Image Section - Left */}
                  <div className="lg:w-1/3 flex-shrink-0">
                    {picture ? (
                      <div className="space-y-2">
                        <img
                          src={picture.picture_url}
                          alt={picture.picture_name}
                          className="w-full h-80 object-cover rounded-lg border border-gray-200 shadow-sm"
                        />
                        <p className="text-xs text-gray-600 truncate">
                          {picture.picture_name}
                        </p>
                      </div>
                    ) : (
                      <div
                        className="w-full h-80 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <p className="text-sm text-gray-500">No image</p>
                      </div>
                    )}
                  </div>

                  {/* Feedback Section - Right */}
                  <div className="lg:w-2/3 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Feedback
                      </label>
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editFeedback}
                            onChange={(e) => setEditFeedback(e.target.value)}
                            placeholder="Enter customer feedback..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleUpdateFeedback(preview.id)
                              }
                              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditFeedback("");
                              }}
                              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-3 min-h-24 border border-gray-200">
                          {preview.customer_feedback ? (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {preview.customer_feedback}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              No feedback yet
                            </p>
                          )}
                          <button
                            onClick={() => {
                              setEditingId(preview.id);
                              setEditFeedback(
                                preview.customer_feedback || ""
                              );
                            }}
                            className="mt-2 inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <FiEdit2 className="w-3 h-3" />
                            Edit
                          </button>
                        </div>
                      )}
                    </div>

                    {preview.internal_notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Internal Notes
                        </label>
                        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {preview.internal_notes}
                          </p>
                        </div>
                      </div>
                    )}

                    {preview.confirmed_at && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-green-700">
                          ✓ Confirmed on{" "}
                          {new Date(preview.confirmed_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Xóa bản preview"
        message="Bạn có chắc chắn muốn xóa bản preview này không? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, previewId: null })}
      />
    </div>
  );
};

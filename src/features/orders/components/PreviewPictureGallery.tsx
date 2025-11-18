// src/features/orders/components/PreviewPictureGallery.tsx

import { ConfirmModal } from "@components/modals";
import { orderPreviewService } from "@features/orders";
import type { OrderPreviewPicture } from "@types";
import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiDownload, FiTrash2, FiX } from "react-icons/fi";

interface PreviewPictureGalleryProps {
  pictures: OrderPreviewPicture[];
  onDeleteSuccess?: (pictureId: number) => void;
  onDeleteError?: (error: Error) => void;
}

export const PreviewPictureGallery: React.FC<PreviewPictureGalleryProps> = ({
                                                                              pictures,
                                                                              onDeleteSuccess,
                                                                              onDeleteError
                                                                            }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; pictureId: number | null }>({
    isOpen: false,
    pictureId: null
  });

  if (pictures.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No preview pictures yet</p>
      </div>
    );
  }

  const handleDownload = async (picture: OrderPreviewPicture) => {
    try {
      const blob = await orderPreviewService.downloadPreviewPicture(
        picture.picture_url
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = picture.picture_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download picture:", error);
    }
  };

  const handleDeleteClick = (pictureId: number) => {
    setDeleteConfirm({ isOpen: true, pictureId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.pictureId) return;

    setIsDeleting(true);
    try {
      await orderPreviewService.deletePreviewPicture(deleteConfirm.pictureId);
      onDeleteSuccess?.(deleteConfirm.pictureId);
      if (selectedIndex !== null) {
        setSelectedIndex(null);
      }
      setDeleteConfirm({ isOpen: false, pictureId: null });
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error("Unknown error");
      onDeleteError?.(err);
      setDeleteConfirm({ isOpen: false, pictureId: null });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < pictures.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const selectedPicture =
    selectedIndex !== null ? pictures[selectedIndex] : null;

  return (
    <div className="w-full">
      {/* Gallery grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {pictures.map((picture, index) => (
          <div
            key={picture.id}
            className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100"
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={picture.picture_url}
              alt={picture.picture_name}
              className="w-full h-32 object-cover group-hover:opacity-75 transition-opacity"
            />
            <div
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <FiDownload className="w-5 h-5 text-white" />
              <FiTrash2 className="w-5 h-5 text-white" />
            </div>
            <div
              className="absolute top-1 right-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {index + 1}/{pictures.length}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox modal */}
      {selectedPicture && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-medium text-gray-900">
                  {selectedPicture.picture_name}
                </h3>
                {selectedPicture.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedPicture.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Uploaded:{" "}
                  {new Date(selectedPicture.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedIndex(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center overflow-auto bg-gray-50 p-4">
              <img
                src={selectedPicture.picture_url}
                alt={selectedPicture.picture_name}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Footer with controls */}
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                {selectedIndex !== null &&
                  `${selectedIndex + 1} / ${pictures.length}`}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={selectedIndex === 0}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={handleNext}
                  disabled={selectedIndex === pictures.length - 1}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>

                <div className="w-px h-6 bg-gray-300" />

                <button
                  onClick={() => handleDownload(selectedPicture)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <FiDownload className="w-4 h-4" />
                  Download
                </button>

                <button
                  onClick={() =>
                    selectedPicture.id && handleDeleteClick(selectedPicture.id)
                  }
                  disabled={isDeleting}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2 text-sm text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Xóa ảnh preview"
        message="Bạn có chắc chắn muốn xóa ảnh này không? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, pictureId: null })}
      />
    </div>
  );
};

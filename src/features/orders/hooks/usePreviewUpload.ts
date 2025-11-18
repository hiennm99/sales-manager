// src/features/orders/hooks/usePreviewUpload.ts
/**
 * Hook for uploading preview pictures and creating order_previews records
 */

import { orderPreviewService } from "@features/orders";
import type { OrderPreview } from "@types";
import { useState } from "react";

interface UsePreviewUploadOptions {
  orderId: number;
  employeeId?: number;
  onSuccess?: (preview: OrderPreview) => void;
  onError?: (error: Error) => void;
}

export const usePreviewUpload = ({
  orderId,
  employeeId,
  onSuccess,
  onError
}: UsePreviewUploadOptions) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPreview = async (
    file: File,
    description?: string
  ): Promise<OrderPreview | null> => {
    try {
      setIsUploading(true);
      setError(null);

      // Validate file
      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file");
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB");
      }

      // Convert image to WebP with optimization
      const { imageService } = await import("@services");
      const optimizedImage = await imageService.convertToWebP(file, {
        quality: 0.85,
        maxWidth: 1920,
        maxHeight: 1920
      });

      // Upload to storage and create preview record
      const { supabase } = await import("@lib");

      // Generate unique file path
      const timestamp = Date.now();
      const baseFileName = file.name.replace(/\.[^/.]+$/, "");
      const fileName = `${orderId}_${timestamp}_${baseFileName}.webp`;
      const filePath = `previews/${orderId}/${fileName}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("orders")
        .upload(filePath, optimizedImage, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      if (!uploadData) {
        throw new Error("File upload returned no data");
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("orders")
        .getPublicUrl(filePath);

      const pictureUrl = urlData.publicUrl;

      // Create preview record in order_previews table
      const preview = await orderPreviewService.createPreview(
        {
          orderId,
          pictureUrl,
          pictureName: file.name,
          fileSize: optimizedImage.size,
          mimeType: "image/webp",
          customerFeedback: description || undefined
        },
        employeeId
      );

      onSuccess?.(preview);
      return preview;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to upload preview";
      setError(errorMsg);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadPreview,
    isUploading,
    error,
    setError
  };
};

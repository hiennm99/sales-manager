// src/types/orderPreview.ts

import type { BaseEntity } from "./common.ts";

export interface OrderPreviewPicture extends BaseEntity {
  order_id: number;
  picture_url: string;
  picture_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by_employee_id: number | null;
  description: string | null;
}

export interface OrderPreviewPictureFormData {
  orderId: number;
  pictureUrl: string;
  pictureName: string;
  fileSize?: number;
  mimeType?: string;
  uploadedByEmployeeId?: number;
  description?: string;
}

// Helper function to convert OrderPreviewPicture to OrderPreviewPictureFormData
export const previewPictureToFormData = (
  picture: OrderPreviewPicture
): OrderPreviewPictureFormData => {
  return {
    orderId: picture.order_id,
    pictureUrl: picture.picture_url,
    pictureName: picture.picture_name,
    fileSize: picture.file_size || undefined,
    mimeType: picture.mime_type || undefined,
    uploadedByEmployeeId: picture.uploaded_by_employee_id || undefined,
    description: picture.description || undefined
  };
};

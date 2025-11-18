// src/types/orderPreview.ts

import type { BaseEntity } from "./common.ts";

export interface OrderPreview extends BaseEntity {
  order_id: number;
  
  // Picture/Image information
  picture_url: string;
  picture_name: string;
  file_size: number | null;
  mime_type: string | null;
  
  // Customer feedback and confirmation
  customer_feedback: string | null;
  customer_confirmed: boolean;
  confirmed_at: string | null;
  
  // Internal tracking
  internal_notes: string | null;
  version_number: number;
  uploaded_by_employee_id: number | null;
  created_by_employee_id: number | null;
}

export interface OrderPreviewPicture extends BaseEntity {
  order_id: number;
  picture_url: string;
  picture_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by_employee_id: number | null;
  description: string | null;
}

export interface OrderPreviewFormData {
  orderId: number;
  
  // Picture/Image information
  pictureUrl: string;
  pictureName: string;
  fileSize?: number | null;
  mimeType?: string | null;
  
  // Customer feedback and confirmation
  customerFeedback?: string | null;
  customerConfirmed?: boolean;
  confirmedAt?: string | null;
  
  // Internal tracking
  internalNotes?: string | null;
  versionNumber?: number;
  uploadedByEmployeeId?: number | null;
  createdByEmployeeId?: number | null;
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

// Helper function to convert OrderPreview to OrderPreviewFormData
export const previewToFormData = (
  preview: OrderPreview
): OrderPreviewFormData => {
  return {
    orderId: preview.order_id,
    pictureUrl: preview.picture_url,
    pictureName: preview.picture_name,
    fileSize: preview.file_size || undefined,
    mimeType: preview.mime_type || undefined,
    customerFeedback: preview.customer_feedback || undefined,
    customerConfirmed: preview.customer_confirmed,
    confirmedAt: preview.confirmed_at || undefined,
    internalNotes: preview.internal_notes || undefined,
    versionNumber: preview.version_number,
    uploadedByEmployeeId: preview.uploaded_by_employee_id || undefined,
    createdByEmployeeId: preview.created_by_employee_id || undefined
  };
};

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

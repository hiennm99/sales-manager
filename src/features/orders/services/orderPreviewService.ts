// src/features/orders/services/orderPreviewService.ts
import { handleSupabaseError, supabase } from "../../../lib/supabase";
import { databaseService, imageService } from "../../../services";
import type {
  OrderPreviewPicture,
  OrderPreviewPictureFormData,
} from "../../../types/orderPreview";
import type { Database } from "../../../types/supabase.ts";
import {
  trackPictureDelete,
  trackPictureUpload,
} from "../utils/orderHistoryHelper";
import { orderHistoryService } from "./orderHistoryService.ts";

/**
 * Storage configuration
 */
const STORAGE_BUCKET = "orders";
const IMAGE_STORAGE_PATH = "previews";

/**
 * Helper function to map database row to OrderPreviewPicture type
 */
const mapToPreviewPictureRow = (
  data: Database["public"]["Tables"]["order_preview_pictures"]["Row"],
): OrderPreviewPicture => {
  return {
    id: data.id,
    order_id: data.order_id,
    picture_url: data.picture_url,
    picture_name: data.picture_name,
    file_size: data.file_size,
    mime_type: data.mime_type,
    uploaded_by_employee_id: data.uploaded_by_employee_id,
    description: data.description,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  };
};

/**
 * Order Preview Picture Supabase Service
 * Handles all database operations related to order preview pictures
 */
export const orderPreviewService = {
  /**
   * Upload a preview picture to Supabase storage and create database record
   */
  async uploadPreviewPicture(
    orderId: number,
    file: File,
    employeeId?: number,
    description?: string,
  ): Promise<OrderPreviewPicture> {
    try {
      // Convert image to WebP with optimization
      const optimizedImage = await imageService.convertToWebP(file, {
        quality: 0.85, // Higher quality for preview pictures
        maxWidth: 1920, // Full HD max width
        maxHeight: 1920, // Full HD max height
      });

      // Generate unique file path with .webp extension
      const timestamp = Date.now();
      const baseFileName = file.name.replace(/\.[^/.]+$/, ""); // Remove original extension
      const fileName = `${orderId}_${timestamp}_${baseFileName}.webp`;
      const filePath = `${IMAGE_STORAGE_PATH}/${orderId}/${fileName}`;

      // Upload optimized file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, optimizedImage, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading file to storage:", uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      if (!uploadData) {
        throw new Error("File upload returned no data");
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      const pictureUrl = urlData.publicUrl;

      // Create database record
      const insertData = {
        order_id: orderId,
        picture_url: pictureUrl,
        picture_name: file.name, // Keep original name for display
        file_size: optimizedImage.size, // Store optimized size
        mime_type: "image/webp", // Always WebP after conversion
        uploaded_by_employee_id: employeeId || null,
        description: description || null,
      };

      const { data: recordData, error: recordError } = await supabase
        .from("order_preview_pictures")
        .insert(insertData)
        .select()
        .single();

      if (recordError) {
        console.error("Error creating preview picture record:", recordError);
        // Attempt to delete uploaded file on failure
        await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
        throw new Error(handleSupabaseError(recordError));
      }

      if (!recordData)
        throw new Error("Failed to create preview picture record");

      // Track picture upload in order history
      try {
        await trackPictureUpload(orderId, file.name, employeeId);
      } catch (error) {
        console.error("Failed to track picture upload:", error);
        // Don't fail the upload if history tracking fails
      }

      return mapToPreviewPictureRow(recordData);
    } catch (error) {
      console.error("Error uploading preview picture:", error);
      throw error;
    }
  },

  /**
   * Get all preview pictures for an order
   */
  async getPreviewPicturesByOrderId(
    orderId: number,
  ): Promise<OrderPreviewPicture[]> {
    const { data, error } = await supabase
      .from("order_preview_pictures")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching preview pictures:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data || data.length === 0) return [];

    return data.map(mapToPreviewPictureRow);
  },

  /**
   * Get a single preview picture by ID
   */
  async getPreviewPictureById(id: number): Promise<OrderPreviewPicture> {
    const { data, error } = await supabase
      .from("order_preview_pictures")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching preview picture:", error);
      if (error.code === "PGRST116") {
        throw new Error("Preview picture not found");
      }
      throw new Error(handleSupabaseError(error));
    }

    if (!data) throw new Error("Preview picture not found");

    return mapToPreviewPictureRow(data);
  },

  /**
   * Update preview picture metadata
   */
  async updatePreviewPicture(
    id: number,
    updates: Partial<OrderPreviewPictureFormData>,
  ): Promise<OrderPreviewPicture> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.description !== undefined)
      updateData.description = updates.description;

    const { data, error } = await supabase
      .from("order_preview_pictures")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating preview picture:", error);
      throw new Error(handleSupabaseError(error));
    }

    if (!data) throw new Error("Failed to update preview picture");

    return mapToPreviewPictureRow(data);
  },

  /**
   * Delete a preview picture
   */
  async deletePreviewPicture(id: number, employeeId?: number): Promise<void> {
    // First get the picture to retrieve the file path
    const picture = await this.getPreviewPictureById(id);

    // Extract file path from URL
    const urlParts = picture.picture_url.split("/");
    const filePath = urlParts.slice(-2).join("/");

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (storageError) {
      console.error("Error deleting file from storage:", storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete database record
    const { error: dbError } = await supabase
      .from("order_preview_pictures")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("Error deleting preview picture record:", dbError);
      throw new Error(handleSupabaseError(dbError));
    }

    // Track picture deletion in order history
    try {
      await trackPictureDelete(
        picture.order_id,
        picture.picture_name,
        employeeId,
      );
    } catch (error) {
      console.error("Failed to track picture deletion:", error);
      // Don't fail the deletion if history tracking fails
    }
  },

  /**
   * Bulk delete preview pictures for an order
   */
  async deletePreviewPicturesByOrderId(
    orderId: number,
    employeeId?: number,
  ): Promise<void> {
    const pictures = await this.getPreviewPicturesByOrderId(orderId);

    // Delete all files from storage
    const filePaths = pictures.map((pic) => {
      const urlParts = pic.picture_url.split("/");
      return urlParts.slice(-2).join("/");
    });

    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(filePaths);

      if (storageError) {
        console.error("Error deleting files from storage:", storageError);
        // Continue with database deletion
      }
    }

    // Delete all database records
    const { error: dbError } = await supabase
      .from("order_preview_pictures")
      .delete()
      .eq("order_id", orderId);

    if (dbError) {
      console.error("Error deleting preview pictures:", dbError);
      throw new Error(handleSupabaseError(dbError));
    }

    // Track bulk picture deletion in order history
    if (pictures.length > 0) {
      try {
        await orderHistoryService.createHistoryRecord(orderId, "updated", {
          fieldName: "Preview Pictures",
          description: `Bulk deleted ${pictures.length} preview pictures`,
          changedByEmployeeId: employeeId,
        });
      } catch (error) {
        console.error("Failed to track bulk picture deletion:", error);
        // Don't fail the deletion if history tracking fails
      }
    }
  },

  /**
   * Download a preview picture (returns blob)
   */
  async downloadPreviewPicture(pictureUrl: string): Promise<Blob> {
    const response = await fetch(pictureUrl);
    if (!response.ok) {
      throw new Error(`Failed to download picture: ${response.statusText}`);
    }
    return response.blob();
  },

  /**
   * Get total preview picture count for an order
   */
  async getPreviewPictureCount(orderId?: number): Promise<number> {
    const filter = orderId ? { order_id: orderId } : undefined;
    return databaseService.getRecordCount("order_preview_pictures", filter);
  },

  /**
   * Check if preview picture exists
   */
  async previewPictureExists(id: number): Promise<boolean> {
    return databaseService.recordExists("order_preview_pictures", { id });
  },

  /**
   * Get latest preview picture ID
   */
  async getLatestPreviewPictureId(): Promise<number | null> {
    return databaseService.getLatestId("order_preview_pictures", "id");
  },

  /**
   * Bulk delete preview pictures by IDs
   */
  async bulkDeletePreviewPictures(
    ids: number[],
    employeeId?: number,
  ): Promise<void> {
    if (!ids || ids.length === 0) return;

    // Get all pictures to retrieve file paths
    const pictures = await Promise.all(
      ids.map((id) => this.getPreviewPictureById(id).catch(() => null)),
    );

    // Delete files from storage
    const filePaths = pictures
      .filter((pic): pic is OrderPreviewPicture => pic !== null)
      .map((pic) => {
        const urlParts = pic.picture_url.split("/");
        return urlParts.slice(-2).join("/");
      });

    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(filePaths);

      if (storageError) {
        console.error("Error deleting files from storage:", storageError);
        // Continue with database deletion
      }
    }

    // Delete database records using databaseService
    await databaseService.batchDelete("order_preview_pictures", ids);

    // Track bulk picture deletion in order history
    const validPictures = pictures.filter(
      (pic): pic is OrderPreviewPicture => pic !== null,
    );
    if (validPictures.length > 0) {
      // Group by order_id to create separate history entries for each order
      const picturesByOrder = validPictures.reduce(
        (acc, pic) => {
          if (!acc[pic.order_id]) {
            acc[pic.order_id] = [];
          }
          acc[pic.order_id].push(pic);
          return acc;
        },
        {} as Record<number, OrderPreviewPicture[]>,
      );

      // Create history entries for each order
      for (const [orderId, orderPictures] of Object.entries(picturesByOrder)) {
        try {
          await orderHistoryService.createHistoryRecord(
            parseInt(orderId),
            "updated",
            {
              fieldName: "Preview Pictures",
              description: `Bulk deleted ${orderPictures.length} preview pictures: ${orderPictures.map((p) => p.picture_name).join(", ")}`,
              changedByEmployeeId: employeeId,
            },
          );
        } catch (error) {
          console.error(
            "Failed to track bulk picture deletion for order",
            orderId,
            error,
          );
          // Don't fail the deletion if history tracking fails
        }
      }
    }
  },
};

// src/services/storageService.ts
/**
 * General Storage Service
 * Handles all file upload, download, and storage operations
 */

import { CACHE } from "@constants";
import { supabase } from "@lib";

export interface UploadOptions {
  bucket: string;
  path: string;
  cacheControl?: string;
  upsert?: boolean;
}

export interface UploadResult {
  path: string;
  publicUrl: string;
  size: number;
  mimeType: string;
}

/**
 * Storage Service for file operations
 */
export const storageService = {
  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(file: File, options: UploadOptions): Promise<UploadResult> {
    try {
      const {
        bucket,
        path,
        cacheControl = CACHE.STORAGE_CACHE_CONTROL,
        upsert = false
      } = options;

      console.log("📤 Uploading file:", {
        bucket,
        path,
        size: file.size,
        type: file.type
      });

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl,
          upsert
        });

      if (uploadError) {
        console.error("❌ Error uploading file:", uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      if (!uploadData) {
        throw new Error("File upload returned no data");
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      console.log("✅ File uploaded successfully:", {
        publicUrl: urlData.publicUrl
      });

      return {
        path: uploadData.path,
        publicUrl: urlData.publicUrl,
        size: file.size,
        mimeType: file.type || "application/octet-stream"
      };
    } catch (error) {
      console.error("Error in uploadFile:", error);
      throw error;
    }
  },

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    options: Omit<UploadOptions, "path"> & {
      pathGenerator: (file: File, index: number) => string;
    }
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = options.pathGenerator(file, i);

      try {
        const result = await this.uploadFile(file, {
          bucket: options.bucket,
          path,
          cacheControl: options.cacheControl,
          upsert: options.upsert
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload file ${i}:`, error);
        throw error;
      }
    }

    return results;
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    try {
      console.log("🗑️ Deleting file:", { bucket, path });

      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        console.error("❌ Error deleting file:", error);
        throw new Error(`Failed to delete file: ${error.message}`);
      }

      console.log("✅ File deleted successfully");
    } catch (error) {
      console.error("Error in deleteFile:", error);
      throw error;
    }
  },

  /**
   * Delete multiple files
   */
  async deleteMultipleFiles(bucket: string, paths: string[]): Promise<void> {
    if (paths.length === 0) return;

    try {
      console.log("🗑️ Deleting multiple files:", {
        bucket,
        count: paths.length
      });

      const { error } = await supabase.storage.from(bucket).remove(paths);

      if (error) {
        console.error("❌ Error deleting files:", error);
        throw new Error(`Failed to delete files: ${error.message}`);
      }

      console.log("✅ Files deleted successfully");
    } catch (error) {
      console.error("Error in deleteMultipleFiles:", error);
      throw error;
    }
  },

  /**
   * Download a file as blob
   */
  async downloadFile(publicUrl: string): Promise<Blob> {
    try {
      console.log("📥 Downloading file:", { url: publicUrl });

      const response = await fetch(publicUrl);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log("✅ File downloaded successfully");
      return blob;
    } catch (error) {
      console.error("Error in downloadFile:", error);
      throw error;
    }
  },

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Check if file exists in storage
   */
  async fileExists(bucket: string, path: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.split("/").slice(0, -1).join("/"));

      if (error) {
        console.error("Error checking file existence:", error);
        return false;
      }

      const fileName = path.split("/").pop();
      return data?.some((file) => file.name === fileName) ?? false;
    } catch (error) {
      console.error("Error in fileExists:", error);
      return false;
    }
  }
};

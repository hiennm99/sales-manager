// src/services/imageService.ts
/**
 * General Image Service
 * Handles image processing, conversion, and validation
 */

import { ACCEPTED_FILE_TYPES, FILE_SIZE_LIMITS, IMAGE_OPTIMIZATION } from "@constants";

export interface ImageValidationOptions {
  maxSize?: number; // in bytes, default 10MB
  allowedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
}

export interface ImageConversionOptions {
  quality?: number; // 0-1, default 0.8
  maxWidth?: number;
  maxHeight?: number;
  format?: "webp" | "jpeg" | "png";
}

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Image Service for image processing and validation
 */
export const imageService = {
  /**
   * Validate image file
   */
  validateImage(
    file: File,
    options: ImageValidationOptions = {}
  ): { valid: boolean; error?: string } {
    const {
      maxSize = FILE_SIZE_LIMITS.IMAGE_MAX_SIZE,
      allowedTypes = ACCEPTED_FILE_TYPES.IMAGES
    } = options;

    // Check file type
    if (!allowedTypes.includes(file.type as any)) {
      return {
        valid: false,
        error: `Invalid image type. Allowed types: ${allowedTypes.join(", ")}`
      };
    }

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum of ${(maxSize / 1024 / 1024).toFixed(2)}MB`
      };
    }

    return { valid: true };
  },

  /**
   * Get image dimensions
   */
  async getImageDimensions(file: File): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height
          });
        };
        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };
        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsDataURL(file);
    });
  },

  /**
   * Convert image to WebP format
   */
  async convertToWebP(
    file: File,
    options: ImageConversionOptions = {}
  ): Promise<File> {
    const {
      quality = IMAGE_OPTIMIZATION.QUALITY,
      maxWidth = IMAGE_OPTIMIZATION.MAX_WIDTH,
      maxHeight = IMAGE_OPTIMIZATION.MAX_HEIGHT
    } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            // Calculate dimensions if max dimensions provided
            let width = img.width;
            let height = img.height;

            if (maxWidth && width > maxWidth) {
              const ratio = maxWidth / width;
              width = maxWidth;
              height = Math.round(height * ratio);
            }

            if (maxHeight && height > maxHeight) {
              const ratio = maxHeight / height;
              height = maxHeight;
              width = Math.round(width * ratio);
            }

            // Create canvas and convert
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              throw new Error("Failed to get canvas context");
            }

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Failed to convert image"));
                  return;
                }

                const webpFile = new File(
                  [blob],
                  file.name.replace(/\.[^/.]+$/, ".webp"),
                  {
                    type: "image/webp",
                    lastModified: Date.now()
                  }
                );


                resolve(webpFile);
              },
              "image/webp",
              quality
            );
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsDataURL(file);
    });
  },

  /**
   * Convert image to specified format
   */
  async convertImage(
    file: File,
    options: ImageConversionOptions = {}
  ): Promise<File> {
    const {
      quality = IMAGE_OPTIMIZATION.QUALITY,
      maxWidth = IMAGE_OPTIMIZATION.MAX_WIDTH,
      maxHeight = IMAGE_OPTIMIZATION.MAX_HEIGHT,
      format = IMAGE_OPTIMIZATION.FORMAT
    } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            // Calculate dimensions
            let width = img.width;
            let height = img.height;

            if (maxWidth && width > maxWidth) {
              const ratio = maxWidth / width;
              width = maxWidth;
              height = Math.round(height * ratio);
            }

            if (maxHeight && height > maxHeight) {
              const ratio = maxHeight / height;
              height = maxHeight;
              width = Math.round(width * ratio);
            }

            // Create canvas
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              throw new Error("Failed to get canvas context");
            }

            ctx.drawImage(img, 0, 0, width, height);

            const mimeTypeMap: Record<string, "image/jpeg" | "image/png" | "image/webp"> = {
              jpeg: "image/jpeg",
              png: "image/png",
              webp: "image/webp"
            };

            const mimeType = mimeTypeMap[format] || "image/jpeg";
            const extension = format === "jpeg" ? "jpg" : format;

            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Failed to convert image"));
                  return;
                }

                const convertedFile = new File(
                  [blob],
                  file.name.replace(/\.[^/.]+$/, `.${extension}`),
                  {
                    type: mimeType,
                    lastModified: Date.now()
                  }
                );
                resolve(convertedFile);
              },
              mimeType,
              quality
            );
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsDataURL(file);
    });
  },

  /**
   * Resize image to fit within max dimensions while maintaining aspect ratio
   */
  async resizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number
  ): Promise<File> {
    return this.convertImage(file, {
      maxWidth,
      maxHeight,
      format: file.type === "image/webp" ? "webp" : "jpeg"
    });
  },

  /**
   * Create thumbnail from image
   */
  async createThumbnail(
    file: File,
    width: number = 200,
    height: number = 200
  ): Promise<File> {
    return this.convertImage(file, {
      maxWidth: width,
      maxHeight: height,
      format: "webp",
      quality: 0.7
    });
  },

  /**
   * Compress image
   */
  async compressImage(file: File, quality: number = 0.7): Promise<File> {
    const dimensions = await this.getImageDimensions(file);
    return this.convertImage(file, {
      quality,
      maxWidth: dimensions.width,
      maxHeight: dimensions.height,
      format: file.type === "image/webp" ? "webp" : "jpeg"
    });
  },

  /**
   * Generate image preview as data URL
   */
  async generatePreview(
    file: File,
    maxWidth: number = 300,
    maxHeight: number = 300
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              throw new Error("Failed to get canvas context");
            }

            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/webp", 0.8));
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsDataURL(file);
    });
  }
};

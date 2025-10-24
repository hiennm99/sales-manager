/**
 * General Services Index
 * Centralized export for all general services
 */

// Storage Service
export { storageService } from "./storageService.ts";
export type { UploadOptions, UploadResult } from "./storageService.ts";

// Image Service
export { imageService } from "./imageService.ts";
export type {
  ImageConversionOptions,
  ImageDimensions,
  ImageValidationOptions,
} from "./imageService.ts";

// Database Service
export { databaseService } from "./databaseService.ts";
export type { TableInfo } from "./databaseService.ts";

// Validation Service
export { validationService } from "./validationService.ts";
export type { ValidationResult } from "./validationService.ts";

// Utility Service
export { utilityService } from "./utilityService.ts";

/**
 * General Services Index
 * Centralized export for all general services
 */

// Storage Service
export { storageService } from "./storage.service";
export type { UploadOptions, UploadResult } from "./storage.service";

// Image Service
export { imageService } from "./image.service";
export type {
  ImageConversionOptions,
  ImageDimensions,
  ImageValidationOptions,
} from "./image.service";

// Database Service
export { databaseService } from "./database.service";
export type { TableInfo } from "./database.service";

// Validation Service
export { validationService } from "./validation.service";
export type { ValidationResult } from "./validation.service";

// Utility Service
export { utilityService } from "./utility.service";

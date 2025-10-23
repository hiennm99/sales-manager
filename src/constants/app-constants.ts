// src/constants/app-constants.ts
/**
 * Global Application Constants
 * Centralized configuration for storage, paths, limits, and other app-wide values
 */

// ===========================
// SUPABASE STORAGE
// ===========================

/**
 * Supabase Storage Bucket Names
 */
export const STORAGE_BUCKETS = {
  IMAGES: "images",
  DOCUMENTS: "documents",
  EXPORTS: "exports",
} as const;

/**
 * Storage Paths per Feature
 */
export const STORAGE_PATHS = {
  PRODUCTS: {
    BUCKET: STORAGE_BUCKETS.IMAGES,
    FOLDER: "products",
    getFilePath: (fileName: string) => `products/${fileName}`,
  },
  SHOPS: {
    BUCKET: STORAGE_BUCKETS.IMAGES,
    FOLDER: "shops",
    getFilePath: (fileName: string) => `shops/${fileName}`,
  },
  EMPLOYEES: {
    BUCKET: STORAGE_BUCKETS.IMAGES,
    FOLDER: "employees",
    getFilePath: (fileName: string) => `employees/${fileName}`,
  },
  REPORTS: {
    BUCKET: STORAGE_BUCKETS.DOCUMENTS,
    FOLDER: "financial-reports",
    getFilePath: (fileName: string) => `financial-reports/${fileName}`,
  },
  EXPORTS: {
    BUCKET: STORAGE_BUCKETS.EXPORTS,
    FOLDER: "data-exports",
    getFilePath: (fileName: string) => `data-exports/${fileName}`,
  },
} as const;

// ===========================
// FILE UPLOAD LIMITS
// ===========================

/**
 * File Size Limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  DOCUMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  EXPORT_MAX_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

/**
 * Accepted File Types
 */
export const ACCEPTED_FILE_TYPES = {
  IMAGES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ],
  DOCUMENTS: [
    "application/pdf",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ],
  ALL: ["*/*"],
} as const;

/**
 * File Extensions
 */
export const FILE_EXTENSIONS = {
  IMAGES: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"],
  DOCUMENTS: [".pdf", ".xls", ".xlsx", ".csv"],
  EXPORTS: [".json", ".csv", ".xlsx"],
} as const;

// ===========================
// IMAGE OPTIMIZATION
// ===========================

/**
 * Image Optimization Settings
 */
export const IMAGE_OPTIMIZATION = {
  QUALITY: 0.8, // 80% quality
  MAX_WIDTH: 1200, // Maximum width in pixels
  MAX_HEIGHT: 1200, // Maximum height in pixels
  FORMAT: "webp", // Preferred format
  THUMBNAIL_SIZE: 300, // Thumbnail size
} as const;

// ===========================
// PAGINATION
// ===========================

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// ===========================
// DATE FORMATS
// ===========================

/**
 * Date Format Constants
 */
export const DATE_FORMATS = {
  DISPLAY: "dd/MM/yyyy", // For display in UI
  DISPLAY_WITH_TIME: "dd/MM/yyyy HH:mm",
  API: "yyyy-MM-dd", // For API calls
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
  FILE_NAME: "yyyy-MM-dd-HHmmss", // For file names
} as const;

// ===========================
// CURRENCY
// ===========================

/**
 * Currency Settings
 */
export const CURRENCY = {
  USD: {
    CODE: "USD",
    SYMBOL: "$",
    LOCALE: "en-US",
  },
  VND: {
    CODE: "VND",
    SYMBOL: "₫",
    LOCALE: "vi-VN",
  },
  DEFAULT_EXCHANGE_RATE: 25000, // VND per USD (fallback)
} as const;

// ===========================
// DEFAULT VALUES
// ===========================

/**
 * Default Numeric Values
 */
export const DEFAULTS = {
  COMMISSION_RATE: 3.0, // 3% default commission
  DISCOUNT_RATE: 0, // No discount by default
  EXCHANGE_RATE: 26000, // Default USD to VND rate
  QUANTITY: 1, // Default quantity
  TIMEOUT: 5000, // 5 seconds timeout
  RETRY_ATTEMPTS: 3, // Number of retry attempts
  DEBOUNCE_DELAY: 300, // 300ms debounce delay
} as const;

// ===========================
// VALIDATION LIMITS
// ===========================

/**
 * Validation Constraints
 */
export const VALIDATION = {
  SKU_MAX_LENGTH: 8,
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 255,
  CODE_MIN_LENGTH: 2,
  CODE_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MIN_LENGTH: 5,
  PHONE_MAX_LENGTH: 50,
  URL_MAX_LENGTH: 2048,
  NOTES_MAX_LENGTH: 1000,
  DESCRIPTION_MAX_LENGTH: 5000,
} as const;

// ===========================
// UI CONSTANTS
// ===========================

/**
 * UI/UX Constants
 */
export const UI = {
  TOAST_DURATION: 5000, // 5 seconds
  MODAL_ANIMATION_DURATION: 300, // 300ms
  LOADING_DELAY: 200, // Show loading after 200ms
  SIDEBAR_WIDTH: 256, // 256px
  SIDEBAR_COLLAPSED_WIDTH: 64, // 64px
  MOBILE_BREAKPOINT: 768, // Mobile breakpoint in px
  TABLET_BREAKPOINT: 1024, // Tablet breakpoint in px
} as const;

// ===========================
// API ENDPOINTS
// ===========================

/**
 * External API Endpoints (if any)
 */
export const API_ENDPOINTS = {
  EXCHANGE_RATE_API: "https://api.exchangerate-api.com/v4/latest/USD",
  // Add other external APIs here
} as const;

// ===========================
// ROUTES
// ===========================

/**
 * Application Route Paths
 */
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  ORDERS: {
    LIST: "/orders",
    CREATE: "/orders/create",
    DETAIL: (id: string | number) => `/orders/${id}`,
    EDIT: (id: string | number) => `/orders/${id}/edit`,
  },
  PRODUCTS: {
    LIST: "/products",
    CREATE: "/products/create",
    DETAIL: (id: string | number) => `/products/${id}`,
  },
  SHOPS: {
    LIST: "/shops",
  },
  EMPLOYEES: {
    LIST: "/employees",
    CREATE: "/employees/create",
    DETAIL: (id: string | number) => `/employees/${id}`,
    SALARY: "/employees/salary",
    COMMISSION: "/employees/commission",
  },
  REPORTS: {
    FINANCIAL: "/reports/financial",
  },
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
  },
} as const;

// ===========================
// CACHE SETTINGS
// ===========================

/**
 * Cache Configuration
 */
export const CACHE = {
  STORAGE_CACHE_CONTROL: "3600", // 1 hour cache for storage
  API_CACHE_TTL: 300000, // 5 minutes in milliseconds
  STATIC_CACHE_TTL: 86400000, // 24 hours in milliseconds
} as const;

// ===========================
// STATUS COLORS
// ===========================

/**
 * Status Color Classes (for Tailwind)
 */
export const STATUS_COLORS = {
  SUCCESS: "bg-green-100 text-green-800 border-green-200",
  WARNING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ERROR: "bg-red-100 text-red-800 border-red-200",
  INFO: "bg-blue-100 text-blue-800 border-blue-200",
  NEUTRAL: "bg-gray-100 text-gray-800 border-gray-200",
} as const;

// ===========================
// FEATURE FLAGS
// ===========================

/**
 * Feature Flags (toggle features on/off)
 */
export const FEATURES = {
  ENABLE_AUTO_REFRESH: true,
  ENABLE_DARK_MODE: false,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_EXPORT: true,
  ENABLE_BULK_ACTIONS: true,
  ENABLE_ANALYTICS: true,
} as const;

// ===========================
// ENVIRONMENT
// ===========================

/**
 * Environment Variables (with fallbacks)
 */
export const ENV = {
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  APP_NAME: "Sales Manager",
  APP_DESCRIPTION: "Quản lý đơn hàng và doanh số",
} as const;

// ===========================
// TYPE EXPORTS
// ===========================

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];
export type FileType = keyof typeof ACCEPTED_FILE_TYPES;
export type Currency = keyof typeof CURRENCY;
export type DateFormat = (typeof DATE_FORMATS)[keyof typeof DATE_FORMATS];

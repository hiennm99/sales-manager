// src/constants/error-messages.ts
/**
 * Centralized Error Messages
 * Provides consistent error messages throughout the application
 * Ready for internationalization (i18n)
 */

export const ERROR_MESSAGES = {
  // ===========================
  // GENERAL ERRORS
  // ===========================
  GENERAL: {
    UNKNOWN: {
      vi: "Đã xảy ra lỗi không xác định",
      en: "An unknown error occurred",
    },
    NETWORK: {
      vi: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet",
      en: "Network error. Please check your internet connection",
    },
    TIMEOUT: {
      vi: "Yêu cầu quá thời gian chờ",
      en: "Request timeout",
    },
    PERMISSION_DENIED: {
      vi: "Bạn không có quyền thực hiện thao tác này",
      en: "Permission denied",
    },
  },

  // ===========================
  // API ERRORS
  // ===========================
  API: {
    FETCH_FAILED: {
      vi: "Không thể tải dữ liệu",
      en: "Failed to fetch data",
    },
    CREATE_FAILED: {
      vi: "Không thể tạo mới",
      en: "Failed to create",
    },
    UPDATE_FAILED: {
      vi: "Không thể cập nhật",
      en: "Failed to update",
    },
    DELETE_FAILED: {
      vi: "Không thể xóa",
      en: "Failed to delete",
    },
    SEARCH_FAILED: {
      vi: "Không thể tìm kiếm",
      en: "Failed to search",
    },
    NOT_FOUND: {
      vi: "Không tìm thấy dữ liệu",
      en: "Not found",
    },
  },

  // ===========================
  // VALIDATION ERRORS
  // ===========================
  VALIDATION: {
    REQUIRED: {
      vi: "Trường này là bắt buộc",
      en: "This field is required",
    },
    INVALID_EMAIL: {
      vi: "Email không hợp lệ",
      en: "Invalid email address",
    },
    INVALID_PHONE: {
      vi: "Số điện thoại không hợp lệ",
      en: "Invalid phone number",
    },
    INVALID_URL: {
      vi: "URL không hợp lệ",
      en: "Invalid URL",
    },
    MIN_LENGTH: {
      vi: "Độ dài tối thiểu là {min} ký tự",
      en: "Minimum length is {min} characters",
    },
    MAX_LENGTH: {
      vi: "Độ dài tối đa là {max} ký tự",
      en: "Maximum length is {max} characters",
    },
    MIN_VALUE: {
      vi: "Giá trị tối thiểu là {min}",
      en: "Minimum value is {min}",
    },
    MAX_VALUE: {
      vi: "Giá trị tối đa là {max}",
      en: "Maximum value is {max}",
    },
    INVALID_DATE: {
      vi: "Ngày không hợp lệ",
      en: "Invalid date",
    },
    DUPLICATE: {
      vi: "Giá trị đã tồn tại",
      en: "Value already exists",
    },
  },

  // ===========================
  // AUTH ERRORS
  // ===========================
  AUTH: {
    LOGIN_FAILED: {
      vi: "Đăng nhập thất bại",
      en: "Login failed",
    },
    LOGOUT_FAILED: {
      vi: "Đăng xuất thất bại",
      en: "Logout failed",
    },
    INVALID_CREDENTIALS: {
      vi: "Email hoặc mật khẩu không đúng",
      en: "Invalid email or password",
    },
    SESSION_EXPIRED: {
      vi: "Phiên đăng nhập đã hết hạn",
      en: "Session expired",
    },
    UNAUTHORIZED: {
      vi: "Bạn chưa đăng nhập",
      en: "Unauthorized",
    },
  },

  // ===========================
  // ENTITY-SPECIFIC ERRORS
  // ===========================
  ORDERS: {
    FETCH_FAILED: {
      vi: "Không thể tải danh sách đơn hàng",
      en: "Failed to fetch orders",
    },
    CREATE_FAILED: {
      vi: "Không thể tạo đơn hàng",
      en: "Failed to create order",
    },
    UPDATE_FAILED: {
      vi: "Không thể cập nhật đơn hàng",
      en: "Failed to update order",
    },
    DELETE_FAILED: {
      vi: "Không thể xóa đơn hàng",
      en: "Failed to delete order",
    },
    NOT_FOUND: {
      vi: "Không tìm thấy đơn hàng",
      en: "Order not found",
    },
    ITEMS_REQUIRED: {
      vi: "Đơn hàng phải có ít nhất 1 sản phẩm",
      en: "Order must have at least 1 item",
    },
  },

  PRODUCTS: {
    FETCH_FAILED: {
      vi: "Không thể tải danh sách sản phẩm",
      en: "Failed to fetch products",
    },
    CREATE_FAILED: {
      vi: "Không thể tạo sản phẩm",
      en: "Failed to create product",
    },
    UPDATE_FAILED: {
      vi: "Không thể cập nhật sản phẩm",
      en: "Failed to update product",
    },
    DELETE_FAILED: {
      vi: "Không thể xóa sản phẩm",
      en: "Failed to delete product",
    },
    NOT_FOUND: {
      vi: "Không tìm thấy sản phẩm",
      en: "Product not found",
    },
    SKU_DUPLICATE: {
      vi: "Mã SKU đã tồn tại",
      en: "SKU already exists",
    },
  },

  SHOPS: {
    FETCH_FAILED: {
      vi: "Không thể tải danh sách cửa hàng",
      en: "Failed to fetch shops",
    },
    CREATE_FAILED: {
      vi: "Không thể tạo cửa hàng",
      en: "Failed to create shop",
    },
    UPDATE_FAILED: {
      vi: "Không thể cập nhật cửa hàng",
      en: "Failed to update shop",
    },
    DELETE_FAILED: {
      vi: "Không thể xóa cửa hàng",
      en: "Failed to delete shop",
    },
    NOT_FOUND: {
      vi: "Không tìm thấy cửa hàng",
      en: "Shop not found",
    },
    SELECT_REQUIRED: {
      vi: "Vui lòng chọn cửa hàng",
      en: "Please select a shop",
    },
  },

  EMPLOYEES: {
    FETCH_FAILED: {
      vi: "Không thể tải danh sách nhân viên",
      en: "Failed to fetch employees",
    },
    CREATE_FAILED: {
      vi: "Không thể tạo nhân viên",
      en: "Failed to create employee",
    },
    UPDATE_FAILED: {
      vi: "Không thể cập nhật nhân viên",
      en: "Failed to update employee",
    },
    DELETE_FAILED: {
      vi: "Không thể xóa nhân viên",
      en: "Failed to delete employee",
    },
    NOT_FOUND: {
      vi: "Không tìm thấy nhân viên",
      en: "Employee not found",
    },
  },

  STATUSES: {
    FETCH_FAILED: {
      vi: "Không thể tải danh sách trạng thái",
      en: "Failed to fetch statuses",
    },
    UPDATE_FAILED: {
      vi: "Không thể cập nhật trạng thái",
      en: "Failed to update status",
    },
  },

  // ===========================
  // FILE UPLOAD ERRORS
  // ===========================
  UPLOAD: {
    FILE_TOO_LARGE: {
      vi: "File quá lớn. Kích thước tối đa là {maxSize}MB",
      en: "File too large. Maximum size is {maxSize}MB",
    },
    INVALID_FILE_TYPE: {
      vi: "Loại file không hợp lệ. Chỉ chấp nhận: {types}",
      en: "Invalid file type. Only accept: {types}",
    },
    UPLOAD_FAILED: {
      vi: "Không thể tải file lên",
      en: "Failed to upload file",
    },
    DELETE_FAILED: {
      vi: "Không thể xóa file",
      en: "Failed to delete file",
    },
  },

  // ===========================
  // EXPORT ERRORS
  // ===========================
  EXPORT: {
    FAILED: {
      vi: "Không thể xuất dữ liệu",
      en: "Failed to export data",
    },
    NO_DATA: {
      vi: "Không có dữ liệu để xuất",
      en: "No data to export",
    },
  },
} as const;

/**
 * Error message parameters type
 */
export type ErrorMessageParams = {
  min?: number;
  max?: number;
  maxSize?: number;
  types?: string;
  field?: string;
  entity?: string;
  [key: string]: string | number | undefined;
};

/**
 * Language type
 */
export type Language = "vi" | "en";

/**
 * Default language
 */
export const DEFAULT_LANGUAGE: Language = "vi";

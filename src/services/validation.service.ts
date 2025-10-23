/**
 * General Validation Service
 * Handles common validation operations
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validation Service for common validation operations
 */
export const validationService = {
  /**
   * Validate email
   */
  validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        error: "Invalid email format",
      };
    }
    return { valid: true };
  },

  /**
   * Validate phone number (Vietnamese format)
   */
  validatePhoneNumber(phone: string): ValidationResult {
    const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return {
        valid: false,
        error: "Invalid phone number format",
      };
    }
    return { valid: true };
  },

  /**
   * Validate URL
   */
  validateUrl(url: string): ValidationResult {
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return {
        valid: false,
        error: "Invalid URL format",
      };
    }
  },

  /**
   * Validate required field
   */
  validateRequired(
    value: unknown,
    fieldName: string = "Field",
  ): ValidationResult {
    if (value === null || value === undefined || value === "") {
      return {
        valid: false,
        error: `${fieldName} is required`,
      };
    }
    return { valid: true };
  },

  /**
   * Validate string length
   */
  validateStringLength(
    value: string,
    min: number,
    max: number,
    fieldName: string = "Field",
  ): ValidationResult {
    if (value.length < min) {
      return {
        valid: false,
        error: `${fieldName} must be at least ${min} characters`,
      };
    }
    if (value.length > max) {
      return {
        valid: false,
        error: `${fieldName} must not exceed ${max} characters`,
      };
    }
    return { valid: true };
  },

  /**
   * Validate number range
   */
  validateNumberRange(
    value: number,
    min: number,
    max: number,
    fieldName: string = "Field",
  ): ValidationResult {
    if (value < min) {
      return {
        valid: false,
        error: `${fieldName} must be at least ${min}`,
      };
    }
    if (value > max) {
      return {
        valid: false,
        error: `${fieldName} must not exceed ${max}`,
      };
    }
    return { valid: true };
  },

  /**
   * Validate date range
   */
  validateDateRange(
    date: Date,
    minDate: Date,
    maxDate: Date,
    fieldName: string = "Date",
  ): ValidationResult {
    if (date < minDate) {
      return {
        valid: false,
        error: `${fieldName} must be after ${minDate.toLocaleDateString()}`,
      };
    }
    if (date > maxDate) {
      return {
        valid: false,
        error: `${fieldName} must be before ${maxDate.toLocaleDateString()}`,
      };
    }
    return { valid: true };
  },

  /**
   * Validate pattern (regex)
   */
  validatePattern(
    value: string,
    pattern: RegExp,
    fieldName: string = "Field",
  ): ValidationResult {
    if (!pattern.test(value)) {
      return {
        valid: false,
        error: `${fieldName} format is invalid`,
      };
    }
    return { valid: true };
  },

  /**
   * Validate array not empty
   */
  validateArrayNotEmpty(
    array: unknown[],
    fieldName: string = "Array",
  ): ValidationResult {
    if (!Array.isArray(array) || array.length === 0) {
      return {
        valid: false,
        error: `${fieldName} must contain at least one item`,
      };
    }
    return { valid: true };
  },

  /**
   * Validate array length
   */
  validateArrayLength(
    array: unknown[],
    min: number,
    max: number,
    fieldName: string = "Array",
  ): ValidationResult {
    if (array.length < min) {
      return {
        valid: false,
        error: `${fieldName} must contain at least ${min} items`,
      };
    }
    if (array.length > max) {
      return {
        valid: false,
        error: `${fieldName} must not contain more than ${max} items`,
      };
    }
    return { valid: true };
  },

  /**
   * Validate object has required properties
   */
  validateObjectProperties(
    obj: Record<string, unknown>,
    requiredProps: string[],
    objectName: string = "Object",
  ): ValidationResult {
    const missingProps = requiredProps.filter((prop) => !(prop in obj));
    if (missingProps.length > 0) {
      return {
        valid: false,
        error: `${objectName} is missing required properties: ${missingProps.join(", ")}`,
      };
    }
    return { valid: true };
  },

  /**
   * Validate enum value
   */
  validateEnum(
    value: unknown,
    allowedValues: unknown[],
    fieldName: string = "Field",
  ): ValidationResult {
    if (!allowedValues.includes(value)) {
      return {
        valid: false,
        error: `${fieldName} must be one of: ${allowedValues.join(", ")}`,
      };
    }
    return { valid: true };
  },

  /**
   * Validate credit card number (Luhn algorithm)
   */
  validateCreditCard(cardNumber: string): ValidationResult {
    const cleaned = cardNumber.replace(/\s/g, "");
    if (!/^\d{13,19}$/.test(cleaned)) {
      return {
        valid: false,
        error: "Invalid credit card number format",
      };
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    if (sum % 10 !== 0) {
      return {
        valid: false,
        error: "Invalid credit card number",
      };
    }

    return { valid: true };
  },

  /**
   * Validate password strength
   */
  validatePasswordStrength(
    password: string,
    options: {
      minLength?: number;
      requireUppercase?: boolean;
      requireLowercase?: boolean;
      requireNumbers?: boolean;
      requireSpecialChars?: boolean;
    } = {},
  ): ValidationResult {
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = true,
    } = options;

    if (password.length < minLength) {
      return {
        valid: false,
        error: `Password must be at least ${minLength} characters`,
      };
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      return {
        valid: false,
        error: "Password must contain at least one uppercase letter",
      };
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      return {
        valid: false,
        error: "Password must contain at least one lowercase letter",
      };
    }

    if (requireNumbers && !/\d/.test(password)) {
      return {
        valid: false,
        error: "Password must contain at least one number",
      };
    }

    if (
      requireSpecialChars &&
      !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    ) {
      return {
        valid: false,
        error: "Password must contain at least one special character",
      };
    }

    return { valid: true };
  },

  /**
   * Validate Vietnamese ID number
   */
  validateVietnameseId(id: string): ValidationResult {
    const idRegex = /^\d{9}$|^\d{12}$/;
    if (!idRegex.test(id.replace(/\s/g, ""))) {
      return {
        valid: false,
        error: "Invalid Vietnamese ID format",
      };
    }
    return { valid: true };
  },

  /**
   * Validate Vietnamese tax ID
   */
  validateVietnameseTaxId(taxId: string): ValidationResult {
    const taxIdRegex = /^\d{10}(-\d{3})?$/;
    if (!taxIdRegex.test(taxId)) {
      return {
        valid: false,
        error: "Invalid Vietnamese tax ID format",
      };
    }
    return { valid: true };
  },
};

/**
 * General Utility Service
 * Handles common utility operations
 */

/**
 * Utility Service for common operations
 */
export const utilityService = {
  /**
   * Generate unique ID
   */
  generateUniqueId(prefix: string = ""): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return prefix ? `${prefix}-${timestamp}${random}` : `${timestamp}${random}`;
  },

  /**
   * Generate UUID v4
   */
  generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  },

  /**
   * Generate random string
   */
  generateRandomString(
    length: number = 10,
    charset: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  ): string {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  },

  /**
   * Generate random number
   */
  generateRandomNumber(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Delay execution (sleep)
   */
  async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * Retry operation with exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number;
      delayMs?: number;
      backoffMultiplier?: number;
    } = {},
  ): Promise<T> {
    const { maxAttempts = 3, delayMs = 1000, backoffMultiplier = 2 } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxAttempts}`);
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`❌ Attempt ${attempt} failed:`, lastError.message);

        if (attempt < maxAttempts) {
          const waitTime = delayMs * Math.pow(backoffMultiplier, attempt - 1);
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await this.delay(waitTime);
        }
      }
    }

    throw lastError || new Error("Operation failed after all retries");
  },

  /**
   * Debounce function
   */
  debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delayMs: number = 300,
  ): T {
    let timeoutId: NodeJS.Timeout | null = null;

    return ((...args: unknown[]) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        fn(...args);
        timeoutId = null;
      }, delayMs);
    }) as T;
  },

  /**
   * Throttle function
   */
  throttle<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delayMs: number = 300,
  ): T {
    let lastCallTime = 0;
    let timeoutId: NodeJS.Timeout | null = null;

    return ((...args: unknown[]) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;

      if (timeSinceLastCall >= delayMs) {
        fn(...args);
        lastCallTime = now;
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          fn(...args);
          lastCallTime = Date.now();
          timeoutId = null;
        }, delayMs - timeSinceLastCall);
      }
    }) as T;
  },

  /**
   * Deep clone object
   */
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T;
    }

    if (obj instanceof Array) {
      return obj.map((item) => this.deepClone(item)) as T;
    }

    if (obj instanceof Object) {
      const clonedObj: Record<string, unknown> = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(
            (obj as Record<string, unknown>)[key],
          );
        }
      }
      return clonedObj as T;
    }

    return obj;
  },

  /**
   * Merge objects
   */
  mergeObjects<T extends Record<string, unknown>>(
    target: T,
    source: Partial<T>,
  ): T {
    return { ...target, ...source };
  },

  /**
   * Deep merge objects
   */
  deepMerge<T extends Record<string, unknown>>(
    target: T,
    source: Partial<T>,
  ): T {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key];

        if (
          sourceValue &&
          typeof sourceValue === "object" &&
          !Array.isArray(sourceValue) &&
          targetValue &&
          typeof targetValue === "object" &&
          !Array.isArray(targetValue)
        ) {
          result[key] = this.deepMerge(
            targetValue as Record<string, unknown>,
            sourceValue as Record<string, unknown>,
          ) as never;
        } else {
          result[key] = sourceValue as never;
        }
      }
    }

    return result;
  },

  /**
   * Filter object by keys
   */
  filterObjectByKeys<T extends Record<string, unknown>>(
    obj: T,
    keys: (keyof T)[],
  ): Partial<T> {
    const result: Partial<T> = {};
    keys.forEach((key) => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },

  /**
   * Omit keys from object
   */
  omitObjectKeys<T extends Record<string, unknown>>(
    obj: T,
    keys: (keyof T)[],
  ): Partial<T> {
    const result: Partial<T> = { ...obj };
    keys.forEach((key) => {
      delete result[key];
    });
    return result;
  },

  /**
   * Convert object to query string
   */
  objectToQueryString(obj: Record<string, unknown>): string {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, String(value));
      }
    });
    return params.toString();
  },

  /**
   * Parse query string to object
   */
  queryStringToObject(queryString: string): Record<string, string> {
    const params = new URLSearchParams(queryString);
    const obj: Record<string, string> = {};
    params.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  },

  /**
   * Format bytes to human readable size
   */
  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (
      Math.round((bytes / Math.pow(k, i)) * Math.pow(10, dm)) /
        Math.pow(10, dm) +
      " " +
      sizes[i]
    );
  },

  /**
   * Convert seconds to time string (HH:MM:SS)
   */
  secondsToTimeString(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hours, minutes, secs]
      .map((val) => String(val).padStart(2, "0"))
      .join(":");
  },

  /**
   * Convert time string to seconds
   */
  timeStringToSeconds(timeString: string): number {
    const parts = timeString.split(":").map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return parts[0];
  },

  /**
   * Capitalize string
   */
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Capitalize each word
   */
  capitalizeWords(str: string): string {
    return str
      .split(" ")
      .map((word) => this.capitalize(word))
      .join(" ");
  },

  /**
   * Convert to slug
   */
  toSlug(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  /**
   * Truncate string with ellipsis
   */
  truncateString(
    str: string,
    maxLength: number,
    suffix: string = "...",
  ): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  },

  /**
   * Highlight text in string
   */
  highlightText(
    text: string,
    searchTerm: string,
    highlightClass: string = "highlight",
  ): string {
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(regex, `<mark class="${highlightClass}">$1</mark>`);
  },

  /**
   * Count occurrences of substring
   */
  countOccurrences(str: string, substring: string): number {
    return str.split(substring).length - 1;
  },

  /**
   * Remove duplicates from array
   */
  removeDuplicates<T>(array: T[]): T[] {
    return Array.from(new Set(array));
  },

  /**
   * Group array by key
   */
  groupArrayByKey<T extends Record<string, unknown>>(
    array: T[],
    key: keyof T,
  ): Record<string, T[]> {
    return array.reduce(
      (result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
          result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
      },
      {} as Record<string, T[]>,
    );
  },

  /**
   * Sort array of objects by key
   */
  sortByKey<T extends Record<string, unknown>>(
    array: T[],
    key: keyof T,
    ascending: boolean = true,
  ): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal < bVal) return ascending ? -1 : 1;
      if (aVal > bVal) return ascending ? 1 : -1;
      return 0;
    });
  },

  /**
   * Flatten nested array
   */
  flattenArray<T>(array: (T | T[])[]): T[] {
    return array.reduce((result: T[], item) => {
      if (Array.isArray(item)) {
        result.push(...this.flattenArray(item as (T | T[])[]));
      } else {
        result.push(item as T);
      }
      return result;
    }, [] as T[]);
  },

  /**
   * Chunk array into smaller arrays
   */
  chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  },

  /**
   * Copy to clipboard
   */
  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      console.log("✅ Copied to clipboard");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      throw error;
    }
  },

  /**
   * Read from clipboard
   */
  async readFromClipboard(): Promise<string> {
    try {
      const text = await navigator.clipboard.readText();
      console.log("✅ Read from clipboard");
      return text;
    } catch (error) {
      console.error("Error reading from clipboard:", error);
      throw error;
    }
  },
};

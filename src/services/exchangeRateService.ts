// src/services/exchangeRateService.ts
/**
 * Exchange Rate Service
 * Handles fetching and caching exchange rates from external API
 */

import { API_ENDPOINTS, CACHE, DEFAULTS } from "@constants";

interface ExchangeRateResponse {
  rates: {
    VND: number;
  };
}

class ExchangeRateService {
  private cacheKey = "exchangeRate_cache";
  private cacheTimestampKey = "exchangeRate_timestamp";

  /**
   * Get current exchange rate (USD to VND)
   * Tries to fetch from API, falls back to cache, then to default
   */
  async getExchangeRate(): Promise<number> {
    try {
      // Check if cache is still valid
      const cachedRate = this.getCachedRate();
      if (cachedRate !== null) {
        return cachedRate;
      }

      // Fetch from API
      const rate = await this.fetchFromAPI();
      this.setCachedRate(rate);
      return rate;
    } catch (error) {
      console.warn(
        "Failed to fetch exchange rate from API, using default:",
        error
      );
      return DEFAULTS.EXCHANGE_RATE;
    }
  }

  /**
   * Clear cached exchange rate
   */
  clearCache(): void {
    try {
      localStorage.removeItem(this.cacheKey);
      localStorage.removeItem(this.cacheTimestampKey);
    } catch (error) {
      console.warn("Error clearing exchange rate cache:", error);
    }
  }

  /**
   * Fetch exchange rate from external API
   */
  private async fetchFromAPI(): Promise<number> {
    const response = await fetch(API_ENDPOINTS.EXCHANGE_RATE_API);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: ExchangeRateResponse = await response.json();
    const rate = data.rates?.VND;

    if (!rate || typeof rate !== "number") {
      throw new Error("Invalid exchange rate data from API");
    }

    return rate; // Keep decimal places for accuracy
  }

  /**
   * Get cached exchange rate if still valid
   */
  private getCachedRate(): number | null {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      const timestamp = localStorage.getItem(this.cacheTimestampKey);

      if (!cached || !timestamp) {
        return null;
      }

      const cacheAge = Date.now() - parseInt(timestamp, 10);

      // Cache valid for 5 minutes
      if (cacheAge < CACHE.API_CACHE_TTL) {
        return parseInt(cached, 10);
      }

      return null;
    } catch (error) {
      console.warn("Error reading cached exchange rate:", error);
      return null;
    }
  }

  /**
   * Set cached exchange rate
   */
  private setCachedRate(rate: number): void {
    try {
      localStorage.setItem(this.cacheKey, rate.toString());
      localStorage.setItem(this.cacheTimestampKey, Date.now().toString());
    } catch (error) {
      console.warn("Error caching exchange rate:", error);
    }
  }
}

export const exchangeRateService = new ExchangeRateService();

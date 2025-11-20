const GEOAPIFY_API_URL = "https://api.geoapify.com/v1/geocode/search";

type GeoapifyFeature = {
  properties: {
    formatted?: string;
    lat?: number;
    lon?: number;
    country?: string;
    city?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    confidence?: number;
    rank?: {
      confidence?: number;
      confidence_city_level?: number;
    };
  };
};

export interface AddressVerificationResult {
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  confidence: number;
  breakdown: {
    country?: string;
    city?: string;
    street?: string;
    houseNumber?: string;
    postalCode?: string;
  };
}

export const addressVerificationService = {
  async verify(address: string): Promise<AddressVerificationResult> {
    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

    if (!apiKey) {
      throw new Error("Thiếu cấu hình Geoapify API key (VITE_GEOAPIFY_API_KEY)");
    }

    if (!address.trim()) {
      throw new Error("Vui lòng nhập địa chỉ để xác thực");
    }

    const params = new URLSearchParams({
      text: address,
      apiKey,
      limit: "1"
    });

    const response = await fetch(`${GEOAPIFY_API_URL}?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Không thể kết nối tới Geoapify");
    }

    const data = (await response.json()) as { features?: GeoapifyFeature[] };
    const feature = data.features?.[0];

    if (!feature || !feature.properties) {
      throw new Error("Không tìm thấy địa chỉ phù hợp");
    }

    const { properties } = feature;

    return {
      formattedAddress: properties.formatted || address,
      latitude: properties.lat,
      longitude: properties.lon,
      confidence:
        properties.rank?.confidence ??
        properties.rank?.confidence_city_level ??
        properties.confidence ??
        0,
      breakdown: {
        country: properties.country,
        city: properties.city,
        street: properties.street,
        houseNumber: properties.housenumber,
        postalCode: properties.postcode
      }
    };
  }
};
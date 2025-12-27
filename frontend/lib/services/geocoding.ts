export interface GeocodingFeature {
  id: string;
  type: "Feature";
  place_type: string[];
  relevance: number;
  properties: {
    facility_name?: string;
    address?: string;
    tel?: string;
    [key: string]: unknown;
  };
  text: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

export interface GeocodingResponse {
  type: "FeatureCollection";
  query: string[];
  features: GeocodingFeature[];
  attribution: string;
}

interface GSIFeature {
  geometry: {
    coordinates: [number, number];
    type: "Point";
  };
  type: "Feature";
  properties: {
    addressCode: string;
    title: string;
  };
}

/**
 * 住所から座標を取得
 * GSI (国土地理院) APIを優先使用し、失敗時にMapboxへフォールバック
 */
export async function searchAddress(query: string): Promise<GeocodingResponse> {
  // 1. GSI (国土地理院) API
  // https://msearch.gsi.go.jp/address-search/AddressSearch?q=...
  try {
    const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(
      query
    )}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("GSI API Error");
    }
    const data = await res.json();

    const features: GeocodingFeature[] = (data as GSIFeature[]).map((item) => ({
      id: item.properties.addressCode || "gsi-result",
      type: "Feature" as const,
      place_type: ["address"],
      relevance: 1,
      properties: {
        address: item.properties.title,
      },
      text: item.properties.title,
      place_name: item.properties.title,
      center: item.geometry.coordinates,
      geometry: item.geometry,
    }));

    // If GSI returns no results, throw to trigger fallback
    if (features.length === 0) {
      throw new Error("No results from GSI");
    }

    return {
      type: "FeatureCollection",
      query: [query],
      features: features,
      attribution: "国土地理院",
    };
  } catch (e) {
    console.warn("GSI Search failed or empty. Falling back to Mapbox...", e);

    // 2. Mapbox Fallback
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      throw new Error("Mapbox access token not configured");
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${token}&country=jp&limit=1`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox API Error: ${response.statusText}`);
    }

    return await response.json();
  }
}

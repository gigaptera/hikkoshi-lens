/**
 * Mapbox サービス層
 * 外部APIクライアントを使用してMapbox機能を提供
 */

import {
  getMapboxClient,
  type GeocodingParams,
  type GeocodingResponse,
} from "@/lib/external-apis/mapbox";

export class MapboxService {
  private static instance: MapboxService;

  static getInstance(): MapboxService {
    if (!MapboxService.instance) {
      MapboxService.instance = new MapboxService();
    }
    return MapboxService.instance;
  }

  /**
   * 住所から座標を取得
   */
  async searchAddress(
    query: string,
    options?: Partial<GeocodingParams>
  ): Promise<GeocodingResponse> {
    // GSI (国土地理院) APIを使用
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

      // GSI Result -> Mapbox GeocodingResponse format
      // data is array of Feature
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

      const features = (data as GSIFeature[]).map((item) => ({
        id: item.properties.addressCode || "gsi-result",
        type: "Feature" as const,
        place_type: ["address"],
        relevance: 1,
        properties: {
          address: item.properties.title,
        },
        text: item.properties.title,
        place_name: item.properties.title, // 全住所
        center: item.geometry.coordinates, // [lng, lat]
        geometry: item.geometry,
      }));

      return {
        type: "FeatureCollection",
        query: [query],
        features: features,
        attribution: "国土地理院",
      };
    } catch (e) {
      console.error("GSI Search Error. Falling back to Mapbox...", e);
      // Fallback to Mapbox if GSI fails? Or just throw?
      // GSI is reliable for JP addresses.

      const client = getMapboxClient();
      return client.geocoding({
        query,
        limit: 5,
        country: "jp",
        ...options,
      });
    }
  }
}

// 簡易的なMock Geocoder
// 駅名から座標（緯度・経度）を返す。
// 実運用ではGoogle Maps APIや専用の駅データAPIを使用する。

export interface Location {
  name: string;
  address: string;
  lat: number;
  lon: number;
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

export async function searchAddress(query: string): Promise<Location[]> {
  if (!query || query.length < 2) return [];

  // GSI (Geospatial Information Authority of Japan) API
  // https://msearch.gsi.go.jp/address-search/AddressSearch?q=...
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(
    query
  )}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("GSI API Error:", res.statusText);
      return [];
    }

    const data = (await res.json()) as GSIFeature[];

    return data.map((item) => ({
      name: item.properties.title, // GSI returns full address as title
      address: item.properties.title,
      lat: item.geometry.coordinates[1], // GSI returns [lon, lat]
      lon: item.geometry.coordinates[0],
    }));
  } catch (error) {
    console.error("Geocoding failed:", error);
    return [];
  }
}

// Keep this for backward compatibility if needed, using the new search
export async function geocodeStation(
  stationName: string
): Promise<{ lat: number; lon: number } | null> {
  const results = await searchAddress(stationName);
  if (results.length > 0) {
    return { lat: results[0].lat, lon: results[0].lon };
  }
  return null;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

import { Station, StationFilter } from "@/types/station";

// ... (ApiError class remains)

const MOCK_STATIONS: Station[] = [
  {
    id: 1,
    station_code: "1130208",
    organization_code: "ODPT.Operator:JR-East",
    line_name: "山手線",
    name: "恵比寿", // Updated mock data to match current UI mock
    prefecture_code: 13,
    location: "POINT(139.710074 35.64669)",
    distance: 120, // Example
    total_score: 92,
    rent_avg: 12.5,
    address: "東京都渋谷区恵比寿南",
    lines: [],
    score_details: { safety: 5, rent: 3 },
  },
  {
    id: 2,
    station_code: "2200115",
    organization_code: "ODPT.Operator:Tokyu",
    line_name: "東横線",
    name: "中目黒",
    prefecture_code: 13,
    location: "POINT(139.698945 35.644265)",
    distance: 180,
    total_score: 89,
    rent_avg: 11.8,
    address: "東京都目黒区上目黒",
    lines: [],
  },
  {
    id: 3,
    station_code: "2200116",
    organization_code: "ODPT.Operator:Tokyu",
    line_name: "東横線",
    name: "代官山",
    prefecture_code: 13,
    location: "POINT(139.7041 35.6481)",
    distance: 240,
    total_score: 88,
    rent_avg: 14.2,
    address: "東京都渋谷区代官山町",
    lines: [],
  },
];

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("/")
    ? endpoint
    : `${API_BASE_URL}/${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(response.status, response.statusText, error);
    }

    return response.json();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`API Error (${url}):`, error);
      console.info(
        "⚠️ Falling back to MOCK DATA due to API connection failure."
      );

      if (
        endpoint.includes("stations/search") ||
        endpoint.includes("stations/nearby")
      ) {
        return MOCK_STATIONS as unknown as T;
      }
    }
    throw error;
  }
}

export async function searchStations(
  filter: StationFilter
): Promise<Station[]> {
  const params = new URLSearchParams();
  params.append("lat", filter.lat.toString());
  params.append("lon", filter.lon.toString());

  if (filter.radius) params.append("radius", filter.radius.toString());
  if (filter.min_rent) params.append("min_rent", filter.min_rent.toString());
  if (filter.max_rent) params.append("max_rent", filter.max_rent.toString());
  if (filter.building_type)
    params.append("building_type", filter.building_type);
  if (filter.layout) params.append("layout", filter.layout);
  if (filter.subsidy_type) params.append("subsidy_type", filter.subsidy_type);
  if (filter.subsidy_range)
    params.append("subsidy_range", filter.subsidy_range.toString());

  // Weights
  if (filter.w_rent) params.append("w_rent", filter.w_rent.toString());
  if (filter.w_access) params.append("w_access", filter.w_access.toString());
  if (filter.w_safety) params.append("w_safety", filter.w_safety.toString());
  if (filter.w_surroundings)
    params.append("w_surroundings", filter.w_surroundings.toString());
  if (filter.w_disaster)
    params.append("w_disaster", filter.w_disaster.toString());

  const response = await fetchApi<Station[] | { data: Station[] }>(
    `api/stations/search?${params.toString()}`
  );

  if (Array.isArray(response)) {
    return response;
  } else if ("data" in response && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}

export async function getStationsByLine(
  organizationCode: string,
  lineName: string
): Promise<Station[]> {
  const params = new URLSearchParams();
  params.append("organization_code", organizationCode);
  params.append("line_name", lineName);
  return fetchApi<Station[]>(`api/stations/line?${params.toString()}`);
}

export { fetchApi, ApiError };

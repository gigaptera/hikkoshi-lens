import { ApiStation } from "@/types/station";

// APIの基本設定
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// 共通のエラーハンドリング
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

// Mock Data for fallback
const MOCK_STATIONS = [
  {
    id: 1,
    organization_code: "ODPT.Operator:JR-East",
    line_name: "山手線",
    name: "東京",
    prefecture_code: 13,
    location: "POINT(139.767125 35.681236)",
    distance: 500,
    total_score: 95,
    address: "東京都千代田区丸の内一丁目",
  },
  {
    id: 2,
    organization_code: "ODPT.Operator:TokyoMetro",
    line_name: "丸ノ内線",
    name: "大手町",
    prefecture_code: 13,
    location: "POINT(139.762886 35.684523)",
    distance: 800,
    total_score: 88,
    address: "東京都千代田区大手町",
  },
  {
    id: 3,
    organization_code: "ODPT.Operator:JR-East",
    line_name: "中央線",
    name: "神田",
    prefecture_code: 13,
    location: "POINT(139.770641 35.69169)",
    distance: 1200,
    total_score: 82,
    address: "東京都千代田区鍛冶町",
  },
];

// 基本的なフェッチ関数
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Use mock if specifically requested or if environment dictates (optional)
  // For now, try fetch, fallback to mock on connection error for dev convenience

  // 相対パスの場合はNext.jsのAPIルートを使用し、絶対URLの場合はそのまま使用
  const url = endpoint.startsWith("/")
    ? endpoint
    : `${API_BASE_URL}/${endpoint}`;

  try {
    const response = await fetch(url, {
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
    // Connection refused or network error
    console.warn(`API Error (${url}):`, error);
    console.info("⚠️ Falling back to MOCK DATA due to API connection failure.");

    // Simple mock routing
    if (
      endpoint.includes("stations/nearby") ||
      endpoint.includes("three-stops")
    ) {
      return MOCK_STATIONS as unknown as T;
    }

    throw error;
  }
}

// 駅関連のAPI
export interface NearbyStationsParams {
  lat: number;
  lon: number;
  radius?: number; // meters
  weights?: Record<string, number>;
}

// 路線関連のAPI
export interface ThreeStopsParams {
  stationId: number;
  weights?: Record<string, number>;
}

export interface XYZParams {
  x?: number;
  y?: number;
  z?: number;
  lon?: number;
  lat?: number;
}

// Helper params builder
const buildWeightParams = (weights?: Record<string, number>) => {
  if (!weights) return "";
  return Object.entries(weights)
    .map(([k, v]) => `&w_${k}=${v}`)
    .join("");
};

// APIクライアント
export const api = {
  // 駅関連
  stations: {
    // 近くの駅を取得
    nearby: async ({
      lat,
      lon,
      radius = 3000,
      weights,
    }: NearbyStationsParams) =>
      fetchApi<ApiStation[]>(
        `api/stations/nearby?lat=${lat}&lon=${lon}&radius=${radius}${buildWeightParams(
          weights
        )}`
      ),

    // 3駅検索
    threeStops: async ({ stationId, weights }: ThreeStopsParams) =>
      fetchApi<ApiStation[]>(
        `api/stations/${stationId}/three-stops?${
          weights ? buildWeightParams(weights).replace(/^&/, "") : ""
        }`
      ),
  },

  // XYZ関連
  xyz: {
    // 経度緯度からXYZタイル座標に変換
    lonLatToXyz: async ({ lon, lat, z }: XYZParams) =>
      fetchApi<{ x: number; y: number; z: number }>(
        `api/xyz/lon-lat-to-xyz?lon=${lon}&lat=${lat}&z=${z}`
      ),

    // タイル左上の経度緯度を取得
    topLeft: async ({ x, y, z }: XYZParams) =>
      fetchApi<{ lon: number; lat: number }>(
        `api/xyz/top-left?x=${x}&y=${y}&z=${z}`
      ),

    // タイルのバウンディングボックスを取得
    bbox: async ({ x, y, z }: XYZParams) =>
      fetchApi<[number, number, number, number]>(
        `api/xyz/bbox?x=${x}&y=${y}&z=${z}`
      ),

    // タイル中心の経度緯度を取得
    tileCenter: async ({ x, y, z }: XYZParams) =>
      fetchApi<{ lon: number; lat: number }>(
        `api/xyz/tile-center?x=${x}&y=${y}&z=${z}`
      ),
  },
};

export default api;

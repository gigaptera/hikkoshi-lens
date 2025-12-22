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

// 基本的なフェッチ関数
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 相対パスの場合はNext.jsのAPIルートを使用し、絶対URLの場合はそのまま使用
  const url = endpoint.startsWith("/")
    ? endpoint
    : `${API_BASE_URL}/${endpoint}`;
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
}

// 駅関連のAPI
export interface NearbyStationsParams {
  lat: number;
  lon: number;
  radius?: number; // meters
  weights?: Record<string, number>;
}

import { ApiStation } from "@/types/station";

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

  // 路線関連 (廃止予定だが、互換性のため残すか、削除するか。今回は削除してstationsに統合)

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

import type { Station, ApiStation } from "@/features/lines/types/station";
import api from "@/lib/api-client";

// ApiStation -> Station 変換
function mapApiStationToStation(apiStation: ApiStation): Station {
  // PostGIS WKT: POINT(lon lat)
  const match = apiStation.location.match(/POINT\(([\d\.]+) ([\d\.]+)\)/);
  const lon = match ? parseFloat(match[1]) : 0;
  const lat = match ? parseFloat(match[2]) : 0;

  // Rent Average: Use backend calculated value if available
  let rentAvg = apiStation.rent_avg;

  // Fallback: Calculate from market_prices if not provided by backend
  if (
    !rentAvg &&
    apiStation.market_prices &&
    apiStation.market_prices.length > 0
  ) {
    const validRents = apiStation.market_prices
      .map((mp: any) => mp.rent)
      .filter((r: number) => r > 0);
    if (validRents.length > 0) {
      const sum = validRents.reduce((a: number, b: number) => a + b, 0);
      rentAvg = sum / validRents.length;
    }
  }

  return {
    id: apiStation.id,
    station_code: apiStation.id.toString(),
    name: apiStation.name,
    line_name: apiStation.line_name,
    company: apiStation.organization_code,
    coordinates: { lat, lng: lon, lon },
    distance_km: apiStation.distance ? apiStation.distance / 1000 : undefined,
    total_score: apiStation.total_score,
    score_details: apiStation.score_details,
    rent_avg: rentAvg,
    address: apiStation.address,
    market_prices: apiStation.market_prices,
    // 家賃補助関連
    is_nearby: apiStation.is_nearby,
    source_station: apiStation.source_station,
    stops_from_source: apiStation.stops_from_source,
  };
}

import { StationFilters } from "@/features/lines/stores/preference-store";

export async function fetchNearbyStations(
  lat: number,
  lon: number,
  filters: StationFilters,
  weights?: Record<string, number>,
  subsidyType?: string,
  subsidyRange?: number
): Promise<Station[]> {
  try {
    // searchエンドポイントを使用
    const apiStations = await api.stations.search({
      lat,
      lon,
      radius: filters.radius || 500,
      minRent: filters.minRent,
      maxRent: filters.maxRent,
      buildingType: filters.buildingType,
      layout: filters.layout,
      calculateScores: false, // フロントエンドで計算するため false
      subsidyType: subsidyType || "none",
      subsidyRange: subsidyRange || 3,
    });

    // Add null check for API response
    if (!apiStations || !Array.isArray(apiStations)) {
      console.warn("API returned invalid data:", apiStations);
      return [];
    }

    // 型変換
    const stations = apiStations.map(mapApiStationToStation);

    // フロントエンド側でスコア計算
    const { calculateScores, sortByScore } = await import(
      "@/features/lines/utils/score-calculator"
    );
    const scoredStations = calculateScores(stations, weights || {});
    const sortedStations = sortByScore(scoredStations);

    return sortedStations;
  } catch (error) {
    console.error("Error fetching nearby stations:", error);
    return [];
  }
}

// 3駅検索
export async function fetchStationsWithinThreeStops(
  stationId: number,
  weights?: Record<string, number>
): Promise<Station[]> {
  try {
    const apiStations = await api.stations.threeStops({ stationId, weights });
    return apiStations.map(mapApiStationToStation);
  } catch (error) {
    console.error("Error fetching three stops:", error);
    return [];
  }
}

// 路線ごとにグループ化する関数
export function groupStationsByLine(stations: Station[]) {
  const lineMap = new Map<string, Station[]>();

  stations.forEach((station) => {
    const key = `${station.company}-${station.line_name}`;
    if (!lineMap.has(key)) {
      lineMap.set(key, []);
    }
    lineMap.get(key)?.push(station);
  });

  // 各路線の代表駅（順位が一番上の駅）でソート
  return Array.from(lineMap.entries())
    .map(([key, stations]) => ({
      id: key,
      company: stations[0].company,
      line_name: stations[0].line_name,
      stations: stations.sort((a, b) => {
        // スコアがあればスコア降順
        if (a.total_score !== undefined && b.total_score !== undefined) {
          // 同じスコアなら距離昇順
          if (Math.abs((a.total_score ?? 0) - (b.total_score ?? 0)) < 0.001) {
            return (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity);
          }
          return (b.total_score ?? 0) - (a.total_score ?? 0);
        }
        // なければ距離昇順
        return (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity);
      }),
    }))
    .sort((a, b) => {
      const sA = a.stations[0];
      const sB = b.stations[0];
      if (sA?.total_score !== undefined && sB?.total_score !== undefined) {
        if (Math.abs((sA.total_score ?? 0) - (sB.total_score ?? 0)) < 0.001) {
          return (sA.distance_km ?? Infinity) - (sB.distance_km ?? Infinity);
        }
        return (sB.total_score ?? 0) - (sA.total_score ?? 0);
      }
      return (sA?.distance_km ?? Infinity) - (sB?.distance_km ?? Infinity);
    })
    .slice(0, 10); // 最大10件に制限
}

// Backendのレスポンス型
export interface ApiStation {
  id: number;
  organization_code: string;
  line_name: string;
  name: string;
  prefecture_code: number;
  location: string; // WKT: "POINT(lon lat)"
  distance?: number; // meters from query
  total_score?: number; // 0-100
  score_details?: Record<string, number>;
  market_prices?: any[]; // Simplified
  address?: string;
  // 家賃補助関連
  is_nearby?: boolean;
  source_station?: string;
  stops_from_source?: number;
  rent_avg?: number; // Backend calculated rent average
}

export interface Coordinates {
  lat: number;
  lng: number;
  lon?: number;
}

// UIで利用する型
export interface Station {
  id: number; // string -> number
  station_code: string; // id.toString()
  name: string;
  line_name: string;
  company: string; // organization_code
  coordinates: Coordinates;
  distance_km?: number; // distance / 1000
  total_score?: number;
  score_details?: Record<string, number>;
  rent_avg?: number; // Average rent in yen
  time_mins?: number; // Commute time in minutes
  address?: string;
  market_prices?: any[]; // For score calculation
  // 家賃補助関連
  is_nearby?: boolean;
  source_station?: string;
  stops_from_source?: number;
}

export interface Line {
  id: string;
  company: string;
  line_name: string;
  stations: Station[];
}

export interface ScoreWeights {
  access: number;
  rent: number;
  facility: number;
  safety: number;
  disaster: number;
  cost: number; // Added cost based on preferenceStore
}

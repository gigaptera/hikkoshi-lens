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
  address?: string;
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

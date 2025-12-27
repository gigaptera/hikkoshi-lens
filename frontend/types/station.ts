export interface Station {
  id: number;
  station_code: string;
  organization_code: string;
  line_name: string;
  name: string;
  prefecture_code: number;
  location: string;
  distance?: number;
  total_score: number;
  rent_avg?: number;
  score_details?: Record<string, number>;
  address: string;
  lines?: Line[];
  market_prices?: MarketPrice[];
  // Subsidy fields
  is_nearby?: boolean;
  source_station?: string;
  stops_from_source?: number;
}

export interface Line {
  id: number;
  station_id: number;
  line_name: string;
}

export interface MarketPrice {
  id: number;
  station_id: number;
  building_type: string;
  layout: string;
  min_rent: number;
  max_rent: number;
  rent: number;
  count: number;
}

export interface StationFilter {
  lat: number;
  lon: number;
  radius?: number;
  min_rent?: number;
  max_rent?: number;
  building_type?: string;
  layout?: string;
  subsidy_type?: "none" | "from_workplace";
  subsidy_range?: number;
  w_rent?: number;
  w_access?: number;
  w_safety?: number;
  w_surroundings?: number;
  w_disaster?: number;
}

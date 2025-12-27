package domain

type StationDetail struct {
	ID             int64          `json:"id"`
	Name           string         `json:"name"`
	Location       Location       `json:"location"`
	Lines          []string       `json:"lines"`
	Tags           []string       `json:"tags"`
	AIInsight      AIInsight      `json:"ai_insight"`
	Score          DetailScore    `json:"score"`
	MarketPrice    MarketData     `json:"market_price"`
	AffiliateLinks AffiliateLinks `json:"affiliate_links"`
}

type AIInsight struct {
	Summary        AISummary      `json:"summary"`
	ResidentVoices ResidentVoices `json:"resident_voices"`
	Trend          string         `json:"trend"`
	LastUpdated    string         `json:"last_updated"`
}

type AISummary struct {
	Pros []string `json:"pros"`
	Cons []string `json:"cons"`
}

type ResidentVoices struct {
	Positive []string `json:"positive"`
	Negative []string `json:"negative"`
}

type DetailScore struct {
	Total float64    `json:"total"`
	Radar RadarScore `json:"radar"`
}

type RadarScore struct {
	Rent     float64 `json:"rent"`
	Safety   float64 `json:"safety"`
	Facility float64 `json:"facility"`
	Access   float64 `json:"access"`
	Disaster float64 `json:"disaster"`
}

type MarketData struct {
	Prices             map[string]float64 `json:"prices"` // "1R": 7.5, "1LDK": 12.0
	NeighborComparison NeighborComparison `json:"neighbor_comparison"`
}

type NeighborComparison struct {
	NextStationDiff float64 `json:"next_station_diff"` // +3000 or -2000
	PrevStationDiff float64 `json:"prev_station_diff"`
}

type AffiliateLinks struct {
	Suumo string `json:"suumo"`
	Homes string `json:"homes"`
}

type Location struct {
	Lat float64 `json:"lat"`
	Lon float64 `json:"lon"`
}

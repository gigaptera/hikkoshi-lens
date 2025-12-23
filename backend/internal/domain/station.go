package domain

import (
	"context"

	"github.com/uptrace/bun"
)

type Station struct {
	bun.BaseModel `bun:"table:stations,alias:s"`

	ID               int64              `bun:"id,pk,autoincrement" json:"id"`
	StationCode      string             `bun:"station_code,unique" json:"station_code"` // 駅コード（国土交通省）
	OrganizationCode string             `bun:"organization_code,notnull" json:"organization_code"`
	LineName         string             `bun:"line_name,notnull" json:"line_name"`
	Name             string             `bun:"name,notnull" json:"name"`
	PrefectureCode   int                `bun:"prefecture_code,notnull" json:"prefecture_code"`
	Location         string             `bun:"location,type:geography(POINT,4326)" json:"location"` // PostGIS Point
	Distance         float64            `bun:"distance,scanonly" json:"distance,omitempty"`         // 検索時の距離(m)
	TotalScore       float64            `bun:"-" json:"total_score"`                                // 総合スコア (DBには保存しない)
	RentAvg          float64            `bun:"-" json:"rent_avg,omitempty"`                         // フィルター条件に合致する家賃相場
	ScoreDetails     map[string]float64 `bun:"-" json:"score_details,omitempty"`                    // スコア内訳
	Address          string             `bun:"address" json:"address"`

	// 家賃補助関連フィールド
	IsNearby        bool   `bun:"-" json:"is_nearby,omitempty"`         // 最寄り駅（半径内）かどうか
	SourceStation   string `bun:"-" json:"source_station,omitempty"`    // どの最寄り駅から含まれたか
	StopsFromSource int    `bun:"-" json:"stops_from_source,omitempty"` // 最寄り駅から何駅目か

	// Relations or calculated fields
	Lines        []Line         `bun:"rel:has-many,join:id=station_id" json:"lines,omitempty"`
	MarketPrices []*MarketPrice `bun:"rel:has-many,join:id=station_id" json:"market_prices,omitempty"`
}

type Line struct {
	bun.BaseModel `bun:"table:lines,alias:l"`

	ID        int64  `bun:"id,pk,autoincrement" json:"id"`
	StationID int64  `bun:"station_id,notnull" json:"station_id"`
	LineName  string `bun:"line_name,notnull" json:"line_name"`
}

type StationFilter struct {
	RadiusMeter     int
	MinRent         float64
	MaxRent         float64
	BuildingType    string
	Layout          string
	Weights         map[string]int
	CalculateScores bool // If true, calculate scores; if false, return raw data only
	// 家賃補助関連
	SubsidyType  string // "none" or "from_workplace"
	SubsidyRange int    // 最寄り駅から前後何駅まで（デフォルト3）
}

type StationRepository interface {
	GetNearby(ctx context.Context, lat, lon float64, filter StationFilter) ([]*Station, error)
	GetStation(ctx context.Context, id int64) (*Station, error)
	GetByLine(ctx context.Context, organizationCode, lineName string) ([]*Station, error)
}

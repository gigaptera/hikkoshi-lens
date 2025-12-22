package domain

import (
	"context"

	"github.com/uptrace/bun"
)

type Station struct {
	bun.BaseModel `bun:"table:stations,alias:s"`

	ID               int64   `bun:"id,pk,autoincrement" json:"id"`
	StationCode      string  `bun:"station_code,unique" json:"station_code"` // 駅コード（国土交通省）
	OrganizationCode string  `bun:"organization_code,notnull" json:"organization_code"`
	LineName         string  `bun:"line_name,notnull" json:"line_name"`
	Name             string  `bun:"name,notnull" json:"name"`
	PrefectureCode   int     `bun:"prefecture_code,notnull" json:"prefecture_code"`
	Location         string  `bun:"location,type:geography(POINT,4326)" json:"location"` // PostGIS Point
	Distance         float64 `bun:"distance,scanonly" json:"distance,omitempty"`         // 検索時の距離(m)
	TotalScore       float64 `bun:"-" json:"total_score"`                                // 総合スコア (DBには保存しない)
	Address          string  `bun:"address" json:"address"`

	// Relations or calculated fields
	Lines       []Line       `bun:"rel:has-many,join:id=station_id" json:"lines,omitempty"`
	MarketPrice *MarketPrice `bun:"rel:has-one,join:station_code=station_code" json:"market_price,omitempty"`
}

type Line struct {
	bun.BaseModel `bun:"table:lines,alias:l"`

	ID        int64  `bun:"id,pk,autoincrement" json:"id"`
	StationID int64  `bun:"station_id,notnull" json:"station_id"`
	LineName  string `bun:"line_name,notnull" json:"line_name"`
}

type StationRepository interface {
	GetNearby(ctx context.Context, lat, lon float64, radiusMeter int) ([]*Station, error)
	GetStation(ctx context.Context, id int64) (*Station, error)
	GetByLine(ctx context.Context, organizationCode, lineName string) ([]*Station, error)
}

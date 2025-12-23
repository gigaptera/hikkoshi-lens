package domain

import (
	"time"

	"github.com/uptrace/bun"
)

type MarketPrice struct {
	bun.BaseModel `bun:"table:market_prices,alias:mp"`
	ID            int64     `bun:"id,pk,autoincrement" json:"id"`
	StationID     int64     `bun:"station_id,notnull" json:"station_id"`
	BuildingType  string    `bun:"building_type,notnull" json:"building_type"` // mansion, apart, detached ...
	Layout        string    `bun:"layout,notnull" json:"layout"`               // 1r, 1k_1dk, 1ldk_2k_2dk ...
	Rent          float64   `bun:"avg_rent,notnull" json:"rent"`               // Average rent in yen
	Source        string    `bun:"source" json:"source"`
	CreatedAt     time.Time `bun:"created_at,nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt     time.Time `bun:"updated_at,nullzero,notnull,default:current_timestamp" json:"updated_at"`
}

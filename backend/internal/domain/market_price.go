package domain

import (
	"time"

	"github.com/uptrace/bun"
)

type MarketPrice struct {
	bun.BaseModel `bun:"table:market_prices,alias:mp"`

	ID          int64     `bun:"id,pk,autoincrement" json:"id"`
	StationCode string    `bun:"station_code,notnull,unique" json:"station_code"`
	MinRent     float64   `bun:"min_rent" json:"min_rent"`         // 最低家賃（未使用かも）
	MaxRent     float64   `bun:"max_rent" json:"max_rent"`         // 最高家賃（未使用かも）
	AvgRent     float64   `bun:"avg_rent,notnull" json:"avg_rent"` // 平均家賃（万円）
	CreatedAt   time.Time `bun:"created_at,nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt   time.Time `bun:"updated_at,nullzero,notnull,default:current_timestamp" json:"updated_at"`
}

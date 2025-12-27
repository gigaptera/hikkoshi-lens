package repository

import (
	"context"
	"fmt"
	"log"

	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain"
	"github.com/uptrace/bun"
)

type stationRepository struct {
	db *bun.DB
}

func NewStationRepository(db *bun.DB) domain.StationRepository {
	return &stationRepository{db: db}
}

func (r *stationRepository) GetNearby(ctx context.Context, lat, lon float64, filter domain.StationFilter) ([]*domain.Station, error) {
	var stations []*domain.Station

	// PostGIS ST_DWithin query
	pointWKT := fmt.Sprintf("POINT(%f %f)", lon, lat)

	q := r.db.NewSelect().
		Model(&stations).
		Column("s.id", "s.station_code", "s.organization_code", "s.line_name", "s.name", "s.prefecture_code", "s.address").
		ColumnExpr("ST_AsText(location) AS location").
		ColumnExpr("ST_Distance(location, ST_GeogFromText(?)) AS distance", pointWKT).
		Where("ST_DWithin(location, ST_GeogFromText(?), ?)", pointWKT, filter.RadiusMeter)

	// Apply Rent Filters via Join
	// 建物種別と間取りが両方指定されている場合のみMarketPricesをロード
	if filter.BuildingType != "" && filter.Layout != "" {
		// 両方の条件が揃っている場合のみ、該当するMarketPricesを取得
		q = q.Relation("MarketPrices", func(q *bun.SelectQuery) *bun.SelectQuery {
			q = q.Where("building_type = ?", filter.BuildingType)
			q = q.Where("layout = ?", filter.Layout)
			// 家賃範囲フィルター（オプション）
			if filter.MinRent > 0 {
				q = q.Where("mp.avg_rent >= ?", filter.MinRent)
			}
			if filter.MaxRent > 0 {
				q = q.Where("mp.avg_rent <= ?", filter.MaxRent)
			}
			return q
		})
	}
	// どちらか一方でも未指定の場合、MarketPricesは取得しない
	// これにより、条件が不完全な状態では家賃データを表示しない

	err := q.OrderExpr("distance ASC").Scan(ctx)

	if err != nil {
		log.Printf("Error querying nearby stations: %v", err)
		return nil, err
	}

	// Manual Filtering for MarketPrice existence/Range if Bun Relation doesn't handle parent filtering easily
	// OR use Where("EXISTS (...)")
	// For simplicity, let's filter in Service or accept that stations might have empty MarketPrices if no match

	// Refine: We DO want to filter stations that don't match the criteria if criteria are present
	if filter.MinRent > 0 || filter.MaxRent > 0 {
		// Filter in memory for now as Relation filter is complex on Parent
		var filtered []*domain.Station
		for _, s := range stations {
			valid := false
			for _, mp := range s.MarketPrices {
				// Re-check logic as Relation filter above might have only fetched matching prices
				// If we have matching prices, check rent range
				if (filter.MinRent == 0 || mp.Rent >= filter.MinRent) &&
					(filter.MaxRent == 0 || mp.Rent <= filter.MaxRent) {
					valid = true
					break
				}
			}
			if valid {
				filtered = append(filtered, s)
			}
		}
		stations = filtered
	}

	return stations, nil
}

func (r *stationRepository) GetStation(ctx context.Context, id int64) (*domain.Station, error) {
	station := new(domain.Station)
	err := r.db.NewSelect().
		Model(station).
		Column("id", "station_code", "organization_code", "line_name", "name", "prefecture_code", "address").
		ColumnExpr("ST_AsText(location) AS location").
		Relation("MarketPrices").
		Where("s.id = ?", id).
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return station, nil
}

func (r *stationRepository) GetByLine(ctx context.Context, organizationCode, lineName string) ([]*domain.Station, error) {
	var stations []*domain.Station
	err := r.db.NewSelect().
		Model(&stations).
		Column("id", "station_code", "organization_code", "line_name", "name", "prefecture_code", "address").
		ColumnExpr("ST_AsText(location) AS location").
		Relation("MarketPrices").
		Where("s.organization_code = ? AND s.line_name = ?", organizationCode, lineName).
		Scan(ctx)
	return stations, err
}

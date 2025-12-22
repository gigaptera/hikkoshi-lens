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

func (r *stationRepository) GetNearby(ctx context.Context, lat, lon float64, radiusMeter int) ([]*domain.Station, error) {
	var stations []*domain.Station

	// PostGIS ST_DWithin query
	// location is GEOGRAPHY(POINT, 4326)
	// We use ST_AsText to fetch location as WKT string for the frontend
	pointWKT := fmt.Sprintf("POINT(%f %f)", lon, lat)

	err := r.db.NewSelect().
		Model(&stations).
		Column("id", "station_code", "organization_code", "line_name", "name", "prefecture_code", "address").
		ColumnExpr("ST_AsText(location) AS location").
		ColumnExpr("ST_Distance(location, ST_GeogFromText(?)) AS distance", pointWKT).
		Relation("MarketPrice").
		Where("ST_DWithin(location, ST_GeogFromText(?), ?)", pointWKT, radiusMeter).
		OrderExpr("distance ASC").
		Scan(ctx)

	if err != nil {
		log.Printf("Error querying nearby stations: %v", err)
		return nil, err
	}

	return stations, nil
}

func (r *stationRepository) GetStation(ctx context.Context, id int64) (*domain.Station, error) {
	station := new(domain.Station)
	err := r.db.NewSelect().
		Model(station).
		Column("id", "station_code", "organization_code", "line_name", "name", "prefecture_code", "address").
		ColumnExpr("ST_AsText(location) AS location").
		Relation("MarketPrice").
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
		Relation("MarketPrice").
		Where("s.organization_code = ? AND s.line_name = ?", organizationCode, lineName).
		Scan(ctx)
	return stations, err
}

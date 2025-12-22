package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

// Input JSON structure
type StationData struct {
	Company     string    `json:"company"`
	Line        string    `json:"line"`
	Station     string    `json:"station"`
	StationCode string    `json:"stationcode"`
	Coordinates []float64 `json:"coordinates"` // [longitude, latitude]
}

// DB Model
type Station struct {
	bun.BaseModel    `bun:"table:stations,alias:s"`
	ID               int64  `bun:"id,pk,autoincrement"`
	StationCode      string `bun:"station_code,unique"`
	OrganizationCode string `bun:"organization_code"`
	LineName         string `bun:"line_name"`
	Name             string `bun:"name"`
	PrefectureCode   int    `bun:"prefecture_code"`
	Location         string `bun:"location,type:geography(POINT,4326)"`
	Address          string `bun:"address"`
}

func main() {
	if err := godotenv.Load("backend/.env"); err != nil {
		if err := godotenv.Load(".env"); err != nil {
			log.Println("No .env file found")
		}
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:postgres@localhost:54322/postgres?sslmode=disable"
	}

	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))
	db := bun.NewDB(sqldb, pgdialect.New())
	defer db.Close()

	ctx := context.Background()

	// Load JSON file
	jsonPath := "../data/processed/stationcode.json"
	file, err := os.Open(jsonPath)
	if err != nil {
		log.Fatalf("Failed to open JSON file: %v", err)
	}
	defer file.Close()

	var stationList []StationData
	if err := json.NewDecoder(file).Decode(&stationList); err != nil {
		log.Fatalf("Failed to decode JSON: %v", err)
	}
	fmt.Printf("Loaded %d station data entries\n", len(stationList))

	// Prepare Station objects with deduplication
	stationMap := make(map[string]Station)
	for _, d := range stationList {
		if len(d.Coordinates) != 2 {
			log.Printf("Invalid coordinates for station %s: %v", d.Station, d.Coordinates)
			continue
		}

		// Skip if already seen (keep first occurrence)
		if _, exists := stationMap[d.StationCode]; exists {
			continue
		}

		// PostGIS POINT format: POINT(longitude latitude)
		location := fmt.Sprintf("POINT(%f %f)", d.Coordinates[0], d.Coordinates[1])

		// organization_code is not in JSON, using company name for now
		// prefecture_code is not in JSON, using 0 for now
		station := Station{
			StationCode:      d.StationCode,
			OrganizationCode: d.Company, // Ideally should map to proper codes
			LineName:         d.Line,
			Name:             d.Station,
			PrefectureCode:   0, // TODO: derive from coordinates or separate mapping
			Location:         location,
			Address:          "",
		}
		stationMap[d.StationCode] = station
	}

	// Convert map to slice
	var stations []Station
	for _, station := range stationMap {
		stations = append(stations, station)
	}

	if len(stations) == 0 {
		log.Println("No valid stations found.")
		return
	}

	// Bulk Insert with conflict handling
	_, err = db.NewInsert().Model(&stations).
		On("CONFLICT (station_code) DO UPDATE").
		Set("organization_code = EXCLUDED.organization_code").
		Set("line_name = EXCLUDED.line_name").
		Set("name = EXCLUDED.name").
		Set("location = EXCLUDED.location").
		Exec(ctx)
	if err != nil {
		log.Fatalf("Failed to insert stations: %v", err)
	}

	fmt.Printf("Successfully inserted/updated %d stations\n", len(stations))
}

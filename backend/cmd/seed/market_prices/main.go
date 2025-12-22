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
type RentData struct {
	StationCode string  `json:"stationcode"`
	Rent        float64 `json:"rent"`
	Company     string  `json:"company"`
	Line        string  `json:"line"`
	Station     string  `json:"station"`
}

// DB Models
type Station struct {
	bun.BaseModel `bun:"table:stations,alias:s"`
	ID            int64  `bun:"id,pk"`
	StationCode   string `bun:"station_code"`
}

type MarketPrice struct {
	bun.BaseModel `bun:"table:market_prices,alias:mp"`
	ID            int64   `bun:"id,pk,autoincrement"`
	StationID     int64   `bun:"station_id,unique"`
	AvgRent1R     float64 `bun:"avg_rent_1r"`
	AvgRent1LDK   float64 `bun:"avg_rent_1ldk"` // JSONには1つの値しかないので、一旦ここには入れないか、同じ値を入れるか検討。現状は1Rとして扱う。
	Source        string  `bun:"source"`
}

func main() {
	// Load .env from backend root or project root.
	// Assuming running from project root, load backend/.env or just environment variables.
	// Try loading backend/.env
	if err := godotenv.Load("backend/.env"); err != nil {
		// If failed, try loading from current dir or just rely on env
		if err := godotenv.Load(".env"); err != nil {
			log.Println("No .env file found")
		}
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Fallback or constructing from parts
		dsn = "postgres://postgres:postgres@localhost:54322/postgres?sslmode=disable"
	}

	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))
	db := bun.NewDB(sqldb, pgdialect.New())
	defer db.Close()

	ctx := context.Background()

	// 1. Load JSON file
	jsonPath := "../data/processed/rent_market_price_integrated.json"
	file, err := os.Open(jsonPath)
	if err != nil {
		log.Fatalf("Failed to open JSON file: %v", err)
	}
	defer file.Close()

	var rentList []RentData
	if err := json.NewDecoder(file).Decode(&rentList); err != nil {
		log.Fatalf("Failed to decode JSON: %v", err)
	}
	fmt.Printf("Loaded %d rent data entries\n", len(rentList))

	// 2. Load Stations to created Code -> ID map
	var stations []Station
	if err := db.NewSelect().Model(&stations).Scan(ctx); err != nil {
		log.Fatalf("Failed to fetch stations: %v", err)
	}

	stationMap := make(map[string]int64)
	for _, s := range stations {
		stationMap[s.StationCode] = s.ID
	}
	fmt.Printf("Loaded %d stations from DB\n", len(stations))

	// 3. Prepare MarketPrice objects
	var marketPrices []MarketPrice

	// 重複除外用
	seen := make(map[int64]bool)

	for _, d := range rentList {
		// stationcode in JSON might need padding if it was stripped, but file view showed "000223" so likely zero-padded.
		// StationCode in DB should also match.

		sid, ok := stationMap[d.StationCode]
		if !ok {
			// log.Printf("Station code not found in DB: %s (%s)", d.StationCode, d.Station)
			continue
		}

		if seen[sid] {
			continue
		}
		seen[sid] = true

		mp := MarketPrice{
			StationID: sid,
			AvgRent1R: d.Rent, // Assuming the 'rent' in JSON is for 1R/1K
			// AvgRent1LDK: 0, // No data
			Source: "SUUMO_JSON_2024",
		}
		marketPrices = append(marketPrices, mp)
	}

	if len(marketPrices) == 0 {
		log.Println("No matched stations found. Check station codes.")
		return
	}

	// 4. Bulk Insert
	// Debug: print first entry
	if len(marketPrices) > 0 {
		fmt.Printf("Sample entry: %+v\n", marketPrices[0])
	}

	// On Conflict Update
	_, err = db.NewInsert().
		Model(&marketPrices).
		Column("station_id", "avg_rent_1r", "source").
		On("CONFLICT (station_id) DO UPDATE").
		Set("avg_rent_1r = EXCLUDED.avg_rent_1r").
		Set("source = EXCLUDED.source").
		Exec(ctx)
	if err != nil {
		log.Fatalf("Failed to insert market prices: %v", err)
	}

	fmt.Printf("Successfully inserted/updated %d market prices\n", len(marketPrices))
}

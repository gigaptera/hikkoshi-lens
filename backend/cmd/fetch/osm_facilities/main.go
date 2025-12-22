package main

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

// DB Models
type Station struct {
	bun.BaseModel `bun:"table:stations,alias:s"`
	ID            int64   `bun:"id,pk"`
	Name          string  `bun:"name"`
	Location      string  `bun:"location,type:geography(POINT,4326)"`
	Lat           float64 `bun:"-"`
	Lon           float64 `bun:"-"`
}

type Facility struct {
	bun.BaseModel          `bun:"table:facilities,alias:f"`
	ID                     int64 `bun:"id,pk,autoincrement"`
	StationID              int64 `bun:"station_id,unique"`
	SupermarketsCount      int   `bun:"supermarkets_count"`
	ConvenienceStoresCount int   `bun:"convenience_stores_count"`
	HospitalsCount         int   `bun:"hospitals_count"`
	DrugstoresCount        int   `bun:"drugstores_count"`
	RestaurantsCount       int   `bun:"restaurants_count"`
	GymsCount              int   `bun:"gyms_count"`
	ParksCount             int   `bun:"parks_count"`
}

// Overpass API response
type OverpassResponse struct {
	Elements []OverpassElement `json:"elements"`
}

type OverpassElement struct {
	Type string                 `json:"type"`
	Tags map[string]interface{} `json:"tags"`
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

	// Load stations with location data
	type StationWithCoords struct {
		ID   int64   `bun:"id"`
		Name string  `bun:"name"`
		Lat  float64 `bun:"lat"`
		Lon  float64 `bun:"lon"`
	}

	var stationsData []StationWithCoords
	err := db.NewRaw(`
		SELECT id, name, 
		       ST_Y(location::geometry) as lat, 
		       ST_X(location::geometry) as lon
		FROM stations 
		WHERE location IS NOT NULL
		LIMIT 10
	`).Scan(ctx, &stationsData)

	if err != nil {
		log.Fatalf("Failed to fetch stations: %v", err)
	}

	fmt.Printf("Fetching facility data for %d stations (sample)\\n", len(stationsData))

	client := &http.Client{Timeout: 30 * time.Second}

	for i, station := range stationsData {
		fmt.Printf("[%d/%d] Processing %s...\\n", i+1, len(stationsData), station.Name)

		facilities := Facility{
			StationID: station.ID,
		}

		// Query Overpass API for each amenity type
		facilities.SupermarketsCount = queryOverpass(client, station.Lat, station.Lon, `shop=supermarket`)
		time.Sleep(1 * time.Second) // Rate limiting

		facilities.ConvenienceStoresCount = queryOverpass(client, station.Lat, station.Lon, `shop=convenience`)
		time.Sleep(1 * time.Second)

		facilities.HospitalsCount = queryOverpass(client, station.Lat, station.Lon, `amenity=hospital`)
		time.Sleep(1 * time.Second)

		facilities.DrugstoresCount = queryOverpass(client, station.Lat, station.Lon, `shop=chemist`)
		time.Sleep(1 * time.Second)

		facilities.RestaurantsCount = queryOverpass(client, station.Lat, station.Lon, `amenity=restaurant`)
		time.Sleep(1 * time.Second)

		facilities.GymsCount = queryOverpass(client, station.Lat, station.Lon, `leisure=fitness_centre`)
		time.Sleep(1 * time.Second)

		facilities.ParksCount = queryOverpass(client, station.Lat, station.Lon, `leisure=park`)
		time.Sleep(1 * time.Second)

		// Insert into DB
		_, err := db.NewInsert().Model(&facilities).
			On("CONFLICT (station_id) DO UPDATE").
			Set("supermarkets_count = EXCLUDED.supermarkets_count").
			Set("convenience_stores_count = EXCLUDED.convenience_stores_count").
			Set("hospitals_count = EXCLUDED.hospitals_count").
			Set("drugstores_count = EXCLUDED.drugstores_count").
			Set("restaurants_count = EXCLUDED.restaurants_count").
			Set("gyms_count = EXCLUDED.gyms_count").
			Set("parks_count = EXCLUDED.parks_count").
			Exec(ctx)

		if err != nil {
			log.Printf("Failed to insert facilities for station %d: %v", station.ID, err)
		}

		fmt.Printf("  → S:%d C:%d H:%d D:%d R:%d G:%d P:%d\\n",
			facilities.SupermarketsCount,
			facilities.ConvenienceStoresCount,
			facilities.HospitalsCount,
			facilities.DrugstoresCount,
			facilities.RestaurantsCount,
			facilities.GymsCount,
			facilities.ParksCount,
		)
	}

	fmt.Println("Facility data fetch completed!")
}

func queryOverpass(client *http.Client, lat, lon float64, filter string) int {
	// Overpass QL query: find POIs within 800m radius
	query := fmt.Sprintf(`
[out:json][timeout:25];
(
  node[%s](around:800,%f,%f);
  way[%s](around:800,%f,%f);
);
out count;
`, filter, lat, lon, filter, lat, lon)

	req, err := http.NewRequest("POST", "https://overpass-api.de/api/interpreter", bytes.NewBufferString(query))
	if err != nil {
		log.Printf("Failed to create request: %v", err)
		return 0
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to query Overpass API: %v", err)
		return 0
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("Overpass API error %d: %s", resp.StatusCode, string(body))
		return 0
	}

	var result OverpassResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		log.Printf("Failed to decode response: %v", err)
		return 0
	}

	return len(result.Elements)
}

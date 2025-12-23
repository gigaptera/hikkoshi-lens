package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/gigaptera/hikkoshi-lens/backend/internal/config"
	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain"
	"github.com/gigaptera/hikkoshi-lens/backend/internal/infrastructure"
)

type StationJSON struct {
	StationCode string    `json:"stationcode"`
	Name        string    `json:"station"`
	LineName    string    `json:"line"`
	Company     string    `json:"company"`
	Coordinates []float64 `json:"coordinates"` // [lon, lat]
}

type MarketPriceJSON struct {
	StationCode interface{} `json:"stationcode"` // 数値または文字列
	Rent        float64     `json:"rent"`
}

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Printf("Warning: failed to load config: %v", err)
	}

	if cfg.DatabaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	db := infrastructure.NewDB(cfg.DatabaseURL)
	defer db.Close()

	ctx := context.Background()

	// テーブル作成
	if _, err := db.Exec("CREATE EXTENSION IF NOT EXISTS postgis"); err != nil {
		log.Printf("Warning: failed to create postgis extension: %v", err)
	}

	// テーブルをリセットしてから作成
	if _, err := db.NewDropTable().Model((*domain.Station)(nil)).IfExists().Exec(ctx); err != nil {
		log.Printf("Warning: failed to drop stations table: %v", err)
	}
	if _, err := db.NewCreateTable().Model((*domain.Station)(nil)).Exec(ctx); err != nil {
		log.Fatal(err)
	}

	if _, err := db.NewDropTable().Model((*domain.Line)(nil)).IfExists().Exec(ctx); err != nil {
		log.Printf("Warning: failed to drop lines table: %v", err)
	}
	if _, err := db.NewCreateTable().Model((*domain.Line)(nil)).Exec(ctx); err != nil {
		log.Fatal(err)
	}

	// MarketPriceテーブル作成
	if _, err := db.NewDropTable().Model((*domain.MarketPrice)(nil)).IfExists().Exec(ctx); err != nil {
		log.Printf("Warning: failed to drop market_prices table: %v", err)
	}
	if _, err := db.NewCreateTable().Model((*domain.MarketPrice)(nil)).Exec(ctx); err != nil {
		log.Fatal(err)
	}

	// Create Unique Index for Upsert
	if _, err := db.ExecContext(ctx, "CREATE UNIQUE INDEX IF NOT EXISTS uq_station_building_layout ON market_prices (station_id, building_type, layout)"); err != nil {
		log.Printf("Warning: failed to create unique index: %v", err)
	}

	// 1. Stationデータの読み込み (stationcode.json)
	stationJsonPath := filepath.Join("..", "data", "processed", "stationcode.json")
	bytes, err := os.ReadFile(stationJsonPath)
	if err != nil {
		log.Fatalf("Failed to read station json: %v", err)
	}

	var stationData []StationJSON
	if err := json.Unmarshal(bytes, &stationData); err != nil {
		log.Fatalf("Failed to parse station json: %v", err)
	}

	log.Printf("Found %d stations in JSON", len(stationData))

	// Deduplicate Stations
	uniqueStationsMap := make(map[string]domain.Station)
	for _, s := range stationData {
		var lon, lat float64
		if len(s.Coordinates) >= 2 {
			lon = s.Coordinates[0]
			lat = s.Coordinates[1]
		}

		st := domain.Station{
			StationCode:      s.StationCode,
			OrganizationCode: s.Company,
			LineName:         s.LineName,
			Name:             s.Name,
			Location:         fmt.Sprintf("POINT(%f %f)", lon, lat),
		}
		// StationCodeをキーにして重複排除（後勝ち）
		uniqueStationsMap[s.StationCode] = st
	}

	var stations []domain.Station
	for _, v := range uniqueStationsMap {
		stations = append(stations, v)
	}
	log.Printf("Unique Stations: %d", len(stations))

	// Bulk Insert Stations (Upsert)
	batchSize := 1000
	for i := 0; i < len(stations); i += batchSize {
		end := i + batchSize
		if end > len(stations) {
			end = len(stations)
		}
		sub := stations[i:end]
		// StationCodeで重複排除 (OnConflict)
		_, err := db.NewInsert().Model(&sub).
			On("CONFLICT (station_code) DO UPDATE").
			Set("organization_code = EXCLUDED.organization_code").
			Set("line_name = EXCLUDED.line_name").
			Set("name = EXCLUDED.name").
			Set("location = EXCLUDED.location").
			Exec(ctx)
		if err != nil {
			log.Printf("Failed to insert stations batch %d-%d: %v", i, end, err)
		} else {
			log.Printf("Inserted/Updated stations batch %d-%d", i, end)
		}
	}

	// 2. MarketPriceデータの読み込み (一時的に無効化 - 新しいスクレイピングデータ待ち)
	/*
		priceJsonPath := filepath.Join("..", "data", "processed", "rent_market_price_integrated.json")
		priceBytes, err := os.ReadFile(priceJsonPath)
		if err != nil {
			log.Printf("Warning: Failed to read market price json: %v", err)
		} else {
			var priceData []MarketPriceJSON
			if err := json.Unmarshal(priceBytes, &priceData); err != nil {
				log.Fatalf("Failed to parse market price json: %v", err)
			}

			log.Printf("Found %d market prices", len(priceData))

			// Deduplicate Prices
			uniquePricesMap := make(map[string]domain.MarketPrice)
			for _, p := range priceData {
				// StationCodeを文字列に変換
				scStr := fmt.Sprintf("%v", p.StationCode)

				mp := domain.MarketPrice{
					// StationCode: scStr, // OLD Struct
					// AvgRent:     p.Rent, // OLD Struct
				}
				uniquePricesMap[scStr] = mp
			}

			var prices []domain.MarketPrice
			for _, v := range uniquePricesMap {
				prices = append(prices, v)
			}
			log.Printf("Unique Prices: %d", len(prices))

			// Bulk Insert MarketPrices
			for i := 0; i < len(prices); i += batchSize {
				end := i + batchSize
				if end > len(prices) {
					end = len(prices)
				}
				sub := prices[i:end]
				_, err := db.NewInsert().Model(&sub).
					On("CONFLICT (station_code) DO UPDATE"). // OLD Constraint
					Set("avg_rent = EXCLUDED.avg_rent").
					Set("updated_at = current_timestamp").
					Exec(ctx)
				if err != nil {
					log.Printf("Failed to insert prices batch %d-%d: %v", i, end, err)
				} else {
					log.Printf("Inserted/Updated prices batch %d-%d", i, end)
				}
			}
		}
	*/

	log.Println("Seeding completed!")
}

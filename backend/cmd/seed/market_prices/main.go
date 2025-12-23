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
	StationID     int64   `bun:"station_id"`
	BuildingType  string  `bun:"building_type"`
	Layout        string  `bun:"layout"`
	AvgRent       float64 `bun:"avg_rent"`
	Source        string  `bun:"source"`
}

func main() {
	// Load .env
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

	// 1. Load JSON file (元データ - 1R/1Kの家賃相場)
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

	// 2. Load Stations
	var stations []Station
	if err := db.NewSelect().Model(&stations).Scan(ctx); err != nil {
		log.Fatalf("Failed to fetch stations: %v", err)
	}

	stationMap := make(map[string]int64)
	for _, s := range stations {
		stationMap[s.StationCode] = s.ID
	}
	fmt.Printf("Loaded %d stations from DB\n", len(stations))

	// 3. 元データから駅ごとの基準家賃を取得
	baseRentMap := make(map[int64]float64) // station_id -> 基準家賃(1R/1K)
	for _, d := range rentList {
		sid, ok := stationMap[d.StationCode]
		if !ok {
			continue
		}
		// 重複がある場合は最初の値を使用
		if _, exists := baseRentMap[sid]; !exists {
			baseRentMap[sid] = d.Rent
		}
	}

	if len(baseRentMap) == 0 {
		log.Println("No matched stations found. Check station codes.")
		return
	}

	fmt.Printf("Found base rent data for %d stations\n", len(baseRentMap))

	// 4. 15通りの組み合わせを生成
	buildingTypes := []string{"mansion", "apart", "detached"}
	layouts := []string{"1r_1k_1dk", "1ldk_2k_2dk", "2ldk_3k_3dk", "3ldk_4k", "4ldk"}

	// 調整係数 (建物種別)
	buildingMultiplier := map[string]float64{
		"mansion":  1.2, // マンションは1.2倍
		"apart":    1.0, // アパートは基準
		"detached": 0.8, // 戸建ては0.8倍（データが少ない想定）
	}

	// 調整係数 (間取り)
	layoutMultiplier := map[string]float64{
		"1r_1k_1dk":   1.0, // 基準（元データ）
		"1ldk_2k_2dk": 1.3, // 1.3倍
		"2ldk_3k_3dk": 1.6, // 1.6倍
		"3ldk_4k":     2.0, // 2.0倍
		"4ldk":        2.5, // 2.5倍
	}

	var marketPrices []MarketPrice

	for stationID, baseRent := range baseRentMap {
		for _, buildingType := range buildingTypes {
			for _, layout := range layouts {
				// 家賃を計算
				adjustedRent := baseRent * buildingMultiplier[buildingType] * layoutMultiplier[layout]

				mp := MarketPrice{
					StationID:    stationID,
					BuildingType: buildingType,
					Layout:       layout,
					AvgRent:      adjustedRent,
					Source:       "SUUMO_ESTIMATED_2024",
				}
				marketPrices = append(marketPrices, mp)
			}
		}
	}

	fmt.Printf("Generated %d market price entries (15 combinations per station)\n", len(marketPrices))

	// 5. Bulk Insert (バッチ処理)
	batchSize := 1000
	for i := 0; i < len(marketPrices); i += batchSize {
		end := i + batchSize
		if end > len(marketPrices) {
			end = len(marketPrices)
		}

		batch := marketPrices[i:end]

		_, err = db.NewInsert().
			Model(&batch).
			On("CONFLICT (station_id, building_type, layout) DO UPDATE").
			Set("avg_rent = EXCLUDED.avg_rent").
			Set("source = EXCLUDED.source").
			Exec(ctx)

		if err != nil {
			log.Fatalf("Failed to insert market prices (batch %d-%d): %v", i, end, err)
		}

		fmt.Printf("Inserted batch %d-%d\n", i, end)
	}

	fmt.Printf("Successfully inserted/updated %d market prices\n", len(marketPrices))
}

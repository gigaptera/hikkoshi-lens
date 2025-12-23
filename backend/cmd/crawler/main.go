package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

// Constants
const (
	UserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
	BaseURL   = "https://suumo.jp"
)

type ScrapeTarget struct {
	BuildingType string // mansion, apart, detached
	TsParam      string // 1, 2, 3
}

var targets = []ScrapeTarget{
	{BuildingType: "mansion", TsParam: "1"},
	{BuildingType: "apart", TsParam: "2"},
	{BuildingType: "detached", TsParam: "3"},
}

func main() {
	// Initialize DB
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Fallback for local
		dsn = "postgres://postgres:postgres@localhost:5432/hikkoshi?sslmode=disable"
	}
	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))
	db := bun.NewDB(sqldb, pgdialect.New())
	defer db.Close()

	ctx := context.Background()

	// 1. Fetch all stations from DB to create a Map for matching
	var stations []domain.Station
	if err := db.NewSelect().Model(&stations).Scan(ctx); err != nil {
		log.Fatalf("Failed to fetch stations: %v", err)
	}
	log.Printf("Loaded %d stations from DB", len(stations))

	// Map: "StationName" -> Entity
	// Note: Names might strictly match "新宿" vs "新宿駅".
	// SUUMO usually uses "新宿" in lists but title might be "新宿駅".
	stationMap := make(map[string]domain.Station)
	for _, s := range stations {
		// Normalize: Remove "駅" suffix if present (though internal naming is inconsistent, let's assume we handle both)
		name := strings.TrimSuffix(s.Name, "駅")
		stationMap[name] = s
	}

	// 2. Start Crawling
	// Entry point: Tokyo Lines
	startURL := "https://suumo.jp/chintai/soba/tokyo/ensen/"
	crawlLines(ctx, db, startURL, stationMap)
}

func crawlLines(ctx context.Context, db *bun.DB, url string, stationMap map[string]domain.Station) {
	doc := fetch(url)
	if doc == nil {
		return
	}

	// Selector for Lines. This is unique to SUUMO structure.
	// Usually strict structure like: .searchtable a
	// We might need to adjust this selector based on actual HTML.
	// For now, finding links containing "en_"
	doc.Find("a").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists {
			return
		}
		// Example: /chintai/soba/tokyo/en_yamanote/
		if strings.Contains(href, "/chintai/soba/tokyo/en_") {
			fullURL := BaseURL + href
			log.Printf("Found Line: %s", fullURL)
			crawlStations(ctx, db, fullURL, stationMap)
		}
	})
}

func crawlStations(ctx context.Context, db *bun.DB, url string, stationMap map[string]domain.Station) {
	doc := fetch(url)
	if doc == nil {
		return
	}

	// Find Station Links
	// Example: /chintai/soba/tokyo/ek_20110/?ts=1
	doc.Find("a").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists {
			return
		}
		if strings.Contains(href, "/ek_") {
			// Extract Station Name
			stationName := strings.TrimSpace(s.Text())
			// Normalize
			stationName = strings.TrimSuffix(stationName, "駅")

			// Check if we have this station in DB
			if st, ok := stationMap[stationName]; ok {
				// Crawl this station
				crawlMarketPrice(ctx, db, BaseURL+href, st)
			}
		}
	})
}

func crawlMarketPrice(ctx context.Context, db *bun.DB, baseURL string, station domain.Station) {
	// Loop through Building Types
	for _, target := range targets {
		// Construct URL: Strip existing params and add ts
		base := strings.Split(baseURL, "?")[0]
		url := fmt.Sprintf("%s?ts=%s", base, target.TsParam)

		log.Printf("Scraping %s (%s) - %s", station.Name, target.BuildingType, url)

		doc := fetch(url)
		if doc == nil {
			continue
		}

		// Parse Table
		// Attempt to see if we found any table
		tableCount := doc.Find("table").Length()
		if tableCount == 0 {
			log.Printf("Warning: No table found for %s", url)
		}

		foundRows := 0
		doc.Find("table").Each(func(i int, s *goquery.Selection) {
			// Basic heuristic: check if headers contain "間取り" or layouts
			if strings.Contains(s.Text(), "間取り") || strings.Contains(s.Text(), "家賃相場") {
				// Iterate rows
				s.Find("tr").Each(func(j int, tr *goquery.Selection) {
					// Try to find Layout and Price
					var layoutTxt, priceTxt string

					// Strategy 1: TH (Layout) + TD (Price)
					if tr.Find("th").Length() > 0 {
						layoutTxt = strings.TrimSpace(tr.Find("th").Text())
						priceTxt = strings.TrimSpace(tr.Find("td").Eq(0).Text()) // First TD
					} else {
						// Strategy 2: TD (Layout) + TD (Price)
						layoutTxt = strings.TrimSpace(tr.Find("td").Eq(0).Text())
						priceTxt = strings.TrimSpace(tr.Find("td").Eq(1).Text())
					}

					// Cleanup newlines/tabs
					layoutTxt = strings.TrimSpace(layoutTxt)
					priceTxt = strings.TrimSpace(priceTxt)

					// log.Printf("Debug Row %d: L='%s' P='%s'", j, layoutTxt, priceTxt)

					if layoutTxt != "" && priceTxt != "" {
						parseAndSave(ctx, db, station.ID, target.BuildingType, layoutTxt, priceTxt)
						foundRows++
					}
				})
			}
		})

		if foundRows > 0 {
			log.Printf("Found %d price entries for %s", foundRows, station.Name)
		} else {
			log.Printf("Warning: No price entries found for %s", station.Name)
		}

		time.Sleep(1 * time.Second) // Polite interval
	}
}

func parseAndSave(ctx context.Context, db *bun.DB, stationID int64, buildingType, layoutRaw, priceRaw string) {
	// Normalize Layout
	layout := normalizeLayout(layoutRaw)
	if layout == "" {
		// log.Printf("Skipping unknown layout: %s", layoutRaw)
		return
	}

	// Parse Price (e.g., "8.5万円")
	// Clean string
	priceRaw = strings.ReplaceAll(priceRaw, "万円", "")
	priceRaw = strings.ReplaceAll(priceRaw, "-", "") // No data
	priceRaw = strings.TrimSpace(priceRaw)

	if priceRaw == "" {
		return
	}

	var price float64
	_, err := fmt.Sscanf(priceRaw, "%f", &price)
	if err != nil {
		// log.Printf("Failed to parse price '%s': %v", priceRaw, err)
		return
	}

	mp := domain.MarketPrice{
		StationID:    stationID,
		BuildingType: buildingType,
		Layout:       layout,
		Rent:         price,
		Source:       "SUUMO",
	}

	_, err = db.NewInsert().Model(&mp).
		On("CONFLICT (station_id, building_type, layout) DO UPDATE").
		Set("avg_rent = EXCLUDED.avg_rent").
		Set("updated_at = current_timestamp").
		Exec(ctx)

	if err != nil {
		log.Printf("Error inserting: %v", err)
	} else {
		// log.Printf("Saved: %d %s %s %.1f", stationID, buildingType, layout, price)
	}
}

func normalizeLayout(raw string) string {
	// Implement mapping
	// 1r, 1k_1dk, 1ldk_2k_2dk, 2ldk_3k_3dk, 3ldk_4k
	if strings.Contains(raw, "ワンルーム") {
		return "1r"
	}
	if strings.Contains(raw, "1K") || strings.Contains(raw, "1DK") {
		return "1k_1dk"
	}
	if strings.Contains(raw, "1LDK") || strings.Contains(raw, "2K") || strings.Contains(raw, "2DK") {
		return "1ldk_2k_2dk"
	}
	if strings.Contains(raw, "2LDK") || strings.Contains(raw, "3K") || strings.Contains(raw, "3DK") {
		return "2ldk_3k_3dk"
	}
	if strings.Contains(raw, "3LDK") || strings.Contains(raw, "4K") {
		return "3ldk_4k"
	}
	return ""
}

func fetch(url string) *goquery.Document {
	client := &http.Client{Timeout: 30 * time.Second}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", UserAgent)

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Fetch error: %v", err)
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		log.Printf("Status %d for %s", resp.StatusCode, url)
		return nil
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		log.Printf("Parse error: %v", err)
		return nil
	}
	return doc
}

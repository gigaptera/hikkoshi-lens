package helper

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

// LoadStationsFixture は駅データのフィクスチャを読み込む
func LoadStationsFixture(t *testing.T) []map[string]interface{} {
	t.Helper()

	return loadJSONFixture(t, "stations.json")
}

// LoadMarketPricesFixture は市場価格データのフィクスチャを読み込む
func LoadMarketPricesFixture(t *testing.T) []map[string]interface{} {
	t.Helper()

	return loadJSONFixture(t, "market_prices.json")
}

// loadJSONFixture はJSONフィクスチャファイルを読み込む汎用関数
func loadJSONFixture(t *testing.T, filename string) []map[string]interface{} {
	t.Helper()

	// testdataディレクトリのパスを構築
	testdataPath := filepath.Join("..", "testdata", filename)

	// ファイルを読み込む
	data, err := os.ReadFile(testdataPath)
	if err != nil {
		t.Fatalf("Failed to read fixture file %s: %v", filename, err)
	}

	// JSONをパース
	var result []map[string]interface{}
	if err := json.Unmarshal(data, &result); err != nil {
		t.Fatalf("Failed to parse JSON fixture %s: %v", filename, err)
	}

	return result
}

// SeedStationsData はテストデータベースに駅データを投入する
// TODO: 実際のデータベース操作を実装する場合に使用
func SeedStationsData(t *testing.T, db interface{}) {
	t.Helper()

	stations := LoadStationsFixture(t)
	t.Logf("Loaded %d stations from fixture", len(stations))

	// TODO: データベースへの投入処理を実装
	// 例:
	// for _, station := range stations {
	//     db.Insert(station)
	// }
}

// SeedMarketPricesData はテストデータベースに市場価格データを投入する
// TODO: 実際のデータベース操作を実装する場合に使用
func SeedMarketPricesData(t *testing.T, db interface{}) {
	t.Helper()

	prices := LoadMarketPricesFixture(t)
	t.Logf("Loaded %d market prices from fixture", len(prices))

	// TODO: データベースへの投入処理を実装
}

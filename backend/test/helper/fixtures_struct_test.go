package helper_test

import (
	"testing"

	"github.com/gigaptera/hikkoshi-lens/backend/test/helper"
	"github.com/stretchr/testify/assert"
)

// TestGetTestStations はGo構造体フィクスチャのテスト
func TestGetTestStations(t *testing.T) {
	stations := helper.GetTestStations()

	assert.Len(t, stations, 3)
	assert.Equal(t, "東京", stations[0].Name)
	assert.Equal(t, "大手町", stations[1].Name)
	assert.Equal(t, "神田", stations[2].Name)
}

// TestGetTestStation は単一駅データのテスト
func TestGetTestStation(t *testing.T) {
	station := helper.GetTestStation()

	assert.NotNil(t, station)
	assert.Equal(t, int64(1), station.ID)
	assert.Equal(t, "東京", station.Name)
}

// TestGetTestMarketPrices は市場価格データのテスト
func TestGetTestMarketPrices(t *testing.T) {
	prices := helper.GetTestMarketPrices()

	assert.Len(t, prices, 6)
	assert.Equal(t, "mansion", prices[0].BuildingType)
	assert.Equal(t, "1r_1k_1dk", prices[0].Layout)
}

// TestGetTestStationWithPrices は市場価格付き駅データのテスト
func TestGetTestStationWithPrices(t *testing.T) {
	station := helper.GetTestStationWithPrices()

	assert.NotNil(t, station)
	assert.Len(t, station.MarketPrices, 3)
}

// TestGetTestStationFilter はフィルターのテスト
func TestGetTestStationFilter(t *testing.T) {
	filter := helper.GetTestStationFilter()

	assert.Equal(t, 3000, filter.RadiusMeter)
	assert.Equal(t, "mansion", filter.BuildingType)
	assert.Equal(t, "1r_1k_1dk", filter.Layout)
	assert.True(t, filter.CalculateScores)
}

// TestGetTestStations_Empty は空リストのテスト
func TestGetTestStations_Empty(t *testing.T) {
	stations := helper.GetTestStations_Empty()

	assert.Empty(t, stations)
}

// TestGetTestStations_Large は大量データ生成のテスト
func TestGetTestStations_Large(t *testing.T) {
	stations := helper.GetTestStations_Large(100)

	assert.Len(t, stations, 100)
	assert.Equal(t, int64(1), stations[0].ID)
	assert.Equal(t, int64(100), stations[99].ID)
}

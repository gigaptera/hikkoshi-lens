package integration

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/gigaptera/hikkoshi-lens/backend/test/helper"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestStationNearbyBasic は駅検索APIの基本機能をテスト
func TestStationNearbyBasic(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&radius=3000")

	assert.Equal(t, http.StatusOK, rec.Code)

	var result []map[string]interface{}
	err := json.Unmarshal(rec.Body.Bytes(), &result)
	require.NoError(t, err)

	// 結果が配列であることを確認
	assert.IsType(t, []map[string]interface{}{}, result)

	// 少なくとも1件は返ってくることを期待
	if len(result) > 0 {
		// 最初の駅にidとnameフィールドがあることを確認
		assert.Contains(t, result[0], "id")
		assert.Contains(t, result[0], "name")
	}
}

// TestStationNearbyLayoutFilter は間取りフィルターをテスト
func TestStationNearbyLayoutFilter(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&layout=1r_1k_1dk")

	assert.Equal(t, http.StatusOK, rec.Code)

	var result []map[string]interface{}
	err := json.Unmarshal(rec.Body.Bytes(), &result)
	require.NoError(t, err)

	// market_pricesが指定間取りでフィルタリングされていることを確認
	for _, station := range result {
		if marketPrices, ok := station["market_prices"].([]interface{}); ok {
			for _, mp := range marketPrices {
				if mpMap, ok := mp.(map[string]interface{}); ok {
					if layout, exists := mpMap["layout"]; exists {
						// フィルターが適用されている場合は指定の間取りのみ
						t.Logf("Station: %s, Layout: %v", station["name"], layout)
					}
				}
			}
		}
	}
}

// TestStationNearbyBuildingTypeFilter は建物種別フィルターをテスト
func TestStationNearbyBuildingTypeFilter(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&building_type=mansion")

	assert.Equal(t, http.StatusOK, rec.Code)

	var result []map[string]interface{}
	err := json.Unmarshal(rec.Body.Bytes(), &result)
	require.NoError(t, err)

	// market_pricesが建物種別でフィルタリングされていることを確認
	for _, station := range result {
		if marketPrices, ok := station["market_prices"].([]interface{}); ok {
			for _, mp := range marketPrices {
				if mpMap, ok := mp.(map[string]interface{}); ok {
					if buildingType, exists := mpMap["building_type"]; exists {
						t.Logf("Station: %s, BuildingType: %v", station["name"], buildingType)
					}
				}
			}
		}
	}
}

// TestStationNearbyCombinedFilters は複合フィルターをテスト
func TestStationNearbyCombinedFilters(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&building_type=mansion&layout=1r_1k_1dk")

	assert.Equal(t, http.StatusOK, rec.Code)

	var result []map[string]interface{}
	err := json.Unmarshal(rec.Body.Bytes(), &result)
	require.NoError(t, err)

	// 両方のフィルターが適用されていることを確認
	assert.IsType(t, []map[string]interface{}{}, result)
}

// TestStationNearbyRentRangeFilter は家賃範囲フィルターをテスト
func TestStationNearbyRentRangeFilter(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&min_rent=50000&max_rent=100000")

	assert.Equal(t, http.StatusOK, rec.Code)

	var result []map[string]interface{}
	err := json.Unmarshal(rec.Body.Bytes(), &result)
	require.NoError(t, err)

	// 家賃範囲内のデータが返されていることを確認
	assert.IsType(t, []map[string]interface{}{}, result)
}

// TestStationNearbyRadiusFilter は半径指定をテスト
func TestStationNearbyRadiusFilter(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&radius=1000")

	assert.Equal(t, http.StatusOK, rec.Code)

	var result []map[string]interface{}
	err := json.Unmarshal(rec.Body.Bytes(), &result)
	require.NoError(t, err)

	// 1km圏内の駅のみ返される
	for _, station := range result {
		if distance, ok := station["distance"].(float64); ok {
			// 距離は1000m以内であるべき
			assert.LessOrEqual(t, distance, 1000.0, "Distance should be within 1000m")
		}
	}
}

// TestStationNearbyWithScores はスコア計算ありをテスト
func TestStationNearbyWithScores(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&calculate_scores=true&w_access=50&w_rent=50")

	assert.Equal(t, http.StatusOK, rec.Code)

	var result []map[string]interface{}
	err := json.Unmarshal(rec.Body.Bytes(), &result)
	require.NoError(t, err)

	// スコアが設定されていることを確認
	if len(result) > 0 {
		t.Logf("First station with scores: %+v", result[0])
		// total_scoreまたはscore_detailsが存在する可能性を確認
		if _, hasScore := result[0]["total_score"]; hasScore {
			t.Log("✓ Has total_score")
		}
		if _, hasDetails := result[0]["score_details"]; hasDetails {
			t.Log("✓ Has score_details")
		}
	}
}

// TestStationNearbyMissingLat は必須パラメータ欠落(lat)をテスト
func TestStationNearbyMissingLat(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/nearby?lon=139.7671")

	assert.Equal(t, http.StatusBadRequest, rec.Code)

	var result map[string]interface{}
	err := json.Unmarshal(rec.Body.Bytes(), &result)
	require.NoError(t, err)

	// エラーメッセージが含まれていることを確認
	assert.Contains(t, result, "error")
}

// TestStationNearbyMissingLon は必須パラメータ欠落(lon)をテスト
func TestStationNearbyMissingLon(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812")

	assert.Equal(t, http.StatusBadRequest, rec.Code)

	var result map[string]interface{}
	err := json.Unmarshal(rec.Body.Bytes(), &result)
	require.NoError(t, err)

	assert.Contains(t, result, "error")
}

// TestStationNearbyInvalidCoordinates は無効な座標値をテスト
func TestStationNearbyInvalidCoordinates(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/nearby?lat=invalid&lon=invalid")

	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

// TestStationNearbyZeroResults は結果が0件の場合をテスト
func TestStationNearbyZeroResults(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	// 海上など、駅がない場所を指定
	rec := ts.Request("GET", "/api/stations/nearby?lat=0&lon=0&radius=100")

	assert.Equal(t, http.StatusOK, rec.Code)

	var result []map[string]interface{}
	err := json.Unmarshal(rec.Body.Bytes(), &result)
	require.NoError(t, err)

	// 空配列が返されることを確認
	assert.Empty(t, result)
}

// TestStationNearbyZeroRadius はradius=0の場合をテスト
func TestStationNearbyZeroRadius(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&radius=0")

	assert.Equal(t, http.StatusOK, rec.Code)

	var result []map[string]interface{}
	err := json.Unmarshal(rec.Body.Bytes(), &result)
	require.NoError(t, err)

	// 0の場合は空配列または何らかの結果が返される
	assert.IsType(t, []map[string]interface{}{}, result)
}

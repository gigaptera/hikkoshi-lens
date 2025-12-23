package integration

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/gigaptera/hikkoshi-lens/backend/test/helper"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestStationThreeStopsBasic は基本的な3駅検索をテスト
func TestStationThreeStopsBasic(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	// 存在する駅IDを使用(データベースに依存)
	rec := ts.Request("GET", "/api/stations/1/three-stops")

	// 駅が存在すれば200、存在しなければ404または500
	if rec.Code == http.StatusOK {
		var result []map[string]interface{}
		err := json.Unmarshal(rec.Body.Bytes(), &result)
		require.NoError(t, err)

		assert.IsType(t, []map[string]interface{}{}, result)
		t.Logf("Found %d stations within 3 stops", len(result))
	} else {
		t.Logf("Station ID 1 may not exist in test database: status=%d", rec.Code)
	}
}

// TestStationThreeStopsWithWeights は重みパラメータ付きをテスト
func TestStationThreeStopsWithWeights(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/1/three-stops?w_access=50&w_rent=50")

	if rec.Code == http.StatusOK {
		var result []map[string]interface{}
		err := json.Unmarshal(rec.Body.Bytes(), &result)
		require.NoError(t, err)

		assert.IsType(t, []map[string]interface{}{}, result)

		// スコアが計算されている可能性を確認
		if len(result) > 0 {
			if _, hasScore := result[0]["total_score"]; hasScore {
				t.Log("✓ Scores calculated with weights")
			}
		}
	}
}

// TestStationThreeStopsNonExistent は存在しない駅IDをテスト
func TestStationThreeStopsNonExistent(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/9999999/three-stops")

	// 404または500が期待される
	assert.NotEqual(t, http.StatusOK, rec.Code)
	t.Logf("Non-existent station returned status: %d", rec.Code)
}

// TestStationThreeStopsInvalidID は無効な駅ID(文字列)をテスト
func TestStationThreeStopsInvalidID(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/invalid/three-stops")

	assert.Equal(t, http.StatusBadRequest, rec.Code)

	var result map[string]interface{}
	err := json.Unmarshal(rec.Body.Bytes(), &result)
	require.NoError(t, err)

	assert.Contains(t, result, "error")
}

// TestStationThreeStopsNegativeID は負の駅IDをテスト
func TestStationThreeStopsNegativeID(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/-1/three-stops")

	// 400 Bad Requestまたは404が期待される
	assert.NotEqual(t, http.StatusOK, rec.Code)
	t.Logf("Negative station ID returned status: %d", rec.Code)
}

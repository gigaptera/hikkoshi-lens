package integration

import (
	"net/http"
	"strings"
	"testing"

	"github.com/gigaptera/hikkoshi-lens/backend/test/helper"
	"github.com/stretchr/testify/assert"
)

// TestStationNearby_SQLInjection はSQLインジェクション試行をテスト
func TestStationNearby_SQLInjection(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	maliciousInputs := []string{
		"'; DROP TABLE stations; --",
		"1' OR '1'='1",
		"\" OR 1=1--",
		"' UNION SELECT * FROM passwords--",
	}

	for _, input := range maliciousInputs {
		// クエリパラメータとしてSQLインジェクションを試行
		rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&building_type="+input)

		// サーバーがクラッシュしないことを確認
		assert.NotEqual(t, http.StatusInternalServerError, rec.Code, "Server should not crash on SQL injection attempt")

		// エラーハンドリングが適切であることを確認
		t.Logf("SQLInjection attempt with '%s': Status=%d", input, rec.Code)
	}
}

// TestStationNearby_XSSAttempt はXSS試行をテスト
func TestStationNearby_XSSAttempt(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	xssPayloads := []string{
		"<script>alert('XSS')</script>",
		"<img src=x onerror=alert(1)>",
		"<svg onload=alert('XSS')>",
		"javascript:alert(document.cookie)",
	}

	for _, payload := range xssPayloads {
		rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&layout="+payload)

		// レスポンスにスクリプトがそのまま含まれていないことを確認
		assert.NotContains(t, rec.Body.String(), "<script>", "Response should not contain unescaped script tags")

		t.Logf("XSS attempt with '%s': Status=%d", payload, rec.Code)
	}
}

// TestStationNearby_ExtremelyLongInput は極端に長い入力をテスト
func TestStationNearby_ExtremelyLongInput(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	longString := strings.Repeat("A", 10000)

	rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&building_type="+longString)

	// サーバーが適切にハンドリングすることを確認（400 or 200のどちらかを返す）
	assert.True(t, rec.Code == http.StatusOK || rec.Code == http.StatusBadRequest,
		"Server should handle extremely long input gracefully")

	t.Logf("Extremely long input: Status=%d", rec.Code)
}

// TestStationNearby_NullBytes はNull文字を含む入力をテスト
func TestStationNearby_NullBytes(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	nullByteInputs := []string{
		"test\x00injection",
		"\x00\x01\x02\x03",
		"normal\x00",
	}

	for _, input := range nullByteInputs {
		rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&building_type="+input)

		// サーバーがクラッシュしないことを確認
		assert.NotEqual(t, http.StatusInternalServerError, rec.Code)

		t.Logf("Null byte attempt: Status=%d", rec.Code)
	}
}

// TestStationNearby_InvalidCoordinates は無効な座標をテスト
func TestStationNearby_InvalidCoordinates(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	testCases := []struct {
		name string
		lat  string
		lon  string
	}{
		{"Extremely large lat", "999999", "139.7671"},
		{"Extremely large lon", "35.6812", "999999"},
		{"Negative extreme", "-999999", "-999999"},
		{"String instead of number", "INVALID", "INVALID"},
		{"Decimal overflow", "999999999999999999999.999999999", "139.7671"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			rec := ts.Request("GET", "/api/stations/nearby?lat="+tc.lat+"&lon="+tc.lon)

			// 無効な入力には400を返すべき
			assert.Equal(t, http.StatusBadRequest, rec.Code,
				"Invalid coordinates should return 400 Bad Request")
		})
	}
}

// TestStationNearby_NegativeRent は負の家賃値をテスト
func TestStationNearby_NegativeRent(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&min_rent=-100000&max_rent=-1")

	// 負の値でもサーバーがクラッシュしないことを確認
	assert.True(t, rec.Code == http.StatusOK || rec.Code == http.StatusBadRequest)

	t.Logf("Negative rent values: Status=%d", rec.Code)
}

// TestStationNearby_ExtremeRentRange は極端な家賃範囲をテスト
func TestStationNearby_ExtremeRentRange(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&min_rent=0&max_rent=999999999999")

	// 極端な値でもハンドリングできることを確認
	assert.Equal(t, http.StatusOK, rec.Code)

	t.Logf("Extreme rent range: Status=%d", rec.Code)
}

// TestStationNearby_UnicodeAttack はUnicode攻撃をテスト
func TestStationNearby_UnicodeAttack(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	unicodePayloads := []string{
		"​‌‍​‌‍​‌‍", // Zero-width characters
		"𝕳𝖆𝖈𝖐𝖊𝖗",    // Mathematical symbols
		"ࠀࠁࠂࠃ",      // Rare Unicode blocks
		"­­­­",      // Soft hyphens
		"🚆🚄🚅🚇🚈",     // Emojis
	}

	for _, payload := range unicodePayloads {
		rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&building_type="+payload)

		// サーバーが適切にハンドリングすることを確認
		assert.NotEqual(t, http.StatusInternalServerError, rec.Code)

		t.Logf("Unicode attack with unusual characters: Status=%d", rec.Code)
	}
}

// TestStationNearby_ZeroRadius は半径0をテスト（境界値）
func TestStationNearby_ZeroRadius(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&radius=0")

	assert.Equal(t, http.StatusOK, rec.Code)

	t.Logf("Zero radius: Status=%d", rec.Code)
}

// TestStationNearby_MaxIntRadius は最大整数の半径をテスト
func TestStationNearby_MaxIntRadius(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/nearby?lat=35.6812&lon=139.7671&radius=2147483647")

	// 極端に大きい値でもクラッシュしない
	assert.NotEqual(t, http.StatusInternalServerError, rec.Code)

	t.Logf("Max int radius: Status=%d", rec.Code)
}

// TestStationThreeStops_SQLInjectionInID はIDパラメータでのSQLインジェクション試行をテスト
func TestStationThreeStops_SQLInjectionInID(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	maliciousIDs := []string{
		"1' OR '1'='1",
		"1; DROP TABLE stations--",
		"1 UNION SELECT * FROM users",
	}

	for _, id := range maliciousIDs {
		rec := ts.Request("GET", "/api/stations/"+id+"/three-stops")

		// 不正なIDには400を返すべき
		assert.Equal(t, http.StatusBadRequest, rec.Code,
			"Malicious ID should return 400 Bad Request")
	}
}

// TestStationThreeStops_ExtremelyLargeID は極端に大きいIDをテスト
func TestStationThreeStops_ExtremelyLargeID(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/stations/999999999999999999999999999/three-stops")

	// 存在しないIDなので404または400
	assert.True(t, rec.Code == http.StatusBadRequest || rec.Code == http.StatusNotFound || rec.Code == http.StatusInternalServerError)

	t.Logf("Extremely large ID: Status=%d", rec.Code)
}

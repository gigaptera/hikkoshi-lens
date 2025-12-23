package helper

import (
	"strings"

	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain"
)

// GetMaliciousInputStations は悪意のある入力を含むテストデータを返す
// セキュリティテストやバリデーションテストに使用
func GetMaliciousInputStations() []*domain.Station {
	return []*domain.Station{
		// SQLインジェクション試行
		{
			ID:               1000,
			StationCode:      "'; DROP TABLE stations; --",
			OrganizationCode: "1' OR '1'='1",
			LineName:         "\" OR 1=1--",
			Name:             "'; DELETE FROM users WHERE 'a'='a",
			PrefectureCode:   13,
			Location:         "POINT(139.0 35.0)",
			Address:          "' UNION SELECT * FROM passwords--",
		},
		// XSS試行
		{
			ID:               1001,
			StationCode:      "<script>alert('XSS')</script>",
			OrganizationCode: "<img src=x onerror=alert(1)>",
			LineName:         "<iframe src='javascript:alert(1)'>",
			Name:             "<svg onload=alert('XSS')>",
			PrefectureCode:   13,
			Location:         "POINT(139.0 35.0)",
			Address:          "<body onload=alert('XSS')>",
		},
		// 巨大文字列
		{
			ID:               1002,
			StationCode:      strings.Repeat("A", 10000),
			OrganizationCode: strings.Repeat("B", 10000),
			LineName:         strings.Repeat("C", 10000),
			Name:             strings.Repeat("極端に長い駅名", 1000),
			PrefectureCode:   13,
			Location:         "POINT(139.0 35.0)",
			Address:          strings.Repeat("住所", 5000),
		},
		// 特殊文字・制御文字
		{
			ID:               1003,
			StationCode:      "\x00\x01\x02\x03\x04",
			OrganizationCode: "\n\r\t\b\f",
			LineName:         "🚆🚄🚅🚇🚈",
			Name:             "NULL\x00CHAR",
			PrefectureCode:   13,
			Location:         "POINT(139.0 35.0)",
			Address:          "改行\n含む\r住所\t",
		},
		// Unicode攻撃
		{
			ID:               1004,
			StationCode:      "​‌‍​‌‍​‌‍", // Zero-width characters
			OrganizationCode: "𝕳𝖆𝖈𝖐𝖊𝖗",    // Mathematical alphanumeric symbols
			LineName:         "ࠀࠁࠂࠃ",      // Samaritan letters
			Name:             "­­­­",      // Soft hyphens
			PrefectureCode:   13,
			Location:         "POINT(139.0 35.0)",
			Address:          "Ａｂｃ１２３", // Fullwidth characters
		},
		// 無効な座標
		{
			ID:               1005,
			StationCode:      "INVALID_COORD",
			OrganizationCode: "TEST",
			LineName:         "Test",
			Name:             "無効座標テスト",
			PrefectureCode:   13,
			Location:         "POINT(999999 999999)", // Out of range
			Address:          "Test",
		},
		// 負の値
		{
			ID:               -1,
			StationCode:      "NEGATIVE",
			OrganizationCode: "TEST",
			LineName:         "Test",
			Name:             "負のIDテスト",
			PrefectureCode:   -1,
			Location:         "POINT(-999 -999)",
			Address:          "Test",
		},
	}
}

// GetBoundaryValueStations は境界値テストデータを返す
func GetBoundaryValueStations() []*domain.Station {
	return []*domain.Station{
		// 最小値
		{
			ID:               1,
			StationCode:      "",
			OrganizationCode: "",
			LineName:         "",
			Name:             "",
			PrefectureCode:   0,
			Location:         "POINT(0 0)",
			Address:          "",
		},
		// 最大整数
		{
			ID:               9223372036854775807, // int64 max
			StationCode:      "MAX",
			OrganizationCode: "MAX",
			LineName:         "MAX",
			Name:             "最大値",
			PrefectureCode:   2147483647,      // int32 max
			Location:         "POINT(180 90)", // Max valid coordinates
			Address:          "MAX",
		},
		// 境界の座標
		{
			ID:               2001,
			StationCode:      "COORD_EDGE",
			OrganizationCode: "TEST",
			LineName:         "Test",
			Name:             "座標境界",
			PrefectureCode:   13,
			Location:         "POINT(180.0 90.0)", // Edge of world
			Address:          "North Pole",
		},
		{
			ID:               2002,
			StationCode:      "COORD_EDGE2",
			OrganizationCode: "TEST",
			LineName:         "Test",
			Name:             "座標境界2",
			PrefectureCode:   13,
			Location:         "POINT(-180.0 -90.0)", // Opposite edge
			Address:          "South Pole",
		},
	}
}

// GetMaliciousMarketPrices は悪意のある市場価格データを返す
func GetMaliciousMarketPrices() []*domain.MarketPrice {
	return []*domain.MarketPrice{
		// 負の家賃
		{
			ID:           10000,
			StationID:    1,
			BuildingType: "mansion",
			Layout:       "1r_1k_1dk",
			Rent:         -100000,
			Source:       "MALICIOUS",
		},
		// 極端に高い家賃
		{
			ID:           10001,
			StationID:    1,
			BuildingType: "mansion",
			Layout:       "1r_1k_1dk",
			Rent:         999999999999,
			Source:       "MALICIOUS",
		},
		// 無効な建物種別
		{
			ID:           10002,
			StationID:    1,
			BuildingType: "'; DROP TABLE market_prices--",
			Layout:       "<script>alert('XSS')</script>",
			Rent:         80000,
			Source:       "MALICIOUS",
		},
		// 0円
		{
			ID:           10003,
			StationID:    1,
			BuildingType: "mansion",
			Layout:       "1r_1k_1dk",
			Rent:         0,
			Source:       "BOUNDARY",
		},
	}
}

// GetStressTestData は負荷テスト用の大量データを生成
func GetStressTestData(stationCount, pricesPerStation int) ([]*domain.Station, []*domain.MarketPrice) {
	stations := make([]*domain.Station, stationCount)
	prices := make([]*domain.MarketPrice, stationCount*pricesPerStation)

	// 駅データ生成
	for i := 0; i < stationCount; i++ {
		stations[i] = &domain.Station{
			ID:               int64(i + 1),
			StationCode:      strings.Repeat("S", 100), // Long code
			OrganizationCode: strings.Repeat("O", 100),
			LineName:         strings.Repeat("L", 100),
			Name:             strings.Repeat("N", 100),
			PrefectureCode:   13,
			Location:         "POINT(139.0 35.0)",
			Address:          strings.Repeat("A", 200),
		}

		// 各駅に複数の価格データ
		for j := 0; j < pricesPerStation; j++ {
			priceIndex := i*pricesPerStation + j
			prices[priceIndex] = &domain.MarketPrice{
				ID:           int64(priceIndex + 1),
				StationID:    int64(i + 1),
				BuildingType: "mansion",
				Layout:       "1r_1k_1dk",
				Rent:         float64(50000 + (priceIndex * 1000)),
				Source:       "STRESS_TEST",
			}
		}
	}

	return stations, prices
}

// GetConcurrentTestStations は並行処理テスト用データ
func GetConcurrentTestStations() []*domain.Station {
	// 同じIDの駅を複数作成（競合テスト用）
	return []*domain.Station{
		{
			ID:               1,
			StationCode:      "CONCURRENT_1",
			OrganizationCode: "TEST",
			LineName:         "Test",
			Name:             "並行処理テスト1",
			PrefectureCode:   13,
			Location:         "POINT(139.0 35.0)",
			Address:          "Test1",
		},
		{
			ID:               1, // 同じID
			StationCode:      "CONCURRENT_2",
			OrganizationCode: "TEST",
			LineName:         "Test",
			Name:             "並行処理テスト2",
			PrefectureCode:   13,
			Location:         "POINT(139.0 35.0)",
			Address:          "Test2",
		},
	}
}

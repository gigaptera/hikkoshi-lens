package helper

import (
	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain"
)

// GetTestStations は型安全なテスト用駅データを返す
// 小規模なテストで使用することを推奨
func GetTestStations() []*domain.Station {
	return []*domain.Station{
		{
			ID:               1,
			StationCode:      "001001",
			OrganizationCode: "JR-East",
			LineName:         "山手線",
			Name:             "東京",
			PrefectureCode:   13,
			Location:         "POINT(139.767125 35.681236)",
			Address:          "東京都千代田区丸の内一丁目",
		},
		{
			ID:               2,
			StationCode:      "002002",
			OrganizationCode: "Tokyo Metro",
			LineName:         "丸ノ内線",
			Name:             "大手町",
			PrefectureCode:   13,
			Location:         "POINT(139.762886 35.684523)",
			Address:          "東京都千代田区大手町",
		},
		{
			ID:               3,
			StationCode:      "003003",
			OrganizationCode: "JR-East",
			LineName:         "中央線",
			Name:             "神田",
			PrefectureCode:   13,
			Location:         "POINT(139.770641 35.69169)",
			Address:          "東京都千代田区鍛冶町",
		},
	}
}

// GetTestStation は単一のテスト用駅データを返す
func GetTestStation() *domain.Station {
	return &domain.Station{
		ID:               1,
		StationCode:      "001001",
		OrganizationCode: "JR-East",
		LineName:         "山手線",
		Name:             "東京",
		PrefectureCode:   13,
		Location:         "POINT(139.767125 35.681236)",
		Address:          "東京都千代田区丸の内一丁目",
	}
}

// GetTestMarketPrices は型安全なテスト用市場価格データを返す
func GetTestMarketPrices() []*domain.MarketPrice {
	return []*domain.MarketPrice{
		{
			ID:           1,
			StationID:    1,
			BuildingType: "mansion",
			Layout:       "1r_1k_1dk",
			Rent:         80000,
			Source:       "TEST_DATA",
		},
		{
			ID:           2,
			StationID:    1,
			BuildingType: "mansion",
			Layout:       "1ldk_2k_2dk",
			Rent:         105000,
			Source:       "TEST_DATA",
		},
		{
			ID:           3,
			StationID:    1,
			BuildingType: "apart",
			Layout:       "1r_1k_1dk",
			Rent:         65000,
			Source:       "TEST_DATA",
		},
		{
			ID:           4,
			StationID:    2,
			BuildingType: "mansion",
			Layout:       "1r_1k_1dk",
			Rent:         90000,
			Source:       "TEST_DATA",
		},
		{
			ID:           5,
			StationID:    2,
			BuildingType: "apart",
			Layout:       "1ldk_2k_2dk",
			Rent:         75000,
			Source:       "TEST_DATA",
		},
		{
			ID:           6,
			StationID:    3,
			BuildingType: "mansion",
			Layout:       "2ldk_3k_3dk",
			Rent:         120000,
			Source:       "TEST_DATA",
		},
	}
}

// GetTestStationWithPrices は市場価格データ付きの駅データを返す
func GetTestStationWithPrices() *domain.Station {
	station := GetTestStation()
	station.MarketPrices = GetTestMarketPrices()[:3] // 最初の3件を関連付け
	return station
}

// GetTestStationFilter はテスト用のフィルターを返す
func GetTestStationFilter() domain.StationFilter {
	return domain.StationFilter{
		RadiusMeter:     3000,
		MinRent:         50000,
		MaxRent:         100000,
		BuildingType:    "mansion",
		Layout:          "1r_1k_1dk",
		Weights:         map[string]int{"access": 50, "rent": 50},
		CalculateScores: true,
	}
}

// GetTestStations_Empty は空の駅リストを返す（エッジケーステスト用）
func GetTestStations_Empty() []*domain.Station {
	return []*domain.Station{}
}

// GetTestStations_Large は大量の駅データを生成する（パフォーマンステスト用）
func GetTestStations_Large(count int) []*domain.Station {
	stations := make([]*domain.Station, count)
	for i := 0; i < count; i++ {
		stations[i] = &domain.Station{
			ID:               int64(i + 1),
			StationCode:      "TEST",
			OrganizationCode: "TEST",
			LineName:         "テスト線",
			Name:             "テスト駅",
			PrefectureCode:   13,
			Location:         "POINT(139.0 35.0)",
			Address:          "テスト住所",
		}
	}
	return stations
}

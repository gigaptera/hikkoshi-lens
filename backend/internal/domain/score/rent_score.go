package score

import (
	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain"
)

type RentScoreStrategy struct{}

func NewRentScore() Strategy {
	return &RentScoreStrategy{}
}

const (
	RentMaxScore = 5.0
	RentMinScore = 1.0
	// 家賃が低いほどスコアが高い。
	// Score = 5 - (Rent - 3.0) / 3.0
)

func (s *RentScoreStrategy) Calculate(station *domain.Station) float64 {
	if len(station.MarketPrices) == 0 {
		return 50.0 // data missing, return neutral score
	}

	totalRent := 0.0
	count := 0
	for _, mp := range station.MarketPrices {
		if mp.Rent > 0 {
			totalRent += mp.Rent
			count++
		}
	}

	if count == 0 {
		return 50.0
	}

	avgRent := totalRent / float64(count)

	// Scoring Logic:
	// <= 6.0 (6万円) -> 100点
	// >= 16.0 (16万円) -> 0点
	// Linear interpolation
	// Score = 100 - (AvgRent - 6.0) * 10

	score := 100.0 - (avgRent-6.0)*10.0

	if score > 100 {
		return 100
	}
	if score < 0 {
		return 0
	}
	return score
}

func (s *RentScoreStrategy) Name() string {
	return "rent"
}

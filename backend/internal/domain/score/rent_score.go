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
	if station.MarketPrice == nil || station.MarketPrice.AvgRent == 0 {
		return RentMinScore
	}

	rent := station.MarketPrice.AvgRent

	// 3万円基準、3万円あがるごとに1点減る
	score := 5.0 - (rent-3.0)/3.0

	if score > RentMaxScore {
		return RentMaxScore
	}
	if score < RentMinScore {
		return RentMinScore
	}
	return score
}

func (s *RentScoreStrategy) Name() string {
	return "rent"
}

package service

import (
	"sort"

	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain"
	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain/score"
)

type ScoringService struct {
	strategies map[string]score.Strategy
}

func NewScoringService() *ScoringService {
	// Register strategies
	s := &ScoringService{
		strategies: make(map[string]score.Strategy),
	}

	// Register default strategies
	strategies := []score.Strategy{
		score.NewAccessScore(),
		score.NewRentScore(),
		score.NewFacilityScore(),
		score.NewSafetyScore(),
		score.NewDisasterScore(),
	}

	for _, strat := range strategies {
		s.strategies[strat.Name()] = strat
	}

	return s
}

// Weights map: key matches Strategy.Name() (e.g. "access", "rent")
// If a weight is missing, it defaults to 0.
func (s *ScoringService) CalculateScores(stations []*domain.Station, weights map[string]int) {
	// Normalize weights so they sum to 1.0 (or keep as is and divide by sum).
	totalWeight := 0.0
	for _, w := range weights {
		totalWeight += float64(w)
	}

	// If no weights provided or sum is 0, use default weights.
	if totalWeight == 0 {
		// Default: Access 50, Rent 50
		weights = map[string]int{
			"access": 50,
			"rent":   50, // This will be displayed as "Price Score"
		}
		totalWeight = 100.0
	}

	for _, station := range stations {
		station.ScoreDetails = make(map[string]float64)
		weightedSum := 0.0

		for name, strategy := range s.strategies {
			// Calculate raw score (0-5, 0-100 etc. Strategy returns float64)
			// Need to normalize strategy output to 0-100 scale if it isn't already?
			// AccessScore returns 0-100. RentScore returns 1-5.
			// Standardize to 0-100.

			rawVal := strategy.Calculate(station)
			normalizedVal := rawVal

			// Store detail
			station.ScoreDetails[name] = normalizedVal

			// Apply Weight
			w, ok := weights[name]
			if ok {
				weightedSum += normalizedVal * float64(w)
			}
		}

		// Final score = Weighted Sum / Total Weight
		if totalWeight > 0 {
			station.TotalScore = weightedSum / totalWeight
		} else {
			station.TotalScore = 0
		}
	}

	// Sort by TotalScore descending
	sort.Slice(stations, func(i, j int) bool {
		return stations[i].TotalScore > stations[j].TotalScore
	})
}

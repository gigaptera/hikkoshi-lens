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

// Weights map: key matches Strategy.Name() (e.g. "access", "cost")
// If a weight is missing, it defaults to 0 (or some default value).
// Ensure weights are normalized or handled such that the final score is 0-100.
func (s *ScoringService) CalculateScores(stations []*domain.Station, weights map[string]int) {
	// Normalize weights so they sum to 1.0 (or keep as is and divide by sum).
	// Frontend sends 0-100 ints.

	totalWeight := 0.0
	for _, w := range weights {
		totalWeight += float64(w)
	}

	// If no weights provided or sum is 0, use default weights.
	if totalWeight == 0 {
		// Default: Access 50, Cost 50
		weights = map[string]int{
			"access": 50,
			"cost":   50,
		}
		totalWeight = 100.0
	}

	for _, station := range stations {
		weightedSum := 0.0

		for name, weight := range weights {
			strategy, exists := s.strategies[name]
			if !exists {
				// Strategy not implemented for this key, skip or log
				continue
			}

			// Calculate score (0-100)
			val := strategy.Calculate(station)
			weightedSum += val * float64(weight)
		}

		// Final score = Weighted Sum / Total Weight
		station.TotalScore = weightedSum / totalWeight
	}

	// Sort by TotalScore descending
	sort.Slice(stations, func(i, j int) bool {
		return stations[i].TotalScore > stations[j].TotalScore
	})
}

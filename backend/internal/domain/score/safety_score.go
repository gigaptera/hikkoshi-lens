package score

import (
	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain"
)

type SafetyScoreStrategy struct{}

func NewSafetyScore() Strategy {
	return &SafetyScoreStrategy{}
}

// Mock implementation: returns a fixed high score
// TODO: Replace with real crime statistics from e-Stat
func (s *SafetyScoreStrategy) Calculate(station *domain.Station) float64 {
	// Mock: Most areas in Japan are quite safe, so default to high score
	// In real implementation, this would query crime_stats table
	mockScore := 4.5 - float64((station.ID%5))*0.2 // Returns 4.5 to 3.7
	return mockScore
}

func (s *SafetyScoreStrategy) Name() string {
	return "safety"
}

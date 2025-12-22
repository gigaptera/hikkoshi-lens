package score

import (
	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain"
)

type DisasterScoreStrategy struct{}

func NewDisasterScore() Strategy {
	return &DisasterScoreStrategy{}
}

// Mock implementation: returns moderate score
// TODO: Replace with real hazard data from MLIT
func (s *DisasterScoreStrategy) Calculate(station *domain.Station) float64 {
	// Mock: Vary risk slightly by station ID
	// In real implementation, this would query disaster_risks table
	mockScore := 4.0 - float64((station.ID%4))*0.3 // Returns 4.0 to 3.1
	return mockScore
}

func (s *DisasterScoreStrategy) Name() string {
	return "disaster"
}

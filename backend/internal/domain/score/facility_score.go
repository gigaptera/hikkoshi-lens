package score

import (
	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain"
)

type FacilityScoreStrategy struct{}

func NewFacilityScore() Strategy {
	return &FacilityScoreStrategy{}
}

// Mock implementation: returns a random-ish score based on station ID
// TODO: Replace with real facility data from OSM/database
func (s *FacilityScoreStrategy) Calculate(station *domain.Station) float64 {
	// Mock: Use station ID to generate pseudo-random but consistent score
	// In real implementation, this would query facilities table
	mockScore := 3.0 + float64((station.ID % 3)) // Returns 3.0, 4.0, or 5.0
	return mockScore
}

func (s *FacilityScoreStrategy) Name() string {
	return "facility"
}

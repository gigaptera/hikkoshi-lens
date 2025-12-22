package score

import "github.com/gigaptera/hikkoshi-lens/backend/internal/domain"

// Strategy defines the interface for calculating a score for a station.
// It returns a score between 0 and 100.
type Strategy interface {
	Calculate(station *domain.Station) float64
	Name() string
}

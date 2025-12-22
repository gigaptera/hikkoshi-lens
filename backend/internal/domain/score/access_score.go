package score

import (
	"math"

	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain"
)

type AccessScore struct{}

func NewAccessScore() Strategy {
	return &AccessScore{}
}

func (s *AccessScore) Name() string {
	return "access"
}

// Calculate returns a score based on the distance from the work location.
// Uses a simple decay function: Score = 100 * (1 / (1 + distance_km/scale))
// Or linear mapping. Let's use a simpler approach for now.
// 0km - 0.5km: 100
// 0.5km - 3.0km: Linear decay to 50
// > 3.0km: Linear decay to 0 at 10km?
// Let's implement a sigmoid or exponential decay for smoother scoring.
// For now: Linear decay. Max score 100 at 0km, 0 at 50km (too far).
// Let's assume the user wants 'nearby' stations.
// In the current context, stations are already filtered by radius (e.g. 3km).
// So within the radius, we score them.
// 0m -> 100
// 3000m -> 50 (example)
func (s *AccessScore) Calculate(station *domain.Station) float64 {
	dist := station.Distance // meters
	// dist is float64 (not pointer anymore)

	// If distance is 0 (e.g. data missing), return 0? or 100?
	// Assuming 0 means right there.

	// Max Score 100 at distance 0
	// Min Score 0 at distance 10km (10000m)
	const maxDist = 30000.0 // 30km

	if dist >= maxDist {
		return 0
	}

	// Linear score
	score := 100.0 * (1.0 - (dist / maxDist))

	// Optional: Penalize very far stations more strictly?
	// 3km以内ならかなり高得点にしたい。
	// Strategy:
	// 0 - 1km: 100 - 90
	// 1km - 3km: 90 - 70
	// 3km - 10km: 70 - 40
	// ...

	// For MVP, let's use a simple inverted distance logic compatible with generic usage.
	// 100 * exp(-k * distance_km)
	distanceKm := dist / 1000.0
	// k=0.1 -> exp(-0.1 * 10) = exp(-1) = 0.36 (at 10km score 36)
	// k=0.1 -> exp(-0.1 * 3) = exp(-0.3) = 0.74 (at 3km score 74)

	score = 100.0 * math.Exp(-0.15*distanceKm)

	if score > 100 {
		return 100
	}
	if score < 0 {
		return 0
	}
	return score
}

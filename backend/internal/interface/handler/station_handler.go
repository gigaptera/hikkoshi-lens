package handler

import (
	"net/http"
	"strconv"

	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain"
	"github.com/gigaptera/hikkoshi-lens/backend/internal/usecase"
	"github.com/labstack/echo/v4"
)

type StationHandler struct {
	u usecase.StationUsecase
}

func NewStationHandler(u usecase.StationUsecase) *StationHandler {
	return &StationHandler{u: u}
}

// Search is the new endpoint for station search with subsidy support
// It replaces GetNearby but GetNearby is kept for backward compatibility
func (h *StationHandler) Search(c echo.Context) error {
	return h.GetNearby(c) // Delegate to GetNearby for now
}

// GetNearby remains for backward compatibility
func (h *StationHandler) GetNearby(c echo.Context) error {
	latStr := c.QueryParam("lat")
	lonStr := c.QueryParam("lon")
	radiusStr := c.QueryParam("radius")

	lat, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid lat"})
	}
	lon, err := strconv.ParseFloat(lonStr, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid lon"})
	}

	// Default radius 500m (徒歩圏内)
	radius := 500
	if radiusStr != "" {
		r, err := strconv.Atoi(radiusStr)
		if err == nil {
			radius = r
		}
	}

	// Parse filters
	minRent, _ := strconv.ParseFloat(c.QueryParam("min_rent"), 64)
	maxRent, _ := strconv.ParseFloat(c.QueryParam("max_rent"), 64)
	buildingType := c.QueryParam("building_type")
	layout := c.QueryParam("layout")

	// Parse subsidy parameters
	subsidyType := c.QueryParam("subsidy_type")
	if subsidyType == "" {
		subsidyType = "none" // default
	}
	subsidyRange := 3 // default
	if subsidyRangeStr := c.QueryParam("subsidy_range"); subsidyRangeStr != "" {
		if sr, err := strconv.Atoi(subsidyRangeStr); err == nil && sr > 0 {
			subsidyRange = sr
		}
	}

	// Parse weights
	weights := make(map[string]int)
	weightKeys := []string{"access", "rent", "facility", "safety", "disaster"}
	for _, key := range weightKeys {
		valStr := c.QueryParam("w_" + key)
		if valStr != "" {
			val, err := strconv.Atoi(valStr)
			if err == nil {
				weights[key] = val
			}
		}
	}

	// Parse calculate_scores parameter (default: true for backward compatibility)
	calculateScores := true
	if calcStr := c.QueryParam("calculate_scores"); calcStr != "" {
		calculateScores = calcStr == "true" || calcStr == "1"
	}

	filter := domain.StationFilter{
		RadiusMeter:     radius,
		MinRent:         minRent,
		MaxRent:         maxRent,
		BuildingType:    buildingType,
		Layout:          layout,
		Weights:         weights,
		CalculateScores: calculateScores,
		SubsidyType:     subsidyType,
		SubsidyRange:    subsidyRange,
	}

	stations, err := h.u.GetNearbyStations(c.Request().Context(), lat, lon, filter)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// 建物種別と間取りが両方指定されていない場合、warningを追加
	if buildingType == "" || layout == "" {
		return c.JSON(http.StatusOK, map[string]interface{}{
			"warning": "建物種別と間取りの両方を指定すると、家賃相場が表示されます",
			"message": "Please specify both building_type and layout to see rent prices",
			"data":    stations,
		})
	}

	return c.JSON(http.StatusOK, stations)
}

func (h *StationHandler) GetStationsWithinThreeStops(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid station ID"})
	}

	// Parse weights (optional, mostly for display)
	weights := make(map[string]int)
	weightKeys := []string{"access", "rent", "facility", "safety", "disaster"}
	for _, key := range weightKeys {
		valStr := c.QueryParam("w_" + key)
		if valStr != "" {
			val, err := strconv.Atoi(valStr)
			if err == nil {
				weights[key] = val
			}
		}
	}

	stations, err := h.u.GetStationsWithinThreeStops(c.Request().Context(), id, weights)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, stations)
}

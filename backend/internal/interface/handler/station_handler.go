package handler

import (
	"net/http"
	"strconv"

	"github.com/gigaptera/hikkoshi-lens/backend/internal/usecase"
	"github.com/labstack/echo/v4"
)

type StationHandler struct {
	u usecase.StationUsecase
}

func NewStationHandler(u usecase.StationUsecase) *StationHandler {
	return &StationHandler{u: u}
}

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

	// Default radius 3000m (3km)
	radius := 3000
	if radiusStr != "" {
		r, err := strconv.Atoi(radiusStr)
		if err == nil {
			radius = r
		}
	}

	// Parse weights
	// e.g. ?w_access=50&w_cost=30
	weights := make(map[string]int)
	weightKeys := []string{"access", "cost", "life", "fun", "safety", "env"} // Define supported keys
	for _, key := range weightKeys {
		valStr := c.QueryParam("w_" + key)
		if valStr != "" {
			val, err := strconv.Atoi(valStr)
			if err == nil {
				weights[key] = val
			}
		}
	}

	stations, err := h.u.GetNearbyStations(c.Request().Context(), lat, lon, radius, weights)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
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
	weightKeys := []string{"access", "cost", "life", "fun", "safety", "env"}
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

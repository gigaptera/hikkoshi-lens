package main

import (
	"log"
	"net/http"

	"github.com/gigaptera/hikkoshi-lens/backend/internal/config"
	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain/service"
	"github.com/gigaptera/hikkoshi-lens/backend/internal/infrastructure"
	"github.com/gigaptera/hikkoshi-lens/backend/internal/infrastructure/repository"
	"github.com/gigaptera/hikkoshi-lens/backend/internal/interface/handler"
	"github.com/gigaptera/hikkoshi-lens/backend/internal/usecase"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Load config
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	// Initialize DB
	db := infrastructure.NewDB(cfg.DatabaseURL)
	defer db.Close()

	// Echo instance
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{http.MethodGet, http.MethodPut, http.MethodPost, http.MethodDelete},
	}))

	// Routes
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})

	api := e.Group("/api")
	{
		// Health
		hHealth := handler.NewHealthHandler()
		api.GET("/health", hHealth.Check)

		// Station
		repoStation := repository.NewStationRepository(db)
		svcScoring := service.NewScoringService()
		ucStation := usecase.NewStationUsecase(repoStation, svcScoring)
		hStation := handler.NewStationHandler(ucStation)
		api.GET("/stations/search", hStation.Search)    // New search endpoint
		api.GET("/stations/nearby", hStation.GetNearby) // Backward compatibility
		api.GET("/stations/:id/three-stops", hStation.GetStationsWithinThreeStops)
	}

	// Start server
	e.Logger.Fatal(e.Start(":" + cfg.Port))
}

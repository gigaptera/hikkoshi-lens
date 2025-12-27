package handler

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockStationUsecase はStationUsecaseのモック
type MockStationUsecase struct {
	mock.Mock
}

func (m *MockStationUsecase) GetNearbyStations(ctx context.Context, lat, lon float64, filter domain.StationFilter) ([]*domain.Station, error) {
	args := m.Called(ctx, lat, lon, filter)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Station), args.Error(1)
}

func (m *MockStationUsecase) GetStationsWithinThreeStops(ctx context.Context, stationID int64, weights map[string]int) ([]*domain.Station, error) {
	args := m.Called(ctx, stationID, weights)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Station), args.Error(1)
}

func (m *MockStationUsecase) GetStationsByLine(ctx context.Context, organizationCode, lineName string) ([]*domain.Station, error) {
	args := m.Called(ctx, organizationCode, lineName)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Station), args.Error(1)
}

func (m *MockStationUsecase) GetStationDetail(ctx context.Context, stationID int64) (*domain.StationDetail, error) {
	args := m.Called(ctx, stationID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.StationDetail), args.Error(1)
}

// TestGetNearby_Success はGetNearbyの正常系テスト
func TestGetNearby_Success(t *testing.T) {
	// Setup
	e := echo.New()
	mockUsecase := new(MockStationUsecase)
	handler := NewStationHandler(mockUsecase)

	// モックの設定
	mockStations := []*domain.Station{
		{
			ID:   1,
			Name: "東京",
		},
		{
			ID:   2,
			Name: "大手町",
		},
	}
	mockUsecase.On("GetNearbyStations", mock.Anything, 35.6812, 139.7671, mock.Anything).Return(mockStations, nil)

	// リクエストを作成
	req := httptest.NewRequest(http.MethodGet, "/api/stations/nearby?lat=35.6812&lon=139.7671&radius=3000", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// テスト実行
	err := handler.GetNearby(c)

	// 検証
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	mockUsecase.AssertExpectations(t)
}

// TestGetNearby_MissingLat はlatパラメータ欠落時のテスト
func TestGetNearby_MissingLat(t *testing.T) {
	// Setup
	e := echo.New()
	mockUsecase := new(MockStationUsecase)
	handler := NewStationHandler(mockUsecase)

	// リクエストを作成（latなし）
	req := httptest.NewRequest(http.MethodGet, "/api/stations/nearby?lon=139.7671", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// テスト実行
	err := handler.GetNearby(c)

	// 検証
	assert.NoError(t, err) // EchoはJSONを返すのでエラーではない
	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Contains(t, rec.Body.String(), "Invalid lat")
}

// TestGetNearby_MissingLon はlonパラメータ欠落時のテスト
func TestGetNearby_MissingLon(t *testing.T) {
	// Setup
	e := echo.New()
	mockUsecase := new(MockStationUsecase)
	handler := NewStationHandler(mockUsecase)

	// リクエストを作成（lonなし）
	req := httptest.NewRequest(http.MethodGet, "/api/stations/nearby?lat=35.6812", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// テスト実行
	err := handler.GetNearby(c)

	// 検証
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Contains(t, rec.Body.String(), "Invalid lon")
}

// TestGetNearby_WithFilters はフィルター付きリクエストのテスト
func TestGetNearby_WithFilters(t *testing.T) {
	// Setup
	e := echo.New()
	mockUsecase := new(MockStationUsecase)
	handler := NewStationHandler(mockUsecase)

	// モックの設定
	mockStations := []*domain.Station{{ID: 1, Name: "東京"}}
	mockUsecase.On("GetNearbyStations", mock.Anything, 35.6812, 139.7671, mock.MatchedBy(func(filter domain.StationFilter) bool {
		return filter.BuildingType == "mansion" && filter.Layout == "1r_1k_1dk"
	})).Return(mockStations, nil)

	// リクエストを作成
	req := httptest.NewRequest(http.MethodGet, "/api/stations/nearby?lat=35.6812&lon=139.7671&building_type=mansion&layout=1r_1k_1dk", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// テスト実行
	err := handler.GetNearby(c)

	// 検証
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	mockUsecase.AssertExpectations(t)
}

// TestGetStationsWithinThreeStops_Success はGetStationsWithinThreeStopsの正常系テスト
func TestGetStationsWithinThreeStops_Success(t *testing.T) {
	// Setup
	e := echo.New()
	mockUsecase := new(MockStationUsecase)
	handler := NewStationHandler(mockUsecase)

	// モックの設定
	mockStations := []*domain.Station{{ID: 1, Name: "東京"}}
	mockUsecase.On("GetStationsWithinThreeStops", mock.Anything, int64(1), mock.Anything).Return(mockStations, nil)

	// リクエストを作成
	req := httptest.NewRequest(http.MethodGet, "/api/stations/1/three-stops", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("1")

	// テスト実行
	err := handler.GetStationsWithinThreeStops(c)

	// 検証
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	mockUsecase.AssertExpectations(t)
}

// TestGetStationsWithinThreeStops_InvalidID は無効なIDのテスト
func TestGetStationsWithinThreeStops_InvalidID(t *testing.T) {
	// Setup
	e := echo.New()
	mockUsecase := new(MockStationUsecase)
	handler := NewStationHandler(mockUsecase)

	// リクエストを作成（無効なID）
	req := httptest.NewRequest(http.MethodGet, "/api/stations/invalid/three-stops", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("invalid")

	// テスト実行
	err := handler.GetStationsWithinThreeStops(c)

	// 検証
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Contains(t, rec.Body.String(), "Invalid station ID")
}

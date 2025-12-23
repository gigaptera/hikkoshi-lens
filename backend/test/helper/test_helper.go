package helper

import (
	"context"
	"database/sql"
	"fmt"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain/service"
	"github.com/gigaptera/hikkoshi-lens/backend/internal/infrastructure/repository"
	"github.com/gigaptera/hikkoshi-lens/backend/internal/interface/handler"
	"github.com/gigaptera/hikkoshi-lens/backend/internal/usecase"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

// TestServer は統合テスト用のサーバー構造体
type TestServer struct {
	Echo *echo.Echo
	DB   *bun.DB
}

// NewTestServer はテストサーバーを作成します
func NewTestServer(t *testing.T) *TestServer {
	t.Helper()

	// .envファイルを明示的にロード
	// 複数のパスを試行
	envPaths := []string{
		".env",
		"../.env",
		"../../.env",
	}

	envLoaded := false
	for _, path := range envPaths {
		if err := godotenv.Load(path); err == nil {
			envLoaded = true
			t.Logf("Loaded .env from: %s", path)
			break
		}
	}

	if !envLoaded {
		// 絶対パスで試行
		wd, _ := os.Getwd()
		t.Logf("Current working directory: %s", wd)

		// backendディレクトリを探す
		backendPath := filepath.Join(wd, "..", "..", ".env")
		if err := godotenv.Load(backendPath); err == nil {
			t.Logf("Loaded .env from absolute path: %s", backendPath)
			envLoaded = true
		}
	}

	// DATABASE_URLを取得
	dbURL := os.Getenv("DATABASE_URL")
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// DATABASE_URLが設定されているか確認
	if dbURL == "" {
		t.Fatal("DATABASE_URL is not set. Please create a .env file with DATABASE_URL")
	}

	// データベース接続
	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dbURL)))
	db := bun.NewDB(sqldb, pgdialect.New())

	// 接続テスト
	ctx := context.Background()
	if err := db.PingContext(ctx); err != nil {
		t.Fatalf("Failed to connect to database: %v", err)
	}

	// Echoインスタンス
	e := echo.New()
	e.HideBanner = true // テスト時はバナーを非表示

	// ハンドラーのセットアップ
	setupRoutes(e, db)

	return &TestServer{
		Echo: e,
		DB:   db,
	}
}

// setupRoutes はルートを設定します
func setupRoutes(e *echo.Echo, db *bun.DB) {
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
		api.GET("/stations/nearby", hStation.GetNearby)
		api.GET("/stations/:id/three-stops", hStation.GetStationsWithinThreeStops)
	}
}

// Close はテストサーバーをクリーンアップします
func (ts *TestServer) Close() error {
	return ts.DB.Close()
}

// Request はHTTPリクエストを実行してレスポンスを返します
func (ts *TestServer) Request(method, path string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, nil)
	rec := httptest.NewRecorder()
	ts.Echo.ServeHTTP(rec, req)
	return rec
}

// SeedTestData はテストデータをデータベースに投入します
func SeedTestData(t *testing.T, db *bun.DB) {
	t.Helper()

	ctx := context.Background()

	// ここにテストデータの投入ロジックを追加
	// 実際のデータはプロジェクトの構造に応じて調整

	// 例: テスト用の駅データを投入
	// stations := []domain.Station{...}
	// _, err := db.NewInsert().Model(&stations).Exec(ctx)
	// if err != nil {
	// 	t.Fatalf("Failed to seed test data: %v", err)
	// }

	_ = ctx
}

// CleanupTestData はテストデータをクリーンアップします
func CleanupTestData(t *testing.T, db *bun.DB) {
	t.Helper()

	ctx := context.Background()

	// テストデータの削除
	// 必要に応じてテーブルをTRUNCATEまたはDELETE

	// 例:
	// _, err := db.NewTruncateTable().Model((*domain.Station)(nil)).Exec(ctx)
	// if err != nil {
	// 	t.Logf("Warning: Failed to cleanup test data: %v", err)
	// }

	_ = ctx
}

// AssertJSONResponse はJSONレスポンスを検証します
func AssertJSONResponse(t *testing.T, rec *httptest.ResponseRecorder, expectedStatus int) {
	t.Helper()

	if rec.Code != expectedStatus {
		t.Errorf("Expected status %d, got %d. Body: %s", expectedStatus, rec.Code, rec.Body.String())
	}

	contentType := rec.Header().Get("Content-Type")
	if contentType != "application/json; charset=UTF-8" {
		t.Errorf("Expected Content-Type 'application/json; charset=UTF-8', got '%s'", contentType)
	}
}

// BuildQueryString はクエリパラメータを構築します
func BuildQueryString(params map[string]string) string {
	if len(params) == 0 {
		return ""
	}

	query := "?"
	first := true
	for key, value := range params {
		if !first {
			query += "&"
		}
		query += fmt.Sprintf("%s=%s", key, value)
		first = false
	}
	return query
}

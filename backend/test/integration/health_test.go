package integration

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/gigaptera/hikkoshi-lens/backend/test/helper"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestHealthCheck は基本的なヘルスチェックをテスト
func TestHealthCheck(t *testing.T) {
	ts := helper.NewTestServer(t)
	defer ts.Close()

	rec := ts.Request("GET", "/api/health")

	assert.Equal(t, http.StatusOK, rec.Code)

	var result map[string]interface{}
	err := json.Unmarshal(rec.Body.Bytes(), &result)
	require.NoError(t, err)

	// ステータスが含まれていることを確認
	assert.Contains(t, result, "status")
	t.Logf("Health check response: %+v", result)
}

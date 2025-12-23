package integration

import (
	"os"
	"testing"
)

// TestMain は全テストの前後処理を実行
func TestMain(m *testing.M) {
	// テスト開始前のセットアップ
	setup()

	// テスト実行
	code := m.Run()

	// テスト終了後のクリーンアップ
	teardown()

	os.Exit(code)
}

// setup はテスト実行前の初期化処理
func setup() {
	// 必要に応じてグローバルなセットアップ処理を追加
	// 例: テストデータベースの初期化、環境変数の設定など
}

// teardown はテスト実行後のクリーンアップ処理
func teardown() {
	// 必要に応じてクリーンアップ処理を追加
	// 例: テストデータの削除、一時ファイルの削除など
}

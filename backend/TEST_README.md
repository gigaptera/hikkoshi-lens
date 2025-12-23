# バックエンド API テスト

このディレクトリには、Hikkoshi Lens バックエンド API の包括的なテストスイートが含まれています。

## テスト構成

### ディレクトリ構造

```
backend/
├── test/
│   ├── integration/      # 統合テスト
│   │   └── api_test.go
│   ├── helper/           # テストヘルパー関数
│   │   └── test_helper.go
│   └── testdata/         # テストデータ
├── internal/
│   └── ...               # (将来的にユニットテスト追加)
└── run_tests.sh          # テスト実行スクリプト
```

### テストタイプ

1. **統合テスト** (`test/integration/`)

   - API エンドポイントのエンドツーエンドテスト
   - 実際のデータベース接続を使用
   - HTTP リクエスト/レスポンスの検証

2. **ユニットテスト** (将来実装)
   - 個別の関数・メソッドのテスト
   - モックを使用した単体テスト

## テスト実行方法

### 前提条件

1. PostgreSQL が起動していること
2. `.env`ファイルに`DATABASE_URL`が設定されていること
3. データベースに必要なテーブルが存在すること

### 基本的な実行方法

```bash
# すべてのテストを実行
go test ./...

# または実行スクリプトを使用
./run_tests.sh
```

### オプション付き実行

```bash
# 詳細出力モード
./run_tests.sh -v

# カバレッジレポート生成
./run_tests.sh -c

# 統合テストのみ実行
./run_tests.sh -i

# 複数オプションの組み合わせ
./run_tests.sh -v -c
```

### 個別テスト実行

```bash
# 統合テストのみ実行
go test ./test/integration/...

# 特定のテスト関数のみ実行
go test ./test/integration/... -run TestStationNearbyAPI

# 詳細出力
go test -v ./test/integration/...
```

## テストケース一覧

### 駅検索 API (`/api/stations/nearby`)

#### 正常系

1. 基本的な位置情報検索
2. 間取りフィルター
3. 建物種別フィルター
4. 複合フィルター
5. 家賃範囲フィルター
6. 半径指定
7. スコア計算あり

#### 異常系

8. 必須パラメータ欠落(lat)
9. 必須パラメータ欠落(lon)
10. 無効な座標値

#### エッジケース

11. 結果が 0 件
12. radius=0

### 3 駅検索 API (`/api/stations/:id/three-stops`)

#### 正常系

13. 基本的な 3 駅検索
14. 重みパラメータ付き

#### 異常系

15. 存在しない駅 ID
16. 無効な駅 ID(文字列)
17. 負の駅 ID

### ヘルスチェック API (`/api/health`)

18. 基本的なヘルスチェック

## カバレッジレポート

カバレッジレポートを生成するには:

```bash
# カバレッジ測定付きでテスト実行
go test -cover -coverprofile=coverage.out ./...

# HTMLレポート生成
go tool cover -html=coverage.out -o coverage.html

# またはスクリプトを使用
./run_tests.sh -c
```

生成された`coverage.html`をブラウザで開くと、行ごとのカバレッジ状況を確認できます。

## テストデータ

テストは実際のデータベースを使用します。テストデータの準備は`test/helper/test_helper.go`の`SeedTestData`関数で行います。

必要に応じて、テスト用のデータを`test/testdata/`に配置してください。

## トラブルシューティング

### データベース接続エラー

```
Error: Failed to load config
```

**解決策**: `.env`ファイルが正しく設定されているか確認してください。

```bash
# .envファイルの例
DATABASE_URL=postgres://user:password@localhost:5432/hikkoshi_lens?sslmode=disable
PORT=8080
```

### テストが見つからない

```
no test files
```

**解決策**: `go.mod`のモジュールパスが正しいか確認してください。

```bash
cd backend
go mod tidy
```

### ポート競合

バックエンドサーバーが起動中の場合、テストで同じポートを使用しようとして失敗する可能性があります。

**解決策**: テスト実行前にサーバーを停止するか、テストで別のポートを使用します。

## CI/CD 統合

GitHub Actions でテストを自動実行する例:

```yaml
# .github/workflows/test.yml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: "1.21"

      - name: Run tests
        working-directory: ./backend
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable
        run: |
          go mod download
          go test -v -cover ./...
```

## 今後の拡張

- [ ] ユニットテストの追加(Repository, Usecase, Handler)
- [ ] モックを使用したテストの追加
- [ ] ベンチマークテストの追加
- [ ] 負荷テストの実装
- [ ] E2E テスト(フロントエンド連携)
- [ ] テストデータのファクトリパターン導入
- [ ] パラメトライズドテストの活用

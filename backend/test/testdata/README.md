# テストデータについて

このディレクトリには、統合テストで使用するフィクスチャデータが含まれています。

## フィクスチャの種類

### 1. JSON 形式（大規模テスト向け）

外部ファイルとして管理され、言語に依存しないデータ形式。

#### stations.json

テスト用の駅データ。以下のフィールドを含みます:

- `id`: 駅 ID
- `station_code`: 駅コード
- `organization_code`: 事業者コード
- `line_name`: 路線名
- `name`: 駅名
- `prefecture_code`: 都道府県コード
- `location`: 位置情報（PostGIS WKT 形式）
- `address`: 住所
- `distance`: 距離（メートル）

#### market_prices.json

テスト用の市場価格データ。以下のフィールドを含みます:

- `id`: ID
- `station_id`: 駅 ID（外部キー）
- `building_type`: 建物種別（`mansion`, `apart`, `detached`）
- `layout`: 間取り（`1r_1k_1dk`, `1ldk_2k_2dk`, `2ldk_3k_3dk`, `3ldk_4k`, `4ldk`）
- `rent`: 家賃（万円）
- `source`: データソース

### 2. Go 構造体形式（小規模テスト向け）

コード内で定義された型安全なデータ。`test/helper/fixtures_struct.go`で提供。

**利用可能な関数**:

- `GetTestStations()` - 3 つの基本駅データ
- `GetTestStation()` - 単一の駅データ
- `GetTestMarketPrices()` - 6 つの市場価格データ
- `GetTestStationWithPrices()` - 市場価格付き駅データ
- `GetTestStationFilter()` - デフォルトのフィルター設定
- `GetTestStations_Empty()` - 空リスト（エッジケース用）
- `GetTestStations_Large(count)` - 大量データ生成（パフォーマンステスト用）

## 使用方法

### JSON 形式の使用（大規模テスト）

```go
import "github.com/gigaptera/hikkoshi-lens/backend/test/helper"

func TestWithJSONFixture(t *testing.T) {
    // 駅データを読み込む
    stations := helper.LoadStationsFixture(t)

    // 市場価格データを読み込む
    prices := helper.LoadMarketPricesFixture(t)

    // テストに使用
    assert.Len(t, stations, 3)
}
```

### Go 構造体の使用（小規模テスト）

```go
import "github.com/gigaptera/hikkoshi-lens/backend/test/helper"

func TestWithStructFixture(t *testing.T) {
    // 型安全なデータ取得
    stations := helper.GetTestStations()

    // IDEの補完が効く
    assert.Equal(t, "東京", stations[0].Name)

    // 単一データ
    station := helper.GetTestStation()

    // フィルター
    filter := helper.GetTestStationFilter()
}
```

### 使い分けの指針

| 用途                   | 推奨形式             | 理由                                   |
| ---------------------- | -------------------- | -------------------------------------- |
| 小規模なユニットテスト | Go 構造体            | 型安全、IDE 補完、高速                 |
| 大規模な統合テスト     | JSON                 | 管理しやすい、外部ツールからも利用可能 |
| エッジケーステスト     | Go 構造体            | 柔軟に生成可能                         |
| パフォーマンステスト   | Go 構造体 Large 関数 | 動的に大量データ生成                   |

## データの追加・更新

### JSON 形式

JSON ファイルを直接編集してテストデータを追加・更新できます。

### Go 構造体形式

`test/helper/fixtures_struct.go`に新しい関数を追加してください。

データベースへの投入が必要な場合は、`helper/fixtures.go`の`SeedStationsData`や`SeedMarketPricesData`関数を実装してください。

## 注意事項

- フィクスチャデータは実際のプロダクションデータではなく、テスト用のサンプルデータです
- ID は連番で管理し、重複しないようにしてください
- 新しいテストケースを追加する際は、必要に応じてフィクスチャを拡張してください
- Go 構造体版は型安全ですが、JSON 版との整合性は手動で管理する必要があります

```

```

# 地点詳細ページ設計書 (Location Detail Page)

## 1. 概要

### 目的

SUUMO など外部サイトで見つけた物件の住所を入力し、その地点周辺の詳細情報（アクセス、施設、治安、物価など）を確認し、複数の候補物件を比較検討するための機能。

### ユーザージャーニー

```
1. Hikkoshi Lens で駅検索
   → 条件に合う駅を発見（例: 三軒茶屋駅）

2. SUUMO で物件検索
   → 気になる物件を複数発見
   - 物件A: 世田谷区三軒茶屋1-2-3
   - 物件B: 渋谷区代官山町5-6-7

3. Hikkoshi Lens で地点詳細比較 ★このページ★
   → 各物件の住所を入力
   → 周辺スコアを確認・比較
   → 最終的な物件決定
```

---

## 2. ページ仕様

### 2.1 URL 構造

```
/location?address={住所}
または
/location?lat={緯度}&lng={経度}
```

**例:**

- `/location?address=東京都世田谷区三軒茶屋1-2-3`
- `/location?lat=35.643&lng=139.669`

### 2.2 レイアウト構造

#### ヘッダー領域

- GlobalHeader（共通）
- ヘッダー検索バーから直接アクセス可能

#### メインコンテンツ（2 カラム構造）

##### 左側: 地図エリア（50%）

```
┌─────────────────────────┐
│   Interactive Map       │
│                         │
│   [指定地点マーカー]     │
│   [最寄り駅マーカー]     │
│   [周辺施設マーカー]     │
│                         │
│  [レイヤー切替]          │
│  □ 駅  □ コンビニ       │
│  □ スーパー □ 病院      │
└─────────────────────────┘
```

##### 右側: 情報パネル（50%）

```
┌─────────────────────────┐
│ 東京都世田谷区三軒茶屋1-2-3 │
├─────────────────────────┤
│ 📍 アクセス評価          │
│  最寄り駅: 三軒茶屋駅     │
│  徒歩: 8分 (約640m)      │
│  路線: 東急田園都市線    │
│  Score: 85/100          │
├─────────────────────────┤
│ 🏪 周辺施設              │
│  コンビニ: 3件 (300m以内)│
│  スーパー: 5件 (500m以内)│
│  病院: 2件              │
│  公園: 1件              │
│  Score: 78/100          │
├─────────────────────────┤
│ 🛡️ 治安                │
│  犯罪率: 低              │
│  Score: 88/100          │
├─────────────────────────┤
│ 💰 物価                 │
│  周辺家賃相場: ¥85,000   │
│  (1K/1DK, マンション)   │
│  Score: 72/100          │
├─────────────────────────┤
│ 🎯 総合スコア: 81/100    │
│                         │
│ [検討リストに追加]       │
└─────────────────────────┘
```

---

## 3. データ構造

### 3.1 入力データ

**住所入力の場合:**

```typescript
{
  address: string; // "東京都世田谷区三軒茶屋1-2-3"
}
```

**緯度経度の場合:**

```typescript
{
  lat: number,  // 35.643
  lng: number   // 139.669
}
```

### 3.2 レスポンスデータ構造（想定）

```typescript
interface LocationDetailResponse {
  location: {
    address: string;
    lat: number;
    lng: number;
  };

  access: {
    nearestStation: {
      id: number;
      name: string;
      lines: string[];
      distance: number; // メートル
      walkingTime: number; // 分
    };
    score: number; // 0-100
  };

  facilities: {
    convenience_stores: FacilityItem[];
    supermarkets: FacilityItem[];
    hospitals: FacilityItem[];
    parks: FacilityItem[];
    score: number;
  };

  safety: {
    crime_rate: "low" | "medium" | "high";
    score: number;
  };

  cost: {
    avg_rent: {
      "1K": number;
      "1LDK": number;
      "2LDK": number;
    };
    price_level: "low" | "medium" | "high";
    score: number;
  };

  total_score: number;
}

interface FacilityItem {
  name: string;
  distance: number;
  lat: number;
  lng: number;
}
```

---

## 4. バックエンド API 設計

### 4.1 新規エンドポイント

#### `GET /api/location/detail`

**パラメータ:**

```
address: string (optional)
lat: number (optional)
lng: number (optional)
```

**処理フロー:**

1. 住所の場合 → Geocoding API で緯度経度に変換
2. 緯度経度から周辺駅を検索（`/api/stations/nearby`を内部利用）
3. 最寄り駅を特定
4. 周辺施設を検索（Google Places API / Overpass API）
5. 治安データを取得（警視庁オープンデータ等）
6. 家賃相場を取得（既存の`MarketPrices`テーブル）
7. 各スコアを計算
8. 統合レスポンスを返却

### 4.2 スコアリングロジック

#### アクセススコア（Access）

```
- 最寄り駅までの徒歩時間
  - 5分以内: 100点
  - 10分以内: 80点
  - 15分以内: 60点
  - 20分以内: 40点
  - 20分超: 20点
```

#### 周辺施設スコア（Facility）

```
- コンビニ（300m以内）: 0-30点
- スーパー（500m以内）: 0-40点
- 病院（1km以内）: 0-20点
- 公園（500m以内）: 0-10点
```

#### 治安スコア（Safety）

```
- 犯罪率データに基づく相対評価
  - 低: 80-100点
  - 中: 50-79点
  - 高: 0-49点
```

#### 物価スコア（Cost）

```
- 周辺家賃相場の安さ
  - 相場データから算出（地域平均との比較）
```

---

## 5. フロントエンド実装

### 5.1 必要なコンポーネント

#### 新規作成

```
/app/location/page.tsx                    # メインページ
/components/features/location/
  ├── location-map.tsx                    # 地図表示
  ├── location-info-panel.tsx             # 情報パネル
  ├── access-score-card.tsx               # アクセス情報
  ├── facility-score-card.tsx             # 周辺施設情報
  ├── safety-score-card.tsx               # 治安情報
  └── cost-score-card.tsx                 # 物価情報
```

#### 更新が必要

```
/components/layout/global-header.tsx      # 検索バー機能化
```

### 5.2 使用技術

- **地図**: Mapbox GL JS (`react-map-gl`)
- **Geocoding**: Google Geocoding API または Mapbox Geocoding API
- **状態管理**: React hooks (useState, useEffect)
- **データフェッチ**: fetch API

---

## 6. 実装フェーズ

### Phase 1: 基本機能（MVP）

- [ ] 住所 → 緯度経度変換（Geocoding）
- [ ] 最寄り駅の特定と表示
- [ ] 基本的な地図表示
- [ ] アクセススコアの計算・表示

### Phase 2: 周辺情報

- [ ] 周辺施設データの取得・表示
- [ ] 地図上に施設マーカー表示
- [ ] 施設別レイヤー切替機能

### Phase 3: スコアリング

- [ ] 治安スコアの実装
- [ ] 物価スコアの実装
- [ ] 総合スコアの計算

### Phase 4: 比較機能

- [ ] 複数地点の検討リスト機能
- [ ] 地点間の比較ビュー

---

## 7. デザインガイドライン（Modern Museum）

### ビジュアル原則

- **形状**: `rounded-none`（鋭利なエッジ）
- **タイポグラフィ**:
  - 見出し: `Playfair Display` (Serif)
  - データ: `JetBrains Mono` (Monospace)
  - 本文: `Inter` (Sans)
- **配色**: モノクロームベース（#000/#FFF）

### スコア表示

```tsx
// 巨大な総合スコア
<div className="text-6xl font-display font-bold">
  81
</div>
<div className="text-sm font-mono text-muted-foreground">
  / 100
</div>
```

### カードデザイン

```tsx
<div className="border border-border rounded-none p-6 hover:shadow-lg transition-shadow">
  {/* カード内容 */}
</div>
```

---

## 8. ヘッダー検索バーの機能化

### 現在の状態

```tsx
// 非機能的なプレースホルダー
<input placeholder="駅、エリア、勤務地を検索..." />
```

### 実装後

```tsx
// Geocoding + 地点詳細ページへの遷移
<input
  value={query}
  onChange={handleChange}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }}
  placeholder="住所、駅名を入力..."
/>
```

**処理フロー:**

1. ユーザーが住所/駅名を入力
2. Enter キーまたは検索ボタンをクリック
3. Geocoding API で緯度経度を取得
4. `/location?lat=...&lng=...` に遷移

---

## 9. データソース

### 必要な外部 API

1. **Geocoding**: Google Geocoding API / Mapbox Geocoding API
2. **地図表示**: Mapbox GL JS
3. **周辺施設**: Google Places API / Overpass API (OpenStreetMap)
4. **治安データ**: 警視庁オープンデータ / 市区町村統計

### 既存データの活用

- `stations` テーブル: 駅情報
- `market_prices` テーブル: 家賃相場

---

## 10. 次のアクション

### ドキュメント更新

✅ `docs/location-detail-design.md` 作成（このファイル）  
⬜ `docs/FUNCTION_LIST.md` に地点詳細機能を追加  
⬜ `docs/SCREEN_DESIGN.md` に地点詳細ページを追加

### 実装準備

⬜ Geocoding API キーの取得  
⬜ Mapbox API キーの取得  
⬜ バックエンド API 設計レビュー  
⬜ フロントエンドコンポーネント設計レビュー

# 駅詳細ページ設計書 (Station Detail Page)

## 1. 概要

### 目的

ユーザーが選択した「駅」について、住環境としてのポテンシャルを深く理解するためのページ。
比較機能（前後駅）ではなく、**その駅自体の詳細情報（周辺施設、リスク、相場など）を網羅的に可視化**することで、ユーザーの「ここに住んでも大丈夫か？」「生活は便利か？」という疑問に答える。

### ターゲットユーザーの疑問

- 「スーパーや病院は近くにある？」
- 「家賃相場は予算内？」
- 「治安は悪くない？」
- 「水害や地震のリスクは？」
- 「都心へのアクセスは？」

---

## 2. ページレイアウト構造

### 2.1 ページ構成

```
[Global Header]

1. Hero Section (駅名・代表写真・総合スコア)
2. Radar Chart & Summary (5軸スコア詳細)
3. Geographic Analysis (インタラクティブ地図: 施設・治安・ハザード)
4. Market Data (家賃相場・推移グラフ)
5. Commute Access (主要駅へのアクセス時間)

[Global Footer]
```

### 2.2 デザイン原則 (Modern Museum)

- **色使い**: モノクロームベース + データの視認性を高めるアクセントカラー（彩度を抑えた赤、青、緑など）
- **形状**: `rounded-none`, シャープなボーダー
- **データ表現**: 数値は大きく (`Playfair Display`), グラフはシンプルに

---

## 3. セクション詳細機能

### 3.1 Hero Section

- **背景**: パララックス効果のある駅周辺の高画質写真（モノクロ/低彩度）
- **コンテンツ**:
  - 駅名（日本語/英語）
  - **駅の特徴タグ**: 「コスパ良好」「治安最高」「始発駅」「学生街」など
  - **総合スコア**: 巨大な数値表示 (例: **84**/100)

### 3.2 AI Insight (住民の声・分析)

Web 上の口コミ、SNS、地域ブログなどを AI が検索・分析し、リアルな「街の空気感」を伝える。

- **AI Summary**: メリット・デメリットの要約。
- **Resident Voices (住民のリアルな声)**:
  - **良い評判**: 「駅前のパン屋がおいしい」「夜道も明るくて安心」
  - **気になる評判**: 「朝のラッシュは激混み」「深夜のバイク音がうるさい」
- **Trend Analysis**: 「最近おしゃれなカフェが増えている」「再開発で注目度上昇中」などの最新トレンド。

### 3.3 Life Convenience (生活利便性マップ)

「生活する」視点で施設をカテゴライズして表示。Mapbox と連動。

**データソース:**

- **OpenStreetMap (Overpass API)** または **Google Places API** を活用。

**表示レイヤー:**

1.  **日常の買い物 (Daily)**:
    - スーパー（価格帯でアイコン色分け: 激安/標準/高級）、薬局、コンビニ
2.  **休日の充実 (Weekend)**:
    - **大型商業施設 (Mall)**、**映画館**、**図書館**、カフェ、大きな公園
3.  **健康・安全 (Safety & Health)**:
    - 病院、交番、避難所
4.  **リスク可視化 (Hazard)**:
    - 洪水浸水想定区域、土砂災害警戒区域（危険度を赤～黄でオーバーレイ）

### 3.4 Market Context (家賃相場と隣駅比較)

単なる金額だけでなく、「お得感」を可視化。

- **グラフ**: 間取り別（1R/1K, 1LDK, 2LDK...）の家賃相場棒グラフ
- **隣駅との比較**:
  - 「A 駅 (隣) より **-5,000 円** お得」
  - 「B 駅 (都心側) と比較しても **同水準**」
- **トレンド**: 過去の相場変動（上昇傾向/下降傾向）

### 3.5 Action Area

ユーザーの次のアクションを促すエリア。

- **賃貸物件を見る (External Links)**:
  - [SUUMO で賃貸を探す]
  - [LIFULL HOME'S で賃貸を探す]
  - ※ アフィリエイトリンクとして実装

### 3.6 Commute Access

- 主要ターミナル駅（新宿、渋谷、東京、大手町など）への所要時間と乗り換え回数リスト。

---

## 4. API 設計

### 4.1 `GET /api/stations/{id}/details`

駅の基本情報とスコアサマリーを取得。

```typescript
response: {
  id: number;
  name: string;
  lines: string[];
  tags: string[]; // "コスパ良好", "学生街" etc.
  ai_insight: {
    summary: {
      pros: string[];
      cons: string[];
    };
    resident_voices: {
      positive: string[];
      negative: string[];
    };
    trend: string; // "再開発により注目度が上昇中..."
    last_updated: string; // "2025-12-01"
  };

  score: {
    total: number;
    radar: {
      rent: number;
      safety: number;
      facility: number;
      access: number;
      disaster: number;
    };
  };
  market_price: {
    prices: {
      "1R": number;
      "1K": number;
      "1LDK": number;
      // ...
    };
    neighbor_comparison: {
      next_station_diff: number; // +3000 or -2000
      prev_station_diff: number;
    };
  };
  affiliate_links: {
    suumo: string;
    homes: string;
  };
}

```

### 4.2 `GET /api/stations/{id}/features` (GeoJSON)

地図表示用のデータ（施設、治安メッシュ、ハザードポリゴン）を取得。

```typescript
response: {
  facilities: GeoJSON.FeatureCollection; // スーパー等のポイント
  hazard: GeoJSON.FeatureCollection; // 危険区域のポリゴン
}
```

---

## 5. 実装ステップ

1.  **Backend**:

    - `StationService` に詳細情報取得ロジック追加
    - ハザードマップデータの取り込み手段検討（国土交通省 API or 静的 GeoJSON）
    - 店舗データ取得（Google Places API 等）のモック化/実装

2.  **Frontend**:
    - `/stations/[id]/page.tsx` 作成
    - `Recharts` を用いたレーダーチャート・棒グラフ実装
    - `Mapbox GL JS` (`react-map-gl`) を用いた地図コンポーネント実装

---

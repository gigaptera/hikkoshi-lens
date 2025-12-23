# フロントエンド家賃表示の万円統一化

## 現状の問題

![現在のUI - 円表示](file:///Users/yuget/.gemini/antigravity/brain/8193c90f-68fa-4a88-8d8d-cd328b0224eb/uploaded_image_1766491383717.png)

**問題点**:

- UI の入力: 「30000 円」（円単位）
- API リクエスト: `min_rent=30000`（円？万円？不明確）
- API レスポンス: `rent: 4.8`（万円単位）
- 表示: 不統一で混乱を招く

## 推奨される統一仕様

### API レスポンス（現状維持）

```json
{
  "rent": 4.8, // 万円単位
  "rent_avg": 4.8
}
```

### API リクエストパラメータ（要変更）

**Before**:

```
?min_rent=30000&max_rent=100000  // 円単位（不明確）
```

**After（推奨）**:

```
?min_rent=3&max_rent=10  // 万円単位（明確）
```

または

```
?min_rent=3.0&max_rent=10.0  // 万円単位（小数点対応）
```

### フロントエンド UI（要変更）

**Before**:

```tsx
<input
  type="number"
  value={30000}
  placeholder="円"
/>
<span>円</span>
```

**After**:

```tsx
<input
  type="number"
  value={3}
  step="0.1"
  placeholder="万円"
/>
<span>万円</span>
```

## 実装方針

### オプション 1: フロントエンドで変換（推奨）

**メリット**: API の互換性を保つ  
**実装**: UI は万円、送信時に 10000 倍

```typescript
// フォーム入力
const [minRentMan, setMinRentMan] = useState(3); // 万円

// API送信時
const params = {
  min_rent: minRentMan * 10000,  // 円に変換
  max_rent: maxRentMan * 10000
};

// 表示
<input
  type="number"
  value={minRentMan}
  onChange={(e) => setMinRentMan(e.target.value)}
  step="0.1"
/>
<span>万円</span>
```

### オプション 2: API も万円に統一（一貫性重視）

**メリット**: 完全統一、変換不要  
**実装**: バックエンド修正必要

```typescript
// フォーム入力（万円）
const [minRent, setMinRent] = useState(3);

// API送信（そのまま）
const params = {
  min_rent: minRent, // 万円のまま
  max_rent: maxRent,
};

// バックエンド（要修正）
q = q.Where("rent >= ?", filter.MinRent); // MinRentは万円として扱う
```

## 推奨実装（オプション 1）

### 1. フォームコンポーネント修正

```tsx
// features/search/components/RentRangeInput.tsx

export function RentRangeInput() {
  const [minRent, setMinRent] = useState<number>(3); // 万円
  const [maxRent, setMaxRent] = useState<number>(10); // 万円

  const handleSubmit = () => {
    const params = {
      min_rent: minRent * 10000, // 円に変換してAPI送信
      max_rent: maxRent * 10000,
    };
    // API呼び出し
  };

  return (
    <div>
      <label>
        家賃下限
        <input
          type="number"
          value={minRent}
          onChange={(e) => setMinRent(Number(e.target.value))}
          step="0.5"
          min="0"
        />
        <span>万円</span>
      </label>

      <label>
        家賃上限
        <input
          type="number"
          value={maxRent}
          onChange={(e) => setMaxRent(Number(e.target.value))}
          step="0.5"
          min="0"
        />
        <span>万円</span>
      </label>
    </div>
  );
}
```

### 2. 表示コンポーネント修正

```tsx
// 家賃表示
function RentDisplay({ rent }: { rent: number }) {
  return <span>¥{rent}万</span>; // 4.8万
}

// または小数点なしで表示
function RentDisplay({ rent }: { rent: number }) {
  return <span>¥{Math.round(rent)}万</span>; // 5万
}
```

### 3. ユーティリティ関数

```typescript
// utils/rent.ts

export function manToYen(man: number): number {
  return man * 10000;
}

export function yenToMan(yen: number): number {
  return yen / 10000;
}

export function formatRentMan(man: number): string {
  return `¥${man.toFixed(1)}万`;
}

export function formatRentYen(yen: number): string {
  return `¥${yen.toLocaleString()}`;
}
```

## 表示例

### Before（円表示）

```
家賃下限: 30000 円
家賃上限: 100000 円
検索結果: ¥48000
```

### After（万円統一）

```
家賃下限: 3 万円
家賃上限: 10 万円
検索結果: ¥4.8万
```

## バックエンドの注意点

現在のバックエンド実装を確認:

```go
// station_repository.go (現在の実装)
if filter.MinRent > 0 {
    q = q.Where("rent >= ?", filter.MinRent)
}
```

**データベースの rent カラム**: 万円単位で保存（4.8 = 4.8 万円）

**フロントエンドの送信値**:

- オプション 1 の場合: `min_rent=30000`（円） → バックエンドで 10000 で割る
- オプション 2 の場合: `min_rent=3`（万円） → そのまま使用

### バックエンド修正（オプション 1 の場合）

```go
// StationFilter構造体
type StationFilter struct {
    MinRent float64  // 円単位で受け取る想定
    MaxRent float64
}

// Repository層で万円に変換
if filter.MinRent > 0 {
    minRentMan := filter.MinRent / 10000
    q = q.Where("rent >= ?", minRentMan)
}
if filter.MaxRent > 0 {
    maxRentMan := filter.MaxRent / 10000
    q = q.Where("rent <= ?", maxRentMan)
}
```

## 結論

**推奨アプローチ**: オプション 1（フロントエンドで変換）

**理由**:

1. ✅ API の互換性を保つ
2. ✅ バックエンド修正が最小限
3. ✅ UI は万円で統一され、理解しやすい
4. ✅ 変換ロジックはフロントエンドで完結

**実装ステップ**:

1. フォーム入力を万円表示に変更
2. API 送信時に 10000 倍して円に変換
3. レスポンス表示を万円で統一（`¥4.8万`）
4. ユーティリティ関数で変換処理を共通化

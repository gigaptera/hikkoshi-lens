# API 警告メッセージとフロントエンド改善提案

## バックエンド API 実装完了 ✅

### API レスポンス仕様

**条件不完全な場合**（building_type または layout が未指定）:

```json
{
  "warning": "建物種別と間取りの両方を指定すると、家賃相場が表示されます",
  "message": "Please specify both building_type and layout to see rent prices",
  "data": [
    {
      "id": 1,
      "name": "東京",
      "distance": 165.4,
      "market_prices": null // 家賃データなし
    }
  ]
}
```

**条件完全な場合**（両方指定）:

```json
[
  {
    "id": 1722,
    "name": "二重橋前",
    "distance": 487.7,
    "market_prices": [
      {
        "building_type": "mansion",
        "layout": "1r_1k_1dk",
        "rent": 4.8
      }
    ],
    "rent_avg": 4.8
  }
]
```

## フロントエンド改善提案

### 1. 検索フォームの必須化

**現在**: 両方とも選択可能（空欄 OK）

**改善後**:

```tsx
// features/stations/components/SearchForm.tsx

<Select
  required
  disabled={!buildingType} // 建物種別が未選択なら間取りは選べない
  placeholder="まず建物種別を選択してください"
>
  {/* 間取りの選択肢 */}
</Select>
```

### 2. 視覚的なガイダンス

```tsx
{
  (!buildingType || !layout) && (
    <Alert severity="info">
      <AlertTitle>家賃相場を表示するには</AlertTitle>
      建物種別と間取りの両方を選択してください
    </Alert>
  );
}
```

### 3. API レスポンス処理

```typescript
// features/stations/api/index.ts

interface SearchResponse {
  warning?: string;
  message?: string;
  data?: Station[];
}

export async function searchStations(params: SearchParams) {
  const response = await fetch(`/api/stations/nearby?${qs(params)}`);
  const json = await response.json();

  // warningがある場合は警告表示
  if ("warning" in json) {
    return {
      warning: json.warning,
      stations: json.data || [],
    };
  }

  // 通常のレスポンス
  return {
    warning: null,
    stations: json,
  };
}
```

### 4. UI 表示の改善

```tsx
// 結果画面
{
  searchResult.warning && (
    <Banner variant="warning">{searchResult.warning}</Banner>
  );
}

<StationList stations={searchResult.stations} />;

{
  /* market_pricesがない駅の表示 */
}
{
  station.market_prices === null && (
    <Text color="gray">条件を指定すると家賃相場が表示されます</Text>
  );
}
```

### 5. フォームバリデーション

```typescript
const validate = (values: SearchForm) => {
  const errors: any = {};

  if (!values.building_type && values.layout) {
    errors.building_type = "建物種別を選択してください";
  }

  if (values.building_type && !values.layout) {
    errors.layout = "間取りを選択してください";
  }

  return errors;
};
```

## 実装の優先順位

### 🔴 優先度: 高

1. **API レスポンス処理** - warning フィールドのハンドリング
2. **検索フォームバリデーション** - 片方だけ選択できないように
3. **視覚的フィードバック** - 条件不足時の Alert 表示

### 🟡 優先度: 中

4. **段階的入力** - 建物種別 → 間取りの順で有効化
5. **家賃なしの表示** - market_prices が null の場合の適切な表示

### 🟢 優先度: 低

6. **プリセット機能** - よく使う条件を保存
7. **おすすめ条件** - 人気の組み合わせを提案

## 期待される効果

✅ **ユーザー体験向上** - 明確なガイダンス  
✅ **誤操作防止** - バリデーションで不完全な検索を防ぐ  
✅ **パフォーマンス向上** - 不要なデータを取得しない  
✅ **データの整合性** - 意味のある家賃データのみ表示

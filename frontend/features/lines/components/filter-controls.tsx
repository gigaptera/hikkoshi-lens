"use client";

import { usePreferenceStore } from "@/features/lines/stores/preference-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FilterControls() {
  const filters = usePreferenceStore((state) => state.filters);
  const setFilters = usePreferenceStore((state) => state.setFilters);

  return (
    <Card className="rounded-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-base">検索条件</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* 家賃範囲 */}
        <div className="grid gap-2">
          <Label>家賃予算 (万円)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="下限なし"
              value={filters.minRent ? filters.minRent / 10000 : ""}
              onChange={(e) =>
                setFilters({
                  minRent: e.target.value
                    ? Number(e.target.value) * 10000
                    : undefined,
                })
              }
            />
            <span>〜</span>
            <Input
              type="number"
              placeholder="上限なし"
              value={filters.maxRent ? filters.maxRent / 10000 : ""}
              onChange={(e) =>
                setFilters({
                  maxRent: e.target.value
                    ? Number(e.target.value) * 10000
                    : undefined,
                })
              }
            />
          </div>
        </div>

        {/* 建物種別 */}
        <div className="grid gap-2">
          <Label>建物種別</Label>
          <div className="relative">
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
              value={filters.buildingType || ""}
              onChange={(e) =>
                setFilters({ buildingType: e.target.value || undefined })
              }
            >
              <option value="">指定なし</option>
              <option value="mansion">マンション</option>
              <option value="apart">アパート</option>
              <option value="detached">一戸建て</option>
            </select>
          </div>
        </div>

        {/* 間取り */}
        <div className="grid gap-2">
          <Label>間取り</Label>
          <div className="relative">
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
              value={filters.layout || ""}
              onChange={(e) =>
                setFilters({ layout: e.target.value || undefined })
              }
            >
              <option value="">指定なし</option>
              <option value="1r">ワンルーム (1R)</option>
              <option value="1k">1K/1DK</option>
              <option value="1ldk">1LDK</option>
              <option value="2k">2K/2DK</option>
              <option value="2ldk">2LDK</option>
              <option value="3k">3K/3DK</option>
              <option value="3ldk">3LDK</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

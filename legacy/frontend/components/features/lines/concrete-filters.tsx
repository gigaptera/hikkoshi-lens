import { usePreferenceStore } from "@/features/lines/stores/preference-store";
import { Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Faders,
  X,
  Buildings,
  House,
  Door,
  CurrencyJpy,
  Gift,
  MapPinLine,
  Train,
  Info,
} from "@phosphor-icons/react";

export function ConcreteFilters() {
  const { filters, setFilters, subsidy, setSubsidy } = usePreferenceStore();

  const handleReset = () => {
    setFilters({
      minRent: undefined,
      maxRent: undefined,
      radius: 3000,
      buildingType: "",
      layout: "",
    });
    setSubsidy({
      conditionType: "none",
      conditionValue: 3,
      amount: 0,
      budgetWithSubsidy: 60000,
    });
  };

  // 家賃補助の一般的なプリセット
  const subsidyPresets = [
    { type: "none", label: "なし", value: 0, desc: "家賃補助なし" },
    {
      type: "distance",
      label: "会社から2km",
      value: 2,
      amount: 3,
      desc: "よくあるパターン",
    },
    {
      type: "distance",
      label: "会社から3km",
      value: 3,
      amount: 3,
      desc: "標準的",
    },
    {
      type: "stops",
      label: "最寄りから3駅",
      value: 3,
      amount: 3,
      desc: "人気の条件",
    },
    {
      type: "stops",
      label: "最寄りから5駅",
      value: 5,
      amount: 3,
      desc: "広範囲",
    },
  ];

  return (
    <Panel variant="steel" className="space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-300 pb-3">
        <div className="flex items-center gap-2">
          <Faders weight="light" className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold uppercase tracking-widest text-neutral-600">
            検索条件
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="h-6 w-6 text-neutral-400 hover:text-neutral-900"
        >
          <X weight="light" className="w-3 h-3" />
        </Button>
      </div>

      {/* Building Type & Layout - Button Style */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1.5 flex items-center gap-2">
          <Buildings weight="light" size={16} /> 物件スペック
        </h4>

        {/* Layout - Step 2 */}
        <div
          className={`space-y-2 ${!filters.buildingType ? "opacity-50" : ""}`}
        >
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
            <Door weight="light" size={14} /> 間取り
            <span className="text-teal-600 text-[9px] ml-1">② 必須</span>
            {!filters.buildingType && (
              <span className="text-neutral-400 text-[9px] ml-auto">
                ← まず建物種別を選択
              </span>
            )}
          </label>
          <div className="flex flex-wrap gap-1">
            {["1R/1K", "1LDK", "2LDK", "3LDK+"].map((l) => {
              const val =
                l === "1R/1K"
                  ? "1r_1k_1dk"
                  : l === "1LDK"
                  ? "1ldk_2k_2dk"
                  : l === "2LDK"
                  ? "2ldk_3k_3dk"
                  : "3ldk_4k";
              const isActive = filters.layout === val;

              return (
                <button
                  key={l}
                  disabled={!filters.buildingType}
                  onClick={() => setFilters({ layout: isActive ? "" : val })}
                  className={`text-[10px] font-bold px-1.5 py-1.5 border rounded-sm transition-all ${
                    !filters.buildingType
                      ? "bg-neutral-50 text-neutral-300 border-neutral-200 cursor-not-allowed"
                      : isActive
                      ? "bg-neutral-800 text-white border-neutral-800"
                      : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>

        {/* Building Type - Step 1 */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
            <Buildings weight="light" size={14} /> 建物種別
            <span className="text-teal-600 text-[9px] ml-1">① 必須</span>
          </label>
          <div className="flex gap-1">
            {[
              { label: "マンション", val: "mansion", icon: Buildings },
              { label: "アパート", val: "apart", icon: House },
            ].map((t) => {
              const isActive = filters.buildingType === t.val;

              return (
                <button
                  key={t.val}
                  onClick={() =>
                    setFilters({ buildingType: isActive ? "" : t.val })
                  }
                  className={`flex-1 text-[10px] font-bold px-1.5 py-1.5 border rounded-sm transition-all flex items-center justify-center gap-2 ${
                    isActive
                      ? "bg-neutral-800 text-white border-neutral-800"
                      : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <t.icon weight={isActive ? "fill" : "light"} size={14} />
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-teal-500" : "bg-neutral-300"
                    }`}
                  />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Budget & Subsidy Section */}
      <div className="space-y-3 pt-3 border-t border-dashed border-neutral-300">
        <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1.5 flex items-center gap-2">
          <CurrencyJpy weight="light" size={16} /> 予算・補助
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* Max Rent - Step 3 (Optional) */}
          <div
            className={
              !filters.buildingType || !filters.layout ? "opacity-50" : ""
            }
          >
            <label className="text-[10px] text-neutral-500 font-bold mb-1 flex items-center gap-1">
              <CurrencyJpy weight="light" size={14} />
              <span>家賃上限</span>
              <span className="text-neutral-400 text-[9px]">③ 任意</span>
              {(!filters.buildingType || !filters.layout) && (
                <span className="text-neutral-400 text-[9px] ml-auto">
                  建物種別と間取りを選択してください
                </span>
              )}
            </label>
            <div
              className={`flex items-baseline border-b pb-1 transition-colors ${
                !filters.buildingType || !filters.layout
                  ? "border-neutral-200"
                  : "border-neutral-300 focus-within:border-teal-500"
              }`}
            >
              <input
                type="number"
                disabled={!filters.buildingType || !filters.layout}
                className={`w-full bg-transparent text-lg font-mono font-bold focus:outline-none ${
                  !filters.buildingType || !filters.layout
                    ? "text-neutral-300 cursor-not-allowed"
                    : "text-neutral-800 placeholder:text-neutral-300"
                }`}
                placeholder="---"
                step="0.5"
                value={filters.maxRent || ""}
                onChange={(e) =>
                  setFilters({
                    maxRent: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
              <span className="text-xs font-mono text-neutral-400 ml-1">
                万円
              </span>
            </div>
          </div>

          {/* Subsidy Amount */}
          <div>
            <label className="text-[10px] text-neutral-500 font-bold mb-1 flex items-center gap-1">
              <Gift weight="light" size={14} /> 家賃補助額
            </label>
            <div className="flex items-baseline border-b border-neutral-300 pb-1 focus-within:border-teal-500 transition-colors">
              <input
                type="number"
                className="w-full bg-transparent text-lg font-mono font-bold text-neutral-800 focus:outline-none placeholder:text-neutral-300"
                placeholder="0"
                step="0.5"
                value={subsidy.amount || ""}
                onChange={(e) =>
                  setSubsidy({
                    ...subsidy,
                    amount: Number(e.target.value),
                  })
                }
              />
              <span className="text-xs font-mono text-neutral-400 ml-1">
                万円
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subsidy Condition Section - 改善版 */}
      <div className="space-y-3 pt-3 border-t border-dashed border-neutral-300">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
            <MapPinLine weight="light" size={16} /> 適用条件
          </h4>
          <div className="group relative">
            <Info size={14} className="text-neutral-400 cursor-help" />
            <div className="hidden group-hover:block absolute right-0 top-6 w-64 bg-white border-2 border-primary-200 rounded-lg shadow-lg p-2.5 text-xs text-neutral-700 z-50">
              <div className="font-bold text-primary mb-2">よくある条件例</div>
              <ul className="space-y-1 text-[10px]">
                <li>• 会社から2〜3km圏内</li>
                <li>• 最寄り駅から3〜5駅以内</li>
                <li>• 補助額は月2〜5万円が一般的</li>
              </ul>
            </div>
          </div>
        </div>

        {/* プリセット選択 */}
        <div className="bg-neutral-50 p-3 rounded-xl border border-border space-y-2">
          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
            よくあるパターンから選ぶ
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {subsidyPresets.map((preset) => {
              const isActive =
                subsidy.conditionType === preset.type &&
                subsidy.conditionValue === preset.value;

              return (
                <button
                  key={`${preset.type}-${preset.value}`}
                  onClick={() => {
                    setSubsidy({
                      ...subsidy,
                      conditionType: preset.type as "none" | "distance" | "stops",
                      conditionValue: preset.value,
                      amount: preset.amount || subsidy.amount,
                    });
                  }}
                  className={`relative p-2 rounded-lg border-2 transition-all text-left ${
                    isActive
                      ? "bg-primary border-primary text-white shadow-md"
                      : "bg-white border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {preset.type === "distance" && (
                      <Buildings
                        size={14}
                        weight={isActive ? "fill" : "light"}
                        className={isActive ? "text-white" : "text-primary"}
                      />
                    )}
                    {preset.type === "stops" && (
                      <Train
                        size={14}
                        weight={isActive ? "fill" : "light"}
                        className={isActive ? "text-white" : "text-primary"}
                      />
                    )}
                    <span className="text-xs font-bold">{preset.label}</span>
                  </div>
                  <div
                    className={`text-[9px] ${
                      isActive ? "text-white/80" : "text-neutral-500"
                    }`}
                  >
                    {preset.desc}
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* カスタム入力 */}
          {subsidy.conditionType !== "none" && (
            <div className="pt-2 border-t border-border">
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                カスタム設定
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 bg-white rounded-lg border-2 border-border p-2 focus-within:border-primary transition-colors">
                    {subsidy.conditionType === "distance" && (
                      <Buildings size={16} weight="bold" className="text-primary shrink-0" />
                    )}
                    {subsidy.conditionType === "stops" && (
                      <Train size={16} weight="bold" className="text-primary shrink-0" />
                    )}
                    <input
                      type="number"
                      className="w-full bg-transparent text-center text-lg font-mono font-bold text-neutral-900 focus:outline-none"
                      value={subsidy.conditionValue}
                      min={1}
                      max={subsidy.conditionType === "distance" ? 10 : 10}
                      onChange={(e) =>
                        setSubsidy({
                          ...subsidy,
                          conditionValue: Number(e.target.value),
                        })
                      }
                    />
                    <span className="text-sm font-bold text-neutral-600 shrink-0">
                      {subsidy.conditionType === "distance" ? "km" : "駅"}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {subsidy.conditionType === "distance" ? "圏内" : "以内"}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* 自己負担額表示 */}
        {subsidy.conditionType !== "none" && subsidy.amount > 0 && (
          <div className="bg-gradient-to-br from-primary to-teal-700 text-white p-3 rounded-xl shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1">
                  自己負担額 (目安)
                </div>
                <div className="text-2xl font-mono font-black">
                  ¥
                  {Math.max(0, (filters.maxRent || 0) - subsidy.amount)
                    .toFixed(1)
                    .replace(/\.0$/, "")}
                  万円
                </div>
              </div>
              <div className="text-right text-xs text-white/80">
                <div>家賃補助: {subsidy.amount}万円</div>
                <div>
                  条件:{" "}
                  {subsidy.conditionType === "distance"
                    ? `会社から${subsidy.conditionValue}km`
                    : `最寄りから${subsidy.conditionValue}駅`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

import { usePreferenceStore } from "@/features/lines/stores/preference-store";
import { Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

  return (
    <Panel variant="steel" className="space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-300 pb-4">
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
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2 flex items-center gap-2">
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
                  className={`text-[10px] font-bold px-3 py-1.5 border rounded-sm transition-all ${
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
                  className={`flex-1 text-[10px] font-bold px-3 py-1.5 border rounded-sm transition-all flex items-center justify-center gap-2 ${
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
      <div className="space-y-4 pt-4 border-t border-dashed border-neutral-300">
        <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2 flex items-center gap-2">
          <CurrencyJpy weight="light" size={16} /> 予算・補助
        </h4>

        <div className="grid grid-cols-2 gap-4">
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

          {/* Subsidy */}
          <div>
            <label className="text-[10px] text-neutral-500 font-bold mb-1 flex items-center gap-1">
              <Gift weight="light" size={14} /> 家賃補助
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

      {/* Subsidy Condition Section */}
      <div className="space-y-4 pt-4 border-t border-dashed border-neutral-300">
        <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2 flex items-center gap-2">
          <MapPinLine weight="light" size={16} /> 適用条件
        </h4>

        <div className="bg-neutral-50 p-3 rounded-md border border-neutral-100 space-y-3">
          <div className="flex bg-white rounded border border-neutral-200 p-0.5">
            {[
              { label: "なし", val: "none" },
              { label: "勤務地", val: "distance", icon: Buildings },
              { label: "最寄り", val: "stops", icon: Train },
            ].map((type) => (
              <button
                key={type.val}
                onClick={() =>
                  setSubsidy({
                    ...subsidy,
                    conditionType: type.val as "none" | "distance" | "stops",
                  })
                }
                className={`flex-1 text-[10px] px-2 py-1 rounded-sm font-bold transition-all flex items-center justify-center gap-1 ${
                  subsidy.conditionType === type.val
                    ? "bg-neutral-800 text-white shadow-sm"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                {type.icon && (
                  <type.icon
                    weight={
                      subsidy.conditionType === type.val ? "fill" : "light"
                    }
                    size={12}
                  />
                )}
                {type.label}
                {type.val !== "none" && "から"}
              </button>
            ))}
          </div>

          {subsidy.conditionType !== "none" && (
            <div className="flex items-center gap-2 justify-end">
              <input
                type="number"
                className="bg-white border border-neutral-200 rounded text-center w-12 py-1 text-sm font-mono font-bold text-neutral-800 focus:outline-none focus:border-teal-500"
                value={subsidy.conditionValue}
                onChange={(e) =>
                  setSubsidy({
                    ...subsidy,
                    conditionValue: Number(e.target.value),
                  })
                }
              />
              <span className="text-[10px] font-bold text-neutral-500">
                {subsidy.conditionType === "distance" ? "km圏内" : "駅以内"}
              </span>
            </div>
          )}
        </div>

        {subsidy.conditionType !== "none" && (
          <div className="bg-neutral-900 text-white p-4 rounded-md shadow-md flex justify-between items-center">
            <span className="text-[10px] font-bold text-neutral-400">
              自己負担額 (目安)
            </span>
            <span className="text-xl font-mono font-bold text-teal-400">
              ¥
              {Math.max(
                0,
                (filters.maxRent || 0) - subsidy.amount
              ).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </Panel>
  );
}

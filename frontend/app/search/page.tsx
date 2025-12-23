"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocationStore } from "@/features/map/stores/location-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { MapPlaceholder } from "@/components/features/dashboard/map-placeholder";
import { usePreferenceStore } from "@/features/lines/stores/preference-store";
import { ScorePanel } from "@/components/features/dashboard/score-panel";
import {
  Door,
  Buildings,
  House,
  CurrencyJpy,
  Gift,
  MapPinLine,
  Train,
  ArrowUpRight,
  ArrowLeft,
} from "@phosphor-icons/react";

export default function SearchPage() {
  const router = useRouter();
  const setWorkLocation = useLocationStore((state) => state.setWorkLocation);
  const { subsidy, setSubsidy, filters, setFilters } = usePreferenceStore();
  const [searchText, setSearchText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async () => {
    if (!searchText.trim()) {
      setErrorMessage("住所を入力してください");
      return;
    }

    setErrorMessage("");

    try {
      const { MapboxService } = await import(
        "@/services/mapbox/mapbox-service"
      );
      const service = MapboxService.getInstance();
      const result = await service.searchAddress(searchText.trim());

      if (result.features.length > 0) {
        const feature = result.features[0];
        const [lng, lat] = feature.center;

        const location = {
          lat,
          lng,
          address: feature.place_name,
        };

        setWorkLocation(location);
        router.push("/stations");
      } else {
        setErrorMessage(
          "住所が見つかりませんでした。別の住所を入力してください。"
        );
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setErrorMessage("住所の検索に失敗しました。もう一度お試しください。");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-200 text-neutral-900 font-sans p-8 md:p-13">
      {/* Header */}
      <header className="mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-teal-500 transition-colors mb-6"
        >
          <ArrowLeft size={12} weight="bold" />
          ホームに戻る
        </Link>

        <div className="relative">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-neutral-800">
            エリア検索
          </h1>
          <div className="absolute -right-4 top-0 w-3 h-3 bg-teal-500 rounded-full"></div>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 pl-1">
            勤務地から最適エリアを探す
          </p>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
        {/* Location Input */}
        <div className="col-span-1 md:col-span-12 row-span-1">
          <Panel
            variant="solid"
            className="h-full !p-0 flex flex-col group relative overflow-hidden"
          >
            <div className="absolute inset-0 z-0 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
              <MapPlaceholder />
            </div>

            <div className="relative z-10 p-8 flex flex-col md:flex-row h-full justify-between items-end bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors gap-6">
              <div className="flex-1 w-full">
                <span className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest inline-block mb-4">
                  勤務地 / 通学先
                </span>

                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="住所を入力 (例: 大手町, 渋谷)..."
                      className="text-3xl md:text-6xl font-black tracking-tighter text-neutral-900 bg-transparent border-b-2 border-neutral-400 focus-visible:border-teal-500 px-0 py-4 h-auto placeholder:text-neutral-300 transition-colors"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchText.trim()) {
                          handleSearch();
                        }
                      }}
                    />
                    {errorMessage && (
                      <div className="mt-3 text-sm font-bold text-red-600 bg-red-50 border-2 border-red-200 rounded px-4 py-2.5 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSearch}
                disabled={!searchText.trim()}
                className="bg-teal-500 hover:bg-teal-600 text-white rounded-none h-14 px-8 text-sm font-bold uppercase tracking-widest shadow-lg hover:translate-y-[-2px] active:translate-y-[1px] transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:bg-neutral-300 disabled:text-neutral-500"
              >
                検索開始 <ArrowUpRight size={18} />
              </Button>
            </div>
          </Panel>
        </div>

        {/* Bottom Section */}
        <div className="col-span-1 md:col-span-12 row-span-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Search Conditions */}
          <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
            <Panel
              variant="solid"
              title="検索条件"
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex flex-col gap-8 pt-2">
                {/* Property Conditions */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2 flex items-center gap-2">
                    <Buildings weight="light" size={16} /> 物件スペック
                  </h4>

                  {/* Layout */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-500 font-bold flex items-center gap-1">
                      <Door weight="light" size={14} /> 間取り
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
                        return (
                          <button
                            key={l}
                            onClick={() =>
                              setFilters({
                                layout: filters.layout === val ? "" : val,
                              })
                            }
                            className={`text-[10px] font-bold px-3 py-1.5 border rounded-sm transition-all ${
                              filters.layout === val
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

                  {/* Building Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-500 font-bold flex items-center gap-1">
                      <Buildings weight="light" size={14} /> 建物種別
                    </label>
                    <div className="flex gap-1">
                      {[
                        {
                          label: "マンション",
                          val: "mansion",
                          icon: Buildings,
                        },
                        { label: "アパート", val: "apart", icon: House },
                      ].map((t) => (
                        <button
                          key={t.val}
                          onClick={() =>
                            setFilters({
                              buildingType:
                                filters.buildingType === t.val ? "" : t.val,
                            })
                          }
                          className={`flex-1 text-[10px] font-bold px-3 py-1.5 border rounded-sm transition-all flex items-center justify-center gap-2 ${
                            filters.buildingType === t.val
                              ? "bg-neutral-800 text-white border-neutral-800"
                              : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                          }`}
                        >
                          <t.icon
                            weight={
                              filters.buildingType === t.val ? "fill" : "light"
                            }
                            size={14}
                          />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Budget & Subsidy */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2 flex items-center gap-2">
                    <CurrencyJpy weight="light" size={16} /> 予算・補助
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-neutral-500 font-bold mb-1 flex items-center gap-1">
                        <CurrencyJpy weight="light" size={14} /> 家賃上限
                      </label>
                      <div className="flex items-baseline border-b border-neutral-300 pb-1 focus-within:border-teal-500 transition-colors">
                        <input
                          type="number"
                          className="w-full bg-transparent text-lg font-mono font-bold text-neutral-800 focus:outline-none placeholder:text-neutral-300"
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

                {/* Range & Condition */}
                <div className="space-y-4 mt-auto">
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
                              conditionType: type.val as
                                | "none"
                                | "distance"
                                | "stops",
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
                                subsidy.conditionType === type.val
                                  ? "fill"
                                  : "light"
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
                          {subsidy.conditionType === "distance"
                            ? "km圏内"
                            : "駅以内"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          {/* Right: Score Panel */}
          <div className="col-span-1 md:col-span-4 h-full">
            <Panel
              variant="steel"
              title="住環境スコア (調整)"
              className="h-full flex flex-col relative transition-colors min-h-[500px]"
            >
              <ScorePanel />
            </Panel>
          </div>
        </div>
      </main>
    </div>
  );
}

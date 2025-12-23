"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocationStore } from "@/features/map/stores/location-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Door,
  Buildings,
  House,
  CurrencyJpy,
  Gift,
  MapPinLine,
  Train,
  ArrowUpRight,
  MagnifyingGlass,
  SquaresFour,
  Heart,
  MapPin,
} from "@phosphor-icons/react";
import { Panel } from "@/components/ui/panel";
import { MapPlaceholder } from "@/components/features/dashboard/map-placeholder";
import { usePreferenceStore } from "@/features/lines/stores/preference-store";
import { ScorePanel } from "@/components/features/dashboard/score-panel";

export default function HomePage() {
  const router = useRouter();
  const setWorkLocation = useLocationStore((state) => state.setWorkLocation);
  const { subsidy, setSubsidy, filters, setFilters } = usePreferenceStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchText, setSearchText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async () => {
    // 未入力チェック
    if (!searchText.trim()) {
      setErrorMessage("住所を入力してください");
      return; // リダイレクトしない
    }

    setErrorMessage(""); // エラーメッセージをクリア

    try {
      // Use MapboxService for geocoding (uses GSI API for Japanese addresses)
      const { MapboxService } = await import(
        "@/services/mapbox/mapbox-service"
      );
      const service = MapboxService.getInstance();
      const result = await service.searchAddress(searchText.trim());

      if (result.features.length > 0) {
        const feature = result.features[0];
        const [lng, lat] = feature.center; // GSI returns [lng, lat]

        const location = {
          lat,
          lng,
          address: feature.place_name,
        };

        setWorkLocation(location);
        router.push("/stations");
      } else {
        // 住所が見つからない
        setErrorMessage(
          "住所が見つかりませんでした。別の住所を入力してください。"
        );
        // リダイレクトしない
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setErrorMessage("住所の検索に失敗しました。もう一度お試しください。");
      // リダイレクトしない
    }
  };

  return (
    <>
      {/* Header Bar */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="relative">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-neutral-800">
            HIKKOSHI
            <br />
            LENS
          </h1>
          <div className="absolute -right-4 top-0 w-3 h-3 bg-teal-500 rounded-full"></div>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 pl-1">
            データで選ぶ、知的移住。
          </p>
        </div>

        <nav className="flex items-center space-x-1 bg-neutral-100/50 p-1 rounded-sm backdrop-blur-sm border border-white/20">
          {[
            { label: "ダッシュボード", icon: SquaresFour },
            { label: "物件検索", icon: MagnifyingGlass },
            { label: "保存済み", icon: Heart },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label.toLowerCase())}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                // Mapping Japanese tabs to internal slugs if needed, or just visual
                activeTab === tab.label.toLowerCase()
                  ? "bg-teal-500 text-white shadow-md"
                  : "text-neutral-500 hover:bg-white/50 hover:text-neutral-800"
              }`}
            >
              <tab.icon
                weight={
                  activeTab === tab.label.toLowerCase() ? "fill" : "light"
                }
                size={16}
              />
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Grid Layout */}
      {/* Main Grid Layout */}
      <main className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
        {/* 1. Location Context (Wide - Full Width) */}
        <div className="col-span-1 md:col-span-12 row-span-1">
          <Panel
            variant="solid"
            className="h-full !p-0 flex flex-col group relative overflow-hidden"
          >
            {/* Background Map Placeholder */}
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
                レポートを作成 <ArrowUpRight size={18} />
              </Button>
            </div>
          </Panel>
        </div>

        {/* Bottom Section: 2 Columns */}
        <div className="col-span-1 md:col-span-12 row-span-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Stacked Conditions & Budget */}
          <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
            {/* 2. Unified Search Panel */}
            <Panel
              variant="solid"
              title="検索条件"
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex flex-col gap-8 pt-2">
                {/* Section A: Property Conditions */}
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
                      {["1R/1K", "1LDK", "2LDK", "3LDK+"].map((l) => (
                        <button
                          key={l}
                          onClick={() => {
                            const val =
                              l === "1R/1K"
                                ? "1r_1k_1dk"
                                : l === "1LDK"
                                ? "1ldk_2k_2dk"
                                : l === "2LDK"
                                ? "2ldk_3k_3dk"
                                : "3ldk_4k";
                            setFilters({
                              layout: filters.layout === val ? "" : val,
                            });
                          }}
                          className={`text-[10px] font-bold px-3 py-1.5 border rounded-sm transition-all ${
                            filters.layout ===
                            (l === "1R/1K"
                              ? "1r_1k_1dk"
                              : l === "1LDK"
                              ? "1ldk_2k_2dk"
                              : l === "2LDK"
                              ? "2ldk_3k_3dk"
                              : "3ldk_4k")
                              ? "bg-neutral-800 text-white border-neutral-800"
                              : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
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
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              filters.buildingType === t.val
                                ? "bg-teal-500"
                                : "bg-neutral-300"
                            }`}
                          ></div>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section B: Budget & Subsidy */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2 flex items-center gap-2">
                    <CurrencyJpy weight="light" size={16} /> 予算・補助
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Max Rent */}
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

                {/* Section C: Range & Result */}
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
              </div>
            </Panel>
          </div>

          {/* Right Column: Tall Score Panel */}
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

      {/* Footer / Copyright */}
      <footer className="mt-16 border-t border-neutral-300 pt-8 flex justify-between items-end opacity-60">
        <div className="text-[10px] font-mono space-y-1">
          <p>HIKKOSHI LENS VER 2.0</p>
          <p>DESIGN: NEO-BRUTALISM / CONCRETE</p>
          <p>LOC: TOKYO, JAPAN</p>
        </div>
        <div className="text-4xl text-neutral-300 font-black tracking-tighter select-none">
          HL-25
        </div>
      </footer>
    </>
  );
}

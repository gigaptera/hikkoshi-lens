"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocationStore } from "@/features/map/stores/location-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { usePreferenceStore } from "@/features/lines/stores/preference-store";
import { ScorePanel } from "@/components/features/dashboard/score-panel";
import { CompactPageHeader } from "@/components/layout/compact-page-header";
import {
  Door,
  Buildings,
  House,
  CurrencyJpy,
  Gift,
  MapPinLine,
  Train,
  ArrowRight,
  MagnifyingGlass,
  ChartBar,
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Compact Header */}
        <CompactPageHeader
          icon={
            <MagnifyingGlass size={18} weight="bold" className="text-primary" />
          }
          title="エリア検索"
          subtitle="勤務地と条件を入力してください"
          currentStep={1}
          showBackLink
        />

        {/* Main Grid: 12-column system */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Location Input */}
            <Panel variant="solid" className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                  <MapPinLine weight="fill" size={14} className="text-white" />
                </div>
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  勤務地 / 通学先
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="例: 大手町, 渋谷, 東京駅..."
                    className="flex-1 h-10 text-base"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchText.trim()) {
                        handleSearch();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={!searchText.trim()}
                    className="h-10 px-4 text-sm font-bold shrink-0"
                  >
                    検索 <ArrowRight size={16} weight="bold" />
                  </Button>
                </div>
                {errorMessage && (
                  <div className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                    <svg
                      className="w-3 h-3 shrink-0"
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
            </Panel>

            {/* Search Conditions */}
            <Panel variant="solid" className="p-6">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Buildings weight="bold" size={14} className="text-primary" />
                </div>
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  検索条件
                </div>
              </div>

              <div className="space-y-2">
                {/* Property Conditions - 2列グリッド */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-600 font-bold flex items-center gap-1 mb-1.5">
                      <Door weight="light" size={12} /> 間取り
                    </label>
                    <div className="grid grid-cols-2 gap-1">
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
                            className={`text-[10px] font-bold px-1 py-1.5 border-2 rounded-lg transition-all ${
                              filters.layout === val
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-neutral-700 border-border hover:border-primary/50"
                            }`}
                          >
                            {l}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-600 font-bold flex items-center gap-1 mb-1.5">
                      <Buildings weight="light" size={12} /> 建物種別
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
                          className={`flex-1 text-[10px] font-bold px-1 py-1.5 border-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                            filters.buildingType === t.val
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-neutral-700 border-border hover:border-primary/50"
                          }`}
                        >
                          <t.icon
                            weight={
                              filters.buildingType === t.val ? "fill" : "light"
                            }
                            size={12}
                          />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Budget - 1行 */}
                <div>
                  <label className="text-[10px] text-neutral-600 font-bold mb-1.5 flex items-center gap-1">
                    <CurrencyJpy weight="light" size={12} /> 予算
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-neutral-500 font-medium">
                        上限
                      </span>
                      <input
                        type="number"
                        className="w-12 h-8 bg-white border-2 border-border rounded-lg px-1 text-center text-sm font-bold text-neutral-900 focus:outline-none focus:border-primary transition-colors"
                        placeholder="10"
                        step="0.5"
                        max="999"
                        value={filters.maxRent || ""}
                        onChange={(e) =>
                          setFilters({
                            maxRent: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                      <span className="text-xs font-bold text-neutral-600">
                        万
                      </span>
                    </div>
                    <span className="text-neutral-300">|</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-neutral-500 font-medium">
                        補助
                      </span>
                      <input
                        type="number"
                        className="w-12 h-8 bg-white border-2 border-border rounded-lg px-1 text-center text-sm font-bold text-neutral-900 focus:outline-none focus:border-primary transition-colors"
                        placeholder="0"
                        step="0.5"
                        max="999"
                        value={subsidy.amount || ""}
                        onChange={(e) =>
                          setSubsidy({
                            ...subsidy,
                            amount: Number(e.target.value),
                          })
                        }
                      />
                      <span className="text-xs font-bold text-neutral-600">
                        万
                      </span>
                    </div>
                  </div>
                </div>

                {/* Condition - 超コンパクト */}
                <div>
                  <label className="text-[10px] text-neutral-600 font-bold flex items-center gap-1 mb-1.5">
                    <MapPinLine weight="light" size={12} /> 適用条件
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setSubsidy({
                          ...subsidy,
                          conditionType: "none",
                          conditionValue: 3,
                        })
                      }
                      className={`text-[10px] px-2 py-1.5 rounded-lg font-bold transition-all border-2 ${
                        subsidy.conditionType === "none"
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-neutral-700 border-border hover:border-primary/50"
                      }`}
                    >
                      なし
                    </button>

                    <div className="flex-1 flex items-center gap-1 bg-neutral-50 rounded-lg p-1 border border-border">
                      {/* 条件タイプ選択 */}
                      <button
                        onClick={() =>
                          setSubsidy({
                            ...subsidy,
                            conditionType:
                              subsidy.conditionType === "distance"
                                ? "stops"
                                : "distance",
                          })
                        }
                        className={`text-[10px] px-1.5 py-1 rounded font-bold transition-all flex items-center gap-0.5 ${
                          subsidy.conditionType !== "none"
                            ? "bg-primary text-white"
                            : "bg-white text-neutral-700"
                        }`}
                      >
                        {subsidy.conditionType === "distance" ? (
                          <>
                            <Buildings size={10} weight="fill" />
                            会社
                          </>
                        ) : (
                          <>
                            <Train size={10} weight="fill" />
                            最寄
                          </>
                        )}
                      </button>

                      {subsidy.conditionType !== "none" && (
                        <>
                          <span className="text-[10px] text-neutral-500">
                            から
                          </span>
                          <input
                            type="number"
                            className="w-9 h-6 bg-white border border-border rounded text-center text-xs font-bold text-neutral-900 focus:outline-none focus:border-primary"
                            value={subsidy.conditionValue}
                            min={1}
                            max={10}
                            onChange={(e) =>
                              setSubsidy({
                                ...subsidy,
                                conditionValue: Number(e.target.value),
                              })
                            }
                          />
                          <span className="text-[10px] font-bold text-neutral-600">
                            {subsidy.conditionType === "distance" ? "km" : "駅"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6">
            <Panel variant="glass" className="p-6">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ChartBar weight="bold" size={14} className="text-primary" />
                </div>
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  スコア重み
                </div>
              </div>
              <ScorePanel />
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

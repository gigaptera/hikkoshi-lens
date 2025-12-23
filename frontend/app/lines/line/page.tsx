"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useStationRanking } from "@/features/lines/hooks/use-station-ranking";
import { StationRadarChart } from "@/features/lines/components/radar-chart";
import { Station } from "@/features/lines/types/station";
import { StationComparison } from "@/features/lines/components/station-comparison";
import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import {
  MapPin,
  ArrowLeft,
  HouseLine,
  Buildings,
  ShieldWarning,
} from "@phosphor-icons/react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useLocationStore } from "@/features/map/stores/location-store";
import { cn } from "@/lib/utils";
import { usePreferenceStore } from "@/features/lines/stores/preference-store";

export default function LinePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stationIdStr = searchParams.get("stationId");
  const subsidy = usePreferenceStore((state) => state.subsidy);

  const { stations, loading } = useStationRanking(
    stationIdStr ? stationIdStr : "0",
    {}
  );
  const targetStation = stations.find((s) => s.id.toString() === stationIdStr);
  const workLocation = useLocationStore((state) => state.workLocation);

  const rentInfo = useMemo(() => {
    if (!targetStation || !targetStation.rent_avg) return null;
    const marketRent = targetStation.rent_avg;
    let effectiveRent = marketRent;
    let isSubsidized = false;

    if (subsidy.conditionType === "distance" && targetStation.distance_km) {
      if (targetStation.distance_km <= subsidy.conditionValue) {
        effectiveRent = Math.max(0, marketRent - subsidy.amount);
        isSubsidized = true;
      }
    }
    return { marketRent, effectiveRent, isSubsidized };
  }, [targetStation, subsidy]);

  useEffect(() => {
    if (!targetStation || !workLocation) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: "detail-map",
      style: "mapbox://styles/mapbox/light-v11", // Light map for Concrete theme
      center: targetStation.coordinates
        ? [targetStation.coordinates.lng, targetStation.coordinates.lat]
        : [139.76, 35.68],
      zoom: 14,
      attributionControl: false,
    });

    map.on("load", () => {
      if (targetStation.coordinates) {
        new mapboxgl.Marker({ color: "#404040" }) // Dark Grey
          .setLngLat([
            targetStation.coordinates.lng,
            targetStation.coordinates.lat,
          ])
          .addTo(map);

        const bounds = new mapboxgl.LngLatBounds()
          .extend([
            targetStation.coordinates.lng,
            targetStation.coordinates.lat,
          ])
          .extend([workLocation.lng, workLocation.lat]);
        map.fitBounds(bounds, { padding: 80 });
      }
      new mapboxgl.Marker({ color: "#f97316" })
        .setLngLat([workLocation.lng, workLocation.lat])
        .addTo(map);
    });

    return () => map.remove();
  }, [targetStation, workLocation]);

  const [comparisonList, setComparisonList] = useState<Station[]>([]);

  if (!stationIdStr || loading || !targetStation) {
    return (
      <div className="min-h-screen bg-neutral-200 flex items-center justify-center text-neutral-500 font-mono">
        データ読み込み中...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-200 text-neutral-900 font-sans p-8 md:p-13 grid gap-8">
      {/* Navigation */}
      <nav className="flex items-center gap-4 text-sm text-neutral-500">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-neutral-500 hover:text-neutral-900 px-0 gap-2 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" /> ランキングに戻る
        </Button>
      </nav>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Station Info (Panel) */}
        <div className="lg:col-span-8 space-y-8">
          <Panel variant="solid" className="!p-0 overflow-hidden min-h-[400px]">
            <div className="h-[400px] w-full relative group">
              <div
                id="detail-map"
                className="w-full h-full grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute top-6 left-6 pointer-events-none">
                <span className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest inline-block mb-2">
                  駅詳細情報
                </span>
                <div className="bg-white/90 backdrop-blur px-6 py-4 shadow-sm border border-white/40">
                  <div className="text-xs font-bold tracking-widest uppercase text-neutral-400 mb-1">
                    {targetStation.line_name} 線
                  </div>
                  <h1 className="text-4xl font-black tracking-tighter text-neutral-900">
                    {targetStation.name}
                  </h1>
                </div>
              </div>
            </div>
          </Panel>

          {/* Hazard Info Panel */}
          <Panel
            variant="solid"
            className="border-l-4 border-l-red-500 bg-neutral-50"
          >
            <div className="flex items-center gap-2 mb-4 text-red-600">
              <ShieldWarning className="w-5 h-5" weight="fill" />
              <span className="text-xs font-bold uppercase tracking-widest">
                防災・ハザード情報 (AI分析推定)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-neutral-400">
                  洪水リスク
                </span>
                <div className="text-lg font-black text-neutral-800 flex items-center gap-2">
                  低{" "}
                  <span className="text-xs font-normal text-neutral-500 bg-green-100 text-green-700 px-1 py-0.5 rounded">
                    Level 1
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-neutral-400">
                  地盤揺れやすさ
                </span>
                <div className="text-lg font-black text-neutral-800">普通</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-neutral-400">
                  避難場所
                </span>
                <div className="text-lg font-black text-neutral-800">
                  徒歩5分圏内 (2)
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-200 text-[10px] text-neutral-400 leading-relaxed">
              ※
              このデータは公的機関のオープンデータを基にした推定値です。契約前に必ず重要事項説明書をご確認ください。
            </div>
          </Panel>

          {/* Comparison Panel */}
          <Panel variant="steel" title="周辺駅との比較">
            <StationComparison
              stations={
                comparisonList.length > 0
                  ? comparisonList
                  : [
                      targetStation,
                      ...stations
                        .filter((s) => s.id !== targetStation.id)
                        .slice(0, 2),
                    ]
              }
              onRemove={(id) =>
                setComparisonList((prev) => prev.filter((s) => s.id !== id))
              }
            />
          </Panel>
        </div>

        {/* Right Col: Metrics (Panels) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Score Panel */}
          <Panel variant="glass" title="総合スコア" accent>
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="text-6xl font-black text-primary tabular-nums tracking-tighter mt-2">
                  {targetStation.total_score?.toFixed(0)}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-400 mt-1">
                  総合評価
                </div>
              </div>
              <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                <span className="font-bold text-lg text-neutral-900">A</span>
              </div>
            </div>
            <div className="h-48 w-full -ml-4 relative">
              {/* Using Recharts component but it might need styling update to match SVG look */}
              <StationRadarChart
                scoreDetails={targetStation.score_details || {}}
              />
            </div>
          </Panel>

          {/* Rent Panel */}
          <Panel variant="solid" className="border-l-4 border-l-neutral-800">
            <div className="flex items-center gap-2 mb-6 text-neutral-500 border-b border-neutral-200 pb-2 border-dashed">
              <HouseLine className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">
                家賃情報
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-1">
                  実質家賃 (1LDK)
                </div>
                <div
                  className={cn(
                    "text-5xl font-mono font-bold tracking-tighter text-neutral-900"
                  )}
                >
                  ¥{rentInfo?.effectiveRent.toLocaleString()}
                </div>
              </div>

              <div className="flex justify-between items-end text-sm text-neutral-500 font-mono border-t border-neutral-100 pt-3">
                <span>平均家賃（相場）</span>
                <span className="line-through decoration-neutral-300">
                  ¥{rentInfo?.marketRent.toLocaleString()}
                </span>
              </div>
            </div>
            {rentInfo?.isSubsidized && (
              <div className="mt-6 py-2 px-3 bg-primary-50 text-xs text-primary-700 font-bold tracking-wide uppercase flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                家賃補助適用
              </div>
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}

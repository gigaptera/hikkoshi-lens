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
  ArrowLeft,
  ShieldWarning,
  Train,
  ChartBar,
  CurrencyJpy,
} from "@phosphor-icons/react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useLocationStore } from "@/features/map/stores/location-store";
import { cn } from "@/lib/utils";
import { usePreferenceStore } from "@/features/lines/stores/preference-store";
import { CompactPageHeader } from "@/components/layout/compact-page-header";

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
      style: "mapbox://styles/mapbox/light-v11",
      center: targetStation.coordinates
        ? [targetStation.coordinates.lng, targetStation.coordinates.lat]
        : [139.76, 35.68],
      zoom: 14,
      attributionControl: false,
    });

    map.on("load", () => {
      if (targetStation.coordinates) {
        new mapboxgl.Marker({ color: "oklch(0.65 0.16 190)" })
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
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Train size={24} weight="bold" className="text-primary" />
          </div>
          <div className="text-sm font-bold text-neutral-700">データ読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20 p-3 md:p-4">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-1.5 text-xs h-8"
          >
            <ArrowLeft className="w-3 h-3" weight="bold" /> 戻る
          </Button>
        </nav>

        {/* Main Grid - コンパクト */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
          {/* Left Col */}
          <div className="space-y-3">
            {/* Map Panel - 小さく */}
            <Panel variant="glass" className="overflow-hidden">
              <div className="h-[250px] w-full relative group">
                <div
                  id="detail-map"
                  className="w-full h-full grayscale-[20%] group-hover:grayscale-0 transition-[filter] duration-300"
                />
                <div className="absolute top-3 left-3 pointer-events-none">
                  <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-white/40">
                    <Badge variant="secondary" className="mb-1 h-4 text-[9px]">
                      {targetStation.line_name} 線
                    </Badge>
                    <h1 className="text-2xl font-black tracking-tight text-neutral-900">
                      {targetStation.name}
                    </h1>
                  </div>
                </div>
              </div>
            </Panel>

            {/* Hazard - コンパクト */}
            <Panel variant="solid" className="border-l-4 border-l-red-500 bg-red-50/30 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
                  <ShieldWarning size={14} className="text-red-600" weight="fill" />
                </div>
                <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                  防災・ハザード情報 (AI分析推定)
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-[9px] font-bold uppercase text-neutral-500 mb-0.5">
                    洪水リスク
                  </div>
                  <div className="text-lg font-black text-neutral-900">
                    低 <Badge variant="success" className="text-[8px] h-3.5 px-1">L1</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase text-neutral-500 mb-0.5">
                    地盤揺れ
                  </div>
                  <div className="text-lg font-black text-neutral-900">普通</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase text-neutral-500 mb-0.5">
                    避難場所
                  </div>
                  <div className="text-lg font-black text-neutral-900">徒歩5分 (2)</div>
                </div>
              </div>
            </Panel>

            {/* Comparison - コンパクト */}
            <Panel variant="solid" className="p-3">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ChartBar weight="bold" size={14} className="text-primary" />
                </div>
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  周辺駅との比較
                </div>
              </div>
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

          {/* Right Col - コンパクト */}
          <div className="space-y-3">
            {/* Score Panel */}
            <Panel variant="glass" className="border-2 border-primary-200 p-3">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                  <ChartBar weight="fill" size={14} className="text-white" />
                </div>
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  総合スコア
                </div>
              </div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-5xl font-black text-primary tabular-nums tracking-tighter leading-none">
                    {targetStation.total_score?.toFixed(0)}
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mt-1">
                    TOTAL
                  </div>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="font-black text-xl text-primary">A</span>
                </div>
              </div>
              <div className="h-40 w-full -ml-4">
                <StationRadarChart
                  scoreDetails={targetStation.score_details || {}}
                />
              </div>
            </Panel>

            {/* Rent Panel */}
            <Panel variant="solid" className="border-l-4 border-l-primary p-3">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CurrencyJpy weight="bold" size={14} className="text-primary" />
                </div>
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  家賃情報
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-[9px] text-neutral-500 uppercase font-bold tracking-wider mb-1">
                    実質家賃 (1LDK)
                  </div>
                  <div className={cn(
                    "text-4xl font-mono font-black tracking-tight text-neutral-900 leading-none"
                  )}>
                    ¥{rentInfo?.effectiveRent.toLocaleString()}
                  </div>
                </div>

                <div className="flex justify-between items-end text-xs text-neutral-500 font-mono border-t border-border pt-2">
                  <span className="font-bold">平均家賃</span>
                  <span className="line-through decoration-neutral-300 text-base font-bold">
                    ¥{rentInfo?.marketRent.toLocaleString()}
                  </span>
                </div>
              </div>
              {rentInfo?.isSubsidized && (
                <div className="mt-3 py-2 px-3 bg-primary-50 rounded-lg text-xs text-primary-700 font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                  家賃補助適用
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePreferenceStore, WEIGHT_KEYS } from "@/stores/preference-store";
import { useLocationStore } from "@/stores/location-store";
import { fetchStationsWithinThreeStops } from "@/services/station/api";
import { Station } from "@/types/station";
import Link from "next/link";
import { MapContainer } from "@/features/map/components/map-container";
import { useMLITDIDLayer } from "@/features/map/hooks/useMLITDIDLayer";
import mapboxgl from "mapbox-gl";
import { cn } from "@/lib/utils";

function LineDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stationIdStr = searchParams.get("stationId");
  const workLocation = useLocationStore((state) => state.workLocation);
  const weights = usePreferenceStore((state) => state.weights);
  const setWeights = usePreferenceStore((state) => state.setWeights);

  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

  // DID Layer Hook
  useMLITDIDLayer(mapInstance, {
    config: {
      visible: true,
      opacity: 0.4,
      fillColor: "#ff0000",
      strokeColor: "#ff0000",
    },
    autoAdd: true,
  });

  // 勤務地が未設定の場合はTOPページにリダイレクト
  useEffect(() => {
    if (!workLocation) {
      router.push("/");
      return;
    }
  }, [workLocation, router]);

  // 駅データを取得
  useEffect(() => {
    if (!stationIdStr) return;
    const stationId = parseInt(stationIdStr, 10);
    if (isNaN(stationId)) return;

    // Debounce to avoid too many requests
    const timer = setTimeout(() => {
      setLoading(true);
      fetchStationsWithinThreeStops(stationId, weights)
        .then((data) => {
          // Frontend-side sorting by TotalScore descending
          // Since backend returns line order (sequential), we re-sort for ranking view if desired.
          // User requested "Realtime Sorting", so let's sort by score.
          const sortedData = [...data].sort(
            (a, b) => (b.total_score ?? 0) - (a.total_score ?? 0)
          );
          setStations(sortedData);
        })
        .catch((error) => {
          console.error("Error fetching stations:", error);
          setStations([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [stationIdStr, weights]); // Add weights dependency

  // マップに駅のピンを追加したり、カメラを移動したりする
  useEffect(() => {
    if (!mapInstance || stations.length === 0) return;

    // 起点駅（リストの最初の駅、または stationIdStr に一致する駅）にカメラを移動
    const centerStation =
      stations.find((s) => s.id.toString() === stationIdStr) || stations[0];

    if (centerStation) {
      mapInstance.flyTo({
        center: [centerStation.coordinates.lng, centerStation.coordinates.lat],
        zoom: 14,
        essential: true,
      });

      // マーカーを追加（簡易実装: 毎回クリアするロジックが必要だが、今回はデモとして追加のみ）
      // 本来はマーカー管理のCustom Hookなどを作るべき
      stations.forEach((s) => {
        // マーカー要素を作成
        const el = document.createElement("div");
        el.className =
          "w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer";
        el.style.backgroundColor =
          s.id.toString() === stationIdStr ? "#FF5555" : "#3FB1CE";

        new mapboxgl.Marker({ element: el })
          .setLngLat([s.coordinates.lng, s.coordinates.lat])
          .setPopup(
            new mapboxgl.Popup({
              offset: 25,
              className: "rounded-none",
            }).setHTML(
              `<div class="p-2"><b>${
                s.name
              }</b><br>Score: ${s.total_score?.toFixed(0)}</div>`
            )
          )
          .addTo(mapInstance);
      });
    }
  }, [mapInstance, stations, stationIdStr]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-4 grid gap-4 min-h-[calc(100vh-4rem)] mt-16">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/lines">Lines</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">
            駅詳細・前後3駅 (おすすめ順)
          </h1>
          <p className="text-sm text-muted-foreground">
            起点駅とその前後の駅を、算出されたスコア順に表示します。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
        {/* Left Column: List & Controls */}
        <div className="flex flex-col gap-6 overflow-hidden h-full">
          {/* 駅リスト */}
          <Card className="rounded-none shadow-sm flex flex-col flex-1 overflow-hidden">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-base">駅ランキング</CardTitle>
              <CardDescription>
                <span className="flex gap-2 text-xs">
                  <span>起点ID: {stationIdStr}</span>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : stations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  データが見つかりませんでした
                </div>
              ) : (
                <ul className="divide-y result-list">
                  {stations.map((station, i) => (
                    <li
                      key={station.id}
                      className={cn(
                        "py-3 flex items-center gap-4 cursor-pointer hover:bg-neutral-50 transition-colors px-2",
                        station.id.toString() === stationIdStr
                          ? "bg-primary-50 hover:bg-primary-100"
                          : ""
                      )}
                      onClick={() => {
                        if (mapInstance) {
                          mapInstance.flyTo({
                            center: [
                              station.coordinates.lng,
                              station.coordinates.lat,
                            ],
                            zoom: 15,
                            essential: true,
                          });
                        }
                      }}
                    >
                      <div className="w-8 text-sm text-muted-foreground tabular-nums font-bold">
                        #{i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-medium",
                              station.id.toString() === stationIdStr
                                ? "text-primary-700 font-bold"
                                : ""
                            )}
                          >
                            {station.name}
                          </span>
                          {station.id.toString() === stationIdStr && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] rounded-none"
                            >
                              起点
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {station.company} - {station.line_name}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Score Badge */}
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-muted-foreground">
                            Score
                          </span>
                          <span className="font-bold tabular-nums text-lg text-primary-600">
                            {station.total_score
                              ? station.total_score.toFixed(0)
                              : "0"}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="tabular-nums rounded-none"
                        >
                          {station.distance_km
                            ? `${station.distance_km.toFixed(1)} km`
                            : "-"}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* 重み調整 */}
          <Card className="rounded-none shadow-sm flex-shrink-0">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">重み調整</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 pb-4">
              {WEIGHT_KEYS.map((key) => (
                <div key={key} className="grid grid-cols-5 items-center gap-2">
                  <div className="col-span-1 text-xs text-muted-foreground">
                    {key === "access" && "アクセス"}
                    {key === "life" && "利便性"}
                    {key === "fun" && "遊び"}
                    {key === "safety" && "治安"}
                    {key === "env" && "環境"}
                    {key === "cost" && "コスパ"}
                  </div>
                  <div className="col-span-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={weights[key]}
                      onChange={(e) => {
                        const newWeights = {
                          ...weights,
                          [key]: Number(e.target.value),
                        };
                        setWeights(newWeights);
                      }}
                      className="w-full h-1.5 bg-neutral-200 rounded-none appearance-none cursor-pointer dark:bg-neutral-700 accent-primary-600"
                    />
                  </div>
                  <div className="col-span-1 text-right tabular-nums text-xs">
                    {weights[key]}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Map */}
        <div className="h-full min-h-[400px] border border-neutral-200 bg-neutral-100 relative">
          <MapContainer className="w-full h-full" onMapLoad={setMapInstance} />
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return <LineDetailContent />;
}

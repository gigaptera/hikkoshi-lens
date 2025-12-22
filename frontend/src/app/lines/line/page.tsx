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
import { usePreferenceStore, WEIGHT_KEYS } from "@/stores/preferenceStore";
import { useLocationStore } from "@/stores/locationStore";
import { fetchStationsWithinThreeStops } from "@/services/station/api";
import { Station } from "@/types/station";
import Link from "next/link";

function LineDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stationIdStr = searchParams.get("stationId");
  const workLocation = useLocationStore((state) => state.workLocation);
  const weights = usePreferenceStore((state) => state.weights);
  const setWeights = usePreferenceStore((state) => state.setWeights);

  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <main className="mx-auto max-w-5xl px-4 py-4 grid gap-4 min-h-[calc(100vh-4rem)] mt-16">
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* 駅リスト */}
        <section className="md:col-span-3">
          <Card className="rounded-2xl flex flex-col max-h-[calc(100vh-16rem)]">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-base">駅ランキング</CardTitle>
              <CardDescription>
                <div className="flex gap-2 text-xs">
                  <span>起点ID: {stationIdStr}</span>
                </div>
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
                <ul className="divide-y">
                  {stations.map((station, i) => (
                    <li
                      key={station.id}
                      className={`py-3 flex items-center gap-4 ${
                        station.id.toString() === stationIdStr
                          ? "bg-muted/50 -mx-4 px-4 sticky top-0 backdrop-blur-sm z-10"
                          : ""
                      }`}
                    >
                      <div className="w-8 text-sm text-muted-foreground tabular-nums font-bold">
                        #{i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              station.id.toString() === stationIdStr
                                ? "text-primary font-bold"
                                : ""
                            }`}
                          >
                            {station.name}
                          </span>
                          {station.id.toString() === stationIdStr && (
                            <Badge variant="secondary" className="text-[10px]">
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
                          <span className="font-bold tabular-nums text-lg text-primary">
                            {station.total_score
                              ? station.total_score.toFixed(0)
                              : "0"}
                          </span>
                        </div>
                        <Badge variant="outline" className="tabular-nums">
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
        </section>
        {/* 重み調整 */}
        <section className="md:col-span-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">重み調整</CardTitle>
              <CardDescription>
                合計は気にせず配分してください（計算時に自動正規化）。
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {WEIGHT_KEYS.map((key) => (
                <div key={key} className="grid grid-cols-5 items-center gap-3">
                  <div className="col-span-1 text-sm text-muted-foreground">
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
                      className="w-full accent-primary"
                    />
                  </div>
                  <div className="col-span-1 text-right tabular-nums text-sm">
                    {weights[key]}
                  </div>
                </div>
              ))}
              <Separator />
              <div className="text-xs text-muted-foreground grid gap-1">
                <div>
                  現在の合計:{" "}
                  <span className="tabular-nums">
                    {Object.values(weights).reduce((a, b) => a + b, 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

export default function Page() {
  return <LineDetailContent />;
}

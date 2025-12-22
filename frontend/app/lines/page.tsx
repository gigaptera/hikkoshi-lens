"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useLocationStore } from "@/features/map/stores/location-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Train, ArrowRight } from "@phosphor-icons/react";
import { fetchNearbyStations, groupStationsByLine } from "@/features/lines/api";
import { Line } from "@/features/lines/types/station";
import { useLineStore } from "@/features/lines/stores/line-store";
import { usePreferenceStore } from "@/features/lines/stores/preference-store";
import Link from "next/link";

// 画面のみ（データはモック）。
// work=lat,lng を受け取り、勤務先に近い順で路線（最大10件）を表示。

export default function Lines() {
  const router = useRouter();
  const workLocation = useLocationStore((state) => state.workLocation);
  const weights = usePreferenceStore((state) => state.weights);

  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workLocation) {
      router.push("/");
      return;
    }

    const loadNearbyStations = async () => {
      try {
        const stations = await fetchNearbyStations(
          workLocation.lat,
          workLocation.lng,
          3000,
          weights
        );
        const groupedLines = groupStationsByLine(stations);
        setLines(groupedLines);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "駅情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    loadNearbyStations();
  }, [workLocation, weights]);

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
            <BreadcrumbPage>Lines</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">対象路線 (おすすめ順)</h1>
          <p className="text-sm text-muted-foreground">
            あなたの重視するポイント（重み）に基づいてスコア計算し、おすすめ順に表示します。
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : lines.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          周辺に路線が見つかりませんでした
        </div>
      ) : (
        <Card className="rounded-none shadow-sm flex flex-col max-h-[calc(100vh-16rem)]">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-base">路線候補</CardTitle>
            <CardDescription>
              勤務先:{" "}
              <span className="text-xs bg-muted px-2 py-0.5 rounded-none">
                {workLocation?.address || "(未設定)"}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <ul className="divide-y">
              {lines.map((line, i) => (
                <li key={line.id} className="py-3 flex items-center gap-4">
                  <div className="w-8 text-sm text-muted-foreground tabular-nums font-bold">
                    #{i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Train className="h-5 w-5" />
                        <span className="font-medium text-lg">
                          {line.stations[0].name}
                        </span>
                      </div>
                      <div className="flex flex-col text-sm text-muted-foreground">
                        <span>{line.line_name}</span>
                        <span className="text-xs">{line.company}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Score Badge */}
                    {line.stations[0].total_score !== undefined && (
                      <div className="flex flex-col items-end mr-2">
                        <span className="text-[10px] text-muted-foreground">
                          Score
                        </span>
                        <span className="font-bold tabular-nums text-lg text-primary-600">
                          {line.stations[0].total_score.toFixed(0)}
                        </span>
                      </div>
                    )}
                    <Badge
                      variant="outline"
                      className="tabular-nums text-base px-3 py-1 rounded-none"
                    >
                      {(line.stations[0]?.distance_km ?? 0).toFixed(1)} km
                    </Badge>
                    <Button
                      className="rounded-none bg-neutral-900 text-white hover:bg-neutral-800"
                      onClick={() => {
                        // 路線詳細ページに遷移
                        // 詳細ページに遷移（起点となる最寄り駅のIDを渡す）
                        const nearestStation = line.stations[0];
                        if (nearestStation) {
                          router.push(
                            `/lines/line/?stationId=${nearestStation.id}`
                          );
                        }
                      }}
                    >
                      この路線を見る <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

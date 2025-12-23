"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocationStore } from "@/features/map/stores/location-store";
import { ArrowLeft } from "@phosphor-icons/react";
import { fetchNearbyStations } from "@/features/lines/api";
import { usePreferenceStore } from "@/features/lines/stores/preference-store";
import { StationList } from "@/features/lines/components/station-list";
import { ConcreteFilters } from "@/components/features/lines/concrete-filters";
import Link from "next/link";

export default function Stations() {
  const router = useRouter();
  const workLocation = useLocationStore((state) => state.workLocation);
  const { subsidy, weights, filters } = usePreferenceStore();

  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNearbyStations = async () => {
      setLoading(true);
      try {
        // TEMPORARY: Use fallback location if no workLocation
        const lat = workLocation?.lat ?? 35.6812; // Tokyo Station
        const lng = workLocation?.lng ?? 139.7671;

        // 家賃補助の種類を判定
        const subsidyType =
          subsidy.conditionType === "stops" ? "from_workplace" : "none";

        const subsidyRange =
          subsidy.conditionType === "stops" ? subsidy.conditionValue || 3 : 3;

        // 検索半径
        const searchRadius =
          subsidy.conditionType === "distance"
            ? subsidy.conditionValue * 1000
            : filters.radius || 500;

        // 新しいsearch APIで一度に取得
        const fetchedStations = await fetchNearbyStations(
          lat,
          lng,
          { ...filters, radius: searchRadius },
          weights,
          subsidyType,
          subsidyRange
        );

        setStations(fetchedStations);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "駅情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    loadNearbyStations();
  }, [workLocation, weights, filters, subsidy]);

  return (
    <main className="min-h-screen bg-neutral-200 text-neutral-900 font-sans p-8 md:p-13">
      {/* Header Bar - トップページと同じスタイル */}
      <header className="max-w-7xl mx-auto mb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono uppercase tracking-widest mb-4">
          <Link
            href="/"
            className="hover:text-teal-500 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={12} weight="bold" />
            Home
          </Link>
          <span>/</span>
          <span className="text-neutral-800 font-bold">最適エリア候補</span>
        </div>

        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] text-neutral-800">
              最適エリア候補
            </h1>
            <div className="absolute -right-4 top-0 w-3 h-3 bg-teal-500 rounded-full"></div>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
              勤務地: {workLocation?.address || "東京駅（デフォルト）"}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar: Filter Panel */}
        <aside className="lg:col-span-3 sticky top-8">
          <ConcreteFilters />
        </aside>

        {/* Main Content: Station List */}
        <section className="lg:col-span-9 space-y-4">
          {loading ? (
            <div className="p-8 text-center text-neutral-500 font-bold uppercase tracking-widest">
              リストを作成中...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 font-bold">
              {error}
            </div>
          ) : (
            <StationList
              stations={stations}
              loading={loading}
              activeStationId={null}
              onStationClick={(s) =>
                router.push(`/stations/detail?stationId=${s.id}`)
              }
            />
          )}
        </section>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocationStore } from "@/features/map/stores/location-store";
import { Train, MagnifyingGlass } from "@phosphor-icons/react";
import { fetchNearbyStations } from "@/features/lines/api";
import { usePreferenceStore } from "@/features/lines/stores/preference-store";
import { StationList } from "@/features/lines/components/station-list";
import { ConcreteFilters } from "@/components/features/lines/concrete-filters";
import { CompactPageHeader } from "@/components/layout/compact-page-header";

export default function Lines() {
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
        const lat = workLocation?.lat ?? 35.6812;
        const lng = workLocation?.lng ?? 139.7671;

        let fetchedStations: any[] = [];

        if (subsidy.conditionType === "stops") {
          const nearestCandidates = await fetchNearbyStations(
            lat,
            lng,
            { ...filters, radius: 2000 },
            weights
          );

          if (nearestCandidates.length > 0) {
            const nearest = nearestCandidates.sort(
              (a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999)
            )[0];

            if (nearest && nearest.id) {
              const { fetchStationsWithinThreeStops } = await import(
                "@/features/lines/api"
              );
              fetchedStations = await fetchStationsWithinThreeStops(
                Number(nearest.id),
                weights
              );
            }
          }
        } else {
          const searchRadius = subsidy.conditionValue
            ? subsidy.conditionValue * 1000
            : filters.radius || 3000;

          fetchedStations = await fetchNearbyStations(
            lat,
            lng,
            { ...filters, radius: searchRadius },
            weights
          );
        }

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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20 p-3 md:p-4">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Compact Header */}
        <CompactPageHeader
          icon={<Train size={18} weight="bold" className="text-primary" />}
          title="路線別候補"
          subtitle={`勤務地: ${workLocation?.address || "東京駅（デフォルト）"}`}
          currentStep={3}
          showBackLink
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3 items-start">
          {/* Sidebar: Filter Panel */}
          <aside className="lg:sticky lg:top-3">
            <ConcreteFilters />
          </aside>

          {/* Main Content: Station List */}
          <section>
            {loading ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <MagnifyingGlass size={24} weight="bold" className="text-primary" />
                </div>
                <div className="text-sm font-bold text-neutral-700">リストを作成中...</div>
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm font-bold text-red-600">{error}</div>
              </div>
            ) : (
              <StationList
                stations={stations}
                loading={loading}
                activeStationId={null}
                onStationClick={(s) =>
                  router.push(`/lines/line?stationId=${s.id}`)
                }
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

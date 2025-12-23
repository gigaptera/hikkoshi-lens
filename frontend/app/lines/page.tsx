"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocationStore } from "@/features/map/stores/location-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Train, ArrowRight, Funnel } from "@phosphor-icons/react";
import { fetchNearbyStations, groupStationsByLine } from "@/features/lines/api";
import { Line } from "@/features/lines/types/station";
import { usePreferenceStore } from "@/features/lines/stores/preference-store";
import { StationList } from "@/features/lines/components/station-list"; // We will reuse or update sidebar
import { ConcreteFilters } from "@/components/features/lines/concrete-filters";
import Link from "next/link";

export default function Lines() {
  const workLocation = useLocationStore((state) => state.workLocation);
  const { subsidy, weights, filters } = usePreferenceStore();

  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TEMPORARY: Allow viewing page without location for Design Review
    /*
    if (!workLocation) {
      router.push("/");
      return;
    }
    */

    const loadNearbyStations = async () => {
      setLoading(true);
      try {
        // TEMPORARY: Use fallback location if no workLocation
        const lat = workLocation?.lat ?? 35.6812; // Tokyo Station
        const lng = workLocation?.lng ?? 139.7671;

        let fetchedStations: any[] = [];

        if (subsidy.conditionType === "stops") {
          // "Stops" mode: Find stations within 3 stops of the NEAREST station to work
          // 1. Find nearest station first (small radius search)
          const nearestCandidates = await fetchNearbyStations(
            lat,
            lng,
            { ...filters, radius: 2000 }, // Look for nearest within 2km
            weights
          );

          if (nearestCandidates.length > 0) {
            // Sort by distance just in case
            const nearest = nearestCandidates.sort(
              (a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999)
            )[0];

            // 2. Fetch 3 stops from this station
            // Note: Currently backend only supports 3 stops logic via specific endpoint
            if (nearest && nearest.id) {
              // Use the imported fetchStationsWithinThreeStops
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
          // "Distance" mode: Use subsidy distance as radius
          // If subsidy.conditionValue is set, use it (km -> meters). Otherwise fallback to filter radius.
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
    <main className="min-h-screen bg-neutral-200 text-neutral-900 font-sans p-8 md:p-13">
      {/* Header Panel */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono uppercase tracking-widest mb-2">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <span>/</span>
            <span>Selection</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-neutral-800">
            最適エリア候補
          </h1>
          <p className="text-neutral-500 mt-1">
            勤務地:{" "}
            <span className="font-medium text-neutral-800 border-b border-neutral-400">
              {workLocation?.address}
            </span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar: Filter Panel */}
        <aside className="lg:col-span-3 sticky top-8">
          <ConcreteFilters />
        </aside>

        {/* Main Content: Station List */}
        <section className="lg:col-span-9 space-y-4">
          {loading ? (
            <div className="p-8 text-center text-neutral-500">
              リストを作成中...
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
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePreferenceStore } from "@/features/lines/stores/preference-store";
import { useLocationStore } from "@/features/map/stores/location-store";
import Link from "next/link";
import { MapContainer } from "@/features/map/components/map-container";
import mapboxgl from "mapbox-gl";
import { useStationRanking } from "@/features/lines/hooks/use-station-ranking";
import { WeightControls } from "@/features/lines/components/weight-controls";
import { StationList } from "@/features/lines/components/station-list";

function LineDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stationIdStr = searchParams.get("stationId");
  const workLocation = useLocationStore((state) => state.workLocation);
  const weights = usePreferenceStore((state) => state.weights);
  const setWeights = usePreferenceStore((state) => state.setWeights);

  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

  // Custom Hook for Data Fetching
  const { stations, loading } = useStationRanking(stationIdStr, weights);

  // Redirect if no work location
  useEffect(() => {
    if (!workLocation) {
      router.push("/");
      return;
    }
  }, [workLocation, router]);

  // Map Effect: Fly to center and add markers
  useEffect(() => {
    if (!mapInstance || stations.length === 0) return;

    const centerStation =
      stations.find((s) => s.id.toString() === stationIdStr) || stations[0];

    if (centerStation) {
      mapInstance.flyTo({
        center: [centerStation.coordinates.lng, centerStation.coordinates.lat],
        zoom: 14,
        essential: true,
      });

      // Simple Marker Implementation
      stations.forEach((s) => {
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

  const handleStationClick = (station: any) => {
    if (mapInstance) {
      mapInstance.flyTo({
        center: [station.coordinates.lng, station.coordinates.lat],
        zoom: 15,
        essential: true,
      });
    }
  };

  const handleWeightChange = (key: string, value: number) => {
    const newWeights = { ...weights, [key]: value };
    setWeights(newWeights);
  };

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
          <StationList
            stations={stations}
            loading={loading}
            activeStationId={stationIdStr}
            onStationClick={handleStationClick}
          />
          <WeightControls
            weights={weights}
            onWeightChange={handleWeightChange}
          />
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

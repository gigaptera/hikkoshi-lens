"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  StationCard,
  StationCardProps,
} from "@/components/features/station/station-card";
import { SearchSidebar } from "@/components/features/search/search-sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal, Spinner } from "@phosphor-icons/react";
import { SearchPagination } from "@/components/features/search/search-pagination";
import { searchStations, getStationsByLine } from "@/lib/api-client";
import React from "react";
import { Station, StationFilter } from "@/types/station";

export default function SearchResultPage() {
  const searchParams = useSearchParams();
  const [stations, setStations] = useState<StationCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Determine filtering state from URL
  const minRent = parseFloat(searchParams.get("min_rent") || "0");
  const maxRent = parseFloat(searchParams.get("max_rent") || "0");
  const buildingType = searchParams.get("building_type") || "mansion";
  const layout = searchParams.get("layout") || "1r_1k_1dk";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const lat = parseFloat(searchParams.get("lat") || "0");
        const lon = parseFloat(searchParams.get("lon") || "0");
        const radius = parseInt(searchParams.get("radius") || "0");

        if (!lat || !lon) {
          setIsLoading(false);
          return;
        }

        // 1. Get Nearby Stations (Candidates for Workplace)
        const filter: StationFilter = {
          lat,
          lon,
          radius: radius > 0 ? radius : undefined,
          building_type: undefined,
          layout: undefined,
          min_rent: undefined,
          max_rent: undefined,
        };

        const nearbyStations = await searchStations(filter);

        if (nearbyStations.length === 0) {
          setStations([]);
          setIsLoading(false);
          return;
        }

        // 2. Extract Unique Lines
        const uniqueLines = new Map<
          string,
          { orgCode: string; lineName: string }
        >();
        const topStations = nearbyStations.slice(0, 5);
        for (const s of topStations) {
          const key = `${s.organization_code}:${s.line_name}`;
          if (!uniqueLines.has(key)) {
            uniqueLines.set(key, {
              orgCode: s.organization_code,
              lineName: s.line_name,
            });
          }
        }

        // 3. Fetch All Stations for Each Line
        const linePromises = Array.from(uniqueLines.values()).map((line) =>
          getStationsByLine(line.orgCode, line.lineName)
        );

        const lineResults = await Promise.all(linePromises);

        // 4. Merge and Deduplicate
        const allStationsMap = new Map<number, Station>();
        for (const lineStations of lineResults) {
          for (const s of lineStations) {
            if (!allStationsMap.has(s.id)) {
              allStationsMap.set(s.id, s);
            }
          }
        }
        const allStations = Array.from(allStationsMap.values());

        // 5. Client-side Filtering & Mapping
        const mappedStations: StationCardProps[] = allStations
          .map((s) =>
            mapStationToCard(s, buildingType, layout, minRent, maxRent)
          )
          .filter((s): s is StationCardProps => s !== null)
          .sort((a, b) => b.score - a.score);

        setStations(mappedStations);
      } catch (error) {
        console.error("Failed to fetch stations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams, buildingType, layout, minRent, maxRent]);

  const mapStationToCard = (
    station: Station,
    targetBuildingType: string,
    targetLayout: string,
    targetMinRent: number,
    targetMaxRent: number
  ): StationCardProps | null => {
    const marketPrice = station.market_prices?.find(
      (mp) =>
        mp.building_type === targetBuildingType && mp.layout === targetLayout
    );

    // If rent limits are set, we strictly require price data to filter
    // If no rent limits, we can show stations without price data (optional decision)
    // Here we skip if price data is missing for the selected type/layout
    if (!marketPrice) {
      // If strict filtering is desired: return null;
      // For now, let's exclude stations where we can't tell the rent
      return null;
    }

    const rent = marketPrice.rent;

    if (
      (targetMinRent > 0 && rent < targetMinRent) ||
      (targetMaxRent > 0 && rent > targetMaxRent)
    ) {
      return null;
    }

    // Calculate client-side distance and score
    let distance = 0;
    let computedScore = station.total_score || 0;

    // Parse POINT string (e.g., "POINT(135.4947 34.7036)")
    const locationMatch = station.location?.match(
      /POINT\(([\d\.]+) ([\d\.]+)\)/
    );
    if (locationMatch) {
      const stationLon = parseFloat(locationMatch[1]);
      const stationLat = parseFloat(locationMatch[2]);

      const searchLat = parseFloat(searchParams.get("lat") || "0");
      const searchLon = parseFloat(searchParams.get("lon") || "0");

      if (searchLat && searchLon) {
        // Haversine formula for distance in meters
        const R = 6371e3; // metres
        const φ1 = (searchLat * Math.PI) / 180;
        const φ2 = (stationLat * Math.PI) / 180;
        const Δφ = ((stationLat - searchLat) * Math.PI) / 180;
        const Δλ = ((stationLon - searchLon) * Math.PI) / 180;

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        distance = R * c; // Distance in meters

        // Simple Score fallback: 100 - (distance in km * 2)
        // e.g. 5km away -> 100 - 10 = 90
        // e.g. 20km away -> 100 - 40 = 60
        if (computedScore === 0) {
          computedScore = Math.max(
            60,
            Math.min(99, 100 - Math.round(distance / 500))
          );
        }
      }
    }

    return {
      name: station.name,
      lines: [station.line_name.replace("ライン", "")],
      score: Math.round(computedScore),
      commuteTime: distance > 0 ? `${Math.round(distance / 80)}分` : "不明",
      rent: rent ? `${rent.toFixed(1)}万円` : "-",
      safety:
        station.score_details?.safety && station.score_details.safety >= 4
          ? "S"
          : "A",
      stopNumber: 0,
    };
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 24;

  // Calculate pagination
  const totalItems = stations.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const displayedStations = stations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Page Header */}
      <PageHeader
        title="検索結果"
        resultCount={totalItems}
        breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "検索結果" }]}
        actions={
          <div className="flex items-center gap-2">
            {/* Mobile: Filter Sheet Trigger */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden flex gap-2 rounded-none"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  絞り込み
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] sm:w-[400px] p-0">
                <SheetHeader className="p-6 pb-4 border-b border-border/40">
                  <SheetTitle className="text-lg font-medium">
                    絞り込み条件
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">
                    希望条件を設定して検索結果を絞り込み
                  </SheetDescription>
                </SheetHeader>
                <div className="p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                  <SearchSidebar />
                </div>
              </SheetContent>
            </Sheet>

            {/* Add Sort dropdown here later */}
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-12 h-full">
          {/* Sidebar - Visible on Desktop */}
          <aside className="hidden lg:block w-[280px] shrink-0 border-r border-border/40 pr-8 min-h-[calc(100vh-140px)]">
            <div className="sticky top-32">
              <SearchSidebar />
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1 flex flex-col min-h-[800px]">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Spinner className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                  {displayedStations.map((station, index) => (
                    <StationCard
                      key={`${station.name}-${index}`}
                      {...station}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <SearchPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

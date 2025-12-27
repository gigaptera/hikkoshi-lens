import { useState, useEffect } from "react";
import { Station } from "@/features/lines/types/station";
import { fetchStationsWithinThreeStops } from "@/features/lines/api";

export function useStationRanking(
  stationIdStr: string | null,
  weights: Record<string, number>
) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!stationIdStr) return;
    const stationId = parseInt(stationIdStr, 10);
    if (isNaN(stationId)) return;

    // Debounce processing
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);

      fetchStationsWithinThreeStops(stationId, weights)
        .then((data) => {
          // Backend already sorts by Total Score Descending
          setStations(data);
        })
        .catch((err) => {
          console.error("Error fetching stations:", err);
          setStations([]);
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500);

    return () => clearTimeout(timer);
  }, [stationIdStr, weights]);

  return { stations, loading, error };
}

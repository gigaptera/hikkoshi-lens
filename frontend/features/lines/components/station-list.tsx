import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Station } from "@/features/lines/types/station";
import { cn } from "@/lib/utils";

interface StationListProps {
  stations: Station[];
  loading: boolean;
  activeStationId: string | null;
  onStationClick: (station: Station) => void;
}

export function StationList({
  stations,
  loading,
  activeStationId,
  onStationClick,
}: StationListProps) {
  return (
    <Card className="rounded-none shadow-sm flex flex-col flex-1 overflow-hidden">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-base">駅ランキング</CardTitle>
        <CardDescription>
          <span className="flex gap-2 text-xs">
            <span>起点ID: {activeStationId}</span>
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
                  station.id.toString() === activeStationId
                    ? "bg-primary-50 hover:bg-primary-100"
                    : ""
                )}
                onClick={() => onStationClick(station)}
              >
                <div className="w-8 text-sm text-muted-foreground tabular-nums font-bold">
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-medium",
                        station.id.toString() === activeStationId
                          ? "text-primary-700 font-bold"
                          : ""
                      )}
                    >
                      {station.name}
                    </span>
                    {station.id.toString() === activeStationId && (
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
  );
}

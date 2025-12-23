import { Badge } from "@/components/ui/badge";
import { Station } from "@/features/lines/types/station";
import { cn } from "@/lib/utils";
import { usePreferenceStore } from "@/features/lines/stores/preference-store";
import { Button } from "@/components/ui/button";
import { Plus, Check, ArrowRight, Train } from "@phosphor-icons/react";

interface StationListProps {
  stations: Station[];
  loading: boolean;
  activeStationId: string | null;
  onStationClick: (station: Station) => void;
  selectedIds?: number[];
  onToggleSelection?: (station: Station) => void;
}

export function StationList({
  stations,
  loading,
  activeStationId,
  onStationClick,
  selectedIds = [],
  onToggleSelection,
}: StationListProps) {
  const { subsidy } = usePreferenceStore();

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-neutral-100/50 animate-pulse border border-neutral-200 rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400 font-bold text-sm bg-neutral-100/50 border border-neutral-200 rounded-lg">
        検索条件に一致する駅が見つかりませんでした
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-neutral-300 pb-1.5 mb-2">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          推奨駅ランキング
        </h2>
        <span className="text-[10px] font-mono text-neutral-400">
          {stations.length} 件
        </span>
      </div>

      {/* Compact List */}
      <ul className="space-y-1.5">
        {stations.map((station, i) => {
          const isSelected = selectedIds.includes(station.id);
          const isActive = station.id.toString() === activeStationId;

          return (
            <li
              key={station.id}
              onClick={() => onStationClick(station)}
              className={cn(
                "group cursor-pointer border-2 rounded-lg transition-all hover:border-primary hover:shadow-sm bg-white p-2.5",
                isActive ? "border-primary shadow-sm" : "border-border"
              )}
            >
              <div className="flex items-center gap-3">
                {/* Rank - コンパクト */}
                <div className="flex items-center justify-center w-8 h-8 border-r border-neutral-200 pr-2">
                  <span className="text-xl font-black text-neutral-800 leading-none tabular-nums">
                    {i + 1}
                  </span>
                </div>

                {/* Station Info - 横並び */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-neutral-900 leading-tight group-hover:text-primary transition-colors">
                      {station.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="text-[9px] h-4 px-1.5"
                    >
                      {station.line_name}
                    </Badge>

                    {/* 家賃補助バッジ */}
                    {station.is_nearby && (
                      <Badge variant="info" className="text-[9px] h-4 px-1.5">
                        最寄り
                      </Badge>
                    )}

                    {station.source_station &&
                      station.stops_from_source !== undefined && (
                        <Badge variant="info" className="text-[9px] h-4 px-1.5">
                          {station.source_station}から{station.stops_from_source}駅
                        </Badge>
                      )}
                  </div>

                  {/* Rent - 横並び */}
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-neutral-500 font-medium">{station.company}</span>
                    <span className="text-neutral-300">|</span>

                    {station.rent_avg &&
                    subsidy.amount > 0 &&
                    (!station.distance_km ||
                      station.distance_km <= subsidy.conditionValue) ? (
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400 line-through text-[10px]">
                          ¥{station.rent_avg.toLocaleString()}
                        </span>
                        <span className="text-primary font-black text-sm tabular-nums">
                          ¥
                          {Math.max(
                            0,
                            station.rent_avg - subsidy.amount
                          ).toLocaleString()}
                        </span>
                        <Badge variant="success" className="text-[8px] h-4 px-1.5">
                          補助適用
                        </Badge>
                      </div>
                    ) : (
                      <span className="font-bold tabular-nums text-neutral-700">
                        ¥{(station.rent_avg || 0).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Score & Action - 右寄せ */}
                <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                  <div className="text-right">
                    <div className="text-[9px] font-bold uppercase text-neutral-400 tracking-wider">
                      スコア
                    </div>
                    <div className="text-2xl font-black text-primary tabular-nums leading-none">
                      {station.total_score
                        ? station.total_score.toFixed(0)
                        : "0"}
                    </div>
                  </div>

                  {onToggleSelection && (
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelection(station);
                      }}
                    >
                      {isSelected ? (
                        <Check weight="bold" className="h-3 w-3" />
                      ) : (
                        <Plus weight="bold" className="h-3 w-3" />
                      )}
                    </Button>
                  )}

                  <div className="text-neutral-300 group-hover:text-primary transition-colors">
                    <ArrowRight weight="bold" size={16} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

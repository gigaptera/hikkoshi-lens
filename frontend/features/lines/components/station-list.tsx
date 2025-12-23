import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Station } from "@/features/lines/types/station";
import { cn } from "@/lib/utils";
import { usePreferenceStore } from "@/features/lines/stores/preference-store";

import { Button } from "@/components/ui/button";
import { Plus, Check, ArrowRight } from "@phosphor-icons/react";

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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-neutral-100/50 animate-pulse border border-neutral-200"
          ></div>
        ))}
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-400 font-bold uppercase tracking-widest bg-neutral-100/50 border border-neutral-200">
        検索条件に一致する駅が見つかりませんでした
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-neutral-300 pb-2 mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
          推奨駅ランキング
        </h2>
        <span className="text-xs font-mono text-neutral-400">
          {stations.length} 件
        </span>
      </div>

      <ul className="space-y-4">
        {stations.map((station, i) => {
          const isSelected = selectedIds.includes(station.id);
          const isActive = station.id.toString() === activeStationId;

          return (
            <Panel
              key={station.id}
              variant={isActive ? "steel" : "solid"}
              className={cn(
                "group cursor-pointer hover:border-teal-500 transition-colors duration-300",
                isActive ? "border-teal-500 shadow-md" : ""
              )}
              onClick={() => onStationClick(station)}
            >
              <div className="flex items-center gap-6">
                {/* Rank Number */}
                <div className="flex flex-col items-center justify-center w-16 border-r border-neutral-300 pr-5">
                  <span className="text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">
                    順位
                  </span>
                  <span className="text-4xl font-black text-neutral-800 leading-none tabular-nums">
                    {i + 1}
                  </span>
                </div>

                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-2xl font-black text-neutral-900 tracking-tight group-hover:text-teal-600 transition-colors">
                      {station.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase tracking-wider rounded-none border-neutral-300 text-neutral-600 font-bold px-2 py-0.5"
                    >
                      {station.line_name}
                    </Badge>

                    {/* 家賃補助関連バッジ */}
                    {station.is_nearby && (
                      <Badge
                        variant="outline"
                        className="text-[9px] uppercase tracking-wider rounded-none border-teal-400 bg-teal-50 text-teal-700 font-bold px-2 py-0.5"
                      >
                        最寄り
                      </Badge>
                    )}

                    {station.source_station &&
                      station.stops_from_source !== undefined && (
                        <Badge
                          variant="outline"
                          className="text-[9px] uppercase tracking-wider rounded-none border-blue-400 bg-blue-50 text-blue-700 font-bold px-2 py-0.5"
                        >
                          {station.source_station}から
                          {station.stops_from_source}駅
                        </Badge>
                      )}
                  </div>
                  <div className="flex gap-4 text-xs font-mono text-neutral-500 items-baseline">
                    <span className="font-bold">{station.company}</span>
                    <span className="text-neutral-300">|</span>

                    {/* Rent Display */}
                    {station.rent_avg &&
                    subsidy.amount > 0 &&
                    (!station.distance_km ||
                      station.distance_km <= subsidy.conditionValue) ? (
                      <div className="flex gap-2 items-baseline">
                        <span className="text-neutral-400 line-through text-xs">
                          ¥{station.rent_avg.toLocaleString()}
                        </span>
                        <span className="text-teal-600 font-black text-base tabular-nums">
                          ¥
                          {Math.max(
                            0,
                            station.rent_avg - subsidy.amount
                          ).toLocaleString()}
                        </span>
                        <span className="text-[8px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-none uppercase font-bold border border-teal-200">
                          補助適用
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold tabular-nums">
                        ¥{(station.rent_avg || 0).toLocaleString()} (相場)
                      </span>
                    )}
                  </div>
                </div>

                {/* Score & Actions */}
                <div className="flex items-center gap-6 pl-6 border-l border-neutral-300">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">
                      総合スコア
                    </span>
                    <span className="text-3xl font-mono font-black text-teal-600 tabular-nums">
                      {station.total_score
                        ? station.total_score.toFixed(0)
                        : "0"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {onToggleSelection && (
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="icon"
                        className="h-10 w-10 rounded-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelection(station);
                        }}
                      >
                        {isSelected ? (
                          <Check weight="light" className="h-4 w-4" />
                        ) : (
                          <Plus weight="light" className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <div className="p-2 text-neutral-300 group-hover:text-teal-500 transition-colors group-hover:translate-x-1 duration-300">
                      <ArrowRight weight="light" size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          );
        })}
      </ul>
    </div>
  );
}

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Station } from "@/features/lines/types/station";
import { Badge } from "@/components/ui/badge";
import { StationRadarChart } from "./radar-chart";
import { Button } from "@/components/ui/button";
import { X } from "@phosphor-icons/react";

interface StationComparisonProps {
  stations: Station[];
  onRemove: (stationId: number) => void;
}

const SCORE_KEYS = [
  "access",
  "rent",
  "facility",
  "safety",
  "disaster",
] as const;
const KEY_LABELS = {
  access: "アクセス",
  rent: "価格", // "Price Score"
  facility: "利便性",
  safety: "治安",
  disaster: "防災",
};

export function StationComparison({
  stations,
  onRemove,
}: StationComparisonProps) {
  if (stations.length === 0) return null;

  return (
    <div className="border rounded-md overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">項目</TableHead>
              {stations.map((s) => (
                <TableHead key={s.id} className="min-w-[200px] text-center">
                  <div className="flex flex-col items-center gap-2 py-2 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-1 -right-1 h-6 w-6 text-muted-foreground hover:text-red-500"
                      onClick={() => onRemove(s.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="font-bold text-lg">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.line_name} / {s.company}
                    </div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Total Score Row */}
            <TableRow>
              <TableCell className="font-bold bg-muted/50">
                総合スコア
              </TableCell>
              {stations.map((s) => (
                <TableCell key={s.id} className="text-center">
                  <span className="text-2xl font-black text-primary-600">
                    {s.total_score?.toFixed(0) ?? "-"}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    / 100
                  </span>
                </TableCell>
              ))}
            </TableRow>

            {/* Distance Row */}
            <TableRow>
              <TableCell className="font-medium">勤務地からの距離</TableCell>
              {stations.map((s) => (
                <TableCell key={s.id} className="text-center tabular-nums">
                  {(s.distance_km ?? 0).toFixed(1)} km
                </TableCell>
              ))}
            </TableRow>

            {/* Radar Chart Visual Row */}
            <TableRow>
              <TableCell className="align-top pt-4">バランス</TableCell>
              {stations.map((s) => (
                <TableCell key={s.id} className="p-0">
                  <div className="flex justify-center -my-4">
                    {s.score_details && (
                      <div className="scale-75 origin-center w-[200px]">
                        <StationRadarChart scoreDetails={s.score_details} />
                      </div>
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>

            {/* Detailed Scores Headers */}
            <TableRow>
              <TableCell
                colSpan={stations.length + 1}
                className="bg-muted/20 font-semibold text-xs py-1"
              >
                スコア内訳 (0-100)
              </TableCell>
            </TableRow>

            {SCORE_KEYS.map((key) => (
              <TableRow key={key}>
                <TableCell>{KEY_LABELS[key]}</TableCell>
                {stations.map((s) => (
                  <TableCell key={s.id} className="text-center tabular-nums">
                    {s.score_details?.[key] ? (
                      <Badge
                        variant={
                          s.score_details[key] >= 80 ? "default" : "secondary"
                        }
                      >
                        {s.score_details[key].toFixed(0)}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {/* Raw Data Row (Example) */}
            <TableRow>
              <TableCell
                colSpan={stations.length + 1}
                className="bg-muted/20 font-semibold text-xs py-1"
              >
                参考データ
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>家賃相場 (目安)</TableCell>
              {stations.map((s) => {
                return (
                  <TableCell
                    key={s.id}
                    className="text-center text-xs tabular-nums"
                  >
                    {s.rent_avg
                      ? `¥${Math.round(s.rent_avg).toLocaleString()}`
                      : "(データなし)"}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

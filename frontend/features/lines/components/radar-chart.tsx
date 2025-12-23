"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  PolarRadiusAxis,
} from "recharts";
import { useMemo } from "react";

interface RadarChartProps {
  scoreDetails: Record<string, number>;
}

const SCORE_LABELS: Record<string, string> = {
  access: "アクセス",
  rent: "価格", // Changed from cost/rent to align with user request "Price Score"
  facility: "利便性",
  safety: "治安",
  disaster: "防災",
};

export function StationRadarChart({ scoreDetails }: RadarChartProps) {
  const data = useMemo(() => {
    return Object.keys(SCORE_LABELS).map((key) => ({
      subject: SCORE_LABELS[key],
      value: scoreDetails[key] || 0,
      fullMark: 100,
    }));
  }, [scoreDetails]);

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e5e5e5" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#666", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Station Score"
            dataKey="value"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}

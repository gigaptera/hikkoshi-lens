"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface ScoreRadarChartProps {
  scores: {
    rent: number;
    safety: number;
    facility: number;
    access: number;
    disaster: number;
  };
}

export function ScoreRadarChart({ scores }: ScoreRadarChartProps) {
  const data = [
    { subject: "家賃", A: scores.rent, fullMark: 100 },
    { subject: "治安", A: scores.safety, fullMark: 100 },
    { subject: "利便性", A: scores.facility, fullMark: 100 },
    { subject: "アクセス", A: scores.access, fullMark: 100 },
    { subject: "防災", A: scores.disaster, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid
            stroke="hsl(var(--muted-foreground))"
            strokeOpacity={0.2}
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fill: "hsl(var(--foreground))",
              fontSize: 12,
              fontWeight: 500,
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="A"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

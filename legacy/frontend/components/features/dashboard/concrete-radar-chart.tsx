"use client";

import React from "react";

export const ConcreteRadarChart = ({
  weights,
}: {
  weights?: { [key: string]: number };
}) => {
  const size = 200;
  const center = size / 2;
  const radius = 80;

  // Default if no weights
  const defaultWeights = {
    rent: 30,
    safety: 10,
    access: 30,
    facility: 20,
    disaster: 10,
  };
  const w = weights || defaultWeights;

  // Normalize to 0.2 - 1.0 range for visual (100% -> 1.0, 0% -> 0.2)
  // Or just simple ratio: value / 100 * radius.
  // Let's do: (value / 50) because max usually around 30-50 in balanced view?
  // No, let's just map 0-100 to 0.1-1.0 scale relative to radius.
  const getScale = (val: number) => Math.max(0.1, Math.min(1.0, val / 40));
  // 40% -> full radius (to make it look filled usually)

  // Order: Top, TR, BR, BL, TL
  // Keys: Rent, Safety, Access, Facility, Disaster
  const data = [
    { key: "rent", val: w["rent"] || 0 },
    { key: "safety", val: w["safety"] || 0 },
    { key: "access", val: w["access"] || 0 },
    { key: "facility", val: w["facility"] || 0 },
    { key: "disaster", val: w["disaster"] || 0 },
  ];

  // Base Vectors (Unit Circle)
  // -90 deg (Top), -18, 54, 126, 198 (360/5 = 72 deg steps)
  // 0: -90
  // 1: -18
  // 2: 54
  // 3: 126
  // 4: 198
  const angles = [-90, -18, 54, 126, 198].map((a) => (a * Math.PI) / 180);

  const points = data.map((d, i) => {
    const r = radius * getScale(d.val);
    const x = Math.cos(angles[i]) * r;
    const y = Math.sin(angles[i]) * r;
    return [x, y];
  });

  const polyPoints = points
    .map((p) => `${center + p[0]},${center + p[1]}`)
    .join(" ");

  // Background webs (Pentagons)
  const webs = [0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => {
    const webPoints = angles
      .map((a) => {
        const r = radius * scale;
        return `${center + Math.cos(a) * r},${center + Math.sin(a) * r}`;
      })
      .join(" ");
    return (
      <polygon
        key={i}
        points={webPoints}
        fill="none"
        stroke="#E5E5E5"
        strokeWidth="1"
      />
    );
  });

  // Axis lines
  const axes = angles.map((a, i) => {
    const x = center + Math.cos(a) * radius;
    const y = center + Math.sin(a) * radius;
    return (
      <line
        key={i}
        x1={center}
        y1={center}
        x2={x}
        y2={y}
        stroke="#E5E5E5"
        strokeWidth="1"
      />
    );
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {webs}
          {axes}
          {/* Data Shape */}
          <polygon
            points={polyPoints}
            fill="rgba(255, 95, 0, 0.15)"
            stroke="#FF5F00"
            strokeWidth="2"
            strokeLinejoin="round"
            className="transition-all duration-300 ease-out"
          />
          {/* Data Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={center + p[0]}
              cy={center + p[1]}
              r="3"
              fill="white"
              stroke="#FF5F00"
              strokeWidth="2"
              className="transition-all duration-300 ease-out"
            />
          ))}
        </svg>
        {/* Labels */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 text-[10px] font-mono text-neutral-500 bg-white/80 px-1">
          RENT
        </div>
        <div className="absolute top-[35%] right-0 translate-x-3 text-[10px] font-mono text-neutral-500 bg-white/80 px-1">
          SAFETY
        </div>
        <div className="absolute bottom-[10%] right-0 text-[10px] font-mono text-neutral-500 bg-white/80 px-1">
          ACCESS
        </div>
        <div className="absolute bottom-[10%] left-0 text-[10px] font-mono text-neutral-500 bg-white/80 px-1">
          FACILITY
        </div>
        <div className="absolute top-[35%] left-0 -translate-x-3 text-[10px] font-mono text-neutral-500 bg-white/80 px-1">
          DISASTER
        </div>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <span className="text-4xl font-bold tracking-tighter text-neutral-800">
          88
        </span>
        <div className="flex flex-col leading-none">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
            Score
          </span>
          <span className="text-xs font-mono text-[#FF5F00]">EXCELLENT</span>
        </div>
      </div>
    </div>
  );
};

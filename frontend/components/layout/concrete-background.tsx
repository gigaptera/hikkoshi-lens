"use client";

import React from "react";
import { NoiseFilter } from "@/components/visual/noise-filter";

interface ConcreteBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const ConcreteBackground = ({
  children,
  className = "",
}: ConcreteBackgroundProps) => {
  return (
    <div
      className={`
        min-h-screen relative overflow-x-hidden
        bg-background text-foreground font-sans
        selection:bg-primary selection:text-primary-foreground
        ${className}
      `}
    >
      <NoiseFilter />

      {/* 1. Concrete Base Texture & Noise */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-15 mix-blend-multiply dark:opacity-10"
        style={{ filter: "url(#noiseFilter)" }}
      ></div>

      {/* 2. Formwork Lines (The Grid) */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
               linear-gradient(to right, rgba(0,0,0,0.045) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(0,0,0,0.045) 1px, transparent 1px)
             `,
          backgroundSize: "300px 600px", // Approx ration of 900x1800mm (Standard Tatami/Plywood size ratio)
        }}
      ></div>

      {/* 3. Separator Holes (P-Cones) - Center of the "panels" or corners */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, #B0B0B0 4px, transparent 5px), radial-gradient(circle at center, rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: "300px 600px",
          backgroundPosition: "150px 300px", // Offset to center in grid cells
        }}
      ></div>

      {/* 4. Lighting/Vignette */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-black/10 dark:from-white/5 dark:to-black/30"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

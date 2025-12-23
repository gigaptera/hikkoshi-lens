"use client";

import React from "react";

export const NoiseFilter = () => (
  <svg className="invisible absolute w-0 h-0">
    <filter id="noiseFilter">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.8"
        numOctaves="3"
        stitchTiles="stitch"
      />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.4" />
      </feComponentTransfer>
    </filter>
  </svg>
);

"use client";

import React from "react";
import { MapPin } from "@phosphor-icons/react";

export const MapPlaceholder = () => (
  <div className="w-full h-full relative bg-neutral-100 overflow-hidden grayscale contrast-[0.9] opacity-80">
    {/* Abstract Map Roads */}
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
      <path
        d="M-10 100 Q 150 120 300 80 T 600 150"
        fill="none"
        stroke="white"
        strokeWidth="12"
      />
      <path
        d="M-10 100 Q 150 120 300 80 T 600 150"
        fill="none"
        stroke="#D4D4D4"
        strokeWidth="8"
      />

      <path
        d="M200 -10 L 250 400"
        fill="none"
        stroke="white"
        strokeWidth="10"
      />
      <path
        d="M200 -10 L 250 400"
        fill="none"
        stroke="#D4D4D4"
        strokeWidth="6"
      />

      <path d="M400 400 L 350 -10" fill="none" stroke="white" strokeWidth="8" />
      <path
        d="M400 400 L 350 -10"
        fill="none"
        stroke="#D4D4D4"
        strokeWidth="4"
      />
    </svg>

    {/* UI Floating on Map */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="w-16 h-16 rounded-full bg-[#FF5F00]/20 flex items-center justify-center animate-pulse">
        <div className="w-4 h-4 bg-[#FF5F00] rounded-full shadow-lg border-2 border-white"></div>
      </div>
    </div>

    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 border border-neutral-200 shadow-sm">
      <div className="flex items-center space-x-2">
        <MapPin size={14} className="text-[#FF5F00]" />
        <span className="text-xs font-bold tracking-wide">
          SETAGAYA-KU, TOKYO
        </span>
      </div>
    </div>
  </div>
);

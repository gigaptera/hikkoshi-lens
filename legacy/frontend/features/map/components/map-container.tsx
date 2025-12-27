"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createMapWithLanguage } from "@/features/map/init";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface MapContainerProps {
  className?: string;
  onMapLoad?: (map: mapboxgl.Map) => void;
}

export function MapContainer({ className, onMapLoad }: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const initializeMap = async () => {
      try {
        const initializedMap = await createMapWithLanguage(
          mapContainer.current!,
          "mapbox://styles/mapbox/light-v11"
        );
        map.current = initializedMap;

        initializedMap.on("load", () => {
          setIsMapLoaded(true);
          if (onMapLoad) {
            onMapLoad(initializedMap);
          }
        });
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className={cn("relative w-full h-full min-h-[400px]", className)}>
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-sm">
          <span className="text-sm text-muted-foreground">Loading Map...</span>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { House, Warning, Shield } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface StationMapProps {
  lat: number;
  lon: number;
}

export default function StationMap({ lat, lon }: StationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [layers, setLayers] = useState({
    facilities: true,
    hazard: false,
    safety: false,
  });

  const updateLayerVisibility = () => {
    if (!map.current) return;
    // Layer toggling logic placeholder.
  };

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;
    if (!TOKEN) {
      console.error("Mapbox token is missing");
      return;
    }

    mapboxgl.accessToken = TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [lon, lat],
      zoom: 14.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");
    map.current.addControl(new mapboxgl.ScaleControl());

    new mapboxgl.Marker({ color: "#1A1A1A" })
      .setLngLat([lon, lat])
      .addTo(map.current);

    map.current.on("load", () => {
      if (!map.current) return;

      map.current.addSource("hazard", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [lon - 0.005, lat - 0.005],
                    [lon + 0.005, lat - 0.005],
                    [lon + 0.005, lat - 0.008],
                    [lon - 0.005, lat - 0.008],
                    [lon - 0.005, lat - 0.005],
                  ],
                ],
              },
              properties: { type: "flood", risk: "high" },
            },
          ],
        },
      });

      map.current.addSource("safety", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [lon + 0.002, lat + 0.002],
              },
              properties: { intensity: 0.8 },
            },
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [lon - 0.003, lat - 0.001],
              },
              properties: { intensity: 0.5 },
            },
          ],
        },
      });

      updateLayerVisibility();
    });
  }, [lat, lon]);

  useEffect(() => {
    updateLayerVisibility();
  }, [layers]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Layer Controls - Sharp "Museum" style */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur border border-border p-3 shadow-lg space-y-2 z-10">
        <h4 className="text-[10px] font-mono uppercase tracking-widest mb-2 text-muted-foreground">
          Map Layers
        </h4>
        <Button
          variant={layers.facilities ? "default" : "outline"}
          size="sm"
          className="w-full justify-start text-xs rounded-none"
          onClick={() =>
            setLayers((p) => ({ ...p, facilities: !p.facilities }))
          }
        >
          <House weight="light" className="w-3.5 h-3.5 mr-2" /> Life & Culture
        </Button>
        <Button
          variant={layers.hazard ? "destructive" : "outline"}
          size="sm"
          className="w-full justify-start text-xs rounded-none"
          onClick={() => setLayers((p) => ({ ...p, hazard: !p.hazard }))}
        >
          <Warning weight="light" className="w-3.5 h-3.5 mr-2" /> Hazard Risks
        </Button>
        <Button
          variant={layers.safety ? "secondary" : "outline"}
          size="sm"
          className="w-full justify-start text-xs rounded-none"
          onClick={() => setLayers((p) => ({ ...p, safety: !p.safety }))}
        >
          <Shield weight="light" className="w-3.5 h-3.5 mr-2" /> Crime Heatmap
        </Button>
      </div>
    </div>
  );
}

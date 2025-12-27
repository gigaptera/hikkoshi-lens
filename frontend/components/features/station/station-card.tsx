"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Buildings, ShieldCheck, MapPin } from "@phosphor-icons/react";

export interface StationCardProps {
  name: string;
  lines: string[];
  score: number;
  commuteTime: string;
  rent: string;
  safety: string;
  stopNumber?: number;
}

export function StationCard({
  name,
  lines,
  score,
  commuteTime,
  rent,
  safety,
  stopNumber,
}: StationCardProps) {
  return (
    <Card className="w-full group cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-1 rounded-none border-border">
      {/* Image Placeholder area */}
      <div className="relative h-40 lg:h-48 bg-muted w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        {/* Mock Image Gradient - dynamic based on score or just random for now */}
        <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-400 group-hover:scale-105 transition-transform duration-700" />

        {/* Score Overlay */}
        <div className="absolute bottom-3 right-4 z-20 text-white text-right">
          <span className="block text-[10px] lg:text-xs font-mono opacity-80 uppercase tracking-widest">
            マッチ度
          </span>
          <span className="font-display text-5xl lg:text-6xl leading-none tracking-tighter">
            {score}
          </span>
        </div>

        {/* Line Badge */}
        <div className="absolute top-3 left-3 lg:top-4 lg:left-4 z-20 flex flex-col gap-1 items-start">
          {lines.map((line) => (
            <Badge
              key={line}
              className="bg-white/90 text-black hover:bg-white rounded-none border-0 font-mono text-[10px] lg:text-xs px-2 py-0.5"
            >
              {line}
            </Badge>
          ))}
        </div>
      </div>

      <CardHeader className="pt-4 lg:pt-5 pb-2 px-4 lg:px-5">
        <div className="flex justify-between items-baseline mb-1">
          <CardTitle className="text-xl lg:text-2xl font-display">
            {name}
          </CardTitle>
          {stopNumber && (
            <span className="font-mono text-xs lg:text-sm text-muted-foreground">
              {stopNumber}駅
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-xs lg:text-sm font-sans">
          <MapPin className="h-3 w-3" />
          <span>{commuteTime}</span>
        </div>
      </CardHeader>

      <CardContent className="px-4 lg:px-5 pb-4 lg:pb-5">
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="space-y-0.5 lg:space-y-1">
            <div className="flex items-center gap-2 text-[10px] lg:text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <Buildings className="h-3 w-3" /> 家賃相場
            </div>
            <p className="font-mono text-base lg:text-lg">{rent}</p>
          </div>
          <div className="space-y-0.5 lg:space-y-1">
            <div className="flex items-center gap-2 text-[10px] lg:text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <ShieldCheck className="h-3 w-3" /> 治安
            </div>
            <p className="font-mono text-base lg:text-lg">{safety}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

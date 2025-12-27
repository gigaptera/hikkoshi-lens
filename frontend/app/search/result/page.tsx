"use client";

import {
  StationCard,
  StationCardProps,
} from "@/components/features/station/station-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SlidersHorizontal } from "@phosphor-icons/react";
import Link from "next/link";

const MOCK_STATIONS: StationCardProps[] = [
  {
    name: "恵比寿",
    lines: ["JR 山手線", "日比谷線"],
    score: 92,
    commuteTime: "勤務地まで 2分",
    rent: "12.5万円",
    safety: "A+",
    stopNumber: 1,
  },
  {
    name: "中目黒",
    lines: ["東横線", "日比谷線"],
    score: 89,
    commuteTime: "勤務地まで 3分",
    rent: "11.8万円",
    safety: "A",
  },
  {
    name: "代官山",
    lines: ["東横線"],
    score: 88,
    commuteTime: "勤務地まで 2分",
    rent: "14.2万円",
    safety: "S",
  },
  {
    name: "武蔵小杉",
    lines: ["JR 横須賀線", "東横線"],
    score: 85,
    commuteTime: "勤務地まで 13分",
    rent: "9.5万円",
    safety: "B+",
  },
  {
    name: "自由が丘",
    lines: ["東横線", "大井町線"],
    score: 84,
    commuteTime: "勤務地まで 10分",
    rent: "10.2万円",
    safety: "A",
  },
  {
    name: "二子玉川",
    lines: ["田園都市線"],
    score: 82,
    commuteTime: "勤務地まで 15分",
    rent: "9.8万円",
    safety: "A+",
  },
];

export default function SearchResultPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Search Header */}
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" passHref>
              <Button variant="ghost" size="icon" className="rounded-none">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex flex-col">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                検索結果
              </span>
              <h1 className="text-sm font-display font-medium">
                条件: 渋谷 / 予算: 15万円
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-sm mr-4">
              {MOCK_STATIONS.length} 件
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none gap-2 hidden md:flex"
            >
              <SlidersHorizontal className="h-4 w-4" />
              絞り込み
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_STATIONS.map((station) => (
            <StationCard key={station.name} {...station} />
          ))}
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ScoreRadarChart } from "@/components/features/station/score-radar-chart";
import { MarketPriceChart } from "@/components/features/station/market-price-chart";
import StationMap from "@/components/features/station/station-map";
import { Heart, Warning, ArrowRight } from "@phosphor-icons/react";

interface StationDetail {
  id: number;
  name: string;
  location: { lat: number; lon: number };
  lines: string[];
  tags: string[];
  ai_insight: {
    summary: { pros: string[]; cons: string[] };
    resident_voices: { positive: string[]; negative: string[] };
    trend: string;
    last_updated: string;
  };
  score: {
    total: number;
    radar: {
      rent: number;
      safety: number;
      facility: number;
      access: number;
      disaster: number;
    };
  };
  market_price: {
    prices: Record<string, number>;
    neighbor_comparison: {
      next_station_diff: number;
      prev_station_diff: number;
    };
  };
  affiliate_links: { suumo: string; homes: string };
}

export default function StationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [detail, setDetail] = useState<StationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/stations/${id}/details`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        setDetail(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        Loading...
      </div>
    );
  }
  if (!detail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        Not found
      </div>
    );
  }

  return (
    <main className="relative h-[calc(100vh-4rem)] w-full flex overflow-hidden">
      {/* LEFT SIDEBAR - Fixed Width, Scrollable */}
      <aside className="w-[360px] shrink-0 h-full bg-background border-r border-border flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Hero */}
          <section className="p-5 border-b border-border">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {detail.lines.map((l) => (
                <span
                  key={l}
                  className="px-2 py-0.5 text-[10px] font-bold uppercase bg-foreground text-background"
                >
                  {l}
                </span>
              ))}
              {detail.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 text-[10px] border border-border text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
            <h1 className="text-2xl font-display font-black tracking-tight mb-1">
              {detail.name}
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {detail.ai_insight.trend}
            </p>
          </section>

          {/* Total Score */}
          <section className="p-5 border-b border-border">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              Total Score
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-display font-black">
                {detail.score.total}
              </span>
              <span className="text-sm font-mono text-muted-foreground">
                / 100
              </span>
            </div>
            <div className="h-1 bg-muted mt-3">
              <div
                className="h-full bg-foreground transition-all"
                style={{ width: `${detail.score.total}%` }}
              />
            </div>
          </section>

          <section className="p-5 border-b border-border">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Metric Balance
            </div>
            <div className="w-full h-[240px]">
              <ScoreRadarChart scores={detail.score.radar} />
            </div>
          </section>

          {/* Market Price */}
          <section className="p-5 border-b border-border">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Market Price
            </div>
            <div className="w-full h-[180px]">
              <MarketPriceChart prices={detail.market_price.prices} />
            </div>
            <div className="mt-3 flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>
                vs Next:{" "}
                <span
                  className={
                    detail.market_price.neighbor_comparison.next_station_diff >
                    0
                      ? "text-red-500"
                      : "text-green-600"
                  }
                >
                  {detail.market_price.neighbor_comparison.next_station_diff > 0
                    ? "+"
                    : ""}
                  {detail.market_price.neighbor_comparison.next_station_diff.toLocaleString()}
                </span>
              </span>
              <span>
                vs Prev:{" "}
                <span
                  className={
                    detail.market_price.neighbor_comparison.prev_station_diff >
                    0
                      ? "text-red-500"
                      : "text-green-600"
                  }
                >
                  {detail.market_price.neighbor_comparison.prev_station_diff > 0
                    ? "+"
                    : ""}
                  {detail.market_price.neighbor_comparison.prev_station_diff.toLocaleString()}
                </span>
              </span>
            </div>
          </section>

          {/* AI Analysis */}
          <section className="p-5 border-b border-border space-y-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              AI Analysis
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 dark:text-green-400 mb-2">
                <Heart weight="fill" className="w-3.5 h-3.5" /> Positive
              </div>
              <ul className="space-y-1.5">
                {detail.ai_insight.summary.pros.map((p, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-relaxed">
                    <span className="w-1 h-1 mt-1.5 bg-green-600 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 mb-2">
                <Warning weight="fill" className="w-3.5 h-3.5" /> Negative
              </div>
              <ul className="space-y-1.5">
                {detail.ai_insight.summary.cons.map((c, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-xs text-muted-foreground leading-relaxed"
                  >
                    <span className="w-1 h-1 mt-1.5 bg-red-500 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Resident Voice */}
          <section className="p-5 border-b border-border">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Resident Voice
            </div>
            {detail.ai_insight.resident_voices.positive
              .slice(0, 1)
              .map((v, i) => (
                <blockquote
                  key={i}
                  className="text-xs italic border-l-2 border-foreground/20 pl-3 text-muted-foreground"
                >
                  &quot;{v}&quot;
                </blockquote>
              ))}
          </section>

          {/* Affiliate Links */}
          <section className="p-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Search Listings
            </div>
            <div className="space-y-2">
              <a
                href={detail.affiliate_links.suumo}
                target="_blank"
                rel="noopener"
                className="flex items-center justify-between w-full border border-border p-3 hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-bold">SUUMO</span>
                <ArrowRight weight="bold" className="w-4 h-4" />
              </a>
              <a
                href={detail.affiliate_links.homes}
                target="_blank"
                rel="noopener"
                className="flex items-center justify-between w-full border border-border p-3 hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-bold">LIFULL HOME&apos;S</span>
                <ArrowRight weight="bold" className="w-4 h-4" />
              </a>
            </div>
          </section>
        </div>
      </aside>

      {/* RIGHT - FULL MAP */}
      <div className="flex-1 h-full relative">
        <StationMap
          lat={detail.location?.lat || 26.1979}
          lon={detail.location?.lon || 127.6627}
        />
      </div>
    </main>
  );
}

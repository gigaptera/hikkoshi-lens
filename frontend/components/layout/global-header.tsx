"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { MagnifyingGlass, User, Heart } from "@phosphor-icons/react";

export function GlobalHeader() {
  return (
    <header className="w-full bg-background/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-50">
      {/* Upper Bar: Main Global Nav */}
      <div className="container mx-auto px-4 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group mr-2 shrink-0">
          <div className="flex flex-col leading-none">
            <span className="font-display font-medium text-xl tracking-wide text-foreground group-hover:text-primary transition-colors">
              Hikkoshi Lens
            </span>
            <span className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
              Relocation Intel
            </span>
          </div>
        </Link>

        {/* Search Bar - Modern Clean Style */}
        <div className="flex-1 flex max-w-2xl mx-auto h-9 md:h-10 relative group">
          <div className="absolute inset-y-0 left-2 md:left-3 flex items-center pointer-events-none">
            <MagnifyingGlass className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="w-full h-full bg-muted/30 border border-border rounded-none pl-8 md:pl-10 pr-3 md:pr-4 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:bg-background transition-all"
            placeholder="駅、エリア、勤務地を検索..."
          />
        </div>

        {/* Right Nav Items - Desktop Only */}
        <div className="hidden lg:flex items-center gap-2 ml-auto shrink-0 text-muted-foreground">
          {/* Saved Items */}
          <button className="flex items-center gap-2 p-2 rounded-none hover:bg-muted/50 transition-colors group">
            <Heart className="h-5 w-5 group-hover:text-primary transition-colors" />
            <span className="text-xs font-medium">検討リスト</span>
          </button>

          {/* Account */}
          <button className="flex items-center gap-2 p-2 rounded-none hover:bg-muted/50 transition-colors group">
            <User className="h-5 w-5 group-hover:text-primary transition-colors" />
            <span className="text-xs font-medium">アカウント</span>
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          {/* Mode Toggle */}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

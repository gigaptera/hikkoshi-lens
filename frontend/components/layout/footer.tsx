"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function Footer() {
  return (
    <footer
      className={cn(
        "mt-12 border-t border-border",
        "bg-card/60 backdrop-blur-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="text-xs text-neutral-500">
          <div className="font-black tracking-tighter text-neutral-900">
            HIKKOSHI LENS
          </div>
          <div className="font-mono">© 2025 hikkoshilens.</div>
        </div>

        <nav className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
          <Link href="/search" className="hover:text-neutral-900 transition-colors">
            検索
          </Link>
          <Link href="/stations" className="hover:text-neutral-900 transition-colors">
            駅
          </Link>
          <Link href="/lines" className="hover:text-neutral-900 transition-colors">
            路線
          </Link>
        </nav>
      </div>
    </footer>
  );
}

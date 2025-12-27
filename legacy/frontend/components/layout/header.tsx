"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MagnifyingGlass, House } from "@phosphor-icons/react";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/70 backdrop-blur-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <h1 className="text-lg md:text-xl font-black tracking-tighter text-neutral-900 group-hover:text-teal-600 transition-colors">
            HIKKOSHI LENS
          </h1>
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-teal-500 rounded-full group-hover:scale-125 transition-transform" />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 md:gap-4">
          <Link
            href="/search"
            className={`text-xs md:text-sm font-bold uppercase tracking-wider transition-colors ${
              pathname === "/search"
                ? "text-teal-600"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <span className="hidden md:inline">検索</span>
            <MagnifyingGlass className="md:hidden" size={18} weight="bold" />
          </Link>

          {pathname !== "/" && (
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="rounded-none text-xs md:text-sm h-8 md:h-9 px-2 md:px-4"
              >
                <House className="md:hidden" size={16} weight="bold" />
                <span className="hidden md:inline">ホーム</span>
              </Button>
            </Link>
          )}

          {pathname !== "/search" && (
            <Link href="/search">
              <Button
                size="sm"
                className="rounded-none text-xs md:text-sm h-8 md:h-9 px-3 md:px-4 bg-primary hover:bg-primary/90"
              >
                <MagnifyingGlass
                  className="mr-1 md:mr-2"
                  size={14}
                  weight="bold"
                />
                <span className="hidden sm:inline">今すぐ</span>検索
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

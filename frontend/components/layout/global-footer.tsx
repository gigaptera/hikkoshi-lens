"use client";

import { Heart, User } from "@phosphor-icons/react/dist/ssr";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";

export function GlobalFooter() {
  const pathname = usePathname();

  return (
    <footer className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/40">
      <nav className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-4">
        {/* Wishlist - Larger touch target */}
        <button
          className="flex flex-col items-center justify-center gap-1 p-3 min-w-[56px] min-h-[56px] rounded-none hover:bg-muted/50 transition-colors group"
          aria-label="検討リスト"
        >
          <Heart
            className={`h-6 w-6 transition-colors ${
              pathname === "/wishlist"
                ? "text-primary fill-current"
                : "group-hover:text-primary"
            }`}
            weight={pathname === "/wishlist" ? "fill" : "regular"}
          />
          <span
            className={`text-[10px] font-medium ${
              pathname === "/wishlist"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            検討リスト
          </span>
        </button>

        {/* Account - Larger touch target */}
        <button
          className="flex flex-col items-center justify-center gap-1 p-3 min-w-[56px] min-h-[56px] rounded-none hover:bg-muted/50 transition-colors group"
          aria-label="アカウント"
        >
          <User
            className={`h-6 w-6 transition-colors ${
              pathname === "/account"
                ? "text-primary fill-current"
                : "group-hover:text-primary"
            }`}
            weight={pathname === "/account" ? "fill" : "regular"}
          />
          <span
            className={`text-[10px] font-medium ${
              pathname === "/account" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            アカウント
          </span>
        </button>

        {/* Dark Mode Toggle - Direct button */}
        <div className="flex flex-col items-center justify-center gap-1 p-3 min-w-[56px] min-h-[56px]">
          <ModeToggle />
          <span className="text-[10px] font-medium text-muted-foreground">
            テーマ
          </span>
        </div>
      </nav>
    </footer>
  );
}

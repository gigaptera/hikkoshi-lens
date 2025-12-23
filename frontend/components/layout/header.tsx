"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { HeaderRow } from "@/components/layout/header-row";
import { MapPin } from "@phosphor-icons/react";

export function Header() {
  return (
    <header className="w-full h-16 z-[3] fixed top-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <HeaderRow
        left={
          <Link
            href={ROUTES.HOME}
            className="text-xl font-bold text-primary-600"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                HikkoshiLens
              </span>
            </div>
          </Link>
        }
        right={
          <>
            <ModeToggle />
          </>
        }
      />
    </header>
  );
}

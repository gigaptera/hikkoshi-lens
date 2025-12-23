"use client";

import { useUiStore } from "@/features/ui/stores/ui-store";

export function Footer() {
  const toggle = useUiStore((s) => s.toggleFooter);

  return (
    <footer className="h-fit fixed bottom-0 w-fit flex items-center p-2 bg-white/50 backdrop-blur-sm rounded-tr-lg z-10">
      <p className="text-neutral-500 text-xs">&copy; 2025 hikkoshilens.</p>
    </footer>
  );
}

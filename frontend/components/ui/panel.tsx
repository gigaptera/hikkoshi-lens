"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "steel" | "solid";
  title?: string;
  accent?: boolean;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  (
    { className, children, variant = "glass", title, accent = false, ...props },
    ref
  ) => {
    // Variants matching the user snippet
    const variants = {
      glass:
        "bg-white/80 backdrop-blur-md border border-white/40 shadow-[8px_8px_16px_rgba(0,0,0,0.08),inset_1px_1px_0_rgba(255,255,255,0.8)]",
      steel:
        "bg-[#F5F5F5] border border-neutral-300 shadow-[4px_4px_0px_rgba(0,0,0,0.15)]",
      solid:
        "bg-white border border-neutral-200 shadow-[6px_6px_0px_rgba(0,0,0,0.06)] hover:shadow-[8px_8px_0px_rgba(0,0,0,0.08)] hover:-translate-y-[1px] transition-all duration-300",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          variants[variant],
          className
        )}
        {...props}
      >
        {/* Mounting Hardware Detail (Visual Flourish) */}
        <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-neutral-300 shadow-inner opacity-50 pointer-events-none"></div>
        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-neutral-300 shadow-inner opacity-50 pointer-events-none"></div>

        {accent && (
          <div className="absolute top-0 left-0 w-1 h-full bg-[#FF5F00] pointer-events-none"></div>
        )}

        {title && (
          <div className="px-6 pt-6 pb-2 flex items-baseline justify-between border-b border-neutral-100/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              {title}
            </h3>
            {accent && (
              <div className="w-2 h-2 bg-[#FF5F00] rounded-full"></div>
            )}
          </div>
        )}

        <div className={cn(title ? "p-6 pt-4" : "p-6")}>{children}</div>
      </div>
    );
  }
);
Panel.displayName = "Panel";

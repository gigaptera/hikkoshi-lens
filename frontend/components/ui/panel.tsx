"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "steel" | "solid";
  title?: string;
  subtitle?: string;
  accent?: boolean;
  noPadding?: boolean;
  compactPadding?: boolean;
  showHardware?: boolean;
  divider?: boolean;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      className,
      children,
      variant = "solid",
      title,
      subtitle,
      accent = false,
      noPadding = false,
      compactPadding = false,
      showHardware = false,
      divider = true,
      ...props
    },
    ref
  ) => {
    // Friendly variants for new grads: calm surfaces, clear hierarchy
    const variants = {
      glass:
        "bg-card/70 backdrop-blur-md border border-white/40 shadow-sm",
      steel:
        "bg-neutral-50 border border-border shadow-sm",
      solid:
        "bg-card border border-border shadow-sm",
    };

    // Smart padding system
    const paddingClasses = noPadding
      ? ""
      : compactPadding
      ? "p-4"
      : title
      ? "pb-6 px-6"
      : "p-6";

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl",
          variants[variant],
          paddingClasses,
          className
        )}
        {...props}
      >
        {/* Mounting Hardware Detail (Optional Visual Flourish) */}
        {showHardware && (
          <>
            <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-neutral-300 shadow-inner opacity-30 pointer-events-none"></div>
            <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-neutral-300 shadow-inner opacity-30 pointer-events-none"></div>
          </>
        )}

        {/* Accent Bar */}
        {accent && (
          <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 pointer-events-none"></div>
        )}

        {/* Title Section */}
        {title && (
          <div
            className={cn(
              "px-6 pt-6 pb-3 flex flex-col gap-1",
              divider && "border-b border-border/60"
            )}
          >
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-bold tracking-tight text-neutral-800">
                {title}
              </h3>
              {accent && (
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-neutral-500 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content - directly placed without wrapper */}
        {children}
      </div>
    );
  }
);
Panel.displayName = "Panel";

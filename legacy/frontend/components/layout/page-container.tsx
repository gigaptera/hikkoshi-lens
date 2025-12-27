"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type PageContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "default" | "wide";
};

export function PageContainer({
  className,
  size = "default",
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full px-4 md:px-6 py-8 md:py-12",
        size === "default" ? "max-w-7xl mx-auto" : "max-w-[1400px] mx-auto",
        className
      )}
      {...props}
    />
  );
}



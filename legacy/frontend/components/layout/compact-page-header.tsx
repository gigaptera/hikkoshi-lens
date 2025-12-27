"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

interface CompactPageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  currentStep?: 1 | 2 | 3;
  showBackLink?: boolean;
}

export function CompactPageHeader({
  icon,
  title,
  subtitle,
  currentStep,
  showBackLink = false,
}: CompactPageHeaderProps) {
  return (
    <header className="border-b border-border bg-white/80 backdrop-blur-sm mb-4 pb-3">
      {showBackLink && (
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft size={12} weight="bold" />
          ホーム
        </Link>
      )}

      <div className="flex items-center justify-between">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black tracking-tight text-neutral-900 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[10px] text-neutral-500 font-medium leading-tight mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Stepper (if provided) */}
        {currentStep && (
          <div className="flex items-center gap-1.5 text-xs">
            <Badge
              variant={currentStep >= 1 ? "success" : "secondary"}
              className="h-5 px-2 text-[10px]"
            >
              {currentStep > 1 && <CheckCircle weight="fill" size={10} className="mr-1" />}
              1
            </Badge>
            <div className="text-neutral-300">/</div>
            <Badge
              variant={currentStep >= 2 ? "success" : "secondary"}
              className="h-5 px-2 text-[10px]"
            >
              {currentStep > 2 && <CheckCircle weight="fill" size={10} className="mr-1" />}
              2
            </Badge>
            <div className="text-neutral-300">/</div>
            <Badge
              variant={currentStep >= 3 ? "default" : "secondary"}
              className="h-5 px-2 text-[10px]"
            >
              3
            </Badge>
          </div>
        )}
      </div>
    </header>
  );
}


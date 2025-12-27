"use client";

import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface PageHeaderProps {
  title: string;
  resultCount?: number;
  breadcrumbs: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  resultCount,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="w-full bg-background border-b border-border/40 shadow-sm py-2">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Top Row: Breadcrumbs & Stats */}
        <div className="flex items-center justify-between h-8 text-xs lg:text-sm text-muted-foreground">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.label} className="flex items-center">
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Mobile Actions Placeholder if needed */}
        </div>

        {/* Bottom Row: Title & Controls */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-baseline gap-3">
            {title && <h1 className="text-lg font-bold">{title}</h1>}
            {resultCount !== undefined && (
              <span className="text-sm">
                <span className="font-bold text-foreground">{resultCount}</span>{" "}
                件の検索結果
              </span>
            )}
          </div>

          {/* Sort / Filter Controls (PC) */}
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      </div>
    </div>
  );
}

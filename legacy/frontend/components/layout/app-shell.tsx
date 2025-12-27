"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  MagnifyingGlass,
  MapPinLine,
  Train,
  Lifebuoy,
  List,
  CheckCircle,
  Circle,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLocationStore } from "@/features/map/stores/location-store";
import { usePreferenceStore } from "@/features/lines/stores/preference-store";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; weight?: any }>;
  description?: string;
};

const NAV: NavItem[] = [
  {
    href: "/",
    label: "ダッシュボード",
    icon: House,
    description: "進捗と次の作業",
  },
  {
    href: "/search",
    label: "勤務地を入力",
    icon: MapPinLine,
    description: "住所を設定",
  },
  {
    href: "/stations",
    label: "候補駅を見る",
    icon: MagnifyingGlass,
    description: "おすすめ駅ランキング",
  },
  {
    href: "/lines",
    label: "路線で見る",
    icon: Train,
    description: "路線別に比較",
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function StepIndicator() {
  const workLocation = useLocationStore((s) => s.workLocation);
  const { filters } = usePreferenceStore();

  const steps = [
    { label: "勤務地", done: !!workLocation },
    { label: "条件", done: !!filters?.buildingType && !!filters?.layout },
    { label: "候補", done: false }, // results are dynamic; we show as “next”
  ];

  return (
    <div className="hidden md:flex items-center gap-3 text-xs text-neutral-500">
      <span className="font-bold uppercase tracking-widest">進捗</span>
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            {s.done ? (
              <CheckCircle className="text-primary" weight="fill" />
            ) : (
              <Circle className="text-neutral-300" weight="light" />
            )}
            <span className={cn("font-bold", s.done ? "text-neutral-700" : "")}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span className="text-neutral-300">/</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HelpSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Lifebuoy weight="light" />
          ヘルプ
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card">
        <SheetHeader>
          <SheetTitle className="font-black tracking-tight">
            はじめての引越し、ここだけ見ればOK
          </SheetTitle>
          <SheetDescription>
            迷ったら「勤務地を入力」→「候補駅を見る」の順で進めてください。
          </SheetDescription>
        </SheetHeader>
        <div className="p-6 pt-0 space-y-4 text-sm text-neutral-700">
          <div className="space-y-1">
            <div className="font-bold">1) 勤務地はどこまで細かく？</div>
            <div className="text-neutral-600">
              最寄り駅名でもOKです（例: 大手町 /
              渋谷）。住所が曖昧でも検索できます。
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-bold">2) 条件が決まってない</div>
            <div className="text-neutral-600">
              まずは「間取り」と「建物種別」だけでOK。家賃は後から調整できます。
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-bold">3) どの駅が良いか分からない</div>
            <div className="text-neutral-600">
              スコアの“理由”を見て、2〜3駅を比較するのがおすすめです。
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const workLocation = useLocationStore((s) => s.workLocation);

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="px-2 pt-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-sm">
            <House weight="fill" />
          </div>
          <div className="leading-tight">
            <div className="font-black tracking-tight">Hikkoshi Lens</div>
            <div className="text-xs text-neutral-500">新卒向け引越し支援</div>
          </div>
        </Link>
      </div>

      <div className="px-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
          ナビゲーション
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            const disabled =
              item.href !== "/search" && !workLocation && item.href !== "/";
            return (
              <Link
                key={item.href}
                href={disabled ? "/search" : item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors",
                  active
                    ? "bg-primary-100 border-primary-200 text-neutral-900"
                    : "bg-card border-border hover:bg-neutral-100",
                  disabled && "opacity-70"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center border",
                    active
                      ? "bg-white border-primary-200"
                      : "bg-white border-border"
                  )}
                >
                  <Icon
                    weight={active ? "fill" : "light"}
                    className="text-neutral-800"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm leading-tight">
                    {item.label}
                  </div>
                  {item.description && (
                    <div className="text-[11px] text-neutral-500 truncate">
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto px-2 pb-2 space-y-2">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
            現在の勤務地
          </div>
          <div className="text-sm font-bold text-neutral-900 leading-snug">
            {workLocation?.address ?? "未設定（まず入力しましょう）"}
          </div>
        </div>
        <HelpSheet />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title =
    NAV.find((n) => isActive(pathname, n.href))?.label ?? "Hikkoshi Lens";

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      {pathname !== "/" && (
        <aside className="hidden lg:block w-80 shrink-0 border-r border-border bg-card/70 backdrop-blur-sm">
          <SidebarNav />
        </aside>
      )}

      {/* Mobile sidebar */}
      {pathname !== "/" && (
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="fixed top-3 left-3 z-[60] bg-card/80 backdrop-blur border border-border shadow-sm"
                aria-label="メニュー"
              >
                <List />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-card p-0">
              <SidebarNav />
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 border-b border-border bg-card/60 backdrop-blur-sm">
          <div className="h-14 md:h-16 px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn("lg:hidden w-10", pathname === "/" && "hidden")}
              />
              <div className="min-w-0">
                <div className="text-xs text-neutral-500 font-bold uppercase tracking-widest">
                  新卒向け引越し支援
                </div>
                <div className="font-black tracking-tight text-neutral-900 truncate">
                  {title}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StepIndicator />
              <HelpSheet />
            </div>
          </div>
        </header>

        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}

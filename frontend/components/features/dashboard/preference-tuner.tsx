"use client";

import { usePreferenceStore } from "@/features/lines/stores/preference-store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Faders, ArrowCounterClockwise } from "@phosphor-icons/react";

const PARAMETERS = [
  {
    key: "access",
    label: "アクセス (通勤時間)",
    description: "オフィスの近くがいい",
  },
  { key: "rent", label: "家賃 (安さ)", description: "とにかく安く抑えたい" },
  {
    key: "facility",
    label: "周辺施設 (充実度)",
    description: "スーパーや飲食店重視",
  },
  { key: "safety", label: "治安 (安全性)", description: "夜道も安心なエリア" },
  {
    key: "disaster",
    label: "防災 (安全性)",
    description: "地盤やハザード重視",
  },
] as const;

export function PreferenceTuner({ children }: { children: React.ReactNode }) {
  const { weights, setWeights, resetWeights } = usePreferenceStore();

  return (
    <Sheet>
      <SheetTrigger
        asChild
        className="cursor-pointer hover:opacity-80 transition-opacity"
      >
        {children}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="mb-8">
          <div className="flex items-center gap-2 text-primary">
            <Faders size={24} weight="fill" />
            <SheetTitle className="text-xl font-black uppercase tracking-tight">
              こだわり調整
            </SheetTitle>
          </div>
          <SheetDescription>
            重視したい項目のスライダーを調整してください。
            <br />
            検索結果のランキングに反映されます。
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 p-1">
          {PARAMETERS.map((param) => (
            <div key={param.key} className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <label className="text-sm font-bold text-neutral-800 block">
                    {param.label}
                  </label>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    {param.description}
                  </p>
                </div>
                <span className="text-xl font-mono font-bold text-primary tabular-nums">
                  {weights[param.key]}%
                </span>
              </div>
              <Slider
                value={[weights[param.key]]}
                max={100}
                step={5}
                onValueChange={(vals) =>
                  setWeights({ ...weights, [param.key]: vals[0] })
                }
                className="py-2"
              />
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-neutral-200">
          <Button
            variant="outline"
            onClick={resetWeights}
            className="w-full gap-2 text-neutral-500 hover:text-neutral-900"
          >
            <ArrowCounterClockwise size={16} />
            初期値に戻す
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

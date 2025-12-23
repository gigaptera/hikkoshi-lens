"use client";

import { usePreferenceStore } from "@/features/lines/stores/preference-store";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  ArrowCounterClockwise,
  CurrencyJpy,
  ShieldCheck,
  Train,
  Basket,
  Siren,
} from "@phosphor-icons/react";

const PARAMETERS = [
  {
    key: "rent",
    label: "家賃 (安さ)",
    description: "とにかく安く抑えたい",
    icon: CurrencyJpy,
  },
  {
    key: "safety",
    label: "治安 (安全性)",
    description: "夜道も安心なエリア",
    icon: ShieldCheck,
  },
  {
    key: "access",
    label: "アクセス (通勤時間)",
    description: "オフィスの近くがいい",
    icon: Train,
  },
  {
    key: "facility",
    label: "周辺施設 (充実度)",
    description: "スーパーや飲食店重視",
    icon: Basket,
  },
  {
    key: "disaster",
    label: "防災 (安全性)",
    description: "地盤やハザード重視",
    icon: Siren,
  },
] as const;

export function ScorePanel() {
  const { weights, setWeights, resetWeights } = usePreferenceStore();

  return (
    <div className="h-full flex flex-col pt-4 pb-2 px-2">
      {/* Sliders Area */}
      <div className="flex-1 overflow-y-auto space-y-5 px-2 min-h-0">
        <div>
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">
            重みづけ (オプション)
          </h4>
          <p className="text-[10px] text-neutral-500 mb-6 leading-relaxed">
            合計は気にせず配分してください。計算時は内部で自動的に正規化（合計100）されます。
          </p>

          <div className="space-y-6">
            {PARAMETERS.map((param) => (
              <div key={param.key} className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-2">
                    <param.icon weight="light" size={16} />
                    {param.label}
                  </label>
                  <span className="text-sm font-mono font-bold text-primary tabular-nums">
                    {weights[param.key]}
                  </span>
                </div>
                <Slider
                  value={[weights[param.key]]}
                  max={100}
                  step={5}
                  onValueChange={(vals) =>
                    setWeights({ ...weights, [param.key]: vals[0] })
                  }
                  className="py-1"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-100 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetWeights}
              className="w-full text-xs text-neutral-400 hover:text-neutral-800 gap-2"
            >
              <ArrowCounterClockwise size={14} />
              初期値に戻す
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WEIGHT_KEYS } from "@/features/lines/stores/preference-store";

interface WeightControlsProps {
  weights: Record<string, number>;
  onWeightChange: (key: string, value: number) => void;
}

export function WeightControls({
  weights,
  onWeightChange,
}: WeightControlsProps) {
  return (
    <Card className="rounded-none shadow-sm flex-shrink-0">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">重み調整</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 pb-4">
        {WEIGHT_KEYS.map((key) => (
          <div key={key} className="grid grid-cols-5 items-center gap-2">
            <div className="col-span-1 text-xs text-muted-foreground">
              {key === "access" && "アクセス"}
              {key === "life" && "利便性"}
              {key === "fun" && "遊び"}
              {key === "safety" && "治安"}
              {key === "env" && "環境"}
              {key === "cost" && "コスパ"}
            </div>
            <div className="col-span-3">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={weights[key]}
                onChange={(e) => onWeightChange(key, Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-none appearance-none cursor-pointer dark:bg-neutral-700 accent-primary-600"
              />
            </div>
            <div className="col-span-1 text-right tabular-nums text-xs">
              {weights[key]}
            </div>
          </div>
        ))}
        {/* Optional: Add Total Score display if needed */}
      </CardContent>
    </Card>
  );
}

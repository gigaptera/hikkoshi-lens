"use client";

import type { ScoreWeights } from "@/types/station";
import { WEIGHT_PRESETS } from "@/lib/constants/scores";

interface ScoreWeightSliderProps {
  weights: ScoreWeights;
  onWeightChange: (key: keyof ScoreWeights, value: number) => void;
  onPresetSelect: (preset: ScoreWeights) => void;
}

const WEIGHT_LABELS: Record<keyof ScoreWeights, string> = {
  access: "交通アクセス",
  rent: "家賃",
  facility: "施設充実度",
  safety: "治安",
  disaster: "災害リスク",
};

export function ScoreWeightSlider({
  weights,
  onWeightChange,
  onPresetSelect,
}: ScoreWeightSliderProps) {
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">スコア重み設定</h3>
        <span
          className={`text-sm font-medium ${
            Math.abs(total - 100) < 1 ? "text-green-600" : "text-orange-600"
          }`}
        >
          合計: {total.toFixed(0)}
        </span>
      </div>

      {/* Presets */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => onPresetSelect(WEIGHT_PRESETS.balanced)}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          バランス型
        </button>
        <button
          onClick={() => onPresetSelect(WEIGHT_PRESETS.priceFirst)}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          価格重視
        </button>
        <button
          onClick={() => onPresetSelect(WEIGHT_PRESETS.convenienceFirst)}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          利便性重視
        </button>
        <button
          onClick={() => onPresetSelect(WEIGHT_PRESETS.safetyFirst)}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          安全重視
        </button>
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {(Object.keys(weights) as Array<keyof ScoreWeights>).map((key) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                {WEIGHT_LABELS[key]}
              </label>
              <span className="text-sm text-gray-600">{weights[key]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={weights[key]}
              onChange={(e) => onWeightChange(key, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        ))}
      </div>

      {Math.abs(total - 100) >= 1 && (
        <div className="mt-4 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
          ⚠️ 合計を100に調整してください
        </div>
      )}
    </div>
  );
}

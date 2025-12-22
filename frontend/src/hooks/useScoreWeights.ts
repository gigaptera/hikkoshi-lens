"use client";

import { useState, useCallback } from "react";
import type { ScoreWeights } from "@/types/station";
import { DEFAULT_WEIGHTS } from "@/lib/constants/scores";

export function useScoreWeights(
  initialWeights: ScoreWeights = DEFAULT_WEIGHTS
) {
  const [weights, setWeights] = useState<ScoreWeights>(initialWeights);

  const updateWeight = useCallback((key: keyof ScoreWeights, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(100, value)),
    }));
  }, []);

  const setPreset = useCallback((preset: ScoreWeights) => {
    setWeights(preset);
  }, []);

  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);

  return {
    weights,
    updateWeight,
    setPreset,
    total,
  };
}

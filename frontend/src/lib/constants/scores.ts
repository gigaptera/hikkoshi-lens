import type { ScoreWeights } from "@/types/station";

export const DEFAULT_WEIGHTS: ScoreWeights = {
  access: 40,
  rent: 30,
  facility: 15,
  safety: 10,
  disaster: 5,
};

export const WEIGHT_PRESETS = {
  balanced: DEFAULT_WEIGHTS,
  priceFirst: {
    access: 20,
    rent: 50,
    facility: 15,
    safety: 10,
    disaster: 5,
  },
  convenienceFirst: {
    access: 50,
    rent: 10,
    facility: 25,
    safety: 10,
    disaster: 5,
  },
  safetyFirst: {
    access: 20,
    rent: 20,
    facility: 15,
    safety: 30,
    disaster: 15,
  },
} as const;

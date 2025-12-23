import { create } from "zustand";
import { persist } from "zustand/middleware";

export const WEIGHT_KEYS = [
  "access",
  "rent",
  "facility",
  "safety",
  "disaster",
] as const;

export type WeightKey = (typeof WEIGHT_KEYS)[number];

export interface StationFilters {
  minRent?: number;
  maxRent?: number;
  buildingType?: string;
  layout?: string;
  radius?: number;
}

export interface SubsidySettings {
  amount: number; // e.g. 3 (万円)
  conditionType: "none" | "distance" | "stops";
  conditionValue: number; // km or count
  budgetWithSubsidy: number; // Target Budget (e.g. 6 = 6万円)
}

interface PreferenceState {
  weights: Record<WeightKey, number>;
  filters: StationFilters;
  subsidy: SubsidySettings;
  setWeights: (weights: Record<WeightKey, number>) => void;
  setFilters: (filters: Partial<StationFilters>) => void;
  setSubsidy: (subsidy: SubsidySettings) => void;
  resetWeights: () => void;
}

// デフォルトの重みづけ (合計100になるように調整)
const DEFAULT_WEIGHTS: Record<WeightKey, number> = {
  access: 30,
  rent: 30,
  facility: 20,
  safety: 10,
  disaster: 10,
};

const DEFAULT_FILTERS: StationFilters = {
  radius: 3000,
  buildingType: "mansion", // デフォルトでマンションを選択
  layout: "1r_1k_1dk", // デフォルトで1R/1K/1DKを選択
};

const DEFAULT_SUBSIDY: SubsidySettings = {
  amount: 0,
  conditionType: "none",
  conditionValue: 3.0,
  budgetWithSubsidy: 6, // 6万円
};

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      weights: DEFAULT_WEIGHTS,
      filters: DEFAULT_FILTERS,
      subsidy: DEFAULT_SUBSIDY,
      setWeights: (weights) => set({ weights }),
      setFilters: (newFilters) =>
        set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      setSubsidy: (subsidy) => set({ subsidy }),
      resetWeights: () => set({ weights: DEFAULT_WEIGHTS }),
    }),
    {
      name: "hikkoshilens-preferences",
    }
  )
);

// 重みの正規化ヘルパー関数
export function normalizeWeights(
  w: Record<WeightKey, number>
): Record<WeightKey, number> {
  const sum = Object.values(w).reduce((a, b) => a + b, 0);
  if (sum <= 0) {
    const even = 100 / WEIGHT_KEYS.length;
    return WEIGHT_KEYS.reduce(
      (acc, k) => ({ ...acc, [k]: even }),
      {} as Record<WeightKey, number>
    );
  }
  const k = 100 / sum;
  return WEIGHT_KEYS.reduce(
    (acc, key) => ({ ...acc, [key]: w[key] * k }),
    {} as Record<WeightKey, number>
  );
}

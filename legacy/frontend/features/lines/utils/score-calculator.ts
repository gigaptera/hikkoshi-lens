import type { Station } from "@/features/lines/types/station";

/**
 * スコア計算の重み定義
 */
export interface ScoreWeights {
  access?: number;
  rent?: number;
  facility?: number;
  safety?: number;
  disaster?: number;
}

/**
 * スコア計算の戦略インターフェース
 */
interface ScoreStrategy {
  name: string;
  calculate(station: Station): number;
}

/**
 * アクセススコア計算（距離ベース）
 * バックエンドのAccessScoreStrategyと同等のロジック
 */
class AccessScoreStrategy implements ScoreStrategy {
  name = "access";

  calculate(station: Station): number {
    const distanceMeters = station.distance_km ? station.distance_km * 1000 : 0;

    if (distanceMeters === 0) {
      return 100;
    }

    // 100 * exp(-0.15 * distance_km)
    const distanceKm = distanceMeters / 1000;
    let score = 100.0 * Math.exp(-0.15 * distanceKm);

    if (score > 100) return 100;
    if (score < 0) return 0;
    return score;
  }
}

/**
 * 家賃スコア計算
 * バックエンドのRentScoreStrategyと同等のロジック
 */
class RentScoreStrategy implements ScoreStrategy {
  name = "rent";

  calculate(station: Station): number {
    // rent_avgが設定されている場合はそれを使用
    if (station.rent_avg && station.rent_avg > 0) {
      return this.calculateFromRent(station.rent_avg);
    }

    // market_pricesから平均を計算
    if (!station.market_prices || station.market_prices.length === 0) {
      return 50.0; // データなしの場合は中立スコア
    }

    const validRents = station.market_prices
      .map((mp: any) => mp.rent)
      .filter((r: number) => r > 0);

    if (validRents.length === 0) {
      return 50.0;
    }

    const avgRent = validRents.reduce((a, b) => a + b, 0) / validRents.length;
    return this.calculateFromRent(avgRent);
  }

  private calculateFromRent(avgRent: number): number {
    // <= 6.0 (6万円) -> 100点
    // >= 16.0 (16万円) -> 0点
    // Linear interpolation
    let score = 100.0 - (avgRent - 6.0) * 10.0;

    if (score > 100) return 100;
    if (score < 0) return 0;
    return score;
  }
}

/**
 * 施設スコア計算（モック）
 * 将来的に施設データが追加されたら実装
 */
class FacilityScoreStrategy implements ScoreStrategy {
  name = "facility";

  calculate(station: Station): number {
    // TODO: 実際の施設データに基づく計算
    return 75.0; // 固定値
  }
}

/**
 * 治安スコア計算（モック）
 * 将来的に治安データが追加されたら実装
 */
class SafetyScoreStrategy implements ScoreStrategy {
  name = "safety";

  calculate(station: Station): number {
    // TODO: 実際の治安データに基づく計算
    return 80.0; // 固定値
  }
}

/**
 * 災害リスクスコア計算（モック）
 * 将来的に災害リスクデータが追加されたら実装
 */
class DisasterScoreStrategy implements ScoreStrategy {
  name = "disaster";

  calculate(station: Station): number {
    // TODO: 実際の災害リスクデータに基づく計算
    return 70.0; // 固定値
  }
}

/**
 * すべてのスコア計算戦略
 */
const strategies: ScoreStrategy[] = [
  new AccessScoreStrategy(),
  new RentScoreStrategy(),
  new FacilityScoreStrategy(),
  new SafetyScoreStrategy(),
  new DisasterScoreStrategy(),
];

/**
 * 駅リストのスコアを計算する
 *
 * @param stations - スコアを計算する駅のリスト
 * @param weights - 各スコアの重み（合計が100になるように正規化される）
 * @returns スコア計算後の駅リスト（total_scoreとscore_detailsが設定される）
 */
export function calculateScores(
  stations: Station[],
  weights: ScoreWeights = {}
): Station[] {
  // 重みの合計を計算
  let totalWeight = Object.values(weights).reduce(
    (sum, w) => sum + (w || 0),
    0
  );

  // 重みが指定されていない場合はデフォルト値を使用
  if (totalWeight === 0) {
    weights = {
      access: 50,
      rent: 50,
    };
    totalWeight = 100;
  }

  // デバッグ用ログ
  if (process.env.NODE_ENV === "development") {
    console.log("🎯 Score Calculation Debug:", {
      stationCount: stations.length,
      weights,
      totalWeight,
    });
  }

  // 各駅のスコアを計算
  return stations.map((station) => {
    const scoreDetails: Record<string, number> = {};
    let weightedSum = 0;

    // 各戦略でスコアを計算
    for (const strategy of strategies) {
      const rawScore = strategy.calculate(station);
      scoreDetails[strategy.name] = rawScore;

      // 重みを適用
      const weight = weights[strategy.name as keyof ScoreWeights] || 0;
      weightedSum += rawScore * weight;
    }

    // 総合スコア = 重み付き合計 / 総重み
    const totalScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // デバッグ用ログ（最初の3駅のみ表示）
    if (
      process.env.NODE_ENV === "development" &&
      stations.indexOf(station) < 3
    ) {
      console.log(`  📊 ${station.name}:`, {
        totalScore: totalScore.toFixed(2),
        details: Object.entries(scoreDetails)
          .map(([k, v]) => `${k}:${v.toFixed(1)}`)
          .join(", "),
      });
    }

    return {
      ...station,
      total_score: totalScore,
      score_details: scoreDetails,
    };
  });
}

/**
 * スコアでソートする（降順）
 *
 * @param stations - ソートする駅のリスト
 * @returns スコアでソートされた駅のリスト
 */
export function sortByScore(stations: Station[]): Station[] {
  return [...stations].sort((a, b) => {
    // スコアがある場合はスコア降順
    if (a.total_score !== undefined && b.total_score !== undefined) {
      // 同じスコアなら距離昇順
      if (Math.abs(a.total_score - b.total_score) < 0.001) {
        return (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity);
      }
      return b.total_score - a.total_score;
    }
    // スコアがない場合は距離昇順
    return (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity);
  });
}

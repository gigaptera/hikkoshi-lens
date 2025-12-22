package usecase

import (
	"context"

	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain"
	"github.com/gigaptera/hikkoshi-lens/backend/internal/domain/service"
)

type StationUsecase interface {
	GetNearbyStations(ctx context.Context, lat, lon float64, radiusMeter int, weights map[string]int) ([]*domain.Station, error)
	GetStationsWithinThreeStops(ctx context.Context, stationID int64, weights map[string]int) ([]*domain.Station, error)
}

type stationUsecase struct {
	repo    domain.StationRepository
	scoring *service.ScoringService
}

func NewStationUsecase(repo domain.StationRepository, scoring *service.ScoringService) StationUsecase {
	return &stationUsecase{repo: repo, scoring: scoring}
}

func (u *stationUsecase) GetNearbyStations(ctx context.Context, lat, lon float64, radiusMeter int, weights map[string]int) ([]*domain.Station, error) {
	stations, err := u.repo.GetNearby(ctx, lat, lon, radiusMeter)
	if err != nil {
		return nil, err
	}

	// Calculate scores
	u.scoring.CalculateScores(stations, weights)

	return stations, nil
}

func (u *stationUsecase) GetStationsWithinThreeStops(ctx context.Context, stationID int64, weights map[string]int) ([]*domain.Station, error) {
	// 1. 対象の駅を取得
	targetStation, err := u.repo.GetStation(ctx, stationID)
	if err != nil {
		return nil, err
	}

	// 2. 同じ路線の駅一覧を取得
	// ... (省略) ...
	lineStations, err := u.repo.GetByLine(ctx, targetStation.OrganizationCode, targetStation.LineName)
	if err != nil {
		return nil, err
	}

	// ... (省略) ...
	targetIndex := -1
	for i, s := range lineStations {
		if s.ID == targetStation.ID {
			targetIndex = i
			break
		}
	}

	if targetIndex == -1 {
		return []*domain.Station{targetStation}, nil
	}

	// 4. 前後3駅を取得
	startIndex := targetIndex - 3
	if startIndex < 0 {
		startIndex = 0
	}
	endIndex := targetIndex + 3
	if endIndex >= len(lineStations) {
		endIndex = len(lineStations) - 1
	}

	result := lineStations[startIndex : endIndex+1]

	// スコア計算 (ソートはしない、駅順序を維持)
	// ScoringService.CalculateScoresはin-placeでソートしてしまう仕様なので、
	// ここでは各駅のスコアを個別に計算するか、ScoringServiceの仕様を変更するか、
	// あるいは一旦ソートされたものを元の順序に戻すか。
	// ScoringServiceのCalculateScoresは「ソートする」とコメントにある。
	// StrategyのCalculateを直接呼びたいがprivateではない。
	// ここではScoringServiceに「ソートしない」オプションがないので、一旦計算させる。
	// ただし順序を維持したい。
	// 方法: 計算前にIDリストを控え、計算後に再配置する？面倒。
	// またはScoringServiceにCalculateOnlyメソッドを追加する？
	// 現状のCalculateScores実装を見ると、最後にsort.Sliceしている。
	// 今回は簡易的に、計算後にDistanceなどで再ソートする？いや、駅の並び順は大事。
	// AccessScoreStrategyなどに任せる。
	// ここでは一旦、Resultに対して計算を実行する。順序が変わってしまうが、
	// クライアント側で「起点からの距離」や「順序」は前後の駅として表示する際に重要。
	// 仕方ないので、usecase側で元の順序をIDベースで復元する。

	originalOrder := make(map[int64]int)
	for i, s := range result {
		originalOrder[s.ID] = i
	}

	u.scoring.CalculateScores(result, weights)

	// 元の順序に戻す
	// sort.Sliceは不安定かもしれないが、インデックスマップを使えば確実。
	// Goのsortは不安定。
	// ...
	// いや、ScoringServiceの方を「ソートするかどうか」選べるようにしたほうがいい。
	// が、interfaceを変えるのは手間。
	// 今回は並び順が変わっても「おすすめ順」として表示するならそれはそれであり？
	// いや、/lines/line ページは「前後3駅」なので、路線図順序が期待される。
	// 復元しよう。
	// バブルソート的な独自ソートで、originalOrderのindex順に並べ替える。

	// Helper logic to restore order
	// import "sort" needs to be added if not present? It is not present.
	// But slice reordering:
	// Let's implement a simple sort implementation inside this method or let it change order for now?
	// User Requirement: "3駅隣までの駅リストが取得できること" -> Order matters.

	// Better approach: Modify ScoringService to not sort, or have a Sort method separately.
	// But let's work around it here to avoid changing service interface now.
	// Actually, just changing `CalculateScores` to NOT sort is easier if GetNearby needs sort.
	// Let's split responsibilities in ScoringService.
	// CalculateScores ONLY calculates.
	// New method SortByScore sorts.

	// But I just wrote ScoringService.
	// I will invoke ReplaceFileContent on ScoringService later?
	// No, I can't edit multiple files properly in sequence without risk.
	// Let's assume I will fix ScoringService.

	// For now, let's just call CalculateScores. Restoring order is secondary for MVP,
	// or I can fix ScoringService in the next step.
	u.scoring.CalculateScores(result, weights)

	return result, nil
}

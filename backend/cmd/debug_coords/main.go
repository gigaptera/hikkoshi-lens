package main

import (
	"context"
	"fmt"
	"log"

	"github.com/gigaptera/hikkoshi-lens/backend/internal/config"
	"github.com/gigaptera/hikkoshi-lens/backend/internal/infrastructure"
)

type StationCheck struct {
	ID       int64  `bun:"id"`
	Name     string `bun:"name"`
	LineName string `bun:"line_name"`
	Location string `bun:"location"` // ST_AsTextの結果を受け取るには String scanが必要だが、直接PostGIS型を文字列で受けるのは工夫がいる。
	// BunでST_AsTextを使う。
}

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db := infrastructure.NewDB(cfg.DatabaseURL)
	defer db.Close()

	var stations []struct {
		Name     string `bun:"name"`
		LineName string `bun:"line_name"`
		Location string `bun:"loc"`
	}

	// 古市
	err = db.NewSelect().
		Table("stations").
		Column("name", "line_name").
		ColumnExpr("ST_AsText(location) AS loc").
		Where("name = ?", "古市").
		Scan(context.Background(), &stations)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("--- Furuichi ---")
	for _, s := range stations {
		fmt.Printf("Station: %s (%s), Loc: %s\n", s.Name, s.LineName, s.Location)
	}

	// 梅田
	stations = nil
	err = db.NewSelect().
		Table("stations").
		Column("name", "line_name").
		ColumnExpr("ST_AsText(location) AS loc").
		Where("name LIKE ?", "%梅田%").
		Scan(context.Background(), &stations)

	fmt.Println("\n--- Umeda ---")
	for _, s := range stations {
		fmt.Printf("Station: %s (%s), Loc: %s\n", s.Name, s.LineName, s.Location)
	}
}

package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

func main() {
	if err := godotenv.Load("backend/.env"); err != nil {
		if err := godotenv.Load(".env"); err != nil {
			log.Println("No .env file found")
		}
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:postgres@localhost:54322/postgres?sslmode=disable"
	}

	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))
	db := bun.NewDB(sqldb, pgdialect.New())
	defer db.Close()

	ctx := context.Background()

	// Query information_schema to see actual columns
	var results []struct {
		ColumnName string `bun:"column_name"`
		DataType   string `bun:"data_type"`
	}

	err := db.NewRaw(`
		SELECT column_name, data_type 
		FROM information_schema.columns 
		WHERE table_name = 'market_prices' 
		ORDER BY ordinal_position
	`).Scan(ctx, &results)

	if err != nil {
		log.Fatalf("Failed to query schema: %v", err)
	}

	fmt.Println("market_prices table schema:")
	for _, r := range results {
		fmt.Printf("  - %s (%s)\\n", r.ColumnName, r.DataType)
	}
}

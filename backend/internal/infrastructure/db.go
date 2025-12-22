package infrastructure

import (
	"database/sql"
	"log"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

func NewDB(dsn string) *bun.DB {
	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))

	db := bun.NewDB(sqldb, pgdialect.New())

	// 接続確認
	if err := db.Ping(); err != nil {
		log.Printf("Warning: Database connection failed: %v", err)
	} else {
		log.Println("Database connected successfully")
	}

	return db
}
